from app.domain.models.task import Task
from app.core.exceptions import NotFoundError
from app.ports.repositories.task_repository import TaskRepository


class GetTasks:
    def __init__(self, task_repo: TaskRepository):
        self.task_repo = task_repo

    async def execute_all(self, user_id: str) -> list[Task]:
        return await self.task_repo.get_all_by_user(user_id)

    async def execute_one(self, task_id: str, user_id: str) -> Task:
        task = await self.task_repo.get_by_id(task_id, user_id)
        if not task:
            raise NotFoundError("Task not found")
        return task