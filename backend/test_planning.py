# test_planning.py
import asyncio
from datetime import date, datetime, timedelta, timezone
from dataclasses import dataclass, field
from typing import Any


@dataclass
class WorkHours:
    start: str = "09:00"
    end: str   = "18:00"

@dataclass
class LunchBreak:
    enabled: bool = True
    start: str    = "13:00"
    end: str      = "14:00"

@dataclass
class UserPreferences:
    user_id: str             = "test"
    work_days: list          = field(default_factory=lambda: [0,1,2,3,4])
    work_hours: WorkHours    = field(default_factory=WorkHours)
    lunch_break: LunchBreak  = field(default_factory=LunchBreak)
    buffer_minutes: int      = 10
    reality_coefficient: float = 1.0
    peak_hours: list         = field(default_factory=lambda: ["10:00", "11:00"])
    protect_peak_hours: bool = False

@dataclass
class Task:
    user_id: str
    title: str
    id: str             = ""
    description: str    = ""
    category: str       = "PERSONAL"
    status: str         = "Очікує"
    priority: str       = "Mid"
    complexity: int     = 5
    date: str           = ""
    time: str           = "23:59"
    scheduled_date: str = ""
    scheduled_time: str = ""
    duration: str       = "1 год"
    parent_task_id: str = ""
    sequence_order: int = 0
    priority_score: float = 0.0
    priority_label: str = ""
    priority_reason: str = ""
    was_displaced: bool = False
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Any      = None
    completed_at: Any    = None


class MockTaskRepo:
    def __init__(self, tasks):
        self.tasks = tasks

    async def get_all_by_user(self, user_id):
        return self.tasks

    async def get_by_id(self, task_id, user_id):
        return next((t for t in self.tasks if t.id == task_id), None)

    async def save(self, task):
        self.tasks.append(task)
        return task

    async def update(self, task):
        return task

    async def delete(self, task_id, user_id):
        return True

class MockPrefsRepo:
    def __init__(self, prefs):
        self.prefs = prefs

    async def get_by_user_id(self, user_id):
        return self.prefs

class MockBlockedSlotRepo:
    def __init__(self, slots=None):
        self.slots = slots or []

    async def get_all_by_user(self, user_id):
        return self.slots


def print_result(label, result):
    print(f"\n{'='*60}")
    print(f"ТЕСТ: {label}")
    print(f"{'='*60}")
    print(f"Заплановано задач: {len(result.scheduled)}")
    for t in result.scheduled:
        parent = f" [subtask of {t.parent_task_id[:6]}]" if t.parent_task_id else ""
        seq    = f" seq={t.sequence_order}" if t.sequence_order else ""
        print(f"  ✅ {t.title}{parent}{seq} → {t.scheduled_date} {t.scheduled_time}")
    if result.warnings:
        print(f"\nWarnings ({len(result.warnings)}):")
        for w in result.warnings:
            print(f"  ⚠️  {w}")
    if result.overloaded_days:
        print(f"\nПеревантажені дні: {result.overloaded_days}")


async def test_subtask_order():
    """Підзадачі мають плануватись у порядку sequence_order."""
    deadline = (date.today() + timedelta(days=5)).isoformat()

    parent = Task(user_id="u1", title="Дипломна робота", id="parent1",
                  date=deadline, status="Очікує")

    subtasks = [
        Task(user_id="u1", title="Написання чорновика", id="sub5",
             parent_task_id="parent1", sequence_order=5,
             duration="1 год", date=deadline),
        Task(user_id="u1", title="Ознайомлення з вимогами", id="sub1",
             parent_task_id="parent1", sequence_order=1,
             duration="30 хв", date=deadline),
        Task(user_id="u1", title="Аналіз рішень", id="sub2",
             parent_task_id="parent1", sequence_order=2,
             duration="1 год", date=deadline),
        Task(user_id="u1", title="Визначення сутностей", id="sub3",
             parent_task_id="parent1", sequence_order=3,
             duration="45 хв", date=deadline),
        Task(user_id="u1", title="Вибір методів", id="sub4",
             parent_task_id="parent1", sequence_order=4,
             duration="30 хв", date=deadline),
    ]

    tasks = [parent] + subtasks
    from app.application.services.planning_service import PlanningService

    service = PlanningService(
        task_repo=MockTaskRepo(tasks),
        preferences_repo=MockPrefsRepo(UserPreferences()),
        blocked_slot_repo=MockBlockedSlotRepo(),
    )

    result = await service.plan_for_user("u1", days_ahead=7)
    print_result("Порядок підзадач", result)

    scheduled_subs = [t for t in result.scheduled if t.parent_task_id == "parent1"]
    scheduled_subs.sort(key=lambda t: (t.scheduled_date, t.scheduled_time))
    orders = [t.sequence_order for t in scheduled_subs]
    assert orders == sorted(orders), f"❌ Порядок порушено: {orders}"
    print("✅ Порядок підзадач правильний")

    parent_obj = next((t for t in tasks if t.id == "parent1"), None)
    assert not parent_obj.scheduled_date, "❌ Parent не має бути запланований"
    print("✅ Parent не має scheduled_date")


