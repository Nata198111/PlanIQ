# app/infrastructure/repositories/mongo_user_repository.py
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.domain.models.user import User
from app.ports.repositories.user_repository import UserRepository


class MongoUserRepository(UserRepository):
    """Реалізація UserRepository через MongoDB + Motor."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["users"]

    def _to_domain(self, doc: dict) -> User:
        """Перетворює MongoDB-документ на domain об'єкт User."""
        return User(
            id=str(doc["_id"]),
            name=doc["name"],
            email=doc["email"],
            hashed_password=doc["hashed_password"],
            is_active=doc.get("is_active", True),
            created_at=doc["created_at"],
        )

    def _to_document(self, user: User) -> dict:
        """Перетворює domain об'єкт User на MongoDB-документ."""
        return {
            "name": user.name,
            "email": user.email,
            "hashed_password": user.hashed_password,
            "is_active": user.is_active,
            "created_at": user.created_at,
        }

    async def find_by_email(self, email: str) -> User | None:
        doc = await self.collection.find_one({"email": email})
        if doc is None:
            return None
        return self._to_domain(doc)

    async def find_by_id(self, user_id: str) -> User | None:
        try:
            doc = await self.collection.find_one({"_id": ObjectId(user_id)})
        except Exception:
            return None
        if doc is None:
            return None
        return self._to_domain(doc)

    async def save(self, user: User) -> User:
        doc = self._to_document(user)
        result = await self.collection.insert_one(doc)
        user.id = str(result.inserted_id)
        return user
    
    async def update_profile(self, user_id: str, name: str) -> User | None:
        try:
            await self.collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"name": name}},
            )
        except Exception:
            return None

        return await self.find_by_id(user_id)

    async def update_password(self, user_id: str, hashed_password: str) -> bool:
        try:
            result = await self.collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"hashed_password": hashed_password}},
            )
            return result.matched_count > 0
        except Exception:
            return False