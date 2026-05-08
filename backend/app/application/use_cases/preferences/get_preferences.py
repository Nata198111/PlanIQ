# app/application/use_cases/preferences/get_preferences.py
from app.domain.models.preferences import UserPreferences
from app.ports.repositories.preferences_repository import PreferencesRepository
 
 
class GetPreferences:
    def __init__(self, repo: PreferencesRepository):
        self.repo = repo
 
    async def execute(self, user_id: str) -> UserPreferences:
        prefs = await self.repo.get_by_user_id(user_id)
        if not prefs:
            # Перший запит — зберігаємо дефолтні налаштування
            prefs = UserPreferences(user_id=user_id)
            prefs = await self.repo.save(prefs)
        return prefs