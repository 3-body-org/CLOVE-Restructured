# app/schemas/user_topic.py
from datetime import datetime
from pydantic import BaseModel
from app.schemas.topic import TopicRead
from typing import List
from app.schemas.user_subtopic import UserSubtopicRead

class UserTopicBase(BaseModel):
    user_id: int
    topic_id: int
    pre_assessment_completed: bool = False
    post_assessment_completed: bool = False
    is_unlocked: bool = False
    is_completed: bool = False
    introduction_seen: bool = False
    completed_subtopics_count: int = 0
    progress_percent: float = 0.0
    unlocked_at: datetime | None = None
    completed_at: datetime | None = None
    last_accessed_at: datetime | None = None

class UserTopicCreate(UserTopicBase):
    pass

class UserTopicUpdate(BaseModel):
    pre_assessment_completed: bool | None = False
    post_assessment_completed: bool | None = False
    is_unlocked: bool | None = True
    is_completed: bool | None = False
    introduction_seen: bool | None = False
    completed_subtopics_count: int | None = 0
    progress_percent: float | None = 0.0
    unlocked_at: datetime | None = None
    completed_at: datetime | None = None
    last_accessed_at: datetime | None = None

class UserTopicRead(UserTopicBase):
    id: int
    pre_assessment_completed: bool
    post_assessment_completed: bool
    is_unlocked: bool
    is_completed: bool
    introduction_seen: bool
    completed_subtopics_count: int
    progress_percent: float
    unlocked_at: datetime | None
    completed_at: datetime | None
    last_accessed_at: datetime | None
    topic: TopicRead
    subtopics: List[UserSubtopicRead] = []

    class Config:
        from_attributes = True
