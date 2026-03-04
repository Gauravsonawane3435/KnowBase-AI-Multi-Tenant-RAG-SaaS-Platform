"""
Chat API — Regular + Streaming Endpoints.

POST /chat/ask     → Full response (backward compatible)
POST /chat/stream  → Token-by-token SSE streaming
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.user import User
from app.models.chat import Chat
from app.core.dependencies import get_current_user
from app.services.rag_service import retrieve_relevant_chunks
from app.services.llm_service import generate_rag_response, generate_rag_response_stream
from app.schemas.chat_schema import ChatRequest, ChatResponse
import json

router = APIRouter(prefix="/chat", tags=["Chat"])


# ────────────────────────────────────────────────────────
#  NON-STREAMING: Full response (backward compatible)
# ────────────────────────────────────────────────────────

@router.post("/ask", response_model=ChatResponse)
async def ask_question(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Ask a question and get a full response (non-streaming)."""
    # 1. Retrieve context using hybrid search
    context = await retrieve_relevant_chunks(db, current_user.id, request.query)
    
    if not context:
        raise HTTPException(status_code=404, detail="No relevant context found. Please upload documents first.")

    # 2. Generate full answer
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


# ────────────────────────────────────────────────────────
#  STREAMING: Server-Sent Events (SSE) — token by token
# ────────────────────────────────────────────────────────

@router.post("/stream")
async def stream_question(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Streams LLM response token-by-token using Server-Sent Events (SSE).
    
    The frontend should read the stream using EventSource or fetch + ReadableStream.
    
    SSE Format:
        data: {"token": "Hello"}
        data: {"token": " world"}
        data: {"done": true, "chat_id": "uuid-here"}
    """
    # 1. Retrieve context (non-streaming — this part is fast)
    context = await retrieve_relevant_chunks(db, current_user.id, request.query)
    
    if not context:
        raise HTTPException(status_code=404, detail="No relevant context found. Please upload documents first.")

    # 2. Create SSE event generator
    async def event_generator():
        full_response = []

        # Stream tokens from LLM
        async for token in generate_rag_response_stream(request.query, context):
            full_response.append(token)
            # SSE format: "data: {json}\n\n"
            yield f"data: {json.dumps({'token': token})}\n\n"

        # 3. After streaming completes, save to database
        complete_response = "".join(full_response)
        new_chat = Chat(
            user_id=current_user.id,
            query=request.query,
            response=complete_response
        )
        db.add(new_chat)
        await db.commit()
        await db.refresh(new_chat)

        # 4. Send completion event with chat ID
        yield f"data: {json.dumps({'done': True, 'chat_id': str(new_chat.id)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx/proxy buffering
        }
    )
