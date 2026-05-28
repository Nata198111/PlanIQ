from abc import ABC, abstractmethod
from app.domain.models.notification import Notification
 
 
class NotificationRepository(ABC):
 
    @abstractmethod
    async def get_all_by_user(self, user_id: str) -> list[Notification]:
        ...
 
    @abstractmethod
    async def save(self, notification: Notification) -> Notification:
        ...
 
    @abstractmethod
    async def mark_read(self, notification_id: str, user_id: str) -> bool:
        ...
 
    @abstractmethod
    async def mark_all_read(self, user_id: str) -> int:
        ...
 
    @abstractmethod
    async def delete(self, notification_id: str, user_id: str) -> bool:
        ...

    @abstractmethod
    async def exists_by_task_and_type(self, task_id: str, user_id: str, notification_type: str) -> bool:
        ...

    @abstractmethod
    async def delete_all_by_user(self, user_id: str) -> int:
        ...