# app/db/models/user_topic.py
from sqlalchemy import Column, Integer, Boolean, Float, TIMESTAMP, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class UserTopic(Base):
    __tablename__ = "user_topics"

    id                          = Column(Integer, primary_key=True, index=True)
    user_id                     = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic_id                    = Column(Integer, ForeignKey("topics.topic_id"), nullable=False)
    pre_assessment_completed    = Column(Boolean, default=False)
    post_assessment_completed   = Column(Boolean, default=False)
    is_unlocked                 = Column(Boolean, default=False)
    is_completed                = Column(Boolean, default=False)
    completed_subtopics_count   = Column(Integer, default=0)
    progress_percent            = Column(Float, default=0.0)
    unlocked_at                 = Column(TIMESTAMP, default=None)
    completed_at                = Column(TIMESTAMP, default=None)
    last_accessed_at            = Column(TIMESTAMP, default=None)

    # Relationships
    user             = relationship(
        "User",
        back_populates="user_topics"
    )
    topic            = relationship(
        "Topic",
        back_populates="user_topics"
    )
    pre_assessments  = relationship(
        "PreAssessment",
        back_populates="user_topic",
        cascade="all, delete-orphan"
    )
    post_assessments = relationship(
        "PostAssessment",
        back_populates="user_topic",
        cascade="all, delete-orphan"
    )
