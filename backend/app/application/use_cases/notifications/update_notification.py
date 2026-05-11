from app.ports.repositories.notification_repository import NotificationRepository
 
 
class UpdateNotification:
    def __init__(self, repo: NotificationRepository):
        self.repo = repo
 
    async def mark_read(self, notification_id: str, user_id: str) -> bool:
        return await self.repo.mark_read(notification_id, user_id)
 
    async def mark_all_read(self, user_id: str) -> int:
        return await self.repo.mark_all_read(user_id)
 
    async def delete(self, notification_id: str, user_id: str) -> bool:
        return await self.repo.delete(notification_id, user_id)
 