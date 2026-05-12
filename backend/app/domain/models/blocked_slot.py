from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class BlockedSlot:
    user_id: str
    title: str          # "Англійська", "Тренування"
    day_of_week: int    # 0=Пн, 1=Вт, ..., 6=Нд
    start_time: str     # "16:00"
    end_time: str       # "17:30"
    id: str = ""
    color: str = "#464555"
    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    