from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.session import get_db
from app.models.user import User
from app.models.document import Document
from app.models.chat import Chat
from app.models.embedding import Embedding
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Count documents
    doc_count = await db.execute(
        select(func.count(Document.id)).where(Document.user_id == current_user.id)
    )
    
    # Count chats
    chat_count = await db.execute(
        select(func.count(Chat.id)).where(Chat.user_id == current_user.id)
    )
    
    # Count embeddings (Knowledge Bits)
    embed_count = await db.execute(
        select(func.count(Embedding.id)).where(Embedding.user_id == current_user.id)
    )
    
    return {
        "documents": doc_count.scalar() or 0,
        "chats": chat_count.scalar() or 0,
        "knowledge_bits": embed_count.scalar() or 0,
        "sessions": 1 # Hardcoded as current active session
    }
