from app.core.exceptions import NotFoundError
from app.ports.repositories.task_repository import TaskRepository


class DeleteTask:
    def __init__(self, task_repo: TaskRepository):
        self.task_repo = task_repo

    async def execute(self, task_id: str, user_id: str) -> None:
        deleted = await self.task_repo.delete(task_id, user_id)
        if not deleted:
            raise NotFoundError("Task not found")