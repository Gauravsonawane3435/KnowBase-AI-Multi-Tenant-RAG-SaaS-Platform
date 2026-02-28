from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,      # Checks connection health before use
    pool_recycle=300,        # Recycle connections every 5 minutes
    pool_size=10,            # High concurrent connections for the dashboard
    max_overflow=20          # Allow more connections during burst activity
)

async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_db():
    async with async_session() as session:
        yield session
