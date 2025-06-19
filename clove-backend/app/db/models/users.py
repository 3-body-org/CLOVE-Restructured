# app/db/models/user.py
from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, func, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    username      = Column(String(50), unique=True, index=True, nullable=False)
    email         = Column(String(255), unique=True, index=True, nullable=False)
    is_adaptive   = Column(Boolean, nullable=False, default=False)
    password_hash = Column(String(255), nullable=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at    = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_login    = Column(DateTime(timezone=True), nullable=True)
    is_active     = Column(Boolean, nullable=False, default=True)
    is_superuser  = Column(Boolean, nullable=False, default=False)
    login_attempts = Column(Integer, nullable=False, default=0)
    last_failed_login = Column(DateTime(timezone=True), nullable=True)
    login_cooldown_until = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user_topics     = relationship(
        "UserTopic",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    user_subtopics  = relationship(
        "UserSubtopic",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    user_challenges = relationship(
        "UserChallenge",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    statistics      = relationship(
        "Statistic",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User {self.username}>"
