# app/db/models/post_assessment.py
from sqlalchemy import Column, Integer, Float, Boolean, JSON, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class PostAssessment(Base):
    __tablename__ = "post_assessments"

    post_assessment_id     = Column(Integer, primary_key=True, index=True)
    user_topic_id          = Column(Integer, ForeignKey("user_topics.id"), nullable=False)
    total_score            = Column(Float, nullable=False, default=0.0)
    total_items            = Column(Integer, default=0)
    is_unlocked            = Column(Boolean, default=False)
    is_completed            = Column(Boolean, default=False)
    subtopic_scores        = Column(JSON, nullable=False, default=dict)
    questions_answers_iscorrect = Column(JSON, nullable=False, default=dict)
    attempt_count          = Column(Integer, default=0)
    taken_at               = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user_topic = relationship(
        "UserTopic",
        back_populates="post_assessments"
    )
