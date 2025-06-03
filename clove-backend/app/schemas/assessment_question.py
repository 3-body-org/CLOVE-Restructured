from pydantic import BaseModel
from typing import Dict
from enum import Enum

class DifficultyLevel(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"

class AssessmentQuestionBase(BaseModel):
    subtopic_id: int
    question_choices_correctanswer: Dict
    difficulty: DifficultyLevel

class AssessmentQuestionCreate(AssessmentQuestionBase):
    pass

class AssessmentQuestionUpdate(BaseModel):
    question_choices_correctanswer: Dict
    difficulty: DifficultyLevel

class AssessmentQuestionRead(AssessmentQuestionBase):
    id: int

    class Config:
        orm_mode = True
