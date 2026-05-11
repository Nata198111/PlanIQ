from dataclasses import dataclass, field
from datetime import datetime, timezone
 
 
@dataclass
class Notification:
    user_id: str
    title: str
    message: str
    # deadline_soon | task_overdue | rescheduled | planning_done | info
    type: str    = "info"
    id: str      = ""
    read: bool   = False
    task_id: str = ""   # опційно — до якої задачі відноситься
    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )