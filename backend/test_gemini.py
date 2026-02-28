import asyncio
import google.generativeai as genai
from app.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

async def test_embed():
    try:
        result = genai.embed_content(
            model="models/text-embedding-004",
            content="Hello World",
            task_type="retrieval_document"
        )
        print("Success!", result)
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(test_embed())
