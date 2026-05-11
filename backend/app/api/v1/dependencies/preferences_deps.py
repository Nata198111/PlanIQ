# app/api/v1/dependencies/preferences_deps.py
from app.infrastructure.database.mongodb import get_database
from app.infrastructure.repositories.mongo_preferences_repository import MongoPreferencesRepository
from app.infrastructure.repositories.mongo_notification_repository import MongoNotificationRepository
from app.ports.repositories.preferences_repository import PreferencesRepository
from app.ports.repositories.notification_repository import NotificationRepository


def get_preferences_repository() -> PreferencesRepository:
    db = get_database()
    return MongoPreferencesRepository(db)

def get_notification_repository() -> NotificationRepository:
    db = get_database()
    return MongoNotificationRepository(db)