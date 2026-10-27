from fastapi import APIRouter, Depends
from app.core.config import Settings, get_settings
from app.models.schemas import HealthResponse, AIStatus

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", response_model=HealthResponse)
async def get_health(settings: Settings = Depends(get_settings)) -> HealthResponse:
    """Return system health status, active environment, and AI provider availability."""
    if settings.is_ai_online:
        ai_status = AIStatus(
            mode="online",
            provider=settings.AI_PROVIDER,
            model=settings.AI_MODEL,
            description="External open-weight inference provider is active and configured.",
        )
    else:
        ai_status = AIStatus(
            mode="offline",
            provider="offline_archive_synthesizer",
            model="local-bm25-grounded",
            description="Operating in Zero-Cost Offline Archive Mode. Knowledge retrieval is fully functional without external API credentials.",
        )

    return HealthResponse(
        status="ok",
        app_name="Echoes of the Forgotten",
        version="1.0.0",
        environment=settings.ENVIRONMENT,
        ai_status=ai_status,
    )
