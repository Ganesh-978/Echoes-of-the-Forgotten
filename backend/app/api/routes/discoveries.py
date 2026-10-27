from typing import List, Dict
from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import DiscoveryCreate, DiscoveryResponse
from app.repositories.database import get_db_repository, DatabaseRepository

router = APIRouter(prefix="/discoveries", tags=["Discoveries"])


@router.get("", response_model=List[DiscoveryResponse])
async def list_discoveries(
    repo: DatabaseRepository = Depends(get_db_repository),
) -> List[DiscoveryResponse]:
    """Retrieve all user-saved historical discoveries from the memory vault."""
    rows = repo.list_discoveries()
    return [
        DiscoveryResponse(
            id=r["id"],
            title=r["title"],
            content=r["content"],
            technology_id=r["technology_id"],
            source_urls=r["source_urls"],
            created_at=r["created_at"],
        )
        for r in rows
    ]


@router.post("", response_model=DiscoveryResponse, status_code=201)
async def create_discovery(
    payload: DiscoveryCreate,
    repo: DatabaseRepository = Depends(get_db_repository),
) -> DiscoveryResponse:
    """Save an interesting historical passage or discovery to SQLite storage."""
    result = repo.save_discovery(
        title=payload.title,
        content=payload.content,
        technology_id=payload.technology_id,
        source_urls=payload.source_urls,
    )
    return DiscoveryResponse(
        id=result["id"],
        title=result["title"],
        content=result["content"],
        technology_id=result["technology_id"],
        source_urls=result["source_urls"],
        created_at=result["created_at"],
    )


@router.delete("/{discovery_id}")
async def delete_discovery(
    discovery_id: int,
    repo: DatabaseRepository = Depends(get_db_repository),
) -> Dict[str, Any]:
    """Remove a saved discovery from the memory vault."""
    success = repo.delete_discovery(discovery_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Discovery ID {discovery_id} not found.")
    return {"status": "deleted", "discovery_id": discovery_id}
