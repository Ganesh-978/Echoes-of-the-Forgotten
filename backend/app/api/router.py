from fastapi import APIRouter
from app.api.routes import health, technologies, search, chat, conversations, discoveries

api_router = APIRouter(prefix="/api")
api_router.include_router(health.router)
api_router.include_router(technologies.router)
api_router.include_router(search.router)
api_router.include_router(chat.router)
api_router.include_router(conversations.router)
api_router.include_router(discoveries.router)
