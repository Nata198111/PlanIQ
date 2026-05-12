from datetime import datetime, timezone
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.domain.models.blocked_slot import BlockedSlot
from app.ports.repositories.blocked_slot_repository import BlockedSlotRepository


class MongoBlockedSlotRepository(BlockedSlotRepository):

    def __init__(self, db: AsyncIOMotorDatabase):
        self.col = db["blocked_slots"]

    def _to_domain(self, doc: dict) -> BlockedSlot:
        return BlockedSlot(
            id=str(doc["_id"]),
            user_id=doc["user_id"],
            title=doc["title"],
            day_of_week=doc["day_of_week"],
            start_time=doc["start_time"],
            end_time=doc["end_time"],
            color=doc.get("color", "#464555"),
            created_at=doc.get("created_at", datetime.now(timezone.utc)),
        )

    async def get_all_by_user(self, user_id: str) -> list[BlockedSlot]:
        cursor = self.col.find({"user_id": user_id}).sort("day_of_week", 1)
        return [self._to_domain(doc) async for doc in cursor]

    async def save(self, slot: BlockedSlot) -> BlockedSlot:
        doc = {
            "user_id": slot.user_id,
            "title": slot.title,
            "day_of_week": slot.day_of_week,
            "start_time": slot.start_time,
            "end_time": slot.end_time,
            "color": slot.color,
            "created_at": slot.created_at,
        }
        result = await self.col.insert_one(doc)
        slot.id = str(result.inserted_id)
        return slot

    async def delete(self, slot_id: str, user_id: str) -> bool:
        try:
            result = await self.col.delete_one({
                "_id": ObjectId(slot_id),
                "user_id": user_id,
            })
            return result.deleted_count > 0
        except Exception:
            return False