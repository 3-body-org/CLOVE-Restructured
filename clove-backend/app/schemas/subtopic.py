# app/schemas/subtopic.py
from pydantic import BaseModel

class SubtopicBase(BaseModel):
    topic_id: int
    title: str

class SubtopicCreate(SubtopicBase):
    pass

class SubtopicUpdate(BaseModel):
    title: str | None = None

class SubtopicRead(SubtopicBase):
    subtopic_id: int

    class Config:
        from_attributes = True
