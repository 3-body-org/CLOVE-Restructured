from sqlalchemy import Column, Integer, String, TIMESTAMP, func, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    username      = Column(String(255), unique=True, index=True, nullable=False)
    email         = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at    = Column(TIMESTAMP, server_default=func.now())
    is_active     = Column(Boolean, default=True)
    is_superuser  = Column(Boolean, default=False)

    topics        = relationship("Topic", back_populates="owner", cascade="all, delete")
    subtopics     = relationship("Subtopic", back_populates="owner", cascade="all, delete")
    q_values      = relationship("QValue", back_populates="user", cascade="all, delete-orphan")
    pre_assessments  = relationship("PreAssessment", back_populates="user", cascade="all, delete")
    post_assessments = relationship("PostAssessment", back_populates="user", cascade="all, delete")
    challenge_attempts = relationship("ChallengeAttempt", back_populates="user", cascade="all, delete")
    statistics    = relationship("Statistic", back_populates="user", cascade="all, delete")
