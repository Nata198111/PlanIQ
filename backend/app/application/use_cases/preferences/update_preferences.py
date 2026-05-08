# app/application/use_cases/preferences/update_preferences.py
from app.domain.models.preferences import UserPreferences, WorkHours, LunchBreak
from app.ports.repositories.preferences_repository import PreferencesRepository


class UpdatePreferences:
    def __init__(self, repo: PreferencesRepository):
        self.repo = repo

    async def execute(self, user_id: str, updates: dict) -> UserPreferences:
        prefs = await self.repo.get_by_user_id(user_id)
        if not prefs:
            # Якщо раптом ще немає — стартуємо з дефолту
            prefs = UserPreferences(user_id=user_id)

        # Прості поля
        simple_fields = [
            "timezone", "work_days", "peak_hours", "selected_categories",
            "reality_coefficient", "auto_reschedule", "protect_peak_hours",
            "buffer_minutes", "notifications_enabled", "reminder_minutes",
        ]
        for f in simple_fields:
            if f in updates and updates[f] is not None:
                setattr(prefs, f, updates[f])

        # Вкладені об'єкти — оновлюємо тільки передані поля
        if "work_hours" in updates and updates["work_hours"] is not None:
            wh = updates["work_hours"]
            # Якщо це вже dict (після model_dump), беремо напряму
            if hasattr(wh, "start"):
                prefs.work_hours = WorkHours(start=wh.start, end=wh.end)
            else:
                prefs.work_hours = WorkHours(
                    start=wh.get("start", prefs.work_hours.start),
                    end=wh.get("end", prefs.work_hours.end),
                )

        if "lunch_break" in updates and updates["lunch_break"] is not None:
            lb = updates["lunch_break"]
            if hasattr(lb, "enabled"):
                prefs.lunch_break = LunchBreak(
                    enabled=lb.enabled, start=lb.start, end=lb.end
                )
            else:
                prefs.lunch_break = LunchBreak(
                    enabled=lb.get("enabled", prefs.lunch_break.enabled),
                    start=lb.get("start", prefs.lunch_break.start),
                    end=lb.get("end", prefs.lunch_break.end),
                )

        return await self.repo.update(prefs)