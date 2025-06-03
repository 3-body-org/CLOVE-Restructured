from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TopicBase(BaseModel):
    title: str
    description: Optional[str] = None
    unlock_threshold: Optional[float] = None

class TopicCreate(TopicBase):
    user_id: int

class TopicUpdate(BaseModel):
    pre_assessment_completed: Optional[bool]
    post_assessment_completed: Optional[bool]
    is_unlocked: Optional[bool]
    is_completed: Optional[bool]
    completed_subtopics_count: Optional[int]
    total_subtopics_count: Optional[int]
    progress_percent: Optional[float]

class TopicRead(TopicBase):
    topic_id: int
    user_id: int
    pre_assessment_completed: bool
    post_assessment_completed: bool
    is_unlocked: bool
    is_completed: bool
    completed_subtopics_count: int
    total_subtopics_count: int
    progress_percent: float
    unlocked_at: Optional[datetime]
    completed_at: Optional[datetime]

    class Config:
        orm_mode = True