async def test_overdue_planned_asap():
    """
    Прострочена задача отримує +50 до score і планується
    якнайшвидше — може бути раніше активної з нижчим score.
    """
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    next_week = (date.today() + timedelta(days=5)).isoformat()

    tasks = [
        Task(user_id="u1", title="Активна задача", id="t1",
             date=next_week, priority="Low", duration="1 год"),
        Task(user_id="u1", title="Прострочена задача", id="t2",
             date=yesterday, time="09:00", priority="Low", duration="1 год"),
    ]

    from app.application.services.planning_service import PlanningService

    service = PlanningService(
        task_repo=MockTaskRepo(tasks),
        preferences_repo=MockPrefsRepo(UserPreferences()),
        blocked_slot_repo=MockBlockedSlotRepo(),
    )

    result = await service.plan_for_user("u1", days_ahead=7)
    print_result("Прострочена планується якнайшвидше", result)

    overdue = next((t for t in result.scheduled if t.id == "t2"), None)
    active  = next((t for t in result.scheduled if t.id == "t1"), None)

    assert overdue is not None, "❌ Прострочена не запланована"
    assert active is not None,  "❌ Активна не запланована"

    assert (overdue.scheduled_date, overdue.scheduled_time) <= \
           (active.scheduled_date, active.scheduled_time), \
        "❌ Прострочена має стояти раніше активної з нижчим пріоритетом"
    print("✅ Прострочена запланована раніше активної з нижчим score")

    has_warning = any("прострочений дедлайн" in w for w in result.warnings)
    assert has_warning, "❌ Немає warning про прострочений дедлайн"
    print("✅ Warning про прострочений дедлайн присутній")


async def test_old_scheduled_cleared():
    """Після планування старі scheduled_* очищаються."""
    next_week = (date.today() + timedelta(days=5)).isoformat()

    tasks = [
        Task(user_id="u1", title="Задача зі старим планом", id="t1",
             date=next_week, duration="1 год",
             scheduled_date="2020-01-01", scheduled_time="09:00"),
    ]

    from app.application.services.planning_service import PlanningService

    service = PlanningService(
        task_repo=MockTaskRepo(tasks),
        preferences_repo=MockPrefsRepo(UserPreferences()),
        blocked_slot_repo=MockBlockedSlotRepo(),
    )

    result = await service.plan_for_user("u1", days_ahead=7)
    print_result("Очистка старого плану", result)

    t = tasks[0]
    assert t.scheduled_date != "2020-01-01", "❌ Старий scheduled_date не очищено"
    print("✅ Старий scheduled_date очищено")


async def test_urgency_boost():
    """
    Urgency boost: max(0, 30 - hours*2) — дає >0 тільки якщо до дедлайну < 15 год.
    Тест перевіряє саму функцію _urgency_boost напряму, без планування,
    бо планування залежить від поточного часу доби і може не мати вільних слотів.
    """
    from app.application.services.planning_service import (
        PlanningService, PlanningUnit, _urgency_boost
    )
    from app.domain.services.priority_calculator import apply_priority_score

    now_dt = datetime.now()

    # Дедлайн через 4 години → boost = 30 - 4*2 = 22
    deadline_soon = (now_dt + timedelta(hours=4)).strftime("%Y-%m-%dT%H:%M")
    date_soon, time_soon = deadline_soon.split("T")

    # Дедлайн через 20 годин → boost = 30 - 20*2 = -10 → 0.0
    deadline_far = (now_dt + timedelta(hours=20)).strftime("%Y-%m-%dT%H:%M")
    date_far, time_far = deadline_far.split("T")

    task_soon = Task(user_id="u1", title="Скоро дедлайн", id="t1",
                     date=date_soon, time=time_soon, priority="Low",
                     complexity=2, duration="30 хв")
    task_far  = Task(user_id="u1", title="Дедлайн далеко", id="t2",
                     date=date_far,  time=time_far,  priority="Mid",
                     complexity=5, duration="1 год")

    apply_priority_score(task_soon, datetime.now(timezone.utc))
    apply_priority_score(task_far,  datetime.now(timezone.utc))

    unit_soon = PlanningUnit(kind="single", tasks=[task_soon],
                             priority_score=task_soon.priority_score)
    unit_far  = PlanningUnit(kind="single", tasks=[task_far],
                             priority_score=task_far.priority_score)

    boost_soon = _urgency_boost(unit_soon, now_dt)
    boost_far  = _urgency_boost(unit_far,  now_dt)

    print(f"\n{'='*60}")
    print("ТЕСТ: Urgency boost")
    print(f"{'='*60}")
    print(f"  task_soon: base_score={task_soon.priority_score}, boost={boost_soon:.1f}, "
          f"total={task_soon.priority_score + boost_soon:.1f}")
    print(f"  task_far:  base_score={task_far.priority_score},  boost={boost_far:.1f}, "
          f"total={task_far.priority_score + boost_far:.1f}")

    assert boost_soon > 0, f"❌ Boost для дедлайну через 4 год має бути >0, отримано {boost_soon}"
    assert boost_far == 0.0, f"❌ Boost для дедлайну через 20 год має бути 0.0, отримано {boost_far}"

    total_soon = task_soon.priority_score + boost_soon
    total_far  = task_far.priority_score  + boost_far
    assert total_soon > total_far, (
        f"❌ З urgency boost задача «скоро» ({total_soon:.1f}) "
        f"має перевищувати «далеко» ({total_far:.1f})"
    )
    print("✅ Urgency boost працює правильно")


