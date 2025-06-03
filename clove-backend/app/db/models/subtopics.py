from sqlalchemy import Column, Integer, String, Boolean, Float, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Subtopic(Base):
    __tablename__ = "subtopics"

    subtopic_id         = Column(Integer, primary_key=True, index=True)
    topic_id            = Column(Integer, ForeignKey("topics.topic_id", ondelete="CASCADE"), nullable=False, index=True)
    user_id             = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title               = Column(String(255), nullable=False, index=True)
    lessons_completed   = Column(Boolean, default=False)
    practice_completed  = Column(Boolean, default=False)
    challenges_completed= Column(Boolean, default=False)
    is_unlocked         = Column(Boolean, default=False)
    is_completed        = Column(Boolean, default=False)
    progress_percent    = Column(Float, default=0.0)
    knowledge_level     = Column(Float, default=0.0)
    unlocked_at         = Column(TIMESTAMP)
    completed_at        = Column(TIMESTAMP)

    topic   = relationship("Topic", back_populates="subtopics")
    owner   = relationship("User", back_populates="subtopics")
    q_values   = relationship("QValue", back_populates="subtopic", cascade="all, delete")
    lessons = relationship("Lesson", back_populates="subtopic", cascade="all, delete")
    challenges  = relationship("Challenge", back_populates="subtopic", cascade="all, delete")
    assessment_questions = relationship("AssessmentQuestion", back_populates="subtopic", cascade="all, delete")
    challenge_attempts   = relationship("ChallengeAttempt", back_populates="subtopic", cascade="all, delete")
