from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.config import get_settings

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for application startup and shutdown."""
    print("---------------------------------------------------------------")
    print(f" Echoes of the Forgotten Backend [v1.0.0]")
    print(f" Mode: {'ONLINE (API Key Active)' if settings.is_ai_online else 'OFFLINE ARCHIVE MODE (No Key Required)'}")
    print(f" Provider: {settings.AI_PROVIDER} | Model: {settings.AI_MODEL}")
    print("---------------------------------------------------------------")
    yield


app = FastAPI(
    title="Echoes of the Forgotten API",
    description="Backend engine for the Hacktoberfest 2026 digital archaeology and retro terminal archive.",
    version="1.0.0",
    lifespan=lifespan,
)

# Explicit CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(api_router)


@app.get("/")
def root():
    """Root endpoint for status inspection."""
    return {
        "project": "Echoes of the Forgotten",
        "challenge": "DEV Community Hacktoberfest 2026 — Ghost in the Machine",
        "status": "online",
        "docs_url": "/docs",
        "health_url": "/api/health",
    }
