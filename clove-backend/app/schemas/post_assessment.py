from pydantic import BaseModel
from typing import Dict
from datetime import datetime

class PostAssessmentBase(BaseModel):
    user_id: int
    topic_id: int
    total_score: float
    total_items: int
    is_unlocked: bool
    subtopic_scores: Dict
    questions_answers_iscorrect: Dict

class PostAssessmentCreate(PostAssessmentBase):
    pass

class PostAssessmentUpdate(BaseModel):
    total_score: float
    total_items: int
    is_unlocked: bool
    subtopic_scores: Dict
    questions_answers_iscorrect: Dict

class PostAssessmentRead(PostAssessmentBase):
    post_assessment_id: int
    taken_at: datetime

    class Config:
        orm_mode = True
