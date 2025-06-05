from sqlalchemy import Column, Integer, String, Float, JSON, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from app.db.base import Base

class QValue(Base):
    __tablename__ = "q_values"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subtopic_id = Column(Integer, ForeignKey("subtopics.subtopic_id", ondelete="CASCADE"), nullable=False, index=True)
    q_table = Column(JSON, nullable=False)  # Store entire Q-table as JSON
    epsilon = Column(Numeric(10, 2), nullable=False, default=0.8)  # Current exploration rate

    # Relationships
    user = relationship("User", back_populates="q_values")
    subtopic = relationship("Subtopic", back_populates="q_values")
