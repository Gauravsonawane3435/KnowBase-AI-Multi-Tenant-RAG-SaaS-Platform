from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.models.embedding import Embedding
from app.services.embedding_service import generate_query_embedding

async def retrieve_relevant_chunks(db: AsyncSession, user_id: str, query: str, limit: int = 5) -> str:
    """Retrieves the most relevant chunks from PGVector for a specific user."""
    query_embedding = await generate_query_embedding(query)
    
    # We must explicitly cast query_embedding to a string representation that pgvector accepts
    embedding_str = str(query_embedding)
    
    # Cosine distance operator is <=>
    sql = text("""
        SELECT e.chunk_text, d.filename, e.embedding <=> CAST(:query_embedding AS vector) AS distance
        FROM embeddings e
        JOIN documents d ON e.document_id = d.id
        WHERE e.user_id = :user_id
        ORDER BY distance ASC
        LIMIT :limit
    """)
    
    print(f"DEBUG: Retrieving for User ID: {user_id}")
    result = await db.execute(sql, {
        "query_embedding": embedding_str,
        "user_id": user_id, 
        "limit": limit
    })
    
    rows = result.fetchall()
    print(f"DEBUG: Found {len(rows)} relevant chunks")
    
    # Combine chunks into a single context string with filename metadata
    context_parts = []
    for row in rows:
        context_parts.append(f"[Source: {row.filename}]\n{row.chunk_text}")
        
    return "\n\n---\n\n".join(context_parts)
