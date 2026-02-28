from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.user import User
from app.models.chat import Chat
from app.core.dependencies import get_current_user
from app.services.rag_service import retrieve_relevant_chunks
from app.services.llm_service import generate_rag_response
from app.schemas.chat_schema import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/ask", response_model=ChatResponse)
async def ask_question(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Retrieve context
    context = await retrieve_relevant_chunks(db, current_user.id, request.query)
    
    if not context:
        raise HTTPException(status_code=404, detail="No relevant context found. Please upload documents first.")

    # 2. Generate final answer
    llm_response = await generate_rag_response(request.query, context)

    # 3. Store chat history
    new_chat = Chat(
        user_id=current_user.id,
        query=request.query,
        response=llm_response
    )
    db.add(new_chat)
    await db.commit()
    await db.refresh(new_chat)

    return new_chat