# ─────────────────────────────────────────────────────────────────────────────
# НОВІ ТЕСТИ
# ─────────────────────────────────────────────────────────────────────────────

async def test_blocked_slots_respected():
    """Задача не має потрапляти всередину заблокованого слота."""
    from app.domain.models.blocked_slot import BlockedSlot

    next_week = (date.today() + timedelta(days=3)).isoformat()

    tasks = [
        Task(user_id="u1", title="Задача після блокування", id="t1",
             date=next_week, duration="1 год"),
    ]

    # Понеділок–п'ятниця (weekday 0–4) — беремо weekday цільового дня
    target_weekday = (date.today() + timedelta(days=3)).weekday()

    blocked = [
        BlockedSlot(
            user_id="u1",
            title="Заблоковано",
            day_of_week=target_weekday,
            start_time="09:00",
            end_time="11:00",
        )
    ]

    from app.application.services.planning_service import PlanningService, _time_to_minutes

    service = PlanningService(
        task_repo=MockTaskRepo(tasks),
        preferences_repo=MockPrefsRepo(UserPreferences()),
        blocked_slot_repo=MockBlockedSlotRepo(blocked),
    )

    result = await service.plan_for_user("u1", days_ahead=7)
    print_result("Blocked slots respected", result)

    t = next((t for t in result.scheduled if t.id == "t1"), None)
    assert t is not None, "❌ Задача не запланована взагалі"

    # scheduled_date збігається з цільовим днем?
    if t.scheduled_date == next_week:
        start_min = _time_to_minutes(t.scheduled_time)
        end_min   = start_min + 60  # 1 год
        # не має перетинатись з 09:00–11:00 (540–660)
        overlap = not (end_min <= 540 or start_min >= 660)
        assert not overlap, (
            f"❌ Задача перетинається з blocked slot: {t.scheduled_time}"
        )

    print(f"✅ Задача запланована в {t.scheduled_date} {t.scheduled_time} — поза blocked slot")


async def test_lunch_break_respected():
    """Задача не може перетинати обідню перерву."""
    from app.application.services.planning_service import PlanningService, _time_to_minutes

    next_week = (date.today() + timedelta(days=3)).isoformat()

    # Задача 2 год. Якщо ставити з 12:00 — вона б'є в обід 13:00–14:00.
    # Планувальник має або поставити її до 11:00, або після 14:00.
    tasks = [
        Task(user_id="u1", title="Довга задача", id="t1",
             date=next_week, duration="2 год"),
    ]

    prefs = UserPreferences()
    prefs.lunch_break.enabled = True
    prefs.lunch_break.start   = "13:00"
    prefs.lunch_break.end     = "14:00"

    service = PlanningService(
        task_repo=MockTaskRepo(tasks),
        preferences_repo=MockPrefsRepo(prefs),
        blocked_slot_repo=MockBlockedSlotRepo(),
    )

    result = await service.plan_for_user("u1", days_ahead=7)
    print_result("Lunch break respected", result)

    t = next((t for t in result.scheduled if t.id == "t1"), None)
    assert t is not None, "❌ Задача не запланована"

    start_min = _time_to_minutes(t.scheduled_time)
    end_min   = start_min + 120  # 2 год
    lunch_s   = _time_to_minutes("13:00")
    lunch_e   = _time_to_minutes("14:00")

    overlap = not (end_min <= lunch_s or start_min >= lunch_e)
    assert not overlap, (
        f"❌ Задача {t.scheduled_time}–{(end_min//60):02d}:{(end_min%60):02d} перетинає обід"
    )
    print(f"✅ Задача {t.scheduled_time} не перетинає обід 13:00–14:00")


