from sqlalchemy import Column, Integer, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.base import Base

difficulty_enum = Enum('easy','medium','hard', name="difficulty_level", create_type=False)

class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id                              = Column(Integer, primary_key=True, index=True)
    subtopic_id                     = Column(Integer, ForeignKey("subtopics.subtopic_id", ondelete="CASCADE"), nullable=False, index=True)
    question_choices_correctanswer  = Column(JSON, nullable=False)
    difficulty                      = Column(difficulty_enum, nullable=False, index=True)

    subtopic = relationship("Subtopic", back_populates="assessment_questions")
    lesson   = relationship("Lesson", back_populates="question", uselist=False)
