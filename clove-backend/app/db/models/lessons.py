from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Lesson(Base):
    __tablename__ = "lessons"

    id            = Column(Integer, primary_key=True, index=True)
    subtopic_id   = Column(Integer, ForeignKey("subtopics.subtopic_id", ondelete="CASCADE"), nullable=False, index=True)
    title         = Column(String(255), nullable=False)
    introduction  = Column(Text)
    content       = Column(Text)
    question_id   = Column(Integer, ForeignKey("assessment_questions.id", ondelete="RESTRICT"), nullable=False, index=True)
    matching_game = Column(JSON)

    subtopic      = relationship("Subtopic", back_populates="lessons")
    question      = relationship("AssessmentQuestion", back_populates="lesson", uselist=False)
