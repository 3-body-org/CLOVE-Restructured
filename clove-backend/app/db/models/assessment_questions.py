# app/db/models/assessment_question.py
from sqlalchemy import Column, Integer, JSON, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

DifficultyEnum = Enum("easy", "medium", "hard", name="aq_difficulty_enum")

class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id                            = Column(Integer, primary_key=True, index=True)
    subtopic_id                   = Column(Integer, ForeignKey("subtopics.subtopic_id"), nullable=False)
    question_choices_correctanswer = Column(JSON, nullable=False, default=dict)
    difficulty                    = Column(DifficultyEnum, nullable=False, default="easy")

    # Relationships
    subtopic = relationship(
        "Subtopic",
        back_populates="assessment_questions"
    )
