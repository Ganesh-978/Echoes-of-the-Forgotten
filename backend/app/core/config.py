from functools import lru_cache
from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment and .env file."""

    ENVIRONMENT: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # AI Configuration
    AI_PROVIDER: str = "groq"
    AI_BASE_URL: str = "https://api.groq.com/openai/v1"
    AI_API_KEY: str = ""
    AI_MODEL: str = "llama-3.1-8b-instant"
    AI_TIMEOUT_SECONDS: int = 15
    AI_MAX_TOKENS: int = 600

    # Persistence
    DATABASE_PATH: str = "echoes.db"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> List[str]:
        """Convert comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_ai_online(self) -> bool:
        """Determines if the external AI provider is configured and available."""
        return bool(self.AI_PROVIDER != "offline" and self.AI_API_KEY and self.AI_API_KEY.strip())


@lru_cache()
def get_settings() -> Settings:
    """Return cached application settings singleton."""
    return Settings()
