# app/schemas/retention_test.py
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

class RetentionTestBase(BaseModel):
    user_id: int
    topic_id: int
    questions_answers: Dict[str, Any] = {}
    total_score: float = 0.0
    total_items: Optional[int] = 0
    is_completed: bool = False
    completed_at: Optional[datetime] = None

class RetentionTestCreate(RetentionTestBase):
    pass

class RetentionTestUpdate(BaseModel):
    questions_answers: Optional[Dict[str, Any]] = None
    total_score: Optional[float] = None
    total_items: Optional[int] = None
    is_completed: Optional[bool] = None
    completed_at: Optional[datetime] = None

class RetentionTestRead(RetentionTestBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class RetentionTestSubmission(BaseModel):
    user_id: int
    topic_id: int
    question_id: int
    user_answer: Any

class RetentionTestResult(BaseModel):
    message: str
    is_correct: bool
    correct_answer: Any
    progress: Dict[str, Any]