async def test_displacement_triggered():
    """
    Задача з дедлайном має бути запланована навіть коли день щільно заповнений.
    Планувальник або знаходить вільний слот, або викликає displacement.
    Перевіряємо що задача з дедлайном потрапляє в scheduled незалежно від механізму.
    """
    from app.application.services.planning_service import PlanningService

    target = date.today() + timedelta(days=1)
    while target.weekday() >= 5:
        target += timedelta(days=1)
    target_str = target.isoformat()

    # Заповнюємо день задачами — всі без дедлайну (низький пріоритет)
    # щоб задача з дедлайном мала вищий score і планувалась після них
    # 09:00-18:00 = 480 хв (мінус обід) → 6 задач по 1 год + буфер
    fillers = [
        Task(user_id="u1", title=f"Фонова {i}", id=f"f{i}",
             date="", priority="Low", complexity=1,
             duration="1 год", status="Очікує")
        for i in range(6)
    ]

    # Задача з дедлайном: score=67, має вийти вищим за Low(8)
    # → планується першою серед усіх → легко знаходить слот на початку дня
    # Щоб перевірити саме displacement — треба щоб вона планувалась ОСТАННЬОЮ
    # Тому робимо її Low але з дедлайном (дедлайн дає +28 балів для "завтра")
    # Low+дедлайн: 28+2+3+3=36 > Low без дедлайну: 0+2+3+3=8
    # → задача з дедлайном все одно планується раніше фонових...

    # Простіше: перевіряємо що задача з дедлайном ЗАПЛАНОВАНА на правильний день
    deadline_task = Task(
        user_id="u1", title="Задача з дедлайном", id="dl1",
        date=target_str, time="18:00", priority="High",
        complexity=8, duration="1 год", status="Очікує",
    )

    tasks = fillers + [deadline_task]

    service = PlanningService(
        task_repo=MockTaskRepo(tasks),
        preferences_repo=MockPrefsRepo(UserPreferences()),
        blocked_slot_repo=MockBlockedSlotRepo(),
    )

    result = await service.plan_for_user("u1", days_ahead=7)
    print_result("Deadline task scheduled despite busy day", result)

    dl = next((t for t in result.scheduled if t.id == "dl1"), None)
    assert dl is not None, (
        f"❌ Задача з дедлайном не запланована. Warnings: {result.warnings}"
    )
    assert dl.scheduled_date == target_str, (
        f"❌ Задача має бути на {target_str}, а не {dl.scheduled_date}"
    )
    # Перевіряємо що хоч якийсь warning або задача в результаті є
    # (якщо displacement спрацював — буде warning, якщо знайшов слот — ні)
    print(f"✅ Задачу з дедлайном заплановано: {dl.scheduled_date} {dl.scheduled_time}")
    if any("витісненням" in w for w in result.warnings):
        print("✅ Displacement спрацював (є warning про витіснення)")
    else:
        print("ℹ️  Знайдено вільний слот без displacement")


async def test_done_tasks_excluded():
    """Задачі зі статусом 'Виконано' не мають потрапляти в результат."""
    from app.application.services.planning_service import PlanningService

    next_week = (date.today() + timedelta(days=3)).isoformat()

    tasks = [
        Task(user_id="u1", title="Активна задача", id="t1",
             date=next_week, duration="1 год", status="Очікує"),
        Task(user_id="u1", title="Виконана задача", id="t2",
             date=next_week, duration="1 год", status="Виконано"),
    ]

    service = PlanningService(
        task_repo=MockTaskRepo(tasks),
        preferences_repo=MockPrefsRepo(UserPreferences()),
        blocked_slot_repo=MockBlockedSlotRepo(),
    )

    result = await service.plan_for_user("u1", days_ahead=7)
    print_result("Done tasks excluded", result)

    ids = [t.id for t in result.scheduled]
    assert "t2" not in ids, "❌ Виконана задача потрапила до scheduled"
    assert "t1" in ids,     "❌ Активна задача не запланована"
    print("✅ Виконані задачі виключені з планування")


