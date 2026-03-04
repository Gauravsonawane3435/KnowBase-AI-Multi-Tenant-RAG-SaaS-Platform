"""
Hybrid Search Engine: BM25 (Keyword) + Vector (Semantic) with Reciprocal Rank Fusion.

This module combines two complementary search strategies:
- Vector Search: Finds semantically similar content using PGVector cosine distance
- BM25 Search: Finds keyword-matching content using PostgreSQL full-text search (tsvector)

Results are merged using Reciprocal Rank Fusion (RRF) for optimal retrieval quality.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.services.embedding_service import generate_query_embedding


async def hybrid_search(
    db: AsyncSession,
    user_id: str,
    query: str,
    limit: int = 5,
    vector_weight: float = 0.7,
    keyword_weight: float = 0.3
) -> list[dict]:
    """
    Performs hybrid search combining vector similarity and BM25 keyword matching.
    
    Args:
        db: Database session
        user_id: Current user's ID for multi-tenant isolation
        query: User's search query
        limit: Number of results to return
        vector_weight: Weight for semantic search (0.0 - 1.0)
        keyword_weight: Weight for keyword search (0.0 - 1.0)
    
    Returns:
        List of dicts with chunk_text, filename, rrf_score, vector_distance, bm25_score
    """
    # 1. Generate query embedding for vector search
    query_embedding = await generate_query_embedding(query)
    embedding_str = str(query_embedding)

    # 2. Combined Hybrid Search using CTEs (Common Table Expressions)
    sql = text("""
        WITH vector_results AS (
            -- SEMANTIC SEARCH: PGVector cosine distance
            SELECT
                e.id,
                e.chunk_text,
                d.filename,
                e.embedding <=> CAST(:query_embedding AS vector) AS vector_distance,
                ROW_NUMBER() OVER (
                    ORDER BY e.embedding <=> CAST(:query_embedding AS vector) ASC
                ) AS vector_rank
            FROM embeddings e
            JOIN documents d ON e.document_id = d.id
            WHERE e.user_id = :user_id
            ORDER BY vector_distance ASC
            LIMIT :search_limit
        ),
        keyword_results AS (
            -- KEYWORD SEARCH: PostgreSQL Full-Text Search (BM25-equivalent)
            SELECT
                e.id,
                e.chunk_text,
                d.filename,
                ts_rank_cd(e.search_vector, plainto_tsquery('english', :query)) AS bm25_score,
                ROW_NUMBER() OVER (
                    ORDER BY ts_rank_cd(e.search_vector, plainto_tsquery('english', :query)) DESC
                ) AS keyword_rank
            FROM embeddings e
            JOIN documents d ON e.document_id = d.id
            WHERE e.user_id = :user_id
              AND e.search_vector IS NOT NULL
              AND e.search_vector @@ plainto_tsquery('english', :query)
            ORDER BY bm25_score DESC
            LIMIT :search_limit
        ),
        fused AS (
            -- RECIPROCAL RANK FUSION (RRF)
            -- Formula: score = weight * (1 / (k + rank)) where k = 60
            SELECT
                COALESCE(v.id, k.id) AS id,
                COALESCE(v.chunk_text, k.chunk_text) AS chunk_text,
                COALESCE(v.filename, k.filename) AS filename,
                v.vector_distance,
                k.bm25_score,
                (
                    COALESCE(:vector_weight * (1.0 / (60 + v.vector_rank)), 0) +
                    COALESCE(:keyword_weight * (1.0 / (60 + k.keyword_rank)), 0)
                ) AS rrf_score
            FROM vector_results v
            FULL OUTER JOIN keyword_results k ON v.id = k.id
        )
        SELECT chunk_text, filename, rrf_score, vector_distance, bm25_score
        FROM fused
        ORDER BY rrf_score DESC
        LIMIT :limit
    """)

    result = await db.execute(sql, {
        "query_embedding": embedding_str,
        "query": query,
        "user_id": str(user_id),
        "limit": limit,
        "search_limit": limit * 3,   # Cast wider net for fusion
        "vector_weight": vector_weight,
        "keyword_weight": keyword_weight
    })

    rows = result.fetchall()

    # 3. Format results with metadata
    results = []
    for row in rows:
        results.append({
            "chunk_text": row.chunk_text,
            "filename": row.filename,
            "rrf_score": float(row.rrf_score) if row.rrf_score else 0,
            "vector_distance": float(row.vector_distance) if row.vector_distance else None,
            "bm25_score": float(row.bm25_score) if row.bm25_score else None,
        })

    return results


async def vector_only_search(
    db: AsyncSession,
    user_id: str,
    query: str,
    limit: int = 5
) -> list[dict]:
    """Fallback: Vector-only search when BM25 is not available."""
    query_embedding = await generate_query_embedding(query)
    embedding_str = str(query_embedding)

    sql = text("""
        SELECT e.chunk_text, d.filename,
               e.embedding <=> CAST(:query_embedding AS vector) AS distance
        FROM embeddings e
        JOIN documents d ON e.document_id = d.id
        WHERE e.user_id = :user_id
        ORDER BY distance ASC
        LIMIT :limit
    """)

    result = await db.execute(sql, {
        "query_embedding": embedding_str,
        "user_id": str(user_id),
        "limit": limit
    })

    rows = result.fetchall()
    return [
        {
            "chunk_text": r.chunk_text,
            "filename": r.filename,
            "rrf_score": 1.0 - float(r.distance) if r.distance else 0,
            "vector_distance": float(r.distance) if r.distance else None,
            "bm25_score": None
        }
        for r in rows
    ]


def format_context(results: list[dict]) -> str:
    """Formats hybrid search results into context string for the LLM."""
    if not results:
        return ""
    context_parts = []
    for r in results:
        source = r["filename"]
        score_info = f"Relevance: {r['rrf_score']:.4f}"
        context_parts.append(f"[Source: {source} | {score_info}]\n{r['chunk_text']}")
    return "\n\n---\n\n".join(context_parts)
