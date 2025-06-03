from pydantic import BaseModel
from enum import Enum

class ChallengeType(str, Enum):
    code_fixer = "code_fixer"
    code_completion = "code_completion"
    output_tracing = "output_tracing"

class StatisticBase(BaseModel):
    user_id: int
    type: ChallengeType
    total_number_attempts: int
    total_number_correct: int
    total_time_spent: int
    total_each_modes_solved: int
    total_all_mode_solved: int

class StatisticCreate(StatisticBase):
    pass

class StatisticUpdate(BaseModel):
    total_number_attempts: int
    total_number_correct: int
    total_time_spent: int
    total_each_modes_solved: int
    total_all_mode_solved: int

class StatisticRead(StatisticBase):
    id: int

    class Config:
        orm_mode = True
