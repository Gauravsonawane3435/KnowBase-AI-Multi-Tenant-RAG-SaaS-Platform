import warnings
with warnings.catch_warnings():
    warnings.simplefilter('ignore', FutureWarning)
    from google import genai

from app.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def generate_rag_response(query: str, context: str) -> str:
    """Passes context and query to Gemini to generate the final answer."""
    prompt = f"""
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
    
    try:
        print(f"DEBUG: Generating RAG Response for Query: '{query[:50]}...'")
        print(f"DEBUG: Using Context (length): {len(context)}")
        
        # Based on your available models list, gemini-2.5-flash is primary
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
        except Exception as e:
            print(f"HINT: 'gemini-2.5-flash' failed, trying 'gemini-2.0-flash' or 'gemini-flash-latest'...")
            try:
                response = client.models.generate_content(
                    model='gemini-2.0-flash',
                    contents=prompt
                )
            except:
                response = client.models.generate_content(
                    model='gemini-flash-latest',
                    contents=prompt
                )
        
        # Log success for verification
        print(f"DEBUG: LLM Response generated successfully. Length: {len(response.text)}")
        return response.text
    except Exception as e:
        print(f"CRITICAL: Gemini API Error: {str(e)}")
        raise Exception(f"Failed to generate LLM response: {str(e)}")
