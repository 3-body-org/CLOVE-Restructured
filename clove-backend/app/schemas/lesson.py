# app/schemas/lesson.py
from pydantic import BaseModel

class LessonBase(BaseModel):
    subtopic_id: int
    title: str
    introduction: str | None = None
    content: str | None = None
    question_id: int
    matching_game: dict | None = None

class LessonCreate(LessonBase):
    pass

class LessonUpdate(BaseModel):
    title: str | None = None
    introduction: str | None = None
    content: str | None = None
    question_id: int | None = None
    matching_game: dict | None = None

class LessonRead(LessonBase):
    id: int

    class Config:
        from_attributes = True
