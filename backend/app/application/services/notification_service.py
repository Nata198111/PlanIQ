from datetime import datetime, timedelta

from app.domain.models.notification import Notification
from app.domain.models.task import Task
from app.ports.repositories.notification_repository import NotificationRepository
from app.ports.repositories.task_repository import TaskRepository


class NotificationService:
    DEADLINE_SOON_HOURS = 24

    def __init__(
        self,
        notification_repo: NotificationRepository,
        task_repo: TaskRepository | None = None,
    ):
        self.notification_repo = notification_repo
        self.task_repo = task_repo

    def _get_task_datetime(self, task: Task) -> datetime | None:
        if not task.date:
            return None

        task_time = task.time or "23:59"

        try:
            return datetime.fromisoformat(f"{task.date}T{task_time}")
        except ValueError:
            return None

    def _is_done(self, task: Task) -> bool:
        return task.status == "Виконано"

    async def _create_once(
        self,
        *,
        user_id: str,
        title: str,
        message: str,
        notification_type: str,
        task_id: str = "",
    ) -> Notification | None:
        if task_id:
            exists = await self.notification_repo.exists_by_task_and_type(
                task_id=task_id,
                user_id=user_id,
                notification_type=notification_type,
            )

            if exists:
                return None

        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notification_type,
            task_id=task_id,
        )

        return await self.notification_repo.save(notification)

    async def create_deadline_notifications_for_task(self, task: Task) -> None:
        if self._is_done(task):
            return

        task_datetime = self._get_task_datetime(task)
        if not task_datetime:
            return

        now = datetime.now()
        deadline_limit = now + timedelta(hours=self.DEADLINE_SOON_HOURS)

        if task_datetime < now:
            await self._create_once(
                user_id=task.user_id,
                title="Задача прострочена",
                message=f"Задача «{task.title}» вже прострочена.",
                notification_type="task_overdue",
                task_id=task.id,
            )
            return

        if now <= task_datetime <= deadline_limit:
            await self._create_once(
                user_id=task.user_id,
                title="Дедлайн наближається",
                message=f"Задача «{task.title}» має дедлайн {task.date} о {task.time}.",
                notification_type="deadline_soon",
                task_id=task.id,
            )

    async def create_rescheduled_notification(
        self,
        old_task: Task | None,
        new_task: Task,
    ) -> None:
        if not old_task:
            return

        date_changed = old_task.date != new_task.date
        time_changed = old_task.time != new_task.time

        if not date_changed and not time_changed:
            return

        await self._create_once(
            user_id=new_task.user_id,
            title="Задачу перенесено",
            message=f"Задача «{new_task.title}» була перенесена на {new_task.date} о {new_task.time}.",
            notification_type="rescheduled",
            task_id=new_task.id,
        )

    async def sync_task_notifications_for_user(self, user_id: str) -> None:
        if not self.task_repo:
            return

        tasks = await self.task_repo.get_all_by_user(user_id)

        for task in tasks:
            await self.create_deadline_notifications_for_task(task)