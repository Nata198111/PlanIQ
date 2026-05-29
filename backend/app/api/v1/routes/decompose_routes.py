# app/api/v1/routes/decompose_routes.py
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.api.v1.dependencies.auth_deps import get_current_user
from app.api.v1.dependencies.task_deps import get_task_repository
from app.api.v1.dependencies.preferences_deps import (
    get_preferences_repository,
    get_notification_repository,
)
from app.api.v1.dependencies.blocked_slot_deps import get_blocked_slot_repository
from app.application.services.decompose_service import decompose_task
from app.application.services.notification_service import NotificationService
from app.application.services.planning_service import PlanningService
from app.domain.models.task import Task
from app.domain.models.user import User
from app.domain.services.priority_calculator import apply_priority_score
from app.ports.repositories.task_repository import TaskRepository
from app.schemas.task.responses import TaskResponse

router = APIRouter(tags=["AI Decompose"])


def _to_response(task: Task) -> TaskResponse:
    return TaskResponse(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        category=task.category,
        status=task.status,
        priority=task.priority,
        complexity=task.complexity,
        date=task.date,
        time=task.time,
        scheduled_date=task.scheduled_date,
        scheduled_time=task.scheduled_time,
        duration=task.duration,
        parent_task_id=task.parent_task_id,
        sequence_order=task.sequence_order,
        priority_score=task.priority_score,
        priority_label=task.priority_label,
        priority_reason=task.priority_reason,
        created_at=task.created_at,
        updated_at=task.updated_at,
        completed_at=task.completed_at,
    )


class SubtaskPreview(BaseModel):
    title: str
    description: str
    duration: str
    complexity: int
    sequence_order: int


class DecomposeResponse(BaseModel):
    parent_task_id: str
    parent_title: str
    subtasks: list[SubtaskPreview]


class ConfirmSubtask(BaseModel):
    title: str
    description: str = ""
    duration: str = "30 хв"
    complexity: int = 5
    sequence_order: int = 1


class ConfirmDecomposeRequest(BaseModel):
    subtasks: list[ConfirmSubtask]


def _duration_to_minutes(value: str) -> int:
    if not value:
        return 60

    value = value.strip().lower().replace(",", ".")

    try:
        if "хв" in value:
            return int(float(value.split()[0]))
        if "год" in value:
            return int(float(value.split()[0]) * 60)
    except Exception:
        return 60

    return 60


def _get_task_end_datetime(task: Task) -> datetime | None:
    if not task.scheduled_date or not task.scheduled_time:
        return None

    try:
        start = datetime.fromisoformat(
            f"{task.scheduled_date}T{task.scheduled_time}:00"
        )
        return start + timedelta(minutes=_duration_to_minutes(task.duration))
    except Exception:
        return None


@router.post(
    "/tasks/{task_id}/decompose",
    response_model=DecomposeResponse,
    operation_id="decompose_task_preview",
)
async def decompose_task_preview(
    task_id: str,
    current_user: User = Depends(get_current_user),
    task_repo: TaskRepository = Depends(get_task_repository),
):
    """
    Генерує підзадачі через Gemini AI і повертає preview.
    Нічого не зберігає — тільки показує що буде створено.
    """
    task = await task_repo.get_by_id(task_id, current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    try:
        subtasks_data = await decompose_task(task)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))

    return DecomposeResponse(
        parent_task_id=task.id,
        parent_title=task.title,
        subtasks=[SubtaskPreview(**s) for s in subtasks_data],
    )


@router.post(
    "/tasks/{task_id}/decompose/confirm",
    response_model=list[TaskResponse],
    status_code=201,
    operation_id="decompose_task_confirm",
)
async def decompose_task_confirm(
    task_id: str,
    body: ConfirmDecomposeRequest,
    current_user: User = Depends(get_current_user),
    task_repo: TaskRepository = Depends(get_task_repository),
    preferences_repo=Depends(get_preferences_repository),
    notification_repo=Depends(get_notification_repository),
    blocked_slot_repo=Depends(get_blocked_slot_repository),
):
    """
    Зберігає підзадачі як реальні задачі з parent_task_id.
    Після збереження запускає планування для кожної підзадачі.
    """
    parent = await task_repo.get_by_id(task_id, current_user.id)
    if not parent:
        raise HTTPException(status_code=404, detail="Task not found")

    created_subtasks: list[Task] = []

    for s in sorted(body.subtasks, key=lambda x: x.sequence_order):
        subtask = Task(
            user_id=current_user.id,
            title=s.title,
            description=s.description,
            category=parent.category,
            status="Очікує",
            priority=parent.priority,
            complexity=s.complexity,
            date=parent.date,       # дедлайн як у батьківської
            time=parent.time,
            duration=s.duration,
            parent_task_id=task_id, # зв'язок з батьківською
            sequence_order=s.sequence_order,
        )

        apply_priority_score(subtask)
        saved = await task_repo.save(subtask)
        created_subtasks.append(saved)

        # Сповіщення про дедлайн
        notif_service = NotificationService(
            notification_repo,
            preferences_repo=preferences_repo,
        )
        await notif_service.create_deadline_notifications_for_task(saved)

    parent.scheduled_date = ""
    parent.scheduled_time = ""
    await task_repo.update(parent)

    # Плануємо підзадачі через planning service
    planning = PlanningService(task_repo, preferences_repo, blocked_slot_repo)
    last_end: datetime | None = None

    for subtask in sorted(created_subtasks, key=lambda t: t.sequence_order):
        planned = await planning.reschedule_task(
            subtask.id,
            current_user.id,
            earliest_start=last_end,
        )

        if planned:
            last_end = _get_task_end_datetime(planned) or last_end
        else: 
            break

    # Повертаємо актуальні дані з БД
    result = []
    for subtask in created_subtasks:
        fresh = await task_repo.get_by_id(subtask.id, current_user.id)
        if fresh:
            result.append(_to_response(fresh))

    return result


@router.get(
    "/tasks/{task_id}/subtasks",
    response_model=list[TaskResponse],
    operation_id="get_task_subtasks",
)
async def get_task_subtasks(
    task_id: str,
    current_user: User = Depends(get_current_user),
    task_repo: TaskRepository = Depends(get_task_repository),
):
    """Отримати всі підзадачі конкретної задачі."""
    all_tasks = await task_repo.get_all_by_user(current_user.id)
    subtasks = [
        t for t in all_tasks
        if getattr(t, "parent_task_id", None) == task_id
    ]
    subtasks.sort(key=lambda t: getattr(t, "sequence_order", 0))
    return [_to_response(t) for t in subtasks]