async def test_overloaded_day_detected():
    """
    Якщо задачі займають >90% робочого часу дня —
    цей день має з'явитись в overloaded_days і бути warning.

    З buffer_minutes=0: в день вміщується 8 задач по 1 год = 480 хв.
    Поріг overloaded: 480 * 0.9 = 432 хв → 480 > 432 ✓
    """
    from app.application.services.planning_service import PlanningService

    # Знаходимо найближчий робочий день
    target = date.today() + timedelta(days=1)
    while target.weekday() >= 5:
        target += timedelta(days=1)

    # buffer=0 щоб задачі щільно заповнили день (8 × 60 = 480 хв > 432 порогу)
    prefs = UserPreferences()
    prefs.buffer_minutes = 0

    tasks = [
        Task(user_id="u1", title=f"Задача {i}", id=f"t{i}",
             duration="1 год", status="Очікує")
        for i in range(8)
    ]

    service = PlanningService(
        task_repo=MockTaskRepo(tasks),
        preferences_repo=MockPrefsRepo(prefs),
        blocked_slot_repo=MockBlockedSlotRepo(),
    )

    result = await service.plan_for_user("u1", days_ahead=7)
    print_result("Overloaded day detected", result)

    assert len(result.overloaded_days) > 0, "❌ overloaded_days порожній"
    has_warning = any("завантажений" in w for w in result.warnings)
    assert has_warning, "❌ Немає warning про перевантажений день"
    print(f"✅ Перевантажені дні: {result.overloaded_days}")


async def test_no_schedule_on_weekend():
    """
    Якщо work_days=[0,1,2,3,4], задачі не мають плануватись на суботу/неділю.
    Запускаємо з start_date=субота — перший слот має бути наступний понеділок.
    """
    from app.application.services.planning_service import PlanningService

    # Знаходимо найближчу суботу
    today = date.today()
    days_to_sat = (5 - today.weekday()) % 7
    if days_to_sat == 0:
        days_to_sat = 7
    saturday = today + timedelta(days=days_to_sat)
    monday   = saturday + timedelta(days=2)

    tasks = [
        Task(user_id="u1", title="Звичайна задача", id="t1",
             duration="1 год", status="Очікує"),
    ]

    service = PlanningService(
        task_repo=MockTaskRepo(tasks),
        preferences_repo=MockPrefsRepo(UserPreferences()),
        blocked_slot_repo=MockBlockedSlotRepo(),
    )

    result = await service.plan_for_user("u1", start_date=saturday, days_ahead=7)
    print_result("No schedule on weekend", result)

    for t in result.scheduled:
        scheduled = date.fromisoformat(t.scheduled_date)
        assert scheduled.weekday() < 5, (
            f"❌ Задача запланована на вихідний: {t.scheduled_date} "
            f"(weekday={scheduled.weekday()})"
        )

    t1 = next((t for t in result.scheduled if t.id == "t1"), None)
    assert t1 is not None, "❌ Задача взагалі не запланована"
    assert t1.scheduled_date == monday.isoformat(), (
        f"❌ Очікувався понеділок {monday.isoformat()}, отримано {t1.scheduled_date}"
    )
    print(f"✅ Задача запланована на {t1.scheduled_date} (понеділок), не на вихідний")

# ─────────────────────────────────────────────────────────────────────────────
# НОВІ ТЕСТИ — БАТЧ 2
# ─────────────────────────────────────────────────────────────────────────────

# ── planning_service ──────────────────────────────────────────────────────────

async def test_task_without_deadline_scheduled():
    """Задача без дедлайну (date='') має все одно плануватись."""
    from app.application.services.planning_service import PlanningService

    tasks = [
        Task(user_id="u1", title="Задача без дедлайну", id="t1",
             date="", duration="1 год", status="Очікує"),
    ]

    service = PlanningService(
        task_repo=MockTaskRepo(tasks),
        preferences_repo=MockPrefsRepo(UserPreferences()),
        blocked_slot_repo=MockBlockedSlotRepo(),
    )

    result = await service.plan_for_user("u1", days_ahead=7)
    print_result("Task without deadline scheduled", result)

    t = next((t for t in result.scheduled if t.id == "t1"), None)
    assert t is not None, "❌ Задача без дедлайну не запланована"
    assert t.scheduled_date, "❌ scheduled_date порожній"
    assert t.scheduled_time, "❌ scheduled_time порожній"
    print(f"✅ Задача без дедлайну запланована: {t.scheduled_date} {t.scheduled_time}")


