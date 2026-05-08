# app/domain/models/preferences.py
from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class WorkHours:
    start: str = "09:00"
    end: str   = "18:00"


@dataclass
class LunchBreak:
    enabled: bool = True
    start: str    = "12:00"
    end: str      = "13:00"


@dataclass
class UserPreferences:
    user_id: str
    id: str = ""

    # Часовий пояс
    timezone: str = "Europe/Kyiv"

    # Робочі дні: 0=Пн ... 6=Нд
    work_days: list = field(default_factory=lambda: [0, 1, 2, 3, 4])

    # Робочі години
    work_hours: WorkHours = field(default_factory=WorkHours)

    # Обідня перерва
    lunch_break: LunchBreak = field(default_factory=LunchBreak)

    # Пікові години продуктивності
    peak_hours: list = field(default_factory=lambda: ["09:00", "10:00", "11:00"])

    # Категорії, обрані при onboarding
    selected_categories: list = field(default_factory=lambda: ["PERSONAL"])

    # Налаштування алгоритму
    reality_coefficient: float = 1.2
    auto_reschedule: bool      = True
    protect_peak_hours: bool   = False
    buffer_minutes: int        = 10

    # Сповіщення
    notifications_enabled: bool = True
    reminder_minutes: int       = 15

    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))