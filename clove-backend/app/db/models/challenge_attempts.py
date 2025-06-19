# app/db/models/challenge_attempt.py
from sqlalchemy import Column, Integer, Boolean, Enum, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime

ChallengeTypeEnum   = Enum("code_fixer", "code_completion", "output_tracing", name="ca_type_enum")
DifficultyEnum      = Enum("easy", "medium", "hard", name="ca_difficulty_enum")

class ChallengeAttempt(Base):
    __tablename__ = "challenge_attempts"

    id               = Column(Integer, primary_key=True, index=True)
    user_challenge_id = Column(Integer, ForeignKey("user_challenges.id"), nullable=False)
    is_successful    = Column(Boolean, nullable=False)
    time_spent       = Column(Integer, comment="Seconds")
    hints_used       = Column(Integer, default=0)
    points           = Column(Integer)
    attempted_at     = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    user_challenge = relationship(
        "UserChallenge",
        back_populates="challenge_attempts"
        )