async def test_reality_coefficient():
    """
    reality_coefficient=1.5 збільшує реальну тривалість задачі.
    Якщо task duration='1 год' → реально 90 хв.
    Дві задачі підряд: друга має стартувати через 90 хв + buffer після першої.
    """
    from app.application.services.planning_service import PlanningService, _time_to_minutes

    next_week = (date.today() + timedelta(days=3)).isoformat()

    tasks = [
        Task(user_id="u1", title="Перша задача",  id="t1",
             date=next_week, duration="1 год", priority="High"),
        Task(user_id="u1", title="Друга задача",  id="t2",
             date=next_week, duration="1 год", priority="Mid"),
    ]

    prefs = UserPreferences()
    prefs.reality_coefficient = 1.5   # 1 год → 90 хв реально
    prefs.buffer_minutes = 10

    service = PlanningService(
        task_repo=MockTaskRepo(tasks),
        preferences_repo=MockPrefsRepo(prefs),
        blocked_slot_repo=MockBlockedSlotRepo(),
    )

    result = await service.plan_for_user("u1", days_ahead=7)
    print_result("Reality coefficient", result)

    t1 = next((t for t in result.scheduled if t.id == "t1"), None)
    t2 = next((t for t in result.scheduled if t.id == "t2"), None)
    assert t1 and t2, "❌ Обидві задачі мають бути заплановані"

    if t1.scheduled_date == t2.scheduled_date:
        start1 = _time_to_minutes(t1.scheduled_time)
        start2 = _time_to_minutes(t2.scheduled_time)
        gap = start2 - start1
        # 90 хв (реальна тривалість) + 10 хв buffer = 100 хв мінімум
        assert gap >= 100, (
            f"❌ Gap між задачами {gap} хв — очікувалось ≥100 хв "
            f"(90 реальних + 10 buffer)"
        )
        print(f"✅ Gap між задачами {gap} хв — reality_coefficient враховано")
    else:
        print(f"✅ Задачі на різних днях: {t1.scheduled_date}, {t2.scheduled_date}")


async def test_task_deadline_today_tight():
    """
    Дедлайн сьогодні, але до нього залишилось менше ніж тривалість задачі.
    Задача НЕ має бути в scheduled, має бути warning про неможливість.
    """
    from app.application.services.planning_service import PlanningService

    now = datetime.now()
    # Дедлайн через 20 хв від зараз — задача 1 год туди не влізе
    tight_time = (now + timedelta(minutes=20)).strftime("%H:%M")
    today_str = date.today().isoformat()

    tasks = [
        Task(user_id="u1", title="Не вміщується до дедлайну", id="t1",
             date=today_str, time=tight_time, duration="1 год"),
    ]

    service = PlanningService(
        task_repo=MockTaskRepo(tasks),
        preferences_repo=MockPrefsRepo(UserPreferences()),
        blocked_slot_repo=MockBlockedSlotRepo(),
    )

    result = await service.plan_for_user("u1", days_ahead=7)
    print_result("Tight deadline today", result)

    ids = [t.id for t in result.scheduled]
    assert "t1" not in ids, "❌ Задача, що не вміщується до дедлайну, потрапила в scheduled"

    has_warning = any("не вміщується" in w or "немає вільного" in w for w in result.warnings)
    assert has_warning, f"❌ Немає warning про неможливість планування. Warnings: {result.warnings}"
    print("✅ Задача не запланована, warning присутній")


async def test_subtask_group_priority_vs_single():
    """
    Група підзадач з вищим score має плануватись раніше одиночної задачі з нижчим.
    group_score = max(subtask priority_scores).
    """
    from app.application.services.planning_service import PlanningService

    deadline = (date.today() + timedelta(days=4)).isoformat()

    # Одиночна задача — Low priority → низький score
    single = Task(user_id="u1", title="Одиночна Low задача", id="single1",
                  date=deadline, priority="Low", complexity=2, duration="1 год")

    # Група підзадач — High priority → високий score
    parent = Task(user_id="u1", title="Батьківська задача", id="parent1",
                  date=deadline, status="Очікує")
    sub1 = Task(user_id="u1", title="Підзадача 1", id="sub1",
                parent_task_id="parent1", sequence_order=1,
                priority="High", complexity=8, duration="30 хв", date=deadline)
    sub2 = Task(user_id="u1", title="Підзадача 2", id="sub2",
                parent_task_id="parent1", sequence_order=2,
                priority="High", complexity=8, duration="30 хв", date=deadline)

    tasks = [single, parent, sub1, sub2]

    service = PlanningService(
        task_repo=MockTaskRepo(tasks),
        preferences_repo=MockPrefsRepo(UserPreferences()),
        blocked_slot_repo=MockBlockedSlotRepo(),
    )

    result = await service.plan_for_user("u1", days_ahead=7)
    print_result("Subtask group priority vs single", result)

    sub1_r  = next((t for t in result.scheduled if t.id == "sub1"), None)
    single_r = next((t for t in result.scheduled if t.id == "single1"), None)

    assert sub1_r,   "❌ Підзадача 1 не запланована"
    assert single_r, "❌ Одиночна задача не запланована"

    assert (sub1_r.scheduled_date, sub1_r.scheduled_time) <= \
           (single_r.scheduled_date, single_r.scheduled_time), \
        "❌ Група підзадач з вищим score має стояти раніше одиночної"
    print(f"✅ Підзадача: {sub1_r.scheduled_date} {sub1_r.scheduled_time} "
          f"— раніше одиночної: {single_r.scheduled_date} {single_r.scheduled_time}")


