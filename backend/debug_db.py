import asyncio
from sqlalchemy import text
from app.db.session import async_session

async def debug_db():
    async with async_session() as db:
        res = await db.execute(text("""
            SELECT u.email, count(e.id) 
            FROM users u
            LEFT JOIN embeddings e ON u.id = e.user_id
            GROUP BY u.email
        """))
        print("\n--- User Embedding Counts ---")
        for row in res.fetchall():
            print(f"User: {row[0]} | Embedding Count: {row[1]}")

if __name__ == "__main__":
    asyncio.run(debug_db())
