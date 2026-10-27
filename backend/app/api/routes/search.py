from typing import Optional
from fastapi import APIRouter, Query, Depends
from app.models.schemas import SearchResult
from app.services.retrieval import get_retriever, KnowledgeRetriever

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("", response_model=SearchResult)
async def search_archive(
    q: str = Query(..., min_length=1, max_length=200, description="Search terms for the digital archive"),
    tech: Optional[str] = Query(None, description="Optional technology filter: cobol, fortran, basic, assembly"),
    retriever: KnowledgeRetriever = Depends(get_retriever),
) -> SearchResult:
    """
    Search the verified historical archive using pure-Python BM25 lexical ranking.
    Returns ranked passages and real source citations with zero GPU or embedding overhead.
    """
    clean_query = q.strip()
    if not clean_query:
        return SearchResult(query=q, total_matches=0, results=[])

    tech_filter = tech.strip().lower() if tech else None
    results = retriever.search(clean_query, technology_filter=tech_filter, min_score=0.3, top_k=5)

    return SearchResult(
        query=clean_query,
        total_matches=len(results),
        results=results,
    )
