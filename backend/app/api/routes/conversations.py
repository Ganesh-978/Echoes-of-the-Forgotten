from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import ConversationSummary
from app.repositories.database import get_db_repository, DatabaseRepository

router = APIRouter(prefix="/conversations", tags=["Conversations"])


@router.get("", response_model=List[ConversationSummary])
async def list_conversations(
    repo: DatabaseRepository = Depends(get_db_repository),
) -> List[ConversationSummary]:
    """List all previous terminal conversations stored in local SQLite persistence."""
    rows = repo.list_conversations()
    return [
        ConversationSummary(
            conversation_id=r["conversation_id"],
            technology_id=r["technology_id"],
            message_count=r["message_count"],
            first_message=r["first_message"],
            created_at=r["created_at"],
            updated_at=r["updated_at"],
        )
        for r in rows
    ]


@router.get("/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    repo: DatabaseRepository = Depends(get_db_repository),
) -> List[Dict[str, Any]]:
    """Retrieve full chronological message transcript for a specific conversation."""
    messages = repo.get_conversation_messages(conversation_id)
    if not messages:
        raise HTTPException(status_code=404, detail=f"Conversation '{conversation_id}' not found.")
    return messages


@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    repo: DatabaseRepository = Depends(get_db_repository),
) -> Dict[str, str]:
    """Delete a conversation and its messages from local persistence."""
    deleted = repo.delete_conversation(conversation_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Conversation '{conversation_id}' not found.")
    return {"status": "deleted", "conversation_id": conversation_id}
