from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create an AsyncEngine using the DATABASE_URL from config
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,       # OTP: set to False in production if you don’t want SQL logs
    future=True
)

# Each AsyncSessionLocal() yields an AsyncSession bound to this engine
AsyncSessionLocal = sessionmaker(
    engine,
    expire_on_commit=False,
    class_=AsyncSession
)

# Dependency to inject a session into path operations
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
