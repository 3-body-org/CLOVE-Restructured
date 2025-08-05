# app/db/models/challenge.py
from sqlalchemy import Column, Integer, Enum, JSON, ForeignKey, String, Text
from sqlalchemy.orm import relationship
from app.db.base import Base

ChallengeTypeEnum    = Enum("code_fixer", "code_completion", "output_tracing", name="challenge_type_enum")
DifficultyEnum       = Enum("easy", "medium", "hard", name="difficulty_enum")

class Challenge(Base):
    __tablename__ = "challenges"

    id              = Column(Integer, primary_key=True, index=True)
    subtopic_id     = Column(Integer, ForeignKey("subtopics.subtopic_id"), nullable=False)
    type            = Column(ChallengeTypeEnum, nullable=False)
    difficulty      = Column(DifficultyEnum, nullable=False)
    timer           = Column(Integer, nullable=False, comment="Time limit in seconds")
    points          = Column(Integer, nullable=False)
    scenario        = Column(Text, nullable=False)
    story_context   = Column(Text, nullable=False)
    challenge_data  = Column(JSON, nullable=False)
    hints           = Column(JSON, nullable=False)

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
