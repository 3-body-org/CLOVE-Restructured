# app/db/models/subtopic.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Subtopic(Base):
    __tablename__ = "subtopics"

    subtopic_id = Column(Integer, primary_key=True, index=True)
    topic_id    = Column(Integer, ForeignKey("topics.topic_id"), nullable=False)
    title       = Column(String, nullable=False, default=None)

    # Relationships
    topic                = relationship(
        "Topic",
        back_populates="subtopics"
    )
    lessons              = relationship(
        "Lesson",
        back_populates="subtopic",
        cascade="all, delete-orphan"
    )
    challenges           = relationship(
        "Challenge",
        back_populates="subtopic",
        cascade="all, delete-orphan"
    )
    assessment_questions = relationship(
        "AssessmentQuestion",
        back_populates="subtopic",
        cascade="all, delete-orphan"
    )
    user_subtopics       = relationship(
        "UserSubtopic",
        back_populates="subtopic",
        cascade="all, delete-orphan"
    )
