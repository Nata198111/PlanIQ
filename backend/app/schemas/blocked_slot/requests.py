from pydantic import BaseModel, field_validator


class CreateBlockedSlotRequest(BaseModel):
    title: str
    day_of_week: int   # 0=Пн ... 6=Нд
    start_time: str    # "16:00"
    end_time: str      # "17:30"
    color: str = "#464555"

    @field_validator("day_of_week")
    @classmethod
    def validate_day(cls, v: int) -> int:
        if not (0 <= v <= 6):
            raise ValueError("day_of_week must be 0-6")
        return v

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip()