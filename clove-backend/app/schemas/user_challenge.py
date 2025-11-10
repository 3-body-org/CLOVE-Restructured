# app/schemas/user_challenge.py
from datetime import datetime
from enum import Enum
from pydantic import BaseModel

class UserChallengeStatus(str, Enum):
    pending = "pending"
    active = "active"
    completed = "completed"
    cancelled = "cancelled"

class UserChallengeBase(BaseModel):
    user_id: int
    challenge_id: int
    is_solved: bool = False
    status: UserChallengeStatus = UserChallengeStatus.pending
    time_spent: int | None = 0
    hints_used: int | None = 0
    partial_answer: str | None = None
    timer_enabled: bool | None = None
    hints_enabled: bool | None = None
    was_cancelled: bool = False

class UserChallengeCreate(UserChallengeBase):
    is_solved: bool = False
    status: UserChallengeStatus = UserChallengeStatus.pending

class UserChallengeUpdate(BaseModel):
    is_solved: bool | None = False
    status: UserChallengeStatus | None = UserChallengeStatus.pending
    time_spent: int | None = None
    hints_used: int | None = None
    partial_answer: str | None = None
    timer_enabled: bool | None = None
    hints_enabled: bool | None = None
    was_cancelled: bool | None = None

class UserChallengeRead(UserChallengeBase):
    id: int
    is_solved: bool
    status: UserChallengeStatus
    last_attempted_at: datetime
    time_spent: int | None
    hints_used: int | None
    partial_answer: str | None
    timer_enabled: bool | None
    hints_enabled: bool | None
    was_cancelled: bool

    class Config:
        from_attributes = True
