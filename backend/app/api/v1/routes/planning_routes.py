# app/api/v1/routes/planning_routes.py
from datetime import date
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.v1.dependencies.auth_deps import get_current_user
from app.api.v1.dependencies.task_deps import get_task_repository
from app.api.v1.dependencies.preferences_deps import get_preferences_repository
from app.api.v1.dependencies.blocked_slot_deps import get_blocked_slot_repository
from app.application.services.planning_service import PlanningService
from app.domain.models.user import User
from app.schemas.task.responses import TaskResponse
from app.api.v1.dependencies.preferences_deps import get_notification_repository
from app.application.services.notification_service import NotificationService
from app.ports.repositories.notification_repository import NotificationRepository


router = APIRouter(prefix="/planning", tags=["Planning"])


def _task_to_response(task) -> TaskResponse:
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
        priority_score=task.priority_score,
        priority_label=task.priority_label,
        priority_reason=task.priority_reason,
        created_at=task.created_at,
        updated_at=task.updated_at,
        completed_at=task.completed_at,
    )


class PlanRequest(BaseModel):
    start_date: date | None = None
    days_ahead: int = 7


@router.post("/schedule", response_model=dict, operation_id="planning_schedule_tasks")
async def schedule_tasks(
    body: PlanRequest = PlanRequest(),
    current_user: User = Depends(get_current_user),
    task_repo=Depends(get_task_repository),
    preferences_repo=Depends(get_preferences_repository),
    blocked_slot_repo=Depends(get_blocked_slot_repository),
    notification_repo: NotificationRepository = Depends(get_notification_repository),
):
    """
    Розкласти всі невиконані задачі по вільних слотах.
    Враховує робочий графік, заблоковані слоти, пікові години і буфер.
    """
    service = PlanningService(task_repo, preferences_repo, blocked_slot_repo)
    result = await service.plan_for_user(
        user_id=current_user.id,
        start_date=body.start_date,
        days_ahead=body.days_ahead,
    )
    notification_service = NotificationService(
        notification_repo,
        preferences_repo=preferences_repo,
    )
    for task in result.scheduled:
        await notification_service.create_deadline_notifications_for_task(task)

    return {
        "scheduled_count": len(result.scheduled),
        "scheduled": [_task_to_response(t) for t in result.scheduled],
        "warnings": result.warnings,
        "overloaded_days": result.overloaded_days,
    }


@router.post("/reschedule/{task_id}", response_model=TaskResponse | None, operation_id="planning_reschedule_task")
async def reschedule_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    task_repo=Depends(get_task_repository),
    preferences_repo=Depends(get_preferences_repository),
    blocked_slot_repo=Depends(get_blocked_slot_repository),
    notification_repo: NotificationRepository = Depends(get_notification_repository),
):
    service = PlanningService(task_repo, preferences_repo, blocked_slot_repo)
    task = await service.reschedule_task(task_id, current_user.id)
    if task:
        notification_service = NotificationService(
            notification_repo,
            preferences_repo=preferences_repo,
        )
        await notification_service.create_deadline_notifications_for_task(task)
    return _task_to_response(task) if task else None