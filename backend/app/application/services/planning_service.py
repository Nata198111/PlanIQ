from datetime import date, datetime, timedelta, timezone
from dataclasses import dataclass
from collections import defaultdict
from typing import Literal

from app.domain.models.task import Task
from app.domain.models.preferences import UserPreferences
from app.domain.models.blocked_slot import BlockedSlot
from app.domain.services.priority_calculator import apply_priority_score
from app.ports.repositories.task_repository import TaskRepository
from app.ports.repositories.blocked_slot_repository import BlockedSlotRepository
from app.ports.repositories.preferences_repository import PreferencesRepository

@dataclass
class PlanningUnit:
    kind: Literal["single", "subtask_group"]
    tasks: list  
    priority_score: float  
    earliest_next_start: dict = None  

    def __post_init__(self):
        if self.earliest_next_start is None:
            self.earliest_next_start = {}

def _time_to_minutes(t: str) -> int:
    try:
        h, m = t.split(":")
        return int(h) * 60 + int(m)
    except Exception:
        return 0


def _minutes_to_time(mins: int) -> str:
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
    if lunch_enabled:
        if not (end_min <= lunch_start or start_min >= lunch_end):
            return False
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
    candidates = []
    if prefer_peak and peak_minutes:
        candidates = [p for p in peak_minutes if p >= work_start]
    candidates.append(work_start)

    for start_candidate in candidates:
        current = start_candidate
        for _ in range(200):
            end = current + duration_min
            if end > work_end:
                break
            if not _is_slot_free(current, end, blocked, lunch_start, lunch_end, lunch_enabled):
                for b_start, b_end in sorted(blocked + ([(lunch_start, lunch_end)] if lunch_enabled else [])):
                    if current >= b_start and current < b_end:
                        current = b_end + buffer
                        break
                else:
                    current += 15
                continue
            conflict = False
            for busy_start, busy_end in busy_slots:
                if not (end + buffer <= busy_start or current >= busy_end + buffer):
                    conflict = True
                    current = busy_end + buffer
                    break
            if not conflict:
                return current
        if start_candidate != work_start:
            continue
        break
    return None


def _can_be_displaced(task: Task, now: datetime) -> bool:
    if getattr(task, "was_displaced", False):
        return False
    if not task.date:
        return True

    deadline_date, deadline_minutes = _get_task_deadline(task)
    return not _is_deadline_still_relevant(deadline_date, deadline_minutes)


@dataclass
class PlanningResult:
    scheduled: list[Task]
    warnings: list[str]
    overloaded_days: list[str]

def _urgency_boost(unit: PlanningUnit, now_dt: datetime) -> float:
    min_hours = float('inf')
    for task in unit.tasks:
        if task.date:
            try:
                dl = datetime.fromisoformat(f"{task.date}T{task.time or '23:59'}")
                hours = (dl - now_dt).total_seconds() / 3600
                if hours > 0:
                    min_hours = min(min_hours, hours)
            except Exception:
                pass
    if min_hours == float('inf'):
        return 0.0
    return max(0.0, 30.0 - min_hours * 2)

