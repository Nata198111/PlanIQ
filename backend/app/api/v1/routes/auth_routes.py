from fastapi import APIRouter, Depends

from app.api.v1.dependencies.auth_deps import get_current_user, get_user_repository
from app.application.use_cases.auth.login_user import LoginUser
from app.application.use_cases.auth.register_user import RegisterUser
from app.core.exceptions import AuthenticationError, NotFoundError
from app.core.security import create_access_token, hash_password, verify_password
from app.domain.models.user import User
from app.ports.repositories.user_repository import UserRepository
from app.schemas.auth.requests import LoginRequest, RegisterRequest, UpdateProfileRequest, ChangePasswordRequest
from app.schemas.auth.responses import TokenResponse, UserResponse
from app.api.v1.dependencies.task_deps import get_task_repository
from app.api.v1.dependencies.preferences_deps import get_preferences_repository, get_notification_repository
from app.api.v1.dependencies.blocked_slot_deps import get_blocked_slot_repository
from app.ports.repositories.task_repository import TaskRepository
from app.ports.repositories.notification_repository import NotificationRepository
from app.ports.repositories.preferences_repository import PreferencesRepository
from app.ports.repositories.blocked_slot_repository import BlockedSlotRepository

router = APIRouter(prefix="/auth", tags=["Auth"])


def _user_to_response(user: User) -> UserResponse:
    return UserResponse(id=user.id, name=user.name, email=user.email)


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(
    body: RegisterRequest,
    user_repo: UserRepository = Depends(get_user_repository),
):
    use_case = RegisterUser(user_repo)
    user = await use_case.execute(
        name=body.name,
        email=body.email,
        password=body.password,
    )
    token = create_access_token(subject=user.id)
    return TokenResponse(token_type="bearer", access_token=token, user=_user_to_response(user))


@router.post("/login", response_model=TokenResponse)
async def login(
    body: LoginRequest,
    user_repo: UserRepository = Depends(get_user_repository),
):
    use_case = LoginUser(user_repo)
    user = await use_case.execute(email=body.email, password=body.password)
    token = create_access_token(subject=user.id)
    return TokenResponse(token_type="bearer", access_token=token, user=_user_to_response(user))


@router.patch("/me", response_model=UserResponse)
async def update_me(
    body: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    user_repo: UserRepository = Depends(get_user_repository),
):
    """Оновити особисті дані поточного користувача."""
    user = await user_repo.update_profile(
        user_id=current_user.id,
        name=body.name,
    )

    if not user:
        raise NotFoundError("User not found")

    return _user_to_response(user)


@router.patch("/change-password")
async def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    user_repo: UserRepository = Depends(get_user_repository),
):
    """Змінити пароль поточного користувача."""
    if not verify_password(body.current_password, current_user.hashed_password):
        raise AuthenticationError("Current password is incorrect")

    new_hash = hash_password(body.new_password)
    updated = await user_repo.update_password(current_user.id, new_hash)

    if not updated:
        raise NotFoundError("User not found")

    return {"ok": True}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Отримати дані поточного користувача."""
    return _user_to_response(current_user)


@router.delete("/me", status_code=204)
async def delete_me(
    current_user: User = Depends(get_current_user),
    user_repo: UserRepository = Depends(get_user_repository),
    task_repo: TaskRepository = Depends(get_task_repository),
    preferences_repo: PreferencesRepository = Depends(get_preferences_repository),
    notification_repo: NotificationRepository = Depends(get_notification_repository),
    blocked_slot_repo: BlockedSlotRepository = Depends(get_blocked_slot_repository),
):
    uid = current_user.id

    tasks = await task_repo.get_all_by_user(uid)
    for task in tasks:
        await task_repo.delete(task.id, uid)

    await notification_repo.delete_all_by_user(uid)

    slots = await blocked_slot_repo.get_all_by_user(uid)
    for slot in slots:
        await blocked_slot_repo.delete(slot.id, uid)

    await preferences_repo.delete(uid)
    await user_repo.delete(uid)