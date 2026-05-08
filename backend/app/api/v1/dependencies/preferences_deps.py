# app/api/v1/dependencies/preferences_deps.py
from app.infrastructure.database.mongodb import get_database
from app.infrastructure.repositories.mongo_preferences_repository import MongoPreferencesRepository
from app.ports.repositories.preferences_repository import PreferencesRepository


def get_preferences_repository() -> PreferencesRepository:
    db = get_database()
    return MongoPreferencesRepository(db)