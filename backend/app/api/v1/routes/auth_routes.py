from fastapi import APIRouter, Depends

from app.api.v1.dependencies.auth_deps import get_current_user, get_user_repository
from app.application.use_cases.auth.login_user import LoginUser
from app.application.use_cases.auth.register_user import RegisterUser
from app.core.security import create_access_token
from app.domain.models.user import User
from app.ports.repositories.user_repository import UserRepository
from app.schemas.auth.requests import LoginRequest, RegisterRequest
from app.schemas.auth.responses import TokenResponse, UserResponse

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


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return _user_to_response(current_user)