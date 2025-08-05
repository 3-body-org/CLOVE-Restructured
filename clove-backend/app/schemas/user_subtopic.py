# app/schemas/user_subtopic.py
from datetime import datetime
from pydantic import BaseModel
from app.schemas.subtopic import SubtopicRead

class UserSubtopicBase(BaseModel):
    user_id: int
    subtopic_id: int
    knowledge_level: float = 0.1

class UserSubtopicCreate(UserSubtopicBase):
    pass

class UserSubtopicUpdate(BaseModel):
    lessons_completed: bool | None = None
    practice_completed: bool | None = None
    challenges_completed: bool | None = None
    is_unlocked: bool | None = None
    is_completed: bool | None = None
    progress_percent: float | None = None
    knowledge_level: float | None = 0.1
    unlocked_at: datetime | None = None
    completed_at: datetime | None = None

class UserSubtopicRead(UserSubtopicBase):
    id: int
    lessons_completed: bool
    practice_completed: bool
    challenges_completed: bool
    is_unlocked: bool
    is_completed: bool
    progress_percent: float
    knowledge_level: float
    unlocked_at: datetime | None
    completed_at: datetime | None
    subtopic: SubtopicRead

    class Config:
        from_attributes = True
