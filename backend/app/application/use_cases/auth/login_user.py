# app/application/use_cases/auth/login_user.py
from app.core.exceptions import AuthenticationError
from app.core.security import verify_password
from app.domain.models.user import User
from app.ports.repositories.user_repository import UserRepository


class LoginUser:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def execute(self, email: str, password: str) -> User:
        # 1. Шукаємо користувача
        user = await self.user_repo.find_by_email(email)
        if not user:
            raise AuthenticationError("Invalid email or password")

        # 2. Перевіряємо пароль
        if not verify_password(password, user.hashed_password):
            raise AuthenticationError("Invalid email or password")

        return user