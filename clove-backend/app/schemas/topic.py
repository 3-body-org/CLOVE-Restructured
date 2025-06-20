# app/schemas/topic.py
from pydantic import BaseModel

class TopicBase(BaseModel):
    title: str
    description: str | None = None

class TopicCreate(TopicBase):
    pass

class TopicUpdate(BaseModel):
    title: str | None = None
    description: str | None = None

class TopicRead(TopicBase):
    topic_id: int

    class Config:
        from_attributes = True
