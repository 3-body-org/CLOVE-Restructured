# app/db/models/user_challenge.py
from sqlalchemy import (
    Column,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    Enum as SQLEnum,
    func,
)
from sqlalchemy.orm import relationship
from app.db.base import Base

StatusEnum = SQLEnum(
    "pending", "completed", "cancelled", name="uc_status_enum"
)

class UserChallenge(Base):
    __tablename__ = "user_challenges"

    id                = Column(Integer, primary_key=True, index=True)
    user_id           = Column(Integer, ForeignKey("users.id"), nullable=False)
    challenge_id      = Column(Integer, ForeignKey("challenges.id"), nullable=False)
    is_solved         = Column(Boolean, default=False, nullable=False)
    last_attempted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    status            = Column(StatusEnum, default="pending", nullable=False)

    # Relationships
    user      = relationship(
        "User",
        back_populates="user_challenges"
    )
    challenge = relationship(
        "Challenge",
        back_populates="user_challenges"
    )
    challenge_attempts = relationship(
        "ChallengeAttempt",
        back_populates="user_challenge",
        cascade="all, delete-orphan"
    )
