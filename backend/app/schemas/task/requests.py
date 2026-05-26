from pydantic import BaseModel, field_validator


class CreateTaskRequest(BaseModel):
    title: str
    description: str = ""
    category: str = "PERSONAL"
    status: str = "Очікує"
    priority: str = "Mid"
    complexity: int = 5
    date: str = ""
    time: str = "09:00"
    scheduled_date: str = ""
    scheduled_time: str = ""
    duration: str = "1 год"
    parent_task_id: str = ""
    sequence_order: int = 0

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip()

    @field_validator("complexity")
    @classmethod
    def complexity_range(cls, v: int) -> int:
        if not (1 <= v <= 10):
            raise ValueError("Complexity must be between 1 and 10")
        return v


class UpdateTaskRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    status: str | None = None
    priority: str | None = None
    complexity: int | None = None
    date: str | None = None
    time: str | None = None
    scheduled_date: str | None = None
    scheduled_time: str | None = None
    duration: str | None = None
    parent_task_id: str | None = None
    sequence_order: int | None = None