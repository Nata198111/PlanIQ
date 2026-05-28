from datetime import timezone
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
 
from app.domain.models.notification import Notification
from app.ports.repositories.notification_repository import NotificationRepository
 
 
class MongoNotificationRepository(NotificationRepository):
 
    def __init__(self, db: AsyncIOMotorDatabase):
        self.col = db["notifications"]

    def _normalize_datetime(self, value):
        if value and value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value
 
    def _to_domain(self, doc: dict) -> Notification:
        return Notification(
            id=str(doc["_id"]),
            user_id=doc["user_id"],
            title=doc["title"],
            message=doc["message"],
            type=doc.get("type", "info"),
            read=doc.get("read", False),
            task_id=doc.get("task_id", ""),
            created_at=self._normalize_datetime(doc["created_at"]),
        )
 
    async def get_all_by_user(self, user_id: str) -> list[Notification]:
        cursor = self.col.find({"user_id": user_id}).sort("created_at", -1).limit(100)
        return [self._to_domain(doc) async for doc in cursor]
 
    async def save(self, n: Notification) -> Notification:
        doc = {
            "user_id":    n.user_id,
            "title":      n.title,
            "message":    n.message,
            "type":       n.type,
            "read":       n.read,
            "task_id":    n.task_id,
            "created_at": n.created_at,
        }
        result = await self.col.insert_one(doc)
        n.id = str(result.inserted_id)
        return n
 
    async def mark_read(self, notification_id: str, user_id: str) -> bool:
        try:
            r = await self.col.update_one(
                {"_id": ObjectId(notification_id), "user_id": user_id},
                {"$set": {"read": True}},
            )
            return r.modified_count > 0
        except Exception:
            return False
 
    async def mark_all_read(self, user_id: str) -> int:
        r = await self.col.update_many(
            {"user_id": user_id, "read": False},
            {"$set": {"read": True}},
        )
        return r.modified_count
 
    async def delete(self, notification_id: str, user_id: str) -> bool:
        try:
            r = await self.col.delete_one(
                {"_id": ObjectId(notification_id), "user_id": user_id}
            )
            return r.deleted_count > 0
        except Exception:
            return False
        
    async def exists_by_task_and_type(self, task_id: str, user_id: str, notification_type: str) -> bool:
        if not task_id:
            return False
        doc = await self.col.find_one(
            {"task_id": task_id, "user_id": user_id, "type": notification_type},
            {"_id": 1},
        )
        return doc is not None
    
    async def delete_all_by_user(self, user_id: str) -> int:
        r = await self.col.delete_many({"user_id": user_id})
        return r.deleted_count