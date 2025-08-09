# app/db/models/user.py
from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, func, DateTime, Date
from sqlalchemy.orm import relationship
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    username      = Column(String(50), unique=True, index=True, nullable=False)
    email         = Column(String(255), unique=True, index=True, nullable=False)
    first_name    = Column(String(100), nullable=True)
    last_name     = Column(String(100), nullable=True)
    birthday      = Column(Date, nullable=True)
    is_adaptive   = Column(Boolean, nullable=False, default=True)
    password_hash = Column(String(255), nullable=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at    = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_login    = Column(DateTime(timezone=True), nullable=True)
    is_active     = Column(Boolean, nullable=False, default=False)
    is_superuser  = Column(Boolean, nullable=False, default=False)
    login_attempts = Column(Integer, nullable=False, default=0)
    last_failed_login = Column(DateTime(timezone=True), nullable=True)
    login_cooldown_until = Column(DateTime(timezone=True), nullable=True)
    bio = Column(String, nullable=True)
    profile_photo_url = Column(String, nullable=True)
    
    # Email verification fields
    email_verified = Column(Boolean, nullable=False, default=False)
    email_verification_token = Column(String(255), nullable=True)
    email_verification_expires = Column(DateTime(timezone=True), nullable=True)
    
    # Password reset fields
    password_reset_token = Column(String(255), nullable=True)
    password_reset_expires = Column(DateTime(timezone=True), nullable=True)

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
