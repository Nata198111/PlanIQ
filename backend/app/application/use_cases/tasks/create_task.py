from app.domain.models.task import Task
from app.ports.repositories.task_repository import TaskRepository


class CreateTask:
    def __init__(self, task_repo: TaskRepository):
        self.task_repo = task_repo

    async def execute(self, user_id: str, **fields) -> Task:
        task = Task(user_id=user_id, **fields)
        return await self.task_repo.save(task)