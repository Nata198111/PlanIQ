from datetime import datetime, timezone

from app.core.exceptions import NotFoundError
from app.domain.models.task import Task
from app.ports.repositories.task_repository import TaskRepository


class UpdateTask:
    def __init__(self, task_repo: TaskRepository):
        self.task_repo = task_repo

    async def execute(self, task_id: str, user_id: str, updates: dict) -> Task:
        task = await self.task_repo.get_by_id(task_id, user_id)

        if not task:
            raise NotFoundError("Task not found")

        now = datetime.now(timezone.utc)

        for field, value in updates.items():
            if value is not None and hasattr(task, field):
                setattr(task, field, value)
        task.updated_at = now
        if "status" in updates:
            if updates["status"] == "Виконано":
                task.completed_at = now
            else:
                task.completed_at = None

        return await self.task_repo.update(task)