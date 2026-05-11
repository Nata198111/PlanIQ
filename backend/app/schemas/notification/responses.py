from pydantic import BaseModel
from datetime import datetime
 
 
class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str
    read: bool
    task_id: str
    created_at: datetime
 