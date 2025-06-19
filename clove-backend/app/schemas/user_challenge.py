# app/schemas/user_challenge.py
from datetime import datetime
from enum import Enum
from pydantic import BaseModel

class UserChallengeStatus(str, Enum):
    pending = "pending"
    completed = "completed"
    cancelled = "cancelled"

class UserChallengeBase(BaseModel):
    user_id: int
    challenge_id: int
    is_solved: bool = False
    status: UserChallengeStatus = UserChallengeStatus.pending

class UserChallengeCreate(UserChallengeBase):
    is_solved: bool = False
    status: UserChallengeStatus = UserChallengeStatus.pending

class UserChallengeUpdate(BaseModel):
    is_solved: bool | None = False
    status: UserChallengeStatus | None = UserChallengeStatus.pending

class UserChallengeRead(UserChallengeBase):
    id: int
    is_solved: bool
    status: UserChallengeStatus
    last_attempted_at: datetime

    class Config:
        from_attributes = True
