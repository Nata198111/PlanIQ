from fastapi import APIRouter

router = APIRouter()


@router.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "ok",
        "service": "PlanIQ API",
        "version": "0.1.0",
    }
