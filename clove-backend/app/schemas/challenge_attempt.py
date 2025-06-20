# app/schemas/challenge_attempt.py
from datetime import datetime
from enum import Enum
from pydantic import BaseModel

class CAType(str, Enum):
    code_fixer = "code_fixer"
    code_completion = "code_completion"
    output_tracing = "output_tracing"

class CADifficulty(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"

class ChallengeAttemptBase(BaseModel):
    user_challenge_id: int
    is_successful: bool
    hints_used: int
    time_spent: int
    points: int

class ChallengeAttemptCreate(ChallengeAttemptBase):
    pass

class ChallengeAttemptUpdate(BaseModel):
    is_successful: bool | None = None
    time_spent: int | None = None
    hints_used: int | None = None
    points: int | None = None

class ChallengeAttemptRead(ChallengeAttemptBase):
    id: int
    attempted_at: datetime

    class Config:
        from_attributes = True
