# app/application/services/decompose_service.py
"""
Сервіс декомпозиції задач через Google Gemini API.
Отримує задачу → генерує підзадачі → повертає список для preview.
"""
import json
import httpx

from app.core.config import settings
from app.domain.models.task import Task


GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.5-flash:generateContent"
)


def _build_prompt(task: Task) -> str:
    return f"""Ти — асистент з планування задач. Розбий задачу на підзадачі.

Задача: "{task.title}"
Опис: "{task.description or 'не вказано'}"
Складність: {task.complexity}/10
Тривалість: {task.duration}
Дедлайн: {task.date or 'не вказано'}
Категорія: {task.category}

Правила:
- Створи від 3 до 7 підзадач
- Підзадачі мають бути конкретними і виконуваними
- Враховуй загальну тривалість батьківської задачі
- Підзадачі мають виконуватись послідовно
- Відповідай ТІЛЬКИ валідним JSON без жодного тексту до або після

Формат відповіді (тільки JSON):
{{
  "subtasks": [
    {{
      "title": "Назва підзадачі",
      "description": "Опис що треба зробити (до 10 слів)",
      "duration": "30 хв",
      "complexity": 4,
      "sequence_order": 1
    }}
  ]
}}

Варіанти тривалості: "15 хв", "30 хв", "45 хв", "1 год", "1.5 год", "2 год", "3 год"
Складність: число від 1 до 10"""


async def decompose_task(task: Task) -> list[dict]:
    """
    Відправляє задачу в Gemini і повертає список підзадач.
    Кожна підзадача: { title, description, duration, complexity, sequence_order }
    """
    if not settings.gemini_api_key:
        raise ValueError("GEMINI_API_KEY не налаштований")

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": _build_prompt(task)}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 4096,
            "responseMimeType": "application/json",
        }
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{GEMINI_URL}?key={settings.gemini_api_key}",
            json=payload,
            headers={"Content-Type": "application/json"},
        )

        if response.status_code == 503:
            raise RuntimeError(
                "Gemini зараз перевантажений. Спробуй повторити запит трохи пізніше."
            )

        if response.status_code != 200:
            raise RuntimeError(
                f"Gemini API error {response.status_code}: {response.text}"
            )

        data = response.json()

    # Дістаємо текст відповіді
    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError) as e:
        raise RuntimeError(f"Неочікувана відповідь від Gemini: {e}")

    # Прибираємо markdown якщо є
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1])

    # Парсимо JSON
    try:
        result = json.loads(text)
        subtasks = result.get("subtasks", [])
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Gemini повернув невалідний JSON: {e}\nТекст: {text}")

    # Валідуємо структуру
    validated = []
    for i, s in enumerate(subtasks):
        validated.append({
            "title":          str(s.get("title", f"Підзадача {i+1}")),
            "description":    str(s.get("description", "")),
            "duration":       str(s.get("duration", "30 хв")),
            "complexity":     max(1, min(10, int(s.get("complexity", 5)))),
            "sequence_order": int(s.get("sequence_order", i + 1)),
        })

    return sorted(validated, key=lambda x: x["sequence_order"])