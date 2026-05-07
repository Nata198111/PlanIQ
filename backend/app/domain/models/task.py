from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class Task:
    user_id: str          # до якого юзера належить задача
    title: str
    id: str = ""
    description: str = ""
    category: str = "PERSONAL"
    status: str = "Очікує"        # Очікує | В процесі | Виконано | Терміново
    priority: str = "Mid"          # Low | Mid | High
    complexity: int = 5            # 1–10
    date: str = ""                 # YYYY-MM-DD
    time: str = "09:00"
    duration: str = "1 год"
    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )