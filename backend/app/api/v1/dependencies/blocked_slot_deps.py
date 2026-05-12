from app.infrastructure.database.mongodb import get_database
from app.infrastructure.repositories.mongo_blocked_slot_repository import (
    MongoBlockedSlotRepository,
)
from app.ports.repositories.blocked_slot_repository import BlockedSlotRepository


def get_blocked_slot_repository() -> BlockedSlotRepository:
    db = get_database()
    return MongoBlockedSlotRepository(db)