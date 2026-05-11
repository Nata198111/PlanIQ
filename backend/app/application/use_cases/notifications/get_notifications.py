from app.ports.repositories.notification_repository import NotificationRepository
from app.domain.models.notification import Notification
 
 
class GetNotifications:
    def __init__(self, repo: NotificationRepository):
        self.repo = repo
 
    async def execute(self, user_id: str) -> list[Notification]:
        return await self.repo.get_all_by_user(user_id)
 