class PlanningService:

    def __init__(
        self,
        task_repo: TaskRepository,
        preferences_repo: PreferencesRepository,
        blocked_slot_repo: BlockedSlotRepository,
    ):
        self.task_repo = task_repo
        self.preferences_repo = preferences_repo
        self.blocked_slot_repo = blocked_slot_repo

    def _try_displace_and_place(
        self,
        task: Task,
        deadline_date: date,
        duration_min: int,
        start_date: date,
        prefs: UserPreferences,
        blocked_slots: list[BlockedSlot],
        busy_by_day: dict[str, list[tuple[int, int]]],
        scheduled: list[Task],
        now: datetime,
    ) -> tuple[bool, list[Task]]:
        work_start    = _time_to_minutes(prefs.work_hours.start)
        work_end      = _time_to_minutes(prefs.work_hours.end)
        buffer        = prefs.buffer_minutes
        lunch_enabled = prefs.lunch_break.enabled
        lunch_start   = _time_to_minutes(prefs.lunch_break.start)
        lunch_end     = _time_to_minutes(prefs.lunch_break.end)
        peak_minutes  = [_time_to_minutes(p) for p in prefs.peak_hours]

        days_range = (deadline_date - start_date).days + 1

        for day_offset in range(days_range):
            target_date = start_date + timedelta(days=day_offset)

            if target_date.weekday() not in prefs.work_days:
                continue

            date_str = target_date.isoformat()

            candidates = [
                t for t in scheduled
                if t.scheduled_date == date_str
                and t.priority_score < task.priority_score
                and not t.parent_task_id
                and _can_be_displaced(t, now)
            ]

            if not candidates:
                continue

            candidates.sort(key=lambda t: t.priority_score)

            busy_today = list(busy_by_day.get(date_str, []))
            displaced_in_attempt: list[Task] = []

            for candidate in candidates:
                if not candidate.scheduled_time:
                    continue

                cand_start = _time_to_minutes(candidate.scheduled_time)
                cand_dur   = int(
                    _parse_duration_minutes(candidate.duration) * prefs.reality_coefficient
                )
                cand_slot = (cand_start, cand_start + cand_dur)

                if cand_slot in busy_today:
                    busy_today.remove(cand_slot)

                displaced_in_attempt.append(candidate)

                blocked_today  = _get_blocked_minutes_for_day(target_date.weekday(), blocked_slots)
                day_work_start = work_start
                day_work_end   = work_end

                if target_date == date.today():
                    current_minutes = datetime.now().hour * 60 + datetime.now().minute
                    day_work_start = max(work_start, _round_up_to_step(current_minutes))

                if target_date == deadline_date:
                    day_work_end = min(work_end, _time_to_minutes(task.time or "23:59"))

                if day_work_start >= day_work_end:
                    continue

                prefer_peak = prefs.protect_peak_hours and task.complexity >= 7

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

                    busy_by_day[date_str] = busy_today
                    busy_by_day[date_str].append((slot_start, slot_start + duration_min))

                    for displaced in displaced_in_attempt:
                        displaced.scheduled_date = ""
                        displaced.scheduled_time = ""
                        displaced.was_displaced  = True

                    return True, displaced_in_attempt

        return False, []
    
    def _place_single_task(
        self,
        task: Task,
        start_date: date,
        days_ahead: int,
        prefs,
        blocked_slots,
        busy_by_day: dict,
        scheduled: list,
        warnings: list,
        now: datetime,
        earliest_start: datetime | None = None,
    ) -> bool:
        work_start    = _time_to_minutes(prefs.work_hours.start)
        work_end      = _time_to_minutes(prefs.work_hours.end)
        buffer        = prefs.buffer_minutes
        lunch_enabled = prefs.lunch_break.enabled
        lunch_start   = _time_to_minutes(prefs.lunch_break.start)
        lunch_end     = _time_to_minutes(prefs.lunch_break.end)
        peak_minutes  = [_time_to_minutes(p) for p in prefs.peak_hours]

        duration_min = int(_parse_duration_minutes(task.duration) * prefs.reality_coefficient)
        deadline_date, deadline_minutes = _get_task_deadline(task)
        deadline_is_relevant = _is_deadline_still_relevant(deadline_date, deadline_minutes)
        placed = False

        if deadline_is_relevant and deadline_date and deadline_minutes is not None:
            now_dt = datetime.now()
            dl_dt = datetime.fromisoformat(
                f"{deadline_date}T{_minutes_to_time(deadline_minutes)}"
            )
            available_minutes = (dl_dt - now_dt).total_seconds() / 60
            if available_minutes < duration_min:
                warnings.append(
                    f"Задача «{task.title}» (тривалість {task.duration}) "
                    f"не вміщується до дедлайну {task.date} {task.time} — "
                    f"залишилось менше ніж потрібно"
                )
                return False

        for day_offset in range(days_ahead):
            target_date = start_date + timedelta(days=day_offset)

            if target_date.weekday() not in prefs.work_days:
                continue
            if deadline_is_relevant and deadline_date and target_date > deadline_date:
                break

            # earliest_start для підзадач
            if earliest_start and target_date < earliest_start.date():
                continue

            date_str      = target_date.isoformat()
            blocked_today = _get_blocked_minutes_for_day(target_date.weekday(), blocked_slots)
            busy_today    = busy_by_day.get(date_str, [])
            prefer_peak   = prefs.protect_peak_hours and task.complexity >= 7

            day_work_start = work_start
            day_work_end   = work_end

            if target_date == date.today():
                current_minutes = datetime.now().hour * 60 + datetime.now().minute
                day_work_start = max(work_start, _round_up_to_step(current_minutes))

            if earliest_start and target_date == earliest_start.date():
                earliest_minutes = earliest_start.hour * 60 + earliest_start.minute
                day_work_start = max(day_work_start, _round_up_to_step(earliest_minutes))

            if deadline_is_relevant and deadline_date and deadline_minutes is not None and target_date == deadline_date:
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
                if date_str not in busy_by_day:
                    busy_by_day[date_str] = []
                busy_by_day[date_str].append((slot_start, slot_start + duration_min))
                placed = True
                break

        if not placed and earliest_start is None:
            if deadline_is_relevant and deadline_date:
                # спробувати displacement
                displaced_placed, displaced_tasks = self._try_displace_and_place(
                    task=task, deadline_date=deadline_date,
                    duration_min=duration_min, start_date=start_date,
                    prefs=prefs, blocked_slots=blocked_slots,
                    busy_by_day=busy_by_day, scheduled=scheduled, now=now,
                )
                if displaced_placed:
                    placed = True
                    warnings.append(
                        f"Задачу «{task.title}» заплановано з витісненням "
                        f"менш пріоритетних задач для дотримання дедлайну {task.date}"
                    )
                    for dt in displaced_tasks:
                        warnings.append(f"Задачу «{dt.title}» витіснено і потрібне повторне планування")

        if not placed:
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

        return placed    

    async def plan_for_user(
        self,
        user_id: str,
        start_date: date | None = None,
        days_ahead: int = 7,
    ) -> PlanningResult:
        if start_date is None:
            start_date = date.today()

        prefs = await self.preferences_repo.get_by_user_id(user_id)
        if not prefs:
            prefs = UserPreferences(user_id=user_id)

        all_tasks = await self.task_repo.get_all_by_user(user_id)

        parent_ids_with_subtasks = {
            t.parent_task_id
            for t in all_tasks
            if t.parent_task_id
        }

        for t in all_tasks:
            if t.id in parent_ids_with_subtasks:
                if t.scheduled_date or t.scheduled_time:
                    t.scheduled_date = ""
                    t.scheduled_time = ""
                    await self.task_repo.update(t)

        blocked_slots = await self.blocked_slot_repo.get_all_by_user(user_id)

        now = datetime.now(timezone.utc)

        raw_tasks = [
            t for t in all_tasks
            if t.status not in ("Виконано",)
            and t.id not in parent_ids_with_subtasks
        ]
        for task in raw_tasks:
            task.scheduled_date = ""
            task.scheduled_time = ""
            task.was_displaced = False
            apply_priority_score(task, now)

        overdue_ids = set()
        active_tasks = []

        for task in raw_tasks:
            dl_date, dl_min = _get_task_deadline(task)
            if dl_date and not _is_deadline_still_relevant(dl_date, dl_min):
                task.priority_score += 50
                overdue_ids.add(task.id)
            active_tasks.append(task)

        subtask_groups: dict[str, list] = defaultdict(list)
        single_tasks = []

        for task in active_tasks:
            if task.parent_task_id:
                subtask_groups[task.parent_task_id].append(task)
            else:
                single_tasks.append(task)

        planning_units: list[PlanningUnit] = []

        for task in single_tasks:
            planning_units.append(PlanningUnit(
                kind="single",
                tasks=[task],
                priority_score=task.priority_score,
            ))

        for parent_id, subtasks in subtask_groups.items():
            subtasks.sort(key=lambda t: t.sequence_order)
            group_score = max(t.priority_score for t in subtasks)
            planning_units.append(PlanningUnit(
                kind="subtask_group",
                tasks=subtasks,
                priority_score=group_score,
            ))

        now_dt = datetime.now()
        planning_units.sort(key=lambda u: u.priority_score + _urgency_boost(u, now_dt), reverse=True)

        work_start    = _time_to_minutes(prefs.work_hours.start)
        work_end      = _time_to_minutes(prefs.work_hours.end)
        lunch_enabled = prefs.lunch_break.enabled
        lunch_start   = _time_to_minutes(prefs.lunch_break.start)
        lunch_end     = _time_to_minutes(prefs.lunch_break.end)

        busy_by_day: dict[str, list[tuple[int, int]]] = {}
        scheduled: list[Task] = []
        warnings:  list[str]  = []
        overloaded_days: list[str] = []

        for unit in planning_units:
            if unit.kind == "single":
                task = unit.tasks[0]
                placed = self._place_single_task(
                    task, start_date, days_ahead, prefs,
                    blocked_slots, busy_by_day, scheduled, warnings, now
                )
                if placed:
                    scheduled.append(task)
                    if task.id in overdue_ids:
                        warnings.append(
                            f"Задача «{task.title}» має прострочений дедлайн {task.date} "
                            f"— заплановано якнайшвидше"    
                        )
            else:
                earliest_dt: datetime | None = None 
                for task in unit.tasks:
                    placed = self._place_single_task(
                        task, start_date, days_ahead, prefs,
                        blocked_slots, busy_by_day, scheduled, warnings, now,
                        earliest_start=earliest_dt
                    )
                    if placed:
                        scheduled.append(task)
                        dur_min = int(_parse_duration_minutes(task.duration) * prefs.reality_coefficient)
                        sched_dt = datetime.fromisoformat(f"{task.scheduled_date}T{task.scheduled_time}")
                        earliest_dt = sched_dt + timedelta(minutes=dur_min)
                    else:
                        break


        all_to_save = list(active_tasks)

        for task in all_to_save:
            task.was_displaced = False
            await self.task_repo.update(task)

        for date_str, slots in busy_by_day.items():
            total_minutes     = sum(end - start for start, end in slots)
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
            prefs = UserPreferences(user_id=user_id)

        all_tasks     = await self.task_repo.get_all_by_user(user_id)
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

        busy_by_day: dict[str, list[tuple[int, int]]] = {}
        for t in all_tasks:
            # Враховуємо тільки реально заплановані задачі
            if not t.scheduled_date or not t.scheduled_time:
                continue
            if t.id == task_id or t.status == "Виконано" or t.id in parent_ids_with_subtasks:
                continue
            dur       = int(_parse_duration_minutes(t.duration) * prefs.reality_coefficient)
            start_min = _time_to_minutes(t.scheduled_time)
            if t.scheduled_date not in busy_by_day:
                busy_by_day[t.scheduled_date] = []
            busy_by_day[t.scheduled_date].append((start_min, start_min + dur))

        work_start    = _time_to_minutes(prefs.work_hours.start)
        work_end      = _time_to_minutes(prefs.work_hours.end)
        buffer        = prefs.buffer_minutes
        lunch_enabled = prefs.lunch_break.enabled
        lunch_start   = _time_to_minutes(prefs.lunch_break.start)
        lunch_end     = _time_to_minutes(prefs.lunch_break.end)
        peak_minutes  = [_time_to_minutes(p) for p in prefs.peak_hours]

        duration_min         = int(_parse_duration_minutes(task.duration) * prefs.reality_coefficient)
        deadline_date, deadline_minutes = _get_task_deadline(task)
        deadline_is_relevant = _is_deadline_still_relevant(deadline_date, deadline_minutes)
        today                = date.today()

        for day_offset in range(days_ahead):
            target_date = today + timedelta(days=day_offset)

            if target_date.weekday() not in prefs.work_days:
                continue
            if deadline_is_relevant and deadline_date and target_date > deadline_date:
                break

            date_str      = target_date.isoformat()
            blocked_today = _get_blocked_minutes_for_day(target_date.weekday(), blocked_slots)
            busy_today    = busy_by_day.get(date_str, [])
            prefer_peak   = prefs.protect_peak_hours and task.complexity >= 7

            day_work_start = work_start
            day_work_end   = work_end

            if target_date == date.today():
                current_minutes = datetime.now().hour * 60 + datetime.now().minute
                day_work_start  = max(work_start, _round_up_to_step(current_minutes))

            if earliest_start:
                earliest_date    = earliest_start.date()
                earliest_minutes = earliest_start.hour * 60 + earliest_start.minute
                if target_date < earliest_date:
                    continue
                if target_date == earliest_date:
                    day_work_start = max(day_work_start, _round_up_to_step(earliest_minutes))

            if deadline_is_relevant and deadline_date and deadline_minutes is not None and target_date == deadline_date:
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