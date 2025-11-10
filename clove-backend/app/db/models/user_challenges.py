# app/db/models/user_challenge.py
from sqlalchemy import (
    Column,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    Enum as SQLEnum,
    func,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from app.db.base import Base

StatusEnum = SQLEnum(
    "pending", "active", "completed", "cancelled", name="uc_status_enum"
)

class UserChallenge(Base):
    __tablename__ = "user_challenges"

    id                = Column(Integer, primary_key=True, index=True)
    user_id           = Column(Integer, ForeignKey("users.id"), nullable=False)
    challenge_id      = Column(Integer, ForeignKey("challenges.id"), nullable=False)
    is_solved         = Column(Boolean, default=False, nullable=False)
    last_attempted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    status            = Column(StatusEnum, default="pending", nullable=False)
    
    # Session tracking fields (Option 2)
    session_token     = Column(String(255), unique=True, nullable=True)
    session_started_at = Column(DateTime(timezone=True), nullable=True)
    last_activity_at  = Column(DateTime(timezone=True), nullable=True)
    
    # Cancelled challenge restoration fields
    time_spent        = Column(Integer, nullable=True, default=0, comment='Time spent on challenge in seconds')
    hints_used        = Column(Integer, nullable=True, default=0, comment='Number of hints used')
    partial_answer    = Column(Text, nullable=True, comment='Partial answer when challenge was cancelled')
    
    # Adaptive features tracking
    timer_enabled     = Column(Boolean, nullable=True, comment='Whether timer was enabled for this challenge session')
    hints_enabled     = Column(Boolean, nullable=True, comment='Whether hints were enabled for this challenge session')
    
    # Cancellation tracking
    was_cancelled     = Column(Boolean, default=False, nullable=False, comment='Whether this challenge was ever cancelled')

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
