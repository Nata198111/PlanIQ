from pydantic import BaseModel
from datetime import datetime


class BlockedSlotResponse(BaseModel):
    id: str
    user_id: str
    title: str
    day_of_week: int
    start_time: str
    end_time: str
    color: str
    created_at: datetime