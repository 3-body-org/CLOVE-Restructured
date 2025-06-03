from sqlalchemy import Column, Integer, Boolean, TIMESTAMP, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

challenge_enum = Enum('code_fixer', 'code_completion', 'output_tracing', name="challenge_type", create_type=False)
difficulty_enum = Enum('easy','medium','hard', name="difficulty_level", create_type=False)

class ChallengeAttempt(Base):
    __tablename__ = "challenge_attempts"

    id                = Column(Integer, primary_key=True, index=True)
    user_id           = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subtopic_id       = Column(Integer, ForeignKey("subtopics.subtopic_id", ondelete="CASCADE"), nullable=False, index=True)
    challenge_id      = Column(Integer, ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False, index=True)
    challenge_type    = Column(challenge_enum, nullable=False, index=True)
    difficulty        = Column(difficulty_enum, nullable=False, index=True)
    is_successful     = Column(Boolean, nullable=False)
    time_spent        = Column(Integer)       # seconds
    hints_used        = Column(Integer, default=0)
    points            = Column(Integer, nullable=False)
    attempted_at      = Column(TIMESTAMP, server_default=func.now())

    user      = relationship("User", back_populates="challenge_attempts")
    subtopic  = relationship("Subtopic", back_populates="challenge_attempts")
    challenge = relationship("Challenge", back_populates="attempts")
