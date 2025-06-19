# app/schemas/q_value.py
from pydantic import BaseModel
from typing import Dict, Any

class QValueBase(BaseModel):
    user_subtopic_id: int
    q_table: Dict[str, Any] = {}
    epsilon: float = 0.8

class QValueCreate(QValueBase):
    pass

class QValueUpdate(BaseModel):
    q_table: Dict[str, Any] | None = {}
    epsilon: float | None = 0.8

class QValueRead(QValueBase):
    id: int

    class Config:
        from_attributes = True
