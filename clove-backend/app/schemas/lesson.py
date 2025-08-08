# app/schemas/lesson.py
from pydantic import BaseModel
from typing import List, Dict, Any

class LessonBase(BaseModel):
    subtopic_id: int
    lessonSections: List[Dict[str, Any]]

class LessonCreate(LessonBase):
    pass

class LessonUpdate(BaseModel):
    lessonSections: List[Dict[str, Any]] | None = None

class LessonRead(LessonBase):
    id: int

    class Config:
        from_attributes = True
