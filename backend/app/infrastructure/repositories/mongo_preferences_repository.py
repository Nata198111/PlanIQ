# app/infrastructure/repositories/mongo_preferences_repository.py
from datetime import datetime, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.domain.models.preferences import UserPreferences, WorkHours, LunchBreak, NotificationSettings
from app.ports.repositories.preferences_repository import PreferencesRepository


class MongoPreferencesRepository(PreferencesRepository):

    def __init__(self, db: AsyncIOMotorDatabase):
        self.col = db["user_preferences"]

    def _to_domain(self, doc: dict) -> UserPreferences:
        wh = doc.get("work_hours", {})
        lb = doc.get("lunch_break", {})
        notifications = doc.get("notifications", {})
        return UserPreferences(
            id=str(doc["_id"]),
            user_id=doc["user_id"],
            timezone=doc.get("timezone", "Europe/Kyiv"),
            work_days=doc.get("work_days", [0, 1, 2, 3, 4]),
            work_hours=WorkHours(
                start=wh.get("start", "09:00"),
                end=wh.get("end", "18:00"),
            ),
            lunch_break=LunchBreak(
                enabled=lb.get("enabled", True),
                start=lb.get("start", "12:00"),
                end=lb.get("end", "13:00"),
            ),
            notifications=NotificationSettings(
                enabled=notifications.get("enabled", doc.get("notifications_enabled", True)),
                deadline_soon=notifications.get("deadline_soon", True),
                task_overdue=notifications.get("task_overdue", True),
                rescheduled=notifications.get("rescheduled", True),
                planning_done=notifications.get("planning_done", True),
                weekly_digest=notifications.get("weekly_digest", False),
                motivation=notifications.get("motivation", False),
                deadline_warning_hours=notifications.get("deadline_warning_hours", 3),
                reminder_minutes=notifications.get("reminder_minutes", doc.get("reminder_minutes", 15)),
            ),
            peak_hours=doc.get("peak_hours", ["09:00", "10:00", "11:00"]),
            selected_categories=doc.get("selected_categories", ["PERSONAL"]),
            reality_coefficient=doc.get("reality_coefficient", 1.2),
            auto_reschedule=doc.get("auto_reschedule", True),
            protect_peak_hours=doc.get("protect_peak_hours", False),
            buffer_minutes=doc.get("buffer_minutes", 10),
            notifications_enabled=doc.get("notifications_enabled", True),
            reminder_minutes=doc.get("reminder_minutes", 15),
            created_at=doc.get("created_at", datetime.now(timezone.utc)),
            updated_at=doc.get("updated_at", datetime.now(timezone.utc)),
        )

    def _to_doc(self, p: UserPreferences) -> dict:
        return {
            "user_id": p.user_id,
            "timezone": p.timezone,
            "work_days": p.work_days,
            "work_hours": {"start": p.work_hours.start, "end": p.work_hours.end},
            "lunch_break": {
                "enabled": p.lunch_break.enabled,
                "start": p.lunch_break.start,
                "end": p.lunch_break.end,
            },
            "notifications": {
                "enabled": p.notifications.enabled,
                "deadline_soon": p.notifications.deadline_soon,
                "task_overdue": p.notifications.task_overdue,
                "rescheduled": p.notifications.rescheduled,
                "planning_done": p.notifications.planning_done,
                "weekly_digest": p.notifications.weekly_digest,
                "motivation": p.notifications.motivation,
                "deadline_warning_hours": p.notifications.deadline_warning_hours,
                "reminder_minutes": p.notifications.reminder_minutes,
            },
            "peak_hours": p.peak_hours,
            "selected_categories": p.selected_categories,
            "reality_coefficient": p.reality_coefficient,
            "auto_reschedule": p.auto_reschedule,
            "protect_peak_hours": p.protect_peak_hours,
            "buffer_minutes": p.buffer_minutes,
            "notifications_enabled": p.notifications_enabled,
            "reminder_minutes": p.reminder_minutes,
            "created_at": p.created_at,
            "updated_at": p.updated_at,
        }

    async def get_by_user_id(self, user_id: str) -> UserPreferences | None:
        doc = await self.col.find_one({"user_id": user_id})
        return self._to_domain(doc) if doc else None

    async def save(self, prefs: UserPreferences) -> UserPreferences:
        doc = self._to_doc(prefs)
        result = await self.col.insert_one(doc)
        prefs.id = str(result.inserted_id)
        return prefs

    async def update(self, prefs: UserPreferences) -> UserPreferences:
        prefs.updated_at = datetime.now(timezone.utc)
        await self.col.update_one(
            {"user_id": prefs.user_id},
            {"$set": self._to_doc(prefs)},
            upsert=True,
        )
        # Якщо id ще порожній (після upsert), підтягуємо з БД
        if not prefs.id:
            doc = await self.col.find_one({"user_id": prefs.user_id})
            if doc:
                prefs.id = str(doc["_id"])
        return prefs
    
    async def delete(self, user_id: str) -> bool:
        r = await self.col.delete_one({"user_id": user_id})
        return r.deleted_count > 0