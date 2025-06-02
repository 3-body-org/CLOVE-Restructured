from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SubtopicBase(BaseModel):
    title: str

class SubtopicCreate(SubtopicBase):
    topic_id: int
    user_id: int

class SubtopicUpdate(BaseModel):
    lessons_completed: Optional[bool]
    practice_completed: Optional[bool]
    challenges_completed: Optional[bool]
    is_unlocked: Optional[bool]
    is_completed: Optional[bool]
    progress_percent: Optional[float]
    knowledge_level: Optional[float]

class SubtopicRead(SubtopicBase):
    subtopic_id: int
    topic_id: int
    user_id: int
    lessons_completed: bool
    practice_completed: bool
    challenges_completed: bool
    is_unlocked: bool
    is_completed: bool
    progress_percent: float
    knowledge_level: float
    unlocked_at: Optional[datetime]
    completed_at: Optional[datetime]

    class Config:
        orm_mode = True
