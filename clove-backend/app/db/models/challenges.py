# app/db/models/challenge.py
from sqlalchemy import Column, Integer, Enum, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

ChallengeTypeEnum    = Enum("code_fixer", "code_completion", "output_tracing", name="challenge_type_enum")
DifficultyEnum       = Enum("easy", "medium", "hard", name="difficulty_enum")

class Challenge(Base):
    __tablename__ = "challenges"

    id              = Column(Integer, primary_key=True, index=True)
    subtopic_id     = Column(Integer, ForeignKey("subtopics.subtopic_id"), nullable=False)
    type            = Column(ChallengeTypeEnum, nullable=False)
    snippet_choices = Column(JSON, nullable=False)
    difficulty      = Column(DifficultyEnum, nullable=False)
    hints           = Column(JSON, default=None)
    timer           = Column(Integer, default=60, comment="Time limit in seconds")
    points          = Column(Integer, default=100)

    # Relationships
    subtopic        = relationship(
        "Subtopic",
        back_populates="challenges"
    )
    user_challenges = relationship(
        "UserChallenge",
        back_populates="challenge",
        cascade="all, delete-orphan"
    )
