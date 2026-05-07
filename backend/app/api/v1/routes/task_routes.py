from fastapi import APIRouter, Depends

from app.api.v1.dependencies.auth_deps import get_current_user, get_user_repository
from app.api.v1.dependencies.task_deps import get_task_repository
from app.application.use_cases.tasks.create_task import CreateTask
from app.application.use_cases.tasks.delete_task import DeleteTask
from app.application.use_cases.tasks.get_tasks import GetTasks
from app.application.use_cases.tasks.update_task import UpdateTask
from app.domain.models.task import Task
from app.domain.models.user import User
from app.ports.repositories.task_repository import TaskRepository
from app.schemas.task.requests import CreateTaskRequest, UpdateTaskRequest
from app.schemas.task.responses import TaskResponse

router = APIRouter(prefix="/tasks", tags=["Tasks"])


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
        duration=task.duration,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


@router.get("", response_model=list[TaskResponse])
async def get_tasks(
    current_user: User = Depends(get_current_user),
    task_repo: TaskRepository = Depends(get_task_repository),
):
    """Отримати всі задачі поточного користувача."""
    use_case = GetTasks(task_repo)
    tasks = await use_case.execute_all(current_user.id)
    return [_to_response(t) for t in tasks]


@router.post("", response_model=TaskResponse, status_code=201)
async def create_task(
    body: CreateTaskRequest,
    current_user: User = Depends(get_current_user),
    task_repo: TaskRepository = Depends(get_task_repository),
):
    """Створити нову задачу."""
    use_case = CreateTask(task_repo)
    task = await use_case.execute(
        user_id=current_user.id,
        title=body.title,
        description=body.description,
        category=body.category,
        status=body.status,
        priority=body.priority,
        complexity=body.complexity,
        date=body.date,
        time=body.time,
        duration=body.duration,
    )
    return _to_response(task)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    task_repo: TaskRepository = Depends(get_task_repository),
):
    """Отримати одну задачу за ID."""
    use_case = GetTasks(task_repo)
    task = await use_case.execute_one(task_id, current_user.id)
    return _to_response(task)


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    body: UpdateTaskRequest,
    current_user: User = Depends(get_current_user),
    task_repo: TaskRepository = Depends(get_task_repository),
):
    """Оновити задачу (часткове оновлення)."""
    use_case = UpdateTask(task_repo)
    task = await use_case.execute(
        task_id=task_id,
        user_id=current_user.id,
        updates=body.model_dump(exclude_none=True),
    )
    return _to_response(task)


@router.delete("/{task_id}", status_code=204)
async def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    task_repo: TaskRepository = Depends(get_task_repository),
):
    """Видалити задачу."""
    use_case = DeleteTask(task_repo)
    await use_case.execute(task_id, current_user.id)