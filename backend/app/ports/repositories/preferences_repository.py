# app/ports/repositories/preferences_repository.py
from abc import ABC, abstractmethod
from app.domain.models.preferences import UserPreferences
 
 
class PreferencesRepository(ABC):
 
    @abstractmethod
    async def get_by_user_id(self, user_id: str) -> UserPreferences | None:
        ...
 
    @abstractmethod
    async def save(self, prefs: UserPreferences) -> UserPreferences:
        ...
 
    @abstractmethod
    async def update(self, prefs: UserPreferences) -> UserPreferences:
        ...

    @abstractmethod
    async def delete(self, user_id: str) -> bool:
        ...