# app/schemas/assessment_question.py
from enum import Enum
from pydantic import BaseModel
from typing import Dict, Any

class AQDifficulty(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"

class AssessmentQuestionBase(BaseModel):
    subtopic_id: int
    question_choices_correctanswer: Dict = {}
    difficulty: AQDifficulty = AQDifficulty.easy

class AssessmentQuestionCreate(AssessmentQuestionBase):
    pass

class AssessmentQuestionUpdate(BaseModel):
    question_choices_correctanswer: Dict | None = {}
    difficulty: AQDifficulty | None = AQDifficulty.easy

class AssessmentQuestionRead(AssessmentQuestionBase):
    id: int

    class Config:
        from_attributes = True
