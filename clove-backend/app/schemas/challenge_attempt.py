# app/schemas/challenge_attempt.py
from datetime import datetime
from enum import Enum
from pydantic import BaseModel
from typing import Optional
from .user_challenge import UserChallengeRead

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
    user_answer: str  # Add this field for user's answer
    is_successful: bool
    hints_used: int
    time_spent: int
    points: int

class ChallengeAttemptCreate(ChallengeAttemptBase):
    pass

# Schema for the request that includes timer/hints flags
class ChallengeAttemptRequest(ChallengeAttemptBase):
    timer_enabled: bool | None = None
    hints_enabled: bool | None = None

class ChallengeAttemptUpdate(BaseModel):
    user_answer: str | None = None
    is_successful: bool | None = None
    time_spent: int | None = None
    hints_used: int | None = None
    points: int | None = None

class ChallengeAttemptRead(ChallengeAttemptBase):
    id: int
    attempted_at: datetime
    user_challenge: Optional[UserChallengeRead] = None

    class Config:
        from_attributes = True

# Minimal schema for results page - only includes needed fields
class ChallengeAttemptResultRead(BaseModel):
    id: int
    is_successful: bool
    time_spent: int
    hints_used: int
    attempted_at: datetime
    challenge_type: str
    challenge_difficulty: str
    timer_enabled: bool | None
    hints_enabled: bool | None
    partial_answer: str | None = None
    was_cancelled: bool = False

    class Config:
        from_attributes = True
