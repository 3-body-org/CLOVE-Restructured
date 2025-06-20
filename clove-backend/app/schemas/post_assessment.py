# app/schemas/post_assessment.py
from datetime import datetime
from pydantic import BaseModel
from typing import Dict, Any

class PostAssessmentBase(BaseModel):
    user_topic_id: int
    total_score: float = 0.0
    total_items: int = 0
    is_unlocked: bool = False
    subtopic_scores: Dict = {}
    questions_answers_iscorrect: Dict = {}

class PostAssessmentCreate(PostAssessmentBase):
    pass

class PostAssessmentUpdate(BaseModel):
    total_score: float | None = 0.0
    total_items: int | None = 0
    is_unlocked: bool | None = False
    subtopic_scores: Dict | None = {}
    questions_answers_iscorrect: Dict | None = {}

class PostAssessmentRead(PostAssessmentBase):
    post_assessment_id: int
    taken_at: datetime

    class Config:
        from_attributes = True
