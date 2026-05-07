from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class Task:
    user_id: str
    title: str

    id: str = ""
    description: str = ""
    category: str = "PERSONAL"
    status: str = "Очікує"
    priority: str = "Mid"
    complexity: int = 5
    date: str = ""
    time: str = "09:00"
    duration: str = "1 год"

    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updated_at: datetime | None = None
    completed_at: datetime | None = None