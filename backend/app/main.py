import warnings
warnings.filterwarnings("ignore", category=FutureWarning, module="google.generativeai")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.api import auth, documents, chat, dashboard
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

# Setup Routers
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(dashboard.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
