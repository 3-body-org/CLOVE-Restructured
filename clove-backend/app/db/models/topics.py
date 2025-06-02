from sqlalchemy import Column, Integer, String, Text, Float, Boolean, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Topic(Base):
    __tablename__ = "topics"

    topic_id                  = Column(Integer, primary_key=True, index=True)
    user_id                   = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title                     = Column(String(255), nullable=False, index=True)
    description               = Column(Text)
    unlock_threshold          = Column(Float)
    pre_assessment_completed  = Column(Boolean, default=False)
    post_assessment_completed = Column(Boolean, default=False)
    is_unlocked               = Column(Boolean, default=False)
    is_completed              = Column(Boolean, default=False)
    completed_subtopics_count = Column(Integer, default=0)
    total_subtopics_count     = Column(Integer, default=0)
    progress_percent          = Column(Float, default=0.0)
    unlocked_at               = Column(TIMESTAMP)
    completed_at              = Column(TIMESTAMP)

    owner      = relationship("User", back_populates="topics")
    subtopics  = relationship("Subtopic", back_populates="topic", cascade="all, delete")
    pre_assessments  = relationship("PreAssessment", back_populates="topic", cascade="all, delete")
    post_assessments = relationship("PostAssessment", back_populates="topic", cascade="all, delete")
