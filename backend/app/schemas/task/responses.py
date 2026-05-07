from datetime import datetime
from pydantic import BaseModel

class TaskResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: str
    category: str
    status: str
    priority: str
    complexity: int
    date: str
    time: str
    duration: str
    created_at: datetime
    updated_at: datetime | None = None
    completed_at: datetime | None = None