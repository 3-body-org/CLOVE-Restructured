# app/db/models/lesson.py
from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    subtopic_id = Column(Integer, ForeignKey("subtopics.subtopic_id"), nullable=False)
    lessonSections = Column(JSON, nullable=False)  # Store the complex lesson structure as JSON

    # Relationships
    subtopic = relationship(
        "Subtopic",
        back_populates="lessons"
    )
