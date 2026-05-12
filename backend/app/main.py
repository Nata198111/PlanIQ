# app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.infrastructure.database.mongodb import connect_to_mongo, close_mongo_connection
from app.api.v1.routes.health_routes import router as health_router

from fastapi import Request
from fastapi.responses import JSONResponse
from app.core.exceptions import AppError, AlreadyExistsError, NotFoundError, AuthenticationError

from app.api.v1.routes.auth_routes import router as auth_router
from app.api.v1.routes.task_routes import router as task_router
from app.api.v1.routes.preferences_routes import router as preferences_router
from app.api.v1.routes.notification_routes import router as notification_router
from app.api.v1.routes.blocked_slot_routes import router as blocked_slot_router
from app.api.v1.routes.planning_routes import router as planning_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        description="API для інтелектуального планування задач",
        version="0.1.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router, prefix="/api/v1")
    app.include_router(auth_router, prefix="/api/v1")
    app.include_router(task_router, prefix="/api/v1")
    app.include_router(preferences_router, prefix="/api/v1")
    app.include_router(notification_router, prefix="/api/v1")
    app.include_router(blocked_slot_router, prefix="/api/v1")
    app.include_router(planning_router, prefix="/api/v1")

    @app.exception_handler(AlreadyExistsError)
    async def already_exists_handler(request: Request, exc: AlreadyExistsError):
        return JSONResponse(status_code=409, content={"detail": exc.message, "code": exc.code})

    @app.exception_handler(NotFoundError)
    async def not_found_handler(request: Request, exc: NotFoundError):
        return JSONResponse(status_code=404, content={"detail": exc.message, "code": exc.code})

    @app.exception_handler(AuthenticationError)
    async def auth_error_handler(request: Request, exc: AuthenticationError):
        return JSONResponse(status_code=401, content={"detail": exc.message, "code": exc.code})
    

    return app


app = create_app()