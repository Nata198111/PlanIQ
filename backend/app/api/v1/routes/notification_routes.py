from fastapi import APIRouter, Depends, Response
 
from app.api.v1.dependencies.auth_deps import get_current_user
from app.api.v1.dependencies.preferences_deps import get_notification_repository, get_preferences_repository
from app.api.v1.dependencies.task_deps import get_task_repository
from app.application.services.notification_service import NotificationService
from app.application.use_cases.notifications.get_notifications import GetNotifications
from app.application.use_cases.notifications.update_notification import UpdateNotification
from app.domain.models.user import User
from app.ports.repositories.task_repository import TaskRepository
from app.ports.repositories.preferences_repository import PreferencesRepository
from app.schemas.notification.responses import NotificationResponse
 
router = APIRouter(prefix="/notifications", tags=["Notifications"])
 
 
def _to_response(n) -> NotificationResponse:
    return NotificationResponse(
        id=n.id,
        user_id=n.user_id,
        title=n.title,
        message=n.message,
        type=n.type,
        read=n.read,
        task_id=n.task_id,
        created_at=n.created_at,
    )
 
 
@router.get("", response_model=list[NotificationResponse])
async def get_notifications(
    current_user: User = Depends(get_current_user),
    repo=Depends(get_notification_repository),
    preferences_repo: PreferencesRepository = Depends(get_preferences_repository),
    task_repo: TaskRepository = Depends(get_task_repository),
):
    """Отримати всі сповіщення поточного користувача (новіші спочатку)."""
    notification_service = NotificationService(repo, task_repo, preferences_repo)
    await notification_service.sync_task_notifications_for_user(current_user.id)
    
    uc = GetNotifications(repo)
    return [_to_response(n) for n in await uc.execute(current_user.id)]
 
 
@router.patch("/read-all")
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    repo=Depends(get_notification_repository),
):
    """Позначити всі сповіщення як прочитані."""
    uc = UpdateNotification(repo)
    count = await uc.mark_all_read(current_user.id)
    return {"marked": count}
 
 
@router.patch("/{notification_id}/read")
async def mark_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    repo=Depends(get_notification_repository),
):
    """Позначити одне сповіщення як прочитане."""
    uc = UpdateNotification(repo)
    ok = await uc.mark_read(notification_id, current_user.id)
    return {"ok": ok}
 
 
@router.delete("/{notification_id}", status_code=204)
async def delete_notification(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    repo=Depends(get_notification_repository),
):
    """Видалити сповіщення."""
    uc = UpdateNotification(repo)
    await uc.delete(notification_id, current_user.id)
    return Response(status_code=204)