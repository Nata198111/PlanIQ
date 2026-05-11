# app/schemas/preferences/responses.py
from pydantic import BaseModel
from datetime import datetime


class WorkHoursResponse(BaseModel):
    start: str
    end: str


class LunchBreakResponse(BaseModel):
    enabled: bool
    start: str
    end: str


class NotificationSettingsResponse(BaseModel):
    enabled: bool
    deadline_soon: bool
    task_overdue: bool
    rescheduled: bool
    planning_done: bool
    weekly_digest: bool
    motivation: bool
    deadline_warning_hours: int
    reminder_minutes: int


class PreferencesResponse(BaseModel):
    id: str
    user_id: str
    timezone: str
    work_days: list[int]
    work_hours: WorkHoursResponse
    lunch_break: LunchBreakResponse
    peak_hours: list[str]
    selected_categories: list[str]
    reality_coefficient: float
    auto_reschedule: bool
    protect_peak_hours: bool
    buffer_minutes: int
    notifications_enabled: bool
    reminder_minutes: int
    notifications: NotificationSettingsResponse
    updated_at: datetime