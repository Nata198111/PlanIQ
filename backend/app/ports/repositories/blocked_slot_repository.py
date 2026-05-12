from abc import ABC, abstractmethod
from app.domain.models.blocked_slot import BlockedSlot


class BlockedSlotRepository(ABC):

    @abstractmethod
    async def get_all_by_user(self, user_id: str) -> list[BlockedSlot]:
        ...

    @abstractmethod
    async def save(self, slot: BlockedSlot) -> BlockedSlot:
        ...

    @abstractmethod
    async def delete(self, slot_id: str, user_id: str) -> bool:
        ...