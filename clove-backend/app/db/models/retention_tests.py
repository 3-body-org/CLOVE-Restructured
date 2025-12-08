# app/db/models/retention_tests.py
from sqlalchemy import Column, Integer, Float, Boolean, JSON, TIMESTAMP, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class RetentionTest(Base):
    __tablename__ = "retention_tests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.topic_id"), nullable=False)
    questions_answers = Column(JSON, nullable=False, default={})
    total_score = Column(Float, nullable=False, default=0.0)
    total_items = Column(Integer, nullable=True, default=0)
    is_completed = Column(Boolean, nullable=True, default=False)
    completed_at = Column(TIMESTAMP(timezone=True), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    # New fields for two-stage retention test system
    stage = Column(Integer, nullable=False, default=1)  # 1 for first retention test (10 hours), 2 for second (5 days)
    first_stage_completed = Column(Boolean, nullable=False, default=False)
    second_stage_completed = Column(Boolean, nullable=False, default=False)

    # Relationships
    user = relationship("User", back_populates="retention_tests")
    topic = relationship("Topic", back_populates="retention_tests")

    def __repr__(self):
        return f"<RetentionTest(id={self.id}, user_id={self.user_id}, topic_id={self.topic_id}, is_completed={self.is_completed})>"
