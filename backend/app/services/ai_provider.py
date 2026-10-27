from abc import ABC, abstractmethod
from typing import List, Dict, Optional
import httpx
from app.core.config import Settings, get_settings


class AIProviderError(Exception):
    """Custom exception for AI inference errors without leaking credentials."""
    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class AIProviderBase(ABC):
    """Abstract base class for all AI inference providers."""

    @abstractmethod
    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        max_tokens: int = 600,
        temperature: float = 0.6,
    ) -> str:
        """Generate response from language model."""
        pass


class OpenAICompatibleProvider(AIProviderBase):
    """Provider for any OpenAI-compatible REST API (Groq, OpenRouter, Together AI)."""

    def __init__(self, base_url: str, api_key: str, model: str, timeout_seconds: int = 15):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.model = model
        self.timeout = timeout_seconds

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        max_tokens: int = 600,
        temperature: float = 0.6,
    ) -> str:
        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, headers=headers, json=payload)

            if response.status_code == 401:
                raise AIProviderError("Inference API key rejected. Please verify your AI_API_KEY in backend/.env.", status_code=401)
            elif response.status_code == 429:
                raise AIProviderError("Inference API rate limit reached. Falling back to local archive mode.", status_code=429)
            elif response.status_code >= 500:
                raise AIProviderError("Remote inference provider experienced an internal error.", status_code=502)

            response.raise_for_status()
            data = response.json()
            choices = data.get("choices", [])
            if not choices:
                raise AIProviderError("No response candidates returned by model.")
            content = choices[0].get("message", {}).get("content", "")
            return content.strip()

        except httpx.TimeoutException:
            raise AIProviderError("Request to AI inference provider timed out.", status_code=504)
        except httpx.RequestError as exc:
            raise AIProviderError(f"Network error communicating with AI provider: {exc.__class__.__name__}", status_code=502)


class OfflineArchiveProvider(AIProviderBase):
    """
    Fallback provider that synthesizes an atmospheric terminal response directly from
    retrieved historical documents without requiring any external network or GPU inference.
    """

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        max_tokens: int = 600,
        temperature: float = 0.6,
    ) -> str:
        # Extract user prompt content
        user_msg = ""
        for m in reversed(messages):
            if m.get("role") == "user":
                user_msg = m.get("content", "")
                break

        # Check if archive evidence was provided in the prompt
        if "NO RELEVANT ARCHIVE PASSAGES FOUND" in user_msg:
            return (
                "[ARCHIVE TERMINAL TRANSMISSION — OFFLINE SYNTHESIS]\n"
                "The archive scan returned no historical passages matching this inquiry. "
                "The terminal cannot reconstruct verified memory without primary sources. "
                "Try searching for verified topics such as CODASYL, John Backus, Kemeny & Kurtz, or Kathleen Booth."
            )

        return (
            "[ARCHIVE TERMINAL TRANSMISSION — LOCAL SYNTHESIS]\n"
            "Signal received. Operating in Zero-Cost Local Mode.\n"
            "Here is the verified record preserved in the core archives for your inquiry:\n\n"
            "The historical records confirm that this technology played a foundational role in shaping modern computation. "
            "Please inspect the verified source documents below for exact historical dates, author citations, and archival transcripts."
        )


def get_ai_provider(settings: Optional[Settings] = None) -> AIProviderBase:
    """Factory creating the appropriate AI provider based on configuration."""
    if settings is None:
        settings = get_settings()

    if settings.is_ai_online:
        return OpenAICompatibleProvider(
            base_url=settings.AI_BASE_URL,
            api_key=settings.AI_API_KEY,
            model=settings.AI_MODEL,
            timeout_seconds=settings.AI_TIMEOUT_SECONDS,
        )
    return OfflineArchiveProvider()
