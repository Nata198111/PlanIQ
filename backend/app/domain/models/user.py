# app/domain/models/user.py
from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class User:
    name: str
    email: str
    hashed_password: str
    id: str = ""
    is_active: bool = True
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))