from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, AsyncEngine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import AsyncAdaptedQueuePool
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text
from app.core.config import settings
import logging
from typing import AsyncGenerator, Dict, Any
import backoff
import time

logger = logging.getLogger(__name__)

# Create an AsyncEngine with connection pooling
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
    poolclass=AsyncAdaptedQueuePool,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=settings.DB_POOL_RECYCLE,
    pool_pre_ping=True,  # Enable connection health checks
    connect_args={
        "server_settings": {
            "application_name": settings.PROJECT_NAME,
            "timezone": "UTC"
        },
        "ssl": "require" if not settings.DEBUG else False,  # SSL required in production
        "command_timeout": 60,  # Increase command timeout
        "statement_cache_size": 0,  # Disable statement cache
    }
)

# Create session factory once at module level
async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Session factory with retry mechanism
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except SQLAlchemyError as e:
            await session.rollback()
            logger.error(f"Database error: {str(e)}")
            raise
        except Exception as e:
            await session.rollback()
            logger.error(f"Unexpected error: {str(e)}")
            raise
        finally:
            await session.close()

async def check_db_health() -> Dict[str, Any]:
    """
    Comprehensive database health check that follows industry standards.
    Returns a dictionary with detailed health status information.
    """
    health_info = {
        "status": "unhealthy",
        "database": "disconnected",
        "details": {
            "connection_pool": {},
            "response_time": None,
            "version": None,
            "last_checked": time.strftime("%Y-%m-%d %H:%M:%S"),
        },
        "error": None
    }

    try:
        start_time = time.time()
        
        async with engine.begin() as conn:
            # Basic connectivity check
            result = await conn.execute(text("SELECT 1"))
            if not result.fetchone():
                raise Exception("Failed to get response from basic health check query")

            # Version check
            version_result = await conn.execute(text("SELECT version()"))
            db_version = version_result.scalar()

            # Pool statistics
            pool = engine.pool
            pool_stats = {
                "size": pool.size(),
                "checked_in": pool.checkedin(),
                "checked_out": pool.checkedout(),
                "overflow": pool.overflow(),
            }

            # Check for long-running queries (optional)
            active_queries = await conn.execute(
                text("""
                SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
                FROM pg_stat_activity 
                WHERE state = 'active' AND now() - pg_stat_activity.query_start > interval '5 seconds'
                """)
            )
            long_running = active_queries.fetchall()

            # Update health information
            health_info.update({
                "status": "healthy",
                "database": "connected",
                "details": {
                    "connection_pool": pool_stats,
                    "response_time": f"{(time.time() - start_time):.3f}s",
                    "version": db_version,
                    "last_checked": time.strftime("%Y-%m-%d %H:%M:%S"),
                    "long_running_queries": len(long_running)
                }
            })

            # Log detailed health information
            logger.info(f"Database health check successful: {health_info}")
            
            return health_info

    except Exception as e:
        error_msg = str(e)
        logger.error(f"Database health check failed: {error_msg}")
        health_info["error"] = error_msg
        return health_info
