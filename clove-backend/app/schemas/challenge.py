from pydantic import BaseModel
from typing import List, Dict, Optional
from enum import Enum

class ChallengeType(str, Enum):
    code_fixer = "code_fixer"
    code_completion = "code_completion"
    output_tracing = "output_tracing"

class DifficultyLevel(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"

class ChallengeBase(BaseModel):
    type: ChallengeType
    snippet_expectedoutput_choices: Dict
    difficulty: DifficultyLevel
    hints: Optional[Dict]
    timer: Optional[int]
    points: Optional[int]
    is_solved: Optional[bool]

class ChallengeCreate(ChallengeBase):
    subtopic_id: int

class ChallengeUpdate(BaseModel):
    snippet_expectedoutput_choices: Optional[Dict]
    hints: Optional[Dict]
    timer: Optional[int]
    points: Optional[int]
    is_solved: Optional[bool]

class ChallengeRead(ChallengeBase):
    id: int
    subtopic_id: int

    class Config:
        orm_mode = True
