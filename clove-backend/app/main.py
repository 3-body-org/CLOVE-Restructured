from fastapi import FastAPI
from contextlib import asynccontextmanager
import logging
import logging.config
from app.core.config import settings
from app.core.middleware import setup_middleware
from app.db.session import check_db_health
from app.api import (
    users, topics, subtopics, lessons, challenges, q_values,
    assessment_questions, pre_assessments, post_assessments,
    challenge_attempts, statistics, user_topics, user_subtopics,
    user_challenges, auth, onboarding
)
from app.db.base import Base
from app.db.session import engine
from fastapi.responses import JSONResponse

# Import all models to ensure they are registered with SQLAlchemy
import app.db.models

# Configure logging
logging.config.dictConfig({
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default",
            "stream": "ext://sys.stdout"
        }
    },
    "root": {
        "level": settings.LOG_LEVEL,
        "handlers": ["console"]
    }
})

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up application...")
    try:
        # Run migrations in production mode
        if not settings.DEBUG:
            import subprocess
            import os
            # Get the correct path - we're already in clove-backend when running
            current_dir = os.getcwd()
            logger.info(f"Current working directory: {current_dir}")
            result = subprocess.run(["alembic", "upgrade", "head"], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                logger.info("Database migrations completed successfully")
                
                # Now run seeding after successful migrations
                try:
                    from app.db.seeder import DatabaseSeeder
                    from app.db.session import get_db
                    
                    logger.info("Checking if database needs seeding...")
                    async for session in get_db():
                        if await DatabaseSeeder.needs_seeding(session):
                            logger.info("Starting database seeding...")
                            seeder = DatabaseSeeder(session)
                            await seeder.seed_database()
                            logger.info("Database seeding completed successfully!")
                        else:
                            logger.info("Database already seeded, skipping...")
                        break
                except Exception as e:
                    logger.error(f"Seeding failed: {str(e)}")
                    # Don't fail startup if seeding fails
            else:
                logger.error(f"Migration failed. Return code: {result.returncode}")
                logger.error(f"STDERR: {result.stderr}")
                logger.error(f"STDOUT: {result.stdout}")
        else:
        # Only create tables in development mode
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables created successfully (development mode)")
    except Exception as e:
        logger.error(f"Error during startup: {str(e)}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")
    await engine.dispose()
    logger.info("Application shutdown complete")

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)

# Setup middleware
setup_middleware(app)

# Health check endpoint
@app.get("/health")
@app.head("/health")
async def health_check():
    db_health = await check_db_health()
    return {
        "status": "healthy" if db_health else "unhealthy",
        "database": "connected" if db_health else "disconnected"
    }

# Include routers without version prefix
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(topics.router)
app.include_router(subtopics.router)
app.include_router(lessons.router)
app.include_router(challenges.router)
app.include_router(q_values.router)
app.include_router(assessment_questions.router)
app.include_router(pre_assessments.router)
app.include_router(post_assessments.router)
app.include_router(challenge_attempts.router)
app.include_router(statistics.router)
app.include_router(user_topics.router)
app.include_router(user_subtopics.router)
app.include_router(user_challenges.router)
app.include_router(onboarding.router)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    import traceback
    import sys
    tb_str = "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))
    print(tb_str, file=sys.stderr)
    if settings.DEBUG:
        return JSONResponse(
            status_code=500,
            content={
                "detail": str(exc),
                "traceback": tb_str
            }
        )
    else:
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error"}
    )
