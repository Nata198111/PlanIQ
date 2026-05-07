from abc import ABC, abstractmethod
from app.domain.models.task import Task


class TaskRepository(ABC):

    @abstractmethod
    async def get_all_by_user(self, user_id: str) -> list[Task]:
        """Всі задачі конкретного користувача."""
        ...

    @abstractmethod
    async def get_by_id(self, task_id: str, user_id: str) -> Task | None:
        """Одна задача — тільки якщо належить цьому user_id."""
        ...

    @abstractmethod
    async def save(self, task: Task) -> Task:
        """Зберегти нову задачу."""
        ...

    @abstractmethod
    async def update(self, task: Task) -> Task:
        """Оновити існуючу задачу."""
        ...

    @abstractmethod
    async def delete(self, task_id: str, user_id: str) -> bool:
        """Видалити задачу. Повертає True якщо успішно."""
        ...