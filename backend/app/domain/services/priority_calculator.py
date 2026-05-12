# app/domain/services/priority_calculator.py
"""
Чистий domain service — не знає про HTTP, MongoDB, FastAPI.
Отримує задачу, повертає (score, label, reason).
"""
from datetime import datetime, timezone

from app.domain.models.task import Task


def _parse_duration_to_minutes(duration: str) -> int:
    """'2 год' → 120, '30 хв' → 30, '1.5 год' → 90"""
    if not duration:
        return 60
    duration = duration.strip().lower()
    if "год" in duration:
        try:
            return int(float(duration.replace("год", "").strip()) * 60)
        except ValueError:
            return 60
    if "хв" in duration:
        try:
            return int(float(duration.replace("хв", "").strip()))
        except ValueError:
            return 30
    return 60


def calculate_priority_score(
    task: Task,
    now: datetime | None = None,
) -> tuple[float, str, str]:
    """
    Розраховує priority_score, priority_label і priority_reason для задачі.

    Формула:
      - Дедлайн (0-40 балів) — чим ближче, тим більше
      - Складність (0-20 балів) — complexity * 2
      - Тривалість (0-10 балів) — довгі задачі треба починати раніше
      - Пріоритет юзера (0-20 балів) — High/Mid/Low
      - Статус (множник) — Терміново ×1.5, В процесі ×1.2

    Повертає:
      (score: float, label: str, reason: str)
    """
    if now is None:
        now = datetime.now(timezone.utc)

    score = 0.0
    reasons: list[str] = []

    # ── 1. Дедлайн (0-40 балів) ───────────────────────────────
    if task.date:
        try:
            task_time = task.time or "23:59"
            deadline_naive = datetime.fromisoformat(f"{task.date}T{task_time}:00")
            # Робимо timezone-aware
            deadline = deadline_naive.replace(tzinfo=timezone.utc)
            hours_left = (deadline - now).total_seconds() / 3600

            today = now.date()
            deadline_date = deadline.date()
            days_left = (deadline_date - today).days

            if hours_left < 0:
                score += 40
                reasons.append("задача прострочена")
            elif days_left == 0:
                if hours_left < 3:
                    score += 38
                    reasons.append("дедлайн у найближчі 3 години")
                else:
                    score += 35
                    reasons.append("дедлайн сьогодні")
            elif days_left == 1:
                score += 28
                reasons.append("дедлайн завтра")
            elif days_left <= 3:
                score += 20
                reasons.append(f"дедлайн через {days_left} дні")
            elif days_left <= 7:
                score += 12
                reasons.append("дедлайн цього тижня")
            else:
                score += 3

        except (ValueError, TypeError):
            pass

    # ── 2. Складність (0-20 балів) ────────────────────────────
    complexity = max(1, min(10, task.complexity or 5))
    score += complexity * 2
    if complexity >= 8:
        reasons.append("дуже складна задача")
    elif complexity >= 6:
        reasons.append("складна задача")

    # ── 3. Тривалість (0-10 балів) ────────────────────────────
    duration_min = _parse_duration_to_minutes(task.duration)
    if duration_min >= 180:
        score += 10
        reasons.append("потребує багато часу")
    elif duration_min >= 90:
        score += 6
    elif duration_min >= 60:
        score += 3

    # ── 4. Пріоритет юзера (0-20 балів) ──────────────────────
    priority_scores = {"High": 20, "Mid": 10, "Low": 3}
    user_priority_score = priority_scores.get(task.priority, 10)
    score += user_priority_score
    if task.priority == "High":
        reasons.append("позначена як High priority")

    # ── 5. Статус (множник) ───────────────────────────────────
    if task.status == "Терміново":
        score *= 1.5
        reasons.append("статус Терміново")
    elif task.status == "В процесі":
        score *= 1.2
        reasons.append("вже розпочата")
    elif task.status == "Виконано":
        # Виконані задачі не мають пріоритету
        return 0.0, "Виконано", "Задача вже виконана"

    score = round(score, 1)

    # ── 6. Label ──────────────────────────────────────────────
    if score >= 75:
        label = "Критичний"
    elif score >= 50:
        label = "Високий"
    elif score >= 25:
        label = "Середній"
    else:
        label = "Низький"

    # ── 7. Reason ─────────────────────────────────────────────
    if reasons:
        reason = f"Пріоритет «{label}»: {', '.join(reasons)}"
    else:
        reason = f"Пріоритет «{label}»: стандартна задача"

    return score, label, reason


def apply_priority_score(task: Task, now: datetime | None = None) -> Task:
    """Розраховує і записує priority_score в задачу. Повертає ту ж задачу."""
    score, label, reason = calculate_priority_score(task, now)
    task.priority_score = score
    task.priority_label = label
    task.priority_reason = reason
    return task