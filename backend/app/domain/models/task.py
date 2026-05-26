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
    scheduled_date: str = ""  # дата, коли система радить виконувати
    scheduled_time: str = ""  # час, коли система радить виконувати
    duration: str = "1 год"

    parent_task_id: str = ""   # id батьківської задачі (якщо це підзадача)
    sequence_order: int = 0    # порядок виконання серед підзадач
    
    priority_score: float = 0.0
    priority_label: str = ""    # Критичний | Високий | Середній | Низький
    priority_reason: str = ""   # Пояснення чому такий пріоритет

    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updated_at: datetime | None = None
    completed_at: datetime | None = None