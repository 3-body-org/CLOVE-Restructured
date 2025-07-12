# app/db/models/topic.py
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.db.base import Base

class Topic(Base):
    __tablename__ = "topics"

    topic_id    = Column(Integer, primary_key=True, index=True)
    title       = Column(String, nullable=False)
    description = Column(Text)
    theme       = Column(String(50), nullable=True, default='space')

    # Relationships
    user_topics = relationship(
        "UserTopic",
        back_populates="topic",
        cascade="all, delete-orphan"
    )
    subtopics   = relationship(
        "Subtopic",
        back_populates="topic",
        cascade="all, delete-orphan"
    )
