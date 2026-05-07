from datetime import datetime, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.domain.models.task import Task
from app.ports.repositories.task_repository import TaskRepository


class MongoTaskRepository(TaskRepository):

    def __init__(self, db: AsyncIOMotorDatabase):
        self.col = db["tasks"]

    def _to_domain(self, doc: dict) -> Task:
        return Task(
            id=str(doc["_id"]),
            user_id=doc["user_id"],
            title=doc["title"],
            description=doc.get("description", ""),
            category=doc.get("category", "PERSONAL"),
            status=doc.get("status", "Очікує"),
            priority=doc.get("priority", "Mid"),
            complexity=doc.get("complexity", 5),
            date=doc.get("date", ""),
            time=doc.get("time", "09:00"),
            duration=doc.get("duration", "1 год"),
            created_at=doc.get("created_at", datetime.now(timezone.utc)),
            updated_at=doc.get("updated_at"),
            completed_at=doc.get("completed_at"),
        )

    def _to_doc(self, task: Task) -> dict:
        return {
            "user_id": task.user_id,
            "title": task.title,
            "description": task.description,
            "category": task.category,
            "status": task.status,
            "priority": task.priority,
            "complexity": task.complexity,
            "date": task.date,
            "time": task.time,
            "duration": task.duration,
            "created_at": task.created_at,
            "updated_at": task.updated_at,
            "completed_at": task.completed_at,
        }

    async def get_all_by_user(self, user_id: str) -> list[Task]:
        cursor = self.col.find({"user_id": user_id}).sort("date", 1)
        return [self._to_domain(doc) async for doc in cursor]

    async def get_by_id(self, task_id: str, user_id: str) -> Task | None:
        try:
            doc = await self.col.find_one({
                "_id": ObjectId(task_id),
                "user_id": user_id,
            })
        except Exception:
            return None

        return self._to_domain(doc) if doc else None

    async def save(self, task: Task) -> Task:
        doc = self._to_doc(task)
        result = await self.col.insert_one(doc)
        task.id = str(result.inserted_id)
        return task

    async def update(self, task: Task) -> Task:
        await self.col.update_one(
            {"_id": ObjectId(task.id), "user_id": task.user_id},
            {"$set": self._to_doc(task)},
        )
        return task

    async def delete(self, task_id: str, user_id: str) -> bool:
        try:
            result = await self.col.delete_one({
                "_id": ObjectId(task_id),
                "user_id": user_id,
            })
            return result.deleted_count > 0
        except Exception:
            return False