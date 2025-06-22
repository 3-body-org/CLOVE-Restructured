# app/db/models/pre_assessment.py
from sqlalchemy import Column, Integer, Float, Boolean, JSON, TIMESTAMP, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class PreAssessment(Base):
    __tablename__ = "pre_assessments"

    pre_assessment_id      = Column(Integer, primary_key=True, index=True)
    user_topic_id          = Column(Integer, ForeignKey("user_topics.id"), nullable=False)
    total_score            = Column(Float, nullable=False, default=0.0)
    total_items            = Column(Integer, default=0)
    is_unlocked            = Column(Boolean, default=False)
    subtopic_scores        = Column(JSON, nullable=False, default=dict)
    questions_answers_iscorrect = Column(JSON, nullable=False, default=dict)
    attempt_count          = Column(Integer, default=0)
    taken_at               = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    user_topic = relationship(
        "UserTopic",
        back_populates="pre_assessments"
    )
