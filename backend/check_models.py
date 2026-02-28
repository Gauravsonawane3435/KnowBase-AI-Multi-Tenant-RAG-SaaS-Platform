import asyncio
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

async def list_available_models():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
         print("ERROR: GEMINI_API_KEY NOT FOUND")
         return
    
    client = genai.Client(api_key=api_key)
    print("Listing Models...")
    try:
        # The new SDK might not have a direct 'list_models' like the old one in a simple way
        # Actually it's client.models.list()
        for m in client.models.list():
            print(f"- {m.name}")
    except Exception as e:
        print(f"Error listing models: {e}")

if __name__ == "__main__":
    asyncio.run(list_available_models())
