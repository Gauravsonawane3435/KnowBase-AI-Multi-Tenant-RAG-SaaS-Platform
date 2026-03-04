import warnings
warnings.filterwarnings("ignore", category=FutureWarning, module="google.generativeai")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.api import auth, documents, chat, dashboard, evaluation
from app.db.session import engine
from app.db.base import Base

# Important: ensure all models are imported so they register with Base
from app.models import user, document, embedding, chat as chat_model

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import traceback
import sys

app = FastAPI(title="KnowBase AI API", version="1.0.0")

# Setup CORS - BE EXPLICIT
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://192.168.1.5:3000",
    "http://192.168.1.5:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"ERROR: Global exception caught: {exc}")
    traceback.print_exc()
    
    # Get origin from request to return it in header (helps with 500/CORS)
    origin = request.headers.get("origin", "*")
    
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={"Access-Control-Allow-Origin": origin}
    )

@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        # Create pgvector extension if not exists
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        # Create tables
        await conn.run_sync(Base.metadata.create_all)

        # Setup BM25 full-text search infrastructure
        try:
            # Add tsvector column if not exists
            await conn.execute(text("""
                ALTER TABLE embeddings 
                ADD COLUMN IF NOT EXISTS search_vector tsvector
            """))
            
            # Populate tsvector for existing rows
            await conn.execute(text("""
                UPDATE embeddings 
                SET search_vector = to_tsvector('english', chunk_text) 
                WHERE search_vector IS NULL
            """))
            
            # Create GIN index for fast BM25 search
            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS ix_embeddings_search_vector 
                ON embeddings USING gin(search_vector)
            """))
            
            # Create trigger to auto-populate tsvector on INSERT/UPDATE
            await conn.execute(text("""
                CREATE OR REPLACE FUNCTION update_search_vector()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.search_vector := to_tsvector('english', NEW.chunk_text);
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql
            """))
            
            await conn.execute(text("""
                DROP TRIGGER IF EXISTS trg_update_search_vector ON embeddings
            """))
            
            await conn.execute(text("""
                CREATE TRIGGER trg_update_search_vector
                BEFORE INSERT OR UPDATE OF chunk_text ON embeddings
                FOR EACH ROW EXECUTE FUNCTION update_search_vector()
            """))
            
            print("✅ BM25 full-text search infrastructure ready")
        except Exception as e:
            print(f"⚠️ BM25 setup skipped (non-critical): {e}")

# Setup Routers
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(dashboard.router)
app.include_router(evaluation.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
