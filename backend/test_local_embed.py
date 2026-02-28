import asyncio
import httpx
from app.config import settings

async def main():
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={settings.GEMINI_API_KEY}"
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(url, timeout=10.0)
            data = res.json()
            print("Supported models for generateContent:")
            for m in data.get("models", []):
                if "generateContent" in m.get("supportedGenerationMethods", []):
                    print(m.get("name"))
    except Exception as e:
        print("FAIL:", str(e))

if __name__ == "__main__":
    asyncio.run(main())
