# app/db/models/user_subtopic.py
from sqlalchemy import Column, Integer, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class UserSubtopic(Base):
    __tablename__ = "user_subtopics"

    id                    = Column(Integer, primary_key=True, index=True)
    user_id               = Column(Integer, ForeignKey("users.id"), nullable=False)
    subtopic_id           = Column(Integer, ForeignKey("subtopics.subtopic_id"), nullable=False)
    lessons_completed     = Column(Boolean, default=False)
    practice_completed    = Column(Boolean, default=False)
    challenges_completed  = Column(Boolean, default=False)
    is_unlocked           = Column(Boolean, default=False)
    is_completed          = Column(Boolean, default=False)
    progress_percent      = Column(Float, default=0.0)
    knowledge_level       = Column(Float, default=0.1)
    unlocked_at           = Column(DateTime(timezone=True))
    completed_at          = Column(DateTime(timezone=True))

    # Relationships
    user               = relationship(
        "User",
        back_populates="user_subtopics"
    )
    subtopic           = relationship(
        "Subtopic",
        back_populates="user_subtopics"
    )
    q_values           = relationship(
        "QValue",
        back_populates="user_subtopic",
        cascade="all, delete-orphan"
    )
