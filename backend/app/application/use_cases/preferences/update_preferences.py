# app/application/use_cases/preferences/update_preferences.py
from app.domain.models.preferences import UserPreferences, WorkHours, LunchBreak, NotificationSettings
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
            "timezone",
            "work_days",
            "peak_hours",
            "selected_categories",
            "reality_coefficient",
            "auto_reschedule",
            "protect_peak_hours",
            "buffer_minutes",
            "notifications_enabled",
            "reminder_minutes",
        ]

        for f in simple_fields:
            if f in updates and updates[f] is not None:
                setattr(prefs, f, updates[f])

        # Вкладені об'єкти — оновлюємо тільки передані поля
        if "work_hours" in updates and updates["work_hours"] is not None:
            wh = updates["work_hours"]

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
                    enabled=lb.enabled,
                    start=lb.start,
                    end=lb.end,
                )
            else:
                prefs.lunch_break = LunchBreak(
                    enabled=lb.get("enabled", prefs.lunch_break.enabled),
                    start=lb.get("start", prefs.lunch_break.start),
                    end=lb.get("end", prefs.lunch_break.end),
                )

        if "notifications" in updates and updates["notifications"] is not None:
            n = updates["notifications"]
            current = prefs.notifications

            if hasattr(n, "enabled"):
                prefs.notifications = NotificationSettings(
                    enabled=n.enabled,
                    deadline_soon=n.deadline_soon,
                    task_overdue=n.task_overdue,
                    rescheduled=n.rescheduled,
                    planning_done=n.planning_done,
                    weekly_digest=n.weekly_digest,
                    motivation=n.motivation,
                    deadline_warning_hours=n.deadline_warning_hours,
                    reminder_minutes=n.reminder_minutes,
                )
            else:
                prefs.notifications = NotificationSettings(
                    enabled=n.get("enabled", current.enabled),
                    deadline_soon=n.get("deadline_soon", current.deadline_soon),
                    task_overdue=n.get("task_overdue", current.task_overdue),
                    rescheduled=n.get("rescheduled", current.rescheduled),
                    planning_done=n.get("planning_done", current.planning_done),
                    weekly_digest=n.get("weekly_digest", current.weekly_digest),
                    motivation=n.get("motivation", current.motivation),
                    deadline_warning_hours=n.get(
                        "deadline_warning_hours",
                        current.deadline_warning_hours,
                    ),
                    reminder_minutes=n.get(
                        "reminder_minutes",
                        current.reminder_minutes,
                    ),
                )

            # Для сумісності зі старими полями
            prefs.notifications_enabled = prefs.notifications.enabled
            prefs.reminder_minutes = prefs.notifications.reminder_minutes

        return await self.repo.update(prefs)