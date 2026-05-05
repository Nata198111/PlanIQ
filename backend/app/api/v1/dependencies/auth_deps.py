# app/api/v1/dependencies/auth_deps.py
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError

from app.core.exceptions import AuthenticationError
from app.core.security import decode_access_token
from app.domain.models.user import User
from app.infrastructure.database.mongodb import get_database
from app.infrastructure.repositories.mongo_user_repository import MongoUserRepository
from app.ports.repositories.user_repository import UserRepository


security = HTTPBearer()


def get_user_repository() -> UserRepository:
    """Повертає реалізацію репозиторія. Тут підміняється MongoDB на будь-що інше."""
    db = get_database()
    return MongoUserRepository(db)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    user_repo: UserRepository = Depends(get_user_repository),
) -> User:
    """FastAPI dependency — витягує поточного юзера з JWT токена."""
    try:
        user_id = decode_access_token(credentials.credentials)
    except JWTError:
        raise AuthenticationError("Invalid or expired token")

    user = await user_repo.find_by_id(user_id)
    if not user:
        raise AuthenticationError("User not found")

    return user