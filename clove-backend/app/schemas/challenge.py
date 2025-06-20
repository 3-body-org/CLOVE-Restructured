# app/schemas/challenge.py
from enum import Enum
from pydantic import BaseModel
from typing import Dict, Any

class ChallengeType(str, Enum):
    code_fixer = "code_fixer"
    code_completion = "code_completion"
    output_tracing = "output_tracing"

class Difficulty(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"

class ChallengeBase(BaseModel):
    subtopic_id: int
    type: ChallengeType
    snippet_choices: Dict
    difficulty: Difficulty
    hints: Dict | None = None
    timer: int = 60
    points: int = 100

class ChallengeCreate(ChallengeBase):
    pass

class ChallengeUpdate(BaseModel):
    type: ChallengeType | None = None
    snippet_choices: Dict | None = None
    difficulty: Difficulty | None = None
    hints: Dict | None = None
    timer: int | None = 60
    points: int | None = 100

class ChallengeRead(ChallengeBase):
    id: int

    class Config:
        from_attributes = True
