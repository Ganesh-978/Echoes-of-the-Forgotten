from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, Field


class AIStatus(BaseModel):
    """Current status of the AI inference engine."""
    mode: str = Field(description="'online' if external inference is configured, otherwise 'offline'")
    provider: str = Field(description="Configured provider (groq, openrouter, offline, etc.)")
    model: str = Field(description="Configured model identifier")
    description: str = Field(description="Human-readable explanation of the current AI state")


class HealthResponse(BaseModel):
    """Health check response schema."""
    status: str = Field(default="ok")
    app_name: str = Field(default="Echoes of the Forgotten")
    version: str = Field(default="1.0.0")
    environment: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ai_status: AIStatus


class SourceReference(BaseModel):
    """Verified historical source metadata."""
    document_id: str
    title: str
    topic: str
    publication_date: Optional[str] = None
    source_title: str
    source_url: str
    technology: str
    excerpt: str
    relevance_score: Optional[float] = None


class TechnologySummary(BaseModel):
    """Summary of a featured forgotten technology character."""
    id: str
    name: str
    title: str
    era: str
    personality: str
    system_prompt: str
    intro_message: str
    theme_color: str
    document_count: int = 0
    suggested_questions: List[str] = []


class SearchResult(BaseModel):
    """Search result schema for the knowledge base."""
    query: str
    total_matches: int
    results: List[SourceReference]


class ChatRequest(BaseModel):
    """Incoming user chat message."""
    technology_id: str = Field(description="ID of the character (e.g., 'cobol', 'fortran', 'basic', 'assembly')")
    message: str = Field(min_length=1, max_length=1000, description="User's query")
    conversation_id: Optional[str] = Field(default=None, description="Optional conversation session ID")


class ChatResponse(BaseModel):
    """Structured response from the haunted terminal."""
    technology_id: str
    conversation_id: str
    reply: str
    sources: List[SourceReference]
    is_offline_synthesis: bool = False
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TerminalCommandRequest(BaseModel):
    """Direct terminal command execution."""
    command_line: str = Field(min_length=1, max_length=200)
    current_technology_id: Optional[str] = None


class TerminalCommandResponse(BaseModel):
    """Response to a terminal command."""
    command: str
    output: str
    command_type: str = Field(description="'system', 'navigation', 'info', 'clear', 'error'")
    new_technology_id: Optional[str] = None


class DiscoveryCreate(BaseModel):
    """Payload to save an interesting discovery."""
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1, max_length=5000)
    technology_id: str
    source_urls: List[str] = []


class DiscoveryResponse(DiscoveryCreate):
    """Saved discovery schema with ID and timestamp."""
    id: int
    created_at: datetime


class ConversationSummary(BaseModel):
    """Summary of a past chat conversation."""
    conversation_id: str
    technology_id: str
    message_count: int
    first_message: str
    created_at: datetime
    updated_at: datetime
