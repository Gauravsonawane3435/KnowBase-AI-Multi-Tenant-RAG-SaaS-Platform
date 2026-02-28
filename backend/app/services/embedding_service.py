import json
import httpx
from app.config import settings

async def generate_embedding(text: str) -> list[float]:
    """Generates embedding for a given text using raw REST API as SDK fallback"""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={settings.GEMINI_API_KEY}"
    
    payload = {
        "model": "models/gemini-embedding-001",
        "content": {
            "parts": [{"text": text}]
        },
        "outputDimensionality": 768
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=30.0)
            response.raise_for_status()
            data = response.json()
            return data["embedding"]["values"]
    except Exception as e:
        raise Exception(f"Failed to generate embedding via REST: {str(e)}")

async def generate_query_embedding(text: str) -> list[float]:
    """Generates embedding for a search query using raw REST API"""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={settings.GEMINI_API_KEY}"
    
    payload = {
        "model": "models/gemini-embedding-001",
        "content": {
            "parts": [{"text": text}]
        },
        "outputDimensionality": 768
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=30.0)
            response.raise_for_status()
            data = response.json()
            return data["embedding"]["values"]
    except Exception as e:
        raise Exception(f"Failed to generate query embedding via REST: {str(e)}")
