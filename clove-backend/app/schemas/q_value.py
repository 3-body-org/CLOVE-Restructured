from pydantic import BaseModel
from typing import Dict, Any

class QValueBase(BaseModel):
    user_id: int
    subtopic_id: int
    q_table: Dict[str, Any]  # The entire Q-table as JSON
    epsilon: float = 0.8

class QValueCreate(QValueBase):
    pass

class QValueUpdate(BaseModel):
    q_table: Dict[str, Any]
    epsilon: float

class QValueRead(QValueBase):
    id: int

    class Config:
        from_attributes = True  # Updated from orm_mode for Pydantic v2
