# app/api/v1/routes/preferences_routes.py
from fastapi import APIRouter, Depends

from app.api.v1.dependencies.auth_deps import get_current_user
from app.api.v1.dependencies.preferences_deps import get_preferences_repository
from app.application.use_cases.preferences.get_preferences import GetPreferences
from app.application.use_cases.preferences.update_preferences import UpdatePreferences
from app.domain.models.user import User
from app.domain.models.preferences import UserPreferences
from app.schemas.preferences.requests import UpdatePreferencesRequest
from app.schemas.preferences.responses import PreferencesResponse, WorkHoursResponse, LunchBreakResponse, NotificationSettingsResponse

router = APIRouter(prefix="/preferences", tags=["Preferences"])


def _to_response(p: UserPreferences) -> PreferencesResponse:
    return PreferencesResponse(
        id=p.id,
        user_id=p.user_id,
        timezone=p.timezone,
        work_days=p.work_days,
        work_hours=WorkHoursResponse(start=p.work_hours.start, end=p.work_hours.end),
        lunch_break=LunchBreakResponse(
            enabled=p.lunch_break.enabled,
            start=p.lunch_break.start,
            end=p.lunch_break.end,
        ),
        peak_hours=p.peak_hours,
        selected_categories=p.selected_categories,
        reality_coefficient=p.reality_coefficient,
        auto_reschedule=p.auto_reschedule,
        protect_peak_hours=p.protect_peak_hours,
        buffer_minutes=p.buffer_minutes,
        notifications_enabled=p.notifications_enabled,
        reminder_minutes=p.reminder_minutes,
                notifications=NotificationSettingsResponse(
            enabled=p.notifications.enabled,
            deadline_soon=p.notifications.deadline_soon,
            task_overdue=p.notifications.task_overdue,
            rescheduled=p.notifications.rescheduled,
            planning_done=p.notifications.planning_done,
            weekly_digest=p.notifications.weekly_digest,
            motivation=p.notifications.motivation,
            deadline_warning_hours=p.notifications.deadline_warning_hours,
            reminder_minutes=p.notifications.reminder_minutes,
        ),
        updated_at=p.updated_at,
    )


@router.get("", response_model=PreferencesResponse)
async def get_preferences(
    current_user: User = Depends(get_current_user),
    repo=Depends(get_preferences_repository),
):
    """Отримати налаштування поточного користувача.
    Якщо налаштувань ще немає — автоматично створює дефолтні."""
    uc = GetPreferences(repo)
    return _to_response(await uc.execute(current_user.id))


@router.patch("", response_model=PreferencesResponse)
async def update_preferences(
    body: UpdatePreferencesRequest,
    current_user: User = Depends(get_current_user),
    repo=Depends(get_preferences_repository),
):
    """Частково оновити налаштування (тільки передані поля)."""
    uc = UpdatePreferences(repo)
    updates = body.model_dump(exclude_none=True)
    return _to_response(await uc.execute(current_user.id, updates))


# PUT — повне оновлення через той самий use case (idempotent)
@router.put("", response_model=PreferencesResponse)
async def replace_preferences(
    body: UpdatePreferencesRequest,
    current_user: User = Depends(get_current_user),
    repo=Depends(get_preferences_repository),
):
    """Повністю замінити налаштування."""
    uc = UpdatePreferences(repo)
    updates = body.model_dump(exclude_none=True)
    return _to_response(await uc.execute(current_user.id, updates))