from sqlalchemy import Column, Integer, String, Double, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class QValue(Base):
    __tablename__ = "q_values"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subtopic_id   = Column(Integer, ForeignKey("subtopics.subtopic_id", ondelete="CASCADE"), nullable=False, index=True)
    mastery       = Column(Integer, nullable=False)
    timer_active  = Column(Integer, nullable=False)
    hint_active   = Column(Integer, nullable=False)
    action        = Column(String(255), nullable=False)
    q_value       = Column(Double, nullable=False)
    last_updated  = Column(TIMESTAMP, server_default=func.now())

    user  = relationship("User", back_populates="q_values")
    subtopic = relationship("Subtopic", back_populates="q_values")
