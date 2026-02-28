import asyncio
from app.services.llm_service import generate_rag_response

async def main():
    try:
        response = await generate_rag_response("What is the system called?", "The system is a project called KnowBase AI.")
        print("Success!", response)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
