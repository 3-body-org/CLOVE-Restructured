from pydantic import BaseModel
from typing import Dict
from datetime import datetime

class PreAssessmentBase(BaseModel):
    user_id: int
    topic_id: int
    total_score: float
    total_items: int
    is_unlocked: bool
    subtopic_scores: Dict
    questions_answers_iscorrect: Dict

class PreAssessmentCreate(PreAssessmentBase):
    pass

class PreAssessmentUpdate(BaseModel):
    total_score: float
    total_items: int
    is_unlocked: bool
    subtopic_scores: Dict
    questions_answers_iscorrect: Dict

class PreAssessmentRead(PreAssessmentBase):
    pre_assessment_id: int
    taken_at: datetime

    class Config:
        orm_mode = True
