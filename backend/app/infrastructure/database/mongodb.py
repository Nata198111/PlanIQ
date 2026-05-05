# app/infrastructure/database/mongodb.py
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings


class MongoDB:
    client: AsyncIOMotorClient | None = None
    db: AsyncIOMotorDatabase | None = None


mongodb = MongoDB()


async def connect_to_mongo() -> None:
    mongodb.client = AsyncIOMotorClient(settings.mongodb_url)
    mongodb.db = mongodb.client[settings.mongodb_db_name]
    await mongodb.client.admin.command("ping")
    print(f"Connected to MongoDB: {settings.mongodb_db_name}")


async def close_mongo_connection() -> None:
    if mongodb.client:
        mongodb.client.close()
        print("MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    if mongodb.db is None:
        raise RuntimeError("Database not connected")
    return mongodb.db