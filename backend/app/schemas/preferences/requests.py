# app/schemas/preferences/requests.py
from pydantic import BaseModel


class WorkHoursSchema(BaseModel):
    start: str = "09:00"
    end: str   = "18:00"


class LunchBreakSchema(BaseModel):
    enabled: bool = True
    start: str    = "12:00"
    end: str      = "13:00"


class UpdatePreferencesRequest(BaseModel):
    timezone: str | None                  = None
    work_days: list[int] | None           = None
    work_hours: WorkHoursSchema | None    = None
    lunch_break: LunchBreakSchema | None  = None
    peak_hours: list[str] | None          = None
    selected_categories: list[str] | None = None
    reality_coefficient: float | None     = None
    auto_reschedule: bool | None          = None
    protect_peak_hours: bool | None       = None
    buffer_minutes: int | None            = None
    notifications_enabled: bool | None    = None
    reminder_minutes: int | None          = None