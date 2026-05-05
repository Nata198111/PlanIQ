from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# Контекст для хешування паролів через bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Перетворює відкритий пароль на bcrypt-хеш."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Перевіряє, чи відповідає пароль збереженому хешу."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str) -> str:
    """
    Створює JWT access token.
    subject — це зазвичай user_id у вигляді рядка.
    """
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {
        "sub": subject,   # subject — кому виданий токен
        "exp": expire,    # expiration — коли закінчується
        "iat": datetime.now(timezone.utc),  # issued at — коли виданий
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> str:
    """
    Декодує JWT і повертає subject (user_id).
    Кидає JWTError якщо токен невалідний або протермінований.
    """
    payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    subject: str | None = payload.get("sub")
    if subject is None:
        raise JWTError("Subject not found in token")
    return subject