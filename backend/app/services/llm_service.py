"""
LLM Service — Gemini Integration with Streaming Support.

Provides both synchronous (full response) and streaming (token-by-token)
methods for RAG response generation using Google Gemini.
"""

import warnings
import asyncio
from typing import AsyncGenerator

with warnings.catch_warnings():
    warnings.simplefilter('ignore', FutureWarning)
    from google import genai

from app.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)


def _build_rag_prompt(query: str, context: str) -> str:
    """Builds the RAG prompt — shared between streaming and non-streaming."""
    return f"""
    You are "KnowBase AI", a premium intelligence assistant.
    Use the provided context to answer the user's question with high precision.
    
    GUIDELINES:
    1. **Structure**: Use clear paragraphs or bullet points for readability.
    2. **Emphasis**: **Bold** the most important keywords, headings, or key findings so the user can quickly scan the answer.
    3. **Citations**: Always mention the source filename using [Source: filename] at the end of relevant sections.
    4. **Tone**: Maintain a professional, executive command-center tone.
    
    CRITICAL: If the answer is not in the context, say:
    "I'm sorry, I couldn't find specific information about that in your uploaded documents."

    Retrieved Context:
    {context}

    User Question: {query}
    
    Helpful Answer (Structured with Markdown):
    """


def _get_model_name() -> str:
    """Returns the primary model name to use."""
    return 'gemini-2.5-flash'


def _get_fallback_models() -> list[str]:
    """Returns fallback model names in priority order."""
    return ['gemini-2.0-flash', 'gemini-flash-latest']


# ────────────────────────────────────────────────────────
#  NON-STREAMING: Full response (backward compatible)
# ────────────────────────────────────────────────────────

async def generate_rag_response(query: str, context: str) -> str:
    """Generates a full RAG response (non-streaming). Used for /chat/ask endpoint."""
    prompt = _build_rag_prompt(query, context)
    
    try:
        print(f"DEBUG: Generating RAG response for: '{query[:50]}...'")
        
        try:
            response = client.models.generate_content(
                model=_get_model_name(),
                contents=prompt
            )
        except Exception as e:
            print(f"HINT: '{_get_model_name()}' failed ({e}), trying fallbacks...")
            response = None
            for fallback in _get_fallback_models():
                try:
                    response = client.models.generate_content(
                        model=fallback,
                        contents=prompt
                    )
                    print(f"DEBUG: Fallback '{fallback}' succeeded")
                    break
                except Exception:
                    continue
            if response is None:
                raise Exception("All Gemini models failed")
        
        print(f"DEBUG: LLM Response generated. Length: {len(response.text)}")
        return response.text
    except Exception as e:
        print(f"CRITICAL: Gemini API Error: {str(e)}")
        raise Exception(f"Failed to generate LLM response: {str(e)}")


# ────────────────────────────────────────────────────────
#  STREAMING: Token-by-token (for /chat/stream endpoint)
# ────────────────────────────────────────────────────────

async def generate_rag_response_stream(query: str, context: str) -> AsyncGenerator[str, None]:
    """
    Streams the LLM response token-by-token using Gemini's streaming API.
    Yields chunks of text as they arrive from the model.
    
    Usage:
        async for token in generate_rag_response_stream(query, context):
            send_to_client(token)
    """
    prompt = _build_rag_prompt(query, context)

    try:
        print(f"DEBUG: Starting streaming response for: '{query[:50]}...'")
        
        # Try primary model with streaming
        try:
            response_stream = client.models.generate_content_stream(
                model=_get_model_name(),
                contents=prompt
            )
            for chunk in response_stream:
                if chunk.text:
                    yield chunk.text
                    await asyncio.sleep(0)  # Yield control to event loop
            return  # Success — exit generator
            
        except Exception as e:
            print(f"WARN: Streaming with '{_get_model_name()}' failed: {e}")
        
        # Try fallback models with streaming
        for fallback in _get_fallback_models():
            try:
                print(f"DEBUG: Trying streaming fallback: {fallback}")
                response_stream = client.models.generate_content_stream(
                    model=fallback,
                    contents=prompt
                )
                for chunk in response_stream:
                    if chunk.text:
                        yield chunk.text
                        await asyncio.sleep(0)
                return  # Success
            except Exception:
                continue
        
        # All models failed
        yield "\n\n**Error:** Unable to generate a response. Please try again later."
        
    except Exception as e:
        print(f"CRITICAL: Streaming error: {str(e)}")
        yield f"\n\n**Error:** {str(e)}"
