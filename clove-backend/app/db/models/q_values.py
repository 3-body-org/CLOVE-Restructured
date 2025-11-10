# app/db/models/q_value.py
from sqlalchemy import Column, Integer, JSON, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class QValue(Base):
    __tablename__ = "q_values"

    id               = Column(Integer, primary_key=True, index=True)
    user_subtopic_id = Column(Integer, ForeignKey("user_subtopics.id"), nullable=False)
    q_table          = Column(JSON, nullable=False, default=dict)
    epsilon          = Column(Numeric(10, 2), nullable=False, default=0.8)

    # Relationships
    user_subtopic = relationship(
        "UserSubtopic",
        back_populates="q_values"
    )
