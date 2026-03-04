"""
RAG Retrieval Service — Production-grade retrieval with Hybrid Search.

Uses BM25 + Vector search with Reciprocal Rank Fusion when available,
falls back to vector-only search if BM25 indexes are not set up yet.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from app.services.hybrid_search import hybrid_search, vector_only_search, format_context


async def retrieve_relevant_chunks(
    db: AsyncSession,
    user_id: str,
    query: str,
    limit: int = 5,
    vector_weight: float = 0.7,
    keyword_weight: float = 0.3
) -> str:
    """
    Retrieves the most relevant chunks using hybrid search (Vector + BM25).
    Automatically falls back to vector-only search if BM25 isn't available.
    
    Returns formatted context string ready to be injected into the LLM prompt.
    """
    try:
        # Try hybrid search first (BM25 + Vector)
        results = await hybrid_search(
            db, user_id, query, limit,
            vector_weight=vector_weight,
            keyword_weight=keyword_weight
        )
        print(f"DEBUG: Hybrid search returned {len(results)} results")
    except Exception as e:
        # Fallback to vector-only search if BM25 column/index doesn't exist yet
        print(f"WARN: Hybrid search failed ({e}), falling back to vector-only")
        results = await vector_only_search(db, user_id, query, limit)
        print(f"DEBUG: Vector-only search returned {len(results)} results")

    if not results:
        return ""

    return format_context(results)
