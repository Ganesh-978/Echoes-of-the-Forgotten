import uuid
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import ChatRequest, ChatResponse, SourceReference, TerminalCommandRequest, TerminalCommandResponse
from app.services.retrieval import get_retriever, KnowledgeRetriever
from app.services.prompt_builder import build_system_prompt, build_user_prompt
from app.services.ai_provider import get_ai_provider, AIProviderBase, AIProviderError, OfflineArchiveProvider
from app.services.terminal_commands import get_command_interpreter
from app.repositories.database import get_db_repository
from app.api.routes.technologies import TECHNOLOGY_REGISTRY
from app.core.config import Settings, get_settings

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
async def chat_with_character(
    request: ChatRequest,
    settings: Settings = Depends(get_settings),
    retriever: KnowledgeRetriever = Depends(get_retriever),
) -> ChatResponse:
    """
    Retrieval-Augmented Generation (RAG) chat endpoint for the ghost terminal.
    1. Validates selected technology persona.
    2. Retrieves top relevant passages via BM25 from the local verified archive.
    3. Builds bounded prompt enforcing factual sources over hallucination.
    4. Generates response using external open-weight model or local fallback.
    5. Returns grounded answer with authentic source metadata.
    """
    tech_id = request.technology_id.lower().strip()
    if tech_id not in TECHNOLOGY_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Technology persona '{request.technology_id}' not found.")

    tech_info = TECHNOLOGY_REGISTRY[tech_id]
    conversation_id = request.conversation_id or f"conv_{uuid.uuid4().hex[:12]}"

    # Step 1: Lexical retrieval using BM25
    sources: List[SourceReference] = retriever.search(
        query=request.message,
        technology_filter=tech_id,
        min_score=0.3,
        top_k=2,
    )

    # Step 2: Build bounded prompt
    system_prompt = build_system_prompt(tech_info["name"], tech_info["system_prompt"])
    user_prompt = build_user_prompt(request.message, sources)

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    # Step 3: Inference generation with graceful fallback
    is_offline = not settings.is_ai_online
    reply: str = ""

    provider: AIProviderBase = get_ai_provider(settings)
    try:
        reply = await provider.generate_response(messages=messages, max_tokens=settings.AI_MAX_TOKENS)
    except AIProviderError as e:
        # Graceful fallback to local synthesis on API failure/timeout/rate-limit
        print(f"[Warning] AI Provider failure ({e.message}). Falling back to Offline Archive Mode.")
        offline_provider = OfflineArchiveProvider()
        reply = await offline_provider.generate_response(messages=messages, max_tokens=settings.AI_MAX_TOKENS)
        reply = f"{reply}\n\n[System Note: External inference was temporarily unavailable. Rendered via local archive synthesis.]"
        is_offline = True

    # Step 4: Persist interaction in SQLite
    repo = get_db_repository()
    # Save user message
    repo.record_message(
        conversation_id=conversation_id,
        technology_id=tech_id,
        role="user",
        content=request.message,
    )
    # Save assistant message with sources
    repo.record_message(
        conversation_id=conversation_id,
        technology_id=tech_id,
        role="assistant",
        content=reply,
        is_offline=is_offline,
        sources=[src.model_dump() for src in sources],
    )

    return ChatResponse(
        technology_id=tech_id,
        conversation_id=conversation_id,
        reply=reply,
        sources=sources,
        is_offline_synthesis=is_offline,
    )


@router.post("/command", response_model=TerminalCommandResponse)
async def execute_terminal_command(
    request: TerminalCommandRequest,
) -> TerminalCommandResponse:
    """
    Execute safe terminal commands (help, whoami, list, switch, search, inspect, clear, exit).
    Contains strictly zero eval, exec, subprocess, or shell access.
    """
    interpreter = get_command_interpreter()
    return interpreter.execute(
        command_line=request.command_line,
        current_technology_id=request.current_technology_id,
    )
