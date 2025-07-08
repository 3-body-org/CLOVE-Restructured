from datetime import date, datetime
from typing import Literal, TypedDict
from pydantic import BaseModel, Field
from app.schemas.topic import TopicRead

class ModeStat(TypedDict):
    attempts: int
    correct:  int
    time_spent: int
    completed: int

class StatisticBase(BaseModel):
    user_id: int

    recent_topic_id: int | None = None

    last_login_date: date | None = None
    current_streak: int = 0
    login_days_this_week: list[int] = Field(default_factory=list)

    total_challenges_solved: int = 0

    mode_stats: dict[
        Literal["code_fixer","code_completion","output_tracing"],
        ModeStat
    ] = Field(
        default_factory=lambda: {
            "code_fixer":      ModeStat(attempts=0,correct=0,time_spent=0,completed=0),
            "code_completion": ModeStat(attempts=0,correct=0,time_spent=0,completed=0),
            "output_tracing":  ModeStat(attempts=0,correct=0,time_spent=0,completed=0),
        }
    )

    accuracy: dict[
        Literal["code_fixer","code_completion","output_tracing"], float
    ] = Field(default_factory=lambda: {"code_fixer":0.0,"code_completion":0.0,"output_tracing":0.0})

    hours_spent: dict[
        Literal["code_fixer","code_completion","output_tracing"], float
    ] = Field(default_factory=lambda: {"code_fixer":0.0,"code_completion":0.0,"output_tracing":0.0})

    completion_rate: dict[
        Literal["code_fixer","code_completion","output_tracing"], float
    ] = Field(default_factory=lambda: {"code_fixer":0.0,"code_completion":0.0,"output_tracing":0.0})

class StatisticCreate(BaseModel):
    user_id: int
    recent_topic_id: int | None = None
    last_login_date: date | None = None
    current_streak: int = 0
    total_challenges_solved: int = 0
    login_days_this_week: list[int] = Field(default_factory=list)

class StatisticRead(StatisticBase):
    id: int
    last_updated: datetime
    recent_topic: TopicRead | None

    class Config:
        from_attributes = True