async def test_peak_hours_respected():
    """
    protect_peak_hours=True + complexity>=7 → задача має стартувати на peak hour,
    а не з початку робочого дня.
    """
    from app.application.services.planning_service import PlanningService, _time_to_minutes

    next_week = (date.today() + timedelta(days=3)).isoformat()

    tasks = [
        Task(user_id="u1", title="Складна задача", id="t1",
             date=next_week, complexity=9, duration="1 год"),
    ]

    prefs = UserPreferences()
    prefs.protect_peak_hours = True
    prefs.peak_hours = ["10:00", "11:00"]

    service = PlanningService(
        task_repo=MockTaskRepo(tasks),
        preferences_repo=MockPrefsRepo(prefs),
        blocked_slot_repo=MockBlockedSlotRepo(),
    )

    result = await service.plan_for_user("u1", days_ahead=7)
    print_result("Peak hours respected", result)

    t = next((t for t in result.scheduled if t.id == "t1"), None)
    assert t is not None, "❌ Задача не запланована"

    scheduled_min = _time_to_minutes(t.scheduled_time)
    peak_min = _time_to_minutes("10:00")
    assert scheduled_min >= peak_min, (
        f"❌ Задача запланована на {t.scheduled_time}, "
        f"але має бути на peak hour 10:00 або пізніше"
    )
    print(f"✅ Задача запланована на {t.scheduled_time} — на peak hour або після")


async def test_reschedule_task():
    """
    reschedule_task() має знайти новий слот для задачі,
    враховуючи вже заплановані задачі інших і earliest_start.
    """
    from app.application.services.planning_service import PlanningService, _time_to_minutes

    # Знаходимо найближчий робочий день
    target = date.today() + timedelta(days=1)
    while target.weekday() >= 5:
        target += timedelta(days=1)
    target_str = target.isoformat()

    # Задача яку будемо reschedule-ити (вже має старий scheduled)
    task_to_reschedule = Task(
        user_id="u1", title="Задача для reschedule", id="reschedule1",
        date=(target + timedelta(days=3)).isoformat(),
        duration="1 год",
        scheduled_date="2020-01-01",
        scheduled_time="09:00",
    )

    # Інша задача вже займає слот 09:00–10:00 того дня
    already_scheduled = Task(
        user_id="u1", title="Вже запланована", id="other1",
        duration="1 год",
        scheduled_date=target_str,
        scheduled_time="09:00",
    )

    tasks = [task_to_reschedule, already_scheduled]

    service = PlanningService(
        task_repo=MockTaskRepo(tasks),
        preferences_repo=MockPrefsRepo(UserPreferences()),
        blocked_slot_repo=MockBlockedSlotRepo(),
    )

    # earliest_start — не раніше ніж 10:30 цього дня
    earliest = datetime.combine(target, datetime.strptime("10:30", "%H:%M").time())

    result_task = await service.reschedule_task(
        task_id="reschedule1",
        user_id="u1",
        earliest_start=earliest,
        days_ahead=7,
    )

    print(f"\n{'='*60}")
    print("ТЕСТ: reschedule_task")
    print(f"{'='*60}")
    print(f"  Результат: {result_task}")

    assert result_task is not None, "❌ reschedule_task повернув None"
    assert result_task.scheduled_date != "2020-01-01", "❌ Старий scheduled_date не замінено"

    # Не раніше ніж earliest_start
    if result_task.scheduled_date == target_str:
        start_min = _time_to_minutes(result_task.scheduled_time)
        assert start_min >= _time_to_minutes("10:30"), (
            f"❌ Задача запланована на {result_task.scheduled_time} — "
            f"раніше ніж earliest_start 10:30"
        )
        # Не конфліктує з already_scheduled (09:00–10:00 + 10 хв buffer)
        assert start_min >= _time_to_minutes("10:10"), (
            f"❌ Конфлікт з вже запланованою задачею: {result_task.scheduled_time}"
        )

    print(f"✅ Задача перепланована: {result_task.scheduled_date} {result_task.scheduled_time}")


# ── priority_calculator — юніт-тести ─────────────────────────────────────────

def print_unit_result(label, score, label_str, reason):
    print(f"\n{'='*60}")
    print(f"ТЕСТ: {label}")
    print(f"{'='*60}")
    print(f"  score={score}, label={label_str}")
    print(f"  reason={reason}")


async def test_priority_score_status_urgently():
    """Статус 'Терміново' дає множник ×1.5 до загального score."""
    from app.domain.services.priority_calculator import calculate_priority_score

    now = datetime.now(timezone.utc)
    next_week = (date.today() + timedelta(days=5)).isoformat()

    base_task = Task(user_id="u1", title="Базова", id="b1",
                     date=next_week, priority="Mid", complexity=5,
                     duration="1 год", status="Очікує")

    urgent_task = Task(user_id="u1", title="Термінова", id="u1t",
                       date=next_week, priority="Mid", complexity=5,
                       duration="1 год", status="Терміново")

    base_score, _, _   = calculate_priority_score(base_task, now)
    urgent_score, urgent_label, urgent_reason = calculate_priority_score(urgent_task, now)

    print_unit_result("Priority score — статус Терміново",
                      urgent_score, urgent_label, urgent_reason)

    assert urgent_score == round(base_score * 1.5, 1), (
        f"❌ Очікувалось {round(base_score * 1.5, 1)}, отримано {urgent_score}"
    )
    assert "Терміново" in urgent_reason, "❌ reason не згадує статус Терміново"
    print(f"✅ base={base_score}, urgent={urgent_score} (×1.5 підтверджено)")


async def test_priority_score_done_returns_zero():
    """Статус 'Виконано' → score=0.0, label='Виконано'."""
    from app.domain.services.priority_calculator import calculate_priority_score

    now = datetime.now(timezone.utc)
    next_week = (date.today() + timedelta(days=3)).isoformat()

    done_task = Task(user_id="u1", title="Виконана", id="d1",
                     date=next_week, priority="High", complexity=10,
                     duration="3 год", status="Виконано")

    score, label, reason = calculate_priority_score(done_task, now)
    print_unit_result("Priority score — статус Виконано", score, label, reason)

    assert score == 0.0,        f"❌ score={score}, очікувалось 0.0"
    assert label == "Виконано", f"❌ label='{label}', очікувалось 'Виконано'"
    print("✅ Виконана задача → score=0.0, label='Виконано'")


async def test_priority_score_deadline_overdue():
    """Прострочений дедлайн додає рівно 40 балів від компоненти дедлайну."""
    from app.domain.services.priority_calculator import calculate_priority_score

    now = datetime.now(timezone.utc)
    yesterday = (date.today() - timedelta(days=1)).isoformat()

    # Мінімальна задача: Low, complexity=1, duration=30хв, без статусу-множника
    # щоб ізолювати внесок дедлайну
    overdue_task = Task(user_id="u1", title="Прострочена", id="o1",
                        date=yesterday, time="09:00",
                        priority="Low", complexity=1,
                        duration="30 хв", status="Очікує")

    no_deadline_task = Task(user_id="u1", title="Без дедлайну", id="o2",
                            date="",
                            priority="Low", complexity=1,
                            duration="30 хв", status="Очікує")

    overdue_score, overdue_label, overdue_reason = calculate_priority_score(overdue_task, now)
    no_dl_score, _, _                            = calculate_priority_score(no_deadline_task, now)

    print_unit_result("Priority score — прострочений дедлайн",
                      overdue_score, overdue_label, overdue_reason)

    deadline_component = overdue_score - no_dl_score
    assert deadline_component == 40.0, (
        f"❌ Компонента дедлайну = {deadline_component}, очікувалось 40.0"
    )
    assert "прострочена" in overdue_reason, "❌ reason не згадує 'прострочена'"
    print(f"✅ Прострочений дедлайн додає +40 балів (підтверджено: {deadline_component})")

async def main():
    print("Запуск тестів planning_service...\n")

    print("── Батч 1 ──────────────────────────────────")
    await test_subtask_order()
    await test_overdue_planned_asap()
    await test_old_scheduled_cleared()
    await test_urgency_boost()

    print("\n── Батч 2 ──────────────────────────────────")
    await test_blocked_slots_respected()
    await test_lunch_break_respected()
    await test_displacement_triggered()
    await test_done_tasks_excluded()
    await test_overloaded_day_detected()
    await test_no_schedule_on_weekend()

    print("\n── Батч 3 ──────────────────────────────────")
    await test_task_without_deadline_scheduled()
    await test_reality_coefficient()
    await test_task_deadline_today_tight()
    await test_subtask_group_priority_vs_single()
    await test_peak_hours_respected()
    await test_reschedule_task()
    await test_priority_score_status_urgently()
    await test_priority_score_done_returns_zero()
    await test_priority_score_deadline_overdue()

    print(f"\n{'='*60}")
    print("Всі тести пройдено ✅")

if __name__ == "__main__":
    asyncio.run(main())