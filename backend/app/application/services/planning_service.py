# app/application/services/planning_service.py

from datetime import date, datetime, timedelta, timezone
from dataclasses import dataclass

from app.domain.models.task import Task
from app.domain.models.preferences import UserPreferences
from app.domain.models.blocked_slot import BlockedSlot
from app.domain.services.priority_calculator import apply_priority_score
from app.ports.repositories.task_repository import TaskRepository
from app.ports.repositories.blocked_slot_repository import BlockedSlotRepository
from app.ports.repositories.preferences_repository import PreferencesRepository


def _time_to_minutes(t: str) -> int:
    """'09:30' → 570"""
    try:
        h, m = t.split(":")
        return int(h) * 60 + int(m)
    except Exception:
        return 0


def _minutes_to_time(mins: int) -> str:
    """570 → '09:30'"""
    h = (mins // 60) % 24
    m = mins % 60
    return f"{h:02d}:{m:02d}"


def _round_up_to_step(minutes: int, step: int = 15) -> int:
    return ((minutes + step - 1) // step) * step


def _get_task_deadline(task: Task) -> tuple[date | None, int | None]:
    if not task.date:
        return None, None

    try:
        deadline_date = date.fromisoformat(task.date)
        deadline_time = task.time or "23:59"
        deadline_minutes = _time_to_minutes(deadline_time)
        return deadline_date, deadline_minutes
    except Exception:
        return None, None


def _is_deadline_still_relevant(
    deadline_date: date | None,
    deadline_minutes: int | None,
) -> bool:
    if not deadline_date or deadline_minutes is None:
        return False

    today = date.today()
    now = datetime.now()
    now_minutes = now.hour * 60 + now.minute

    return deadline_date > today or (
        deadline_date == today and deadline_minutes > now_minutes
    )


def _parse_duration_minutes(duration: str) -> int:
    """'2 год' → 120, '30 хв' → 30"""
    if not duration:
        return 60
    d = duration.strip().lower()
    if "год" in d:
        try:
            return int(float(d.replace("год", "").strip()) * 60)
        except ValueError:
            return 60
    if "хв" in d:
        try:
            return int(float(d.replace("хв", "").strip()))
        except ValueError:
            return 30
    return 60


def _get_blocked_minutes_for_day(
    weekday: int,
    blocked_slots: list[BlockedSlot],
) -> list[tuple[int, int]]:
    """Повертає список (start_min, end_min) заблокованих інтервалів для дня тижня."""
    result = []
    for slot in blocked_slots:
        if slot.day_of_week == weekday:
            result.append((
                _time_to_minutes(slot.start_time),
                _time_to_minutes(slot.end_time),
            ))
    return result


def _is_slot_free(
    start_min: int,
    end_min: int,
    blocked: list[tuple[int, int]],
    lunch_start: int,
    lunch_end: int,
    lunch_enabled: bool,
) -> bool:
    """Перевіряє чи слот (start_min, end_min) вільний."""
    # Перевірка обідньої перерви
    if lunch_enabled:
        if not (end_min <= lunch_start or start_min >= lunch_end):
            return False

    # Перевірка заблокованих слотів
    for b_start, b_end in blocked:
        if not (end_min <= b_start or start_min >= b_end):
            return False

    return True


def _find_free_slot(
    duration_min: int,
    work_start: int,
    work_end: int,
    buffer: int,
    blocked: list[tuple[int, int]],
    lunch_start: int,
    lunch_end: int,
    lunch_enabled: bool,
    busy_slots: list[tuple[int, int]],
    prefer_peak: bool,
    peak_minutes: list[int],
) -> int | None:
    """
    Шукає перший вільний слот у робочому дні.
    Повертає start_min або None якщо день повний.
    """
    # Якщо треба пікові години — починаємо з них
    candidates = []
    if prefer_peak and peak_minutes:
        candidates = [p for p in peak_minutes if p >= work_start]
    candidates.append(work_start)

    for start_candidate in candidates:
        current = start_candidate
        for _ in range(200):  # максимум 200 ітерацій
            end = current + duration_min

            if end > work_end:
                break

            # Перевіряємо обід і заблоковані слоти
            if not _is_slot_free(current, end, blocked, lunch_start, lunch_end, lunch_enabled):
                # Пропускаємо через заблокований слот
                for b_start, b_end in sorted(blocked + ([(lunch_start, lunch_end)] if lunch_enabled else [])):
                    if current >= b_start and current < b_end:
                        current = b_end + buffer
                        break
                else:
                    current += 15
                continue

            # Перевіряємо зайняті слоти (вже заплановані задачі)
            conflict = False
            for busy_start, busy_end in busy_slots:
                if not (end + buffer <= busy_start or current >= busy_end + buffer):
                    conflict = True
                    current = busy_end + buffer
                    break

            if not conflict:
                return current

        # Якщо з піковим часом не вийшло — пробуємо з початку робочого дня
        if start_candidate != work_start:
            continue

        break

    return None


@dataclass
class PlanningResult:
    scheduled: list[Task]
    warnings: list[str]
    overloaded_days: list[str]


class PlanningService:
    """
    Головний сервіс інтелектуального планування PlanIQ.
    """

    def __init__(
        self,
        task_repo: TaskRepository,
        preferences_repo: PreferencesRepository,
        blocked_slot_repo: BlockedSlotRepository,
    ):
        self.task_repo = task_repo
        self.preferences_repo = preferences_repo
        self.blocked_slot_repo = blocked_slot_repo

    async def plan_for_user(
        self,
        user_id: str,
        start_date: date | None = None,
        days_ahead: int = 7,
    ) -> PlanningResult:
 
        if start_date is None:
            start_date = date.today()

        # Завантажуємо дані
        prefs = await self.preferences_repo.get_by_user_id(user_id)
        if not prefs:
            from app.domain.models.preferences import UserPreferences
            prefs = UserPreferences(user_id=user_id)

        all_tasks = await self.task_repo.get_all_by_user(user_id)

        parent_ids_with_subtasks = {
            t.parent_task_id
            for t in all_tasks
            if t.parent_task_id
        }
        blocked_slots = await self.blocked_slot_repo.get_all_by_user(user_id)

        # Беремо тільки невиконані задачі
        tasks_to_plan = [
            t for t in all_tasks
            if t.status not in ("Виконано",)
            and t.id not in parent_ids_with_subtasks
        ]

        # Розраховуємо priority_score для кожної
        now = datetime.now(timezone.utc)
        for task in tasks_to_plan:
            apply_priority_score(task, now)

        # Сортуємо: найвищий score першим
        tasks_to_plan.sort(key=lambda t: t.priority_score, reverse=True)

        # Налаштування з preferences
        work_start = _time_to_minutes(prefs.work_hours.start)
        work_end   = _time_to_minutes(prefs.work_hours.end)
        buffer     = prefs.buffer_minutes
        lunch_enabled = prefs.lunch_break.enabled
        lunch_start   = _time_to_minutes(prefs.lunch_break.start)
        lunch_end     = _time_to_minutes(prefs.lunch_break.end)
        peak_minutes  = [_time_to_minutes(p) for p in prefs.peak_hours]

        # Словник зайнятих слотів по днях: {date_str: [(start, end), ...]}
        busy_by_day: dict[str, list[tuple[int, int]]] = {}

        scheduled: list[Task] = []
        warnings: list[str] = []
        overloaded_days: list[str] = []

        for task in tasks_to_plan:
            duration_raw = _parse_duration_minutes(task.duration)
            # Коефіцієнт реальності — задача займає більше часу ніж здається
            duration_min = int(duration_raw * prefs.reality_coefficient)
            deadline_date, deadline_minutes = _get_task_deadline(task)
            deadline_is_relevant = _is_deadline_still_relevant(
                deadline_date,
                deadline_minutes,
            )
            placed = False

            # Шукаємо вільний день починаючи з сьогодні
            for day_offset in range(days_ahead):
                target_date = start_date + timedelta(days=day_offset)

                # Перевіряємо чи це робочий день
                if target_date.weekday() not in prefs.work_days:
                    continue
                # Якщо дедлайн ще не минув — не плануємо після дедлайну
                if deadline_is_relevant and deadline_date and target_date > deadline_date:
                    break

                date_str = target_date.isoformat()

                # Заблоковані слоти для цього дня тижня
                blocked_today = _get_blocked_minutes_for_day(
                    target_date.weekday(),
                    blocked_slots,
                )

                # Вже зайняті слоти в цей день
                busy_today = busy_by_day.get(date_str, [])

                # Складні задачі → пікові години
                prefer_peak = (
                    prefs.protect_peak_hours
                    and task.complexity >= 7
                )

                day_work_start = work_start
                day_work_end = work_end
                if target_date == date.today():
                    current_minutes = datetime.now().hour * 60 + datetime.now().minute
                    day_work_start = max(work_start, _round_up_to_step(current_minutes))
                if (
                    deadline_is_relevant
                    and deadline_date
                    and deadline_minutes is not None
                    and target_date == deadline_date
                ):
                    day_work_end = min(work_end, deadline_minutes)
                if day_work_start >= day_work_end:
                    continue

                slot_start = _find_free_slot(
                    duration_min=duration_min,
                    work_start=day_work_start,
                    work_end=day_work_end,
                    buffer=buffer,
                    blocked=blocked_today,
                    lunch_start=lunch_start,
                    lunch_end=lunch_end,
                    lunch_enabled=lunch_enabled,
                    busy_slots=busy_today,
                    prefer_peak=prefer_peak,
                    peak_minutes=peak_minutes,
                )

                if slot_start is not None:
                    task.scheduled_date = date_str
                    task.scheduled_time = _minutes_to_time(slot_start)

                    # Додаємо в зайняті слоти
                    if date_str not in busy_by_day:
                        busy_by_day[date_str] = []
                    busy_by_day[date_str].append(
                        (slot_start, slot_start + duration_min)
                    )

                    placed = True
                    break

            if placed:
                scheduled.append(task)
            else:
                if deadline_is_relevant:
                    warnings.append(
                        f"Не вдалося запланувати «{task.title}» до дедлайну "
                        f"{task.date} {task.time} — немає вільного слота"
                    )
                else:
                    warnings.append(
                        f"Не вдалося запланувати «{task.title}» — "
                        f"немає вільних слотів у найближчі {days_ahead} днів"
                    )

        # Зберігаємо оновлені задачі в БД
        for task in scheduled:
            await self.task_repo.update(task)

        # Перевіряємо перевантажені дні
        for date_str, slots in busy_by_day.items():
            total_minutes = sum(end - start for start, end in slots)
            available_minutes = work_end - work_start
            if lunch_enabled:
                available_minutes -= (lunch_end - lunch_start)

            if total_minutes > available_minutes * 0.9:
                overloaded_days.append(date_str)
                warnings.append(
                    f"День {date_str} завантажений на "
                    f"{round(total_minutes / available_minutes * 100)}% — "
                    f"деякі задачі можуть не вміститись"
                )

        return PlanningResult(
            scheduled=scheduled,
            warnings=warnings,
            overloaded_days=overloaded_days,
        )

    async def reschedule_task(
        self,
        task_id: str,
        user_id: str,
        earliest_start: datetime | None = None,
        days_ahead: int = 7,
    ):
        prefs = await self.preferences_repo.get_by_user_id(user_id)
        if not prefs:
            from app.domain.models.preferences import UserPreferences
            prefs = UserPreferences(user_id=user_id)

        all_tasks = await self.task_repo.get_all_by_user(user_id)
        blocked_slots = await self.blocked_slot_repo.get_all_by_user(user_id)
        parent_ids_with_subtasks = {
            t.parent_task_id
            for t in all_tasks
            if t.parent_task_id
        }

        task = next((t for t in all_tasks if t.id == task_id), None)
        if not task:
            return None
        
        if task.id in parent_ids_with_subtasks:
            task.scheduled_date = ""
            task.scheduled_time = ""
            await self.task_repo.update(task)
            return None

        # Збираємо зайняті слоти інших задач
        busy_by_day: dict[str, list[tuple[int, int]]] = {}

        for t in all_tasks:
            plan_date = t.scheduled_date or t.date
            plan_time = t.scheduled_time or t.time

            if t.id == task_id or t.status == "Виконано" or t.id in parent_ids_with_subtasks or not plan_date or not plan_time:
                continue
            dur = int(_parse_duration_minutes(t.duration) * prefs.reality_coefficient)
            start_min = _time_to_minutes(plan_time)
            if plan_date not in busy_by_day:
                busy_by_day[plan_date] = []
            busy_by_day[plan_date].append((start_min, start_min + dur))

        # Налаштування
        work_start    = _time_to_minutes(prefs.work_hours.start)
        work_end      = _time_to_minutes(prefs.work_hours.end)
        buffer        = prefs.buffer_minutes
        lunch_enabled = prefs.lunch_break.enabled
        lunch_start   = _time_to_minutes(prefs.lunch_break.start)
        lunch_end     = _time_to_minutes(prefs.lunch_break.end)
        peak_minutes  = [_time_to_minutes(p) for p in prefs.peak_hours]

        duration_min = int(
            _parse_duration_minutes(task.duration) * prefs.reality_coefficient
        )
        deadline_date, deadline_minutes = _get_task_deadline(task)
        deadline_is_relevant = _is_deadline_still_relevant(
            deadline_date,
            deadline_minutes,
        )
        today = date.today()

        for day_offset in range(days_ahead):
            target_date = today + timedelta(days=day_offset)

            if target_date.weekday() not in prefs.work_days:
                continue
            if deadline_is_relevant and deadline_date and target_date > deadline_date:
                break

            date_str = target_date.isoformat()
            blocked_today = _get_blocked_minutes_for_day(
                target_date.weekday(), blocked_slots
            )
            busy_today = busy_by_day.get(date_str, [])

            prefer_peak = prefs.protect_peak_hours and task.complexity >= 7

            day_work_start = work_start
            day_work_end = work_end

            if target_date == date.today():
                current_minutes = datetime.now().hour * 60 + datetime.now().minute
                day_work_start = max(work_start, _round_up_to_step(current_minutes))

            if earliest_start:
                earliest_date = earliest_start.date()
                earliest_minutes = earliest_start.hour * 60 + earliest_start.minute

                if target_date < earliest_date:
                    continue

                if target_date == earliest_date:
                    day_work_start = max(
                        day_work_start,
                        _round_up_to_step(earliest_minutes),
                    )

            if (
                deadline_is_relevant
                and deadline_date
                and deadline_minutes is not None
                and target_date == deadline_date
            ):
                day_work_end = min(work_end, deadline_minutes)

            if day_work_start >= day_work_end:
                continue

            slot_start = _find_free_slot(
                duration_min=duration_min,
                work_start=day_work_start,
                work_end=day_work_end,
                buffer=buffer,
                blocked=blocked_today,
                lunch_start=lunch_start,
                lunch_end=lunch_end,
                lunch_enabled=lunch_enabled,
                busy_slots=busy_today,
                prefer_peak=prefer_peak,
                peak_minutes=peak_minutes,
            )

            if slot_start is not None:
                task.scheduled_date = date_str
                task.scheduled_time = _minutes_to_time(slot_start)
                apply_priority_score(task)
                await self.task_repo.update(task)
                return task

        return None