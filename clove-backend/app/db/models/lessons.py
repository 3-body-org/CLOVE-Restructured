# app/db/models/lesson.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Lesson(Base):
    __tablename__ = "lessons"

    id             = Column(Integer, primary_key=True, index=True)
    subtopic_id    = Column(Integer, ForeignKey("subtopics.subtopic_id"), nullable=False)
    title          = Column(String, nullable=False)
    introduction   = Column(Text, default=None)
    content        = Column(Text, default=None)
    question_id    = Column(Integer, ForeignKey("assessment_questions.id"), nullable=False)
    matching_game  = Column("matching_game", String, default=None)  # or JSON type if supported

    # Relationships
    subtopic = relationship(
        "Subtopic",
        back_populates="lessons"
    )
    question = relationship(
        "AssessmentQuestion",
        back_populates="lessons"
    )
