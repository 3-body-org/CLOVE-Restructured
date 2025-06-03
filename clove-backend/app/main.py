from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import users, topics, subtopics, lessons, challenges, q_values, assessment_questions, pre_assessments, post_assessments, challenge_attempts, statistics
from app.db.base import Base
from app.db.session import engine

app = FastAPI(title="CLOVE Learning Backend")

# CORS - allow your frontend origin (e.g. http://localhost:3000 in development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # <— in production, replace "*" with your Vercel domain: ["https://your-frontend.vercel.app"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    # If you are NOT using Alembic, this will create all tables based on your SQLAlchemy models.
    # (Skip if you prefer alembic migrations instead.)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# Include all routers
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(topics.router, prefix="/topics", tags=["topics"])
app.include_router(subtopics.router, prefix="/subtopics", tags=["subtopics"])
app.include_router(lessons.router, prefix="/lessons", tags=["lessons"])
app.include_router(challenges.router, prefix="/challenges", tags=["challenges"])
app.include_router(q_values.router, prefix="/q_values", tags=["q_values"])
app.include_router(assessment_questions.router, prefix="/assessment_questions", tags=["assessment_questions"])
app.include_router(pre_assessments.router, prefix="/pre_assessments", tags=["pre_assessments"])
app.include_router(post_assessments.router, prefix="/post_assessments", tags=["post_assessments"])
app.include_router(challenge_attempts.router, prefix="/challenge_attempts", tags=["challenge_attempts"])
app.include_router(statistics.router, prefix="/statistics", tags=["statistics"])
