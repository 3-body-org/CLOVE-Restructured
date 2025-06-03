from pydantic import BaseModel

class QValueBase(BaseModel):
    user_id: int
    subtopic_id: int
    mastery: int
    timer_active: int
    hint_active: int
    action: str
    q_value: float

class QValueCreate(QValueBase):
    pass

class QValueUpdate(BaseModel):
    q_value: float

class QValueRead(QValueBase):
    id: int
    last_updated: str

    class Config:
        orm_mode = True
