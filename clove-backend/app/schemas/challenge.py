# app/schemas/challenge.py
from enum import Enum
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class ChallengeType(str, Enum):
    code_fixer = "code_fixer"
    code_completion = "code_completion"
    output_tracing = "output_tracing"

class Difficulty(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"

class ChallengeData(BaseModel):
    code: Optional[str] = None
    initial_code: Optional[str] = None
    expected_output: Optional[List[str]] = None
    solution_code: Optional[str] = None
    choices: Optional[List[str]] = None
    completion_slots: Optional[List[Dict[str, Any]]] = None
    errors: Optional[List[Dict[str, Any]]] = None
    number_of_errors: Optional[int] = None
    number_of_slots: Optional[int] = None
    explanation: Optional[str] = None

class ChallengeBase(BaseModel):
    subtopic_id: int
    type: ChallengeType
    difficulty: Difficulty
    timer: int
    points: int
    scenario: str
    story_context: str
    challenge_data: ChallengeData
    hints: Dict[str, str]

class ChallengeCreate(ChallengeBase):
    pass

class ChallengeUpdate(BaseModel):
    type: ChallengeType | None = None
    difficulty: Difficulty | None = None
    timer: int | None = None
    points: int | None = None
    scenario: str | None = None
    story_context: str | None = None
    challenge_data: ChallengeData | None = None
    hints: Dict[str, str] | None = None

class ChallengeRead(ChallengeBase):
    id: int

    class Config:
        from_attributes = True
