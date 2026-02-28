from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    id: UUID
    query: str
    response: str
    created_at: datetime

    class Config:
        from_attributes = True
