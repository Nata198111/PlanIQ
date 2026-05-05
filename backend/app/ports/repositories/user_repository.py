# app/ports/repositories/user_repository.py
from abc import ABC, abstractmethod
from app.domain.models.user import User


class UserRepository(ABC):
    """
    Абстрактний інтерфейс для роботи з користувачами.
    Use case знає лише цей клас — не MongoUserRepository.
    """

    @abstractmethod
    async def find_by_email(self, email: str) -> User | None:
        """Знайти користувача за email. Повертає None якщо не знайдено."""
        ...

    @abstractmethod
    async def find_by_id(self, user_id: str) -> User | None:
        """Знайти користувача за ID."""
        ...

    @abstractmethod
    async def save(self, user: User) -> User:
        """Зберегти нового користувача. Повертає збережений об'єкт з id."""
        ...