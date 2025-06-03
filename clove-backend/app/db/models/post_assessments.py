from sqlalchemy import Column, Integer, Float, Boolean, JSON, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class PostAssessment(Base):
    __tablename__ = "post_assessments"

    post_assessment_id           = Column(Integer, primary_key=True, index=True)
    user_id                      = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id                     = Column(Integer, ForeignKey("topics.topic_id", ondelete="CASCADE"), nullable=False, index=True)
    total_score                  = Column(Float, nullable=False)
    total_items                  = Column(Integer)
    is_unlocked                  = Column(Boolean, default=False)
    subtopic_scores              = Column(JSON, nullable=False)
    questions_answers_iscorrect  = Column(JSON, nullable=False)
    taken_at                     = Column(TIMESTAMP, server_default=func.now())

    user  = relationship("User", back_populates="post_assessments")
    topic = relationship("Topic", back_populates="post_assessments")
