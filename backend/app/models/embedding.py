import uuid
from sqlalchemy import Column, String, ForeignKey, Text, Index
from sqlalchemy.dialects.postgresql import UUID, TSVECTOR
from pgvector.sqlalchemy import Vector
from app.db.base import Base

from sqlalchemy.orm import relationship

class Embedding(Base):
    __tablename__ = "embeddings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_text = Column(Text, nullable=False)
    embedding = Column(Vector(768), nullable=False)

    # BM25 Full-Text Search vector — auto-populated by database trigger
    search_vector = Column(TSVECTOR, nullable=True)

    document = relationship("Document", back_populates="embeddings")
