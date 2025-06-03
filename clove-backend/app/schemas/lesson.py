from pydantic import BaseModel
from typing import Optional, Dict

class LessonBase(BaseModel):
    title: str
    introduction: Optional[str]
    content: Optional[str]
    question_id: int
    matching_game: Optional[Dict]

class LessonCreate(LessonBase):
    subtopic_id: int

class LessonUpdate(BaseModel):
    title: Optional[str]
    introduction: Optional[str]
    content: Optional[str]
    matching_game: Optional[Dict]

class LessonRead(LessonBase):
    id: int
    subtopic_id: int

    class Config:
        orm_mode = True
