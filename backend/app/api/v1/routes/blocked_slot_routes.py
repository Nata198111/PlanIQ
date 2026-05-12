# app/api/v1/routes/blocked_slot_routes.py
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.v1.dependencies.auth_deps import get_current_user
from app.api.v1.dependencies.blocked_slot_deps import get_blocked_slot_repository
from app.domain.models.blocked_slot import BlockedSlot
from app.domain.models.user import User
from app.ports.repositories.blocked_slot_repository import BlockedSlotRepository
from app.schemas.blocked_slot.requests import CreateBlockedSlotRequest
from app.schemas.blocked_slot.responses import BlockedSlotResponse

router = APIRouter(prefix="/blocked-slots", tags=["Blocked Slots"])

def _time_to_minutes(value: str) -> int:
    hours, minutes = value.split(":")
    return int(hours) * 60 + int(minutes)


def _slots_overlap(start_a: str, end_a: str, start_b: str, end_b: str) -> bool:
    a_start = _time_to_minutes(start_a)
    a_end = _time_to_minutes(end_a)
    b_start = _time_to_minutes(start_b)
    b_end = _time_to_minutes(end_b)

    return a_start < b_end and b_start < a_end

def _to_response(slot: BlockedSlot) -> BlockedSlotResponse:
    return BlockedSlotResponse(
        id=slot.id,
        user_id=slot.user_id,
        title=slot.title,
        day_of_week=slot.day_of_week,
        start_time=slot.start_time,
        end_time=slot.end_time,
        color=slot.color,
        created_at=slot.created_at,
    )


@router.get("", response_model=list[BlockedSlotResponse])
async def get_blocked_slots(
    current_user: User = Depends(get_current_user),
    repo: BlockedSlotRepository = Depends(get_blocked_slot_repository),
):
    """Отримати всі заблоковані слоти поточного користувача."""
    slots = await repo.get_all_by_user(current_user.id)
    return [_to_response(s) for s in slots]


@router.post("", response_model=BlockedSlotResponse, status_code=201)
async def create_blocked_slot(
    body: CreateBlockedSlotRequest,
    current_user: User = Depends(get_current_user),
    repo: BlockedSlotRepository = Depends(get_blocked_slot_repository),
):
    """Додати заблокований слот (англійська, тренування тощо)."""
    existing_slots = await repo.get_all_by_user(current_user.id)

    conflict = next(
        (
            s for s in existing_slots
            if s.day_of_week == body.day_of_week
            and _slots_overlap(
                body.start_time,
                body.end_time,
                s.start_time,
                s.end_time,
            )
        ),
        None,
    )

    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Цей час перетинається з уже заблокованим слотом "
                f"«{conflict.title}» {conflict.start_time}–{conflict.end_time}"
            ),
        )
    slot = BlockedSlot(
        user_id=current_user.id,
        title=body.title,
        day_of_week=body.day_of_week,
        start_time=body.start_time,
        end_time=body.end_time,
        color=body.color,
    )

    saved = await repo.save(slot)
    return _to_response(saved)


@router.delete("/{slot_id}", status_code=204)
async def delete_blocked_slot(
    slot_id: str,
    current_user: User = Depends(get_current_user),
    repo: BlockedSlotRepository = Depends(get_blocked_slot_repository),
):
    """Видалити заблокований слот."""
    await repo.delete(slot_id, current_user.id)