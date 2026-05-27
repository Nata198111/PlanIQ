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
    """Задача з ближчим дедлайном має плануватись раніше."""
    tomorrow  = (date.today() + timedelta(days=1)).isoformat()
    next_week = (date.today() + timedelta(days=6)).isoformat()

    tasks = [
        Task(user_id="u1", title="Низький пріоритет але завтра", id="t1",
             date=tomorrow, time="18:00", priority="Low",
             complexity=2, duration="1 год"),
        Task(user_id="u1", title="Середній пріоритет наступного тижня", id="t2",
             date=next_week, priority="Mid",
             complexity=5, duration="1 год"),
    ]

    from app.application.services.planning_service import PlanningService

    service = PlanningService(
        task_repo=MockTaskRepo(tasks),
        preferences_repo=MockPrefsRepo(UserPreferences()),
        blocked_slot_repo=MockBlockedSlotRepo(),
    )

    result = await service.plan_for_user("u1", days_ahead=7)
    print_result("Urgency boost", result)

    t1 = next((t for t in result.scheduled if t.id == "t1"), None)
    t2 = next((t for t in result.scheduled if t.id == "t2"), None)

    assert t1 and t2, "❌ Обидві задачі мають бути заплановані"
    assert (t1.scheduled_date, t1.scheduled_time) <= (t2.scheduled_date, t2.scheduled_time), \
        "❌ Задача з ближчим дедлайном має стояти раніше"
    print("✅ Urgency boost працює правильно")


async def main():
    print("Запуск тестів planning_service...\n")
    await test_subtask_order()
    await test_overdue_planned_asap()
    await test_old_scheduled_cleared()
    await test_urgency_boost()
    print(f"\n{'='*60}")
    print("Всі тести пройдено ✅")

if __name__ == "__main__":
    asyncio.run(main())