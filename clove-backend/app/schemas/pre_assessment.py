# app/schemas/pre_assessment.py
from datetime import datetime
from pydantic import BaseModel
from typing import Dict, Any

class PreAssessmentBase(BaseModel):
    user_topic_id: int
    total_score: float
    total_items: int | None = None
    is_unlocked: bool = False
    subtopic_scores: Dict
    questions_answers_iscorrect: Dict
    attempt_count: int = 0

class PreAssessmentCreate(PreAssessmentBase):
    pass

class PreAssessmentUpdate(BaseModel):
    total_score: float | None = None
    total_items: int | None = None
    is_unlocked: bool | None = None
    subtopic_scores: Dict | None = None
    questions_answers_iscorrect: Dict | None = None
    attempt_count: int | None = None

class PreAssessmentRead(PreAssessmentBase):
    pre_assessment_id: int
    taken_at: datetime

    class Config:
        from_attributes = True

class SingleAnswerSubmission(BaseModel):
    user_id: int
    topic_id: int
    question_id: int
    user_answer: str  # or Any if needed
