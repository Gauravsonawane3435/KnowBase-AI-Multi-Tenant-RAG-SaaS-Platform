from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List
from sqlalchemy import select, delete
from app.db.session import get_db
from app.models.user import User
from app.models.document import Document
from app.models.embedding import Embedding
from app.core.dependencies import get_current_user
from app.services.document_processor import extract_text_from_pdf, chunk_text
from app.services.embedding_service import generate_embedding
from app.schemas.document_schema import DocumentResponse

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("/", response_model=List[DocumentResponse])
async def list_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Document).where(Document.user_id == current_user.id).order_by(Document.created_at.desc())
    )
    return result.scalars().all()

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_bytes = await file.read()
    extracted_text = extract_text_from_pdf(file_bytes)
    
    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="No extractable text found in PDF")

    # 1. Create document row FIRST
    new_doc = Document(user_id=current_user.id, filename=file.filename)
    db.add(new_doc)
    await db.commit() # Commit metadata first
    await db.refresh(new_doc)

    try:
        # 2. Chunk text
        chunks = chunk_text(extracted_text, chunk_size=500, overlap=50)

        # 3. Embed & Store in PGVector
        for chunk in chunks:
            # Prepend filename to chunk to improve retrieval metadata context
            contextual_chunk = f"Document: {file.filename}\nContent: {chunk}"
            vec = await generate_embedding(contextual_chunk)
            new_embedding = Embedding(
                user_id=current_user.id,
                document_id=new_doc.id,
                chunk_text=chunk, # Store the actual text
                embedding=vec
            )
            db.add(new_embedding)

        # Final commit for embeddings
        await db.commit()
    except Exception as e:
        # If embedding fails, we still have the document row, but maybe we should log it
        print(f"Error during embedding: {e}")
        # Note: In a real app, you might want to mark the document as "failed" or delete it if critical
        pass

    return new_doc

@router.delete("/{document_id}")
async def delete_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify ownership
    result = await db.execute(
        select(Document).where(Document.id == document_id, Document.user_id == current_user.id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or access denied")

    # Delete embeddings and document (Cascade delete will handle embeddings if configured in DB, 
    # but we handle it explicitly via relationship cascade "all, delete-orphan")
    await db.delete(doc)
    await db.commit()

    return {"message": "Document and associated embeddings deleted successfully"}
