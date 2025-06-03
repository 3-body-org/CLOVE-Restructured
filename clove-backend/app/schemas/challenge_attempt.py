from pydantic import BaseModel
from datetime import datetime
from enum import Enum

class ChallengeType(str, Enum):
    code_fixer = "code_fixer"
    code_completion = "code_completion"
    output_tracing = "output_tracing"

class DifficultyLevel(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"

class ChallengeAttemptBase(BaseModel):
    user_id: int
    subtopic_id: int
    challenge_id: int
    challenge_type: ChallengeType
    difficulty: DifficultyLevel
    is_successful: bool
    time_spent: int
    hints_used: int
    points: int

class ChallengeAttemptCreate(ChallengeAttemptBase):
    pass

class ChallengeAttemptUpdate(BaseModel):
    is_successful: bool
    time_spent: int
    hints_used: int
    points: int

class ChallengeAttemptRead(ChallengeAttemptBase):
    id: int
    attempted_at: datetime

    class Config:
        orm_mode = True
