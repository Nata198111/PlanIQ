# app/application/use_cases/auth/register_user.py
from app.core.exceptions import AlreadyExistsError
from app.core.security import hash_password
from app.domain.models.user import User
from app.ports.repositories.user_repository import UserRepository


class RegisterUser:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def execute(self, name: str, email: str, password: str) -> User:
        # 1. Перевіряємо чи email не зайнятий
        existing = await self.user_repo.find_by_email(email)
        if existing:
            raise AlreadyExistsError("User with this email already exists")

        # 2. Хешуємо пароль
        hashed = hash_password(password)

        # 3. Створюємо domain об'єкт
        user = User(name=name, email=email, hashed_password=hashed)

        # 4. Зберігаємо і повертаємо
        return await self.user_repo.save(user)