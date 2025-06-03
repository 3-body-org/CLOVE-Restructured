from sqlalchemy import Column, Integer, ForeignKey, Enum, JSON, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base

# Use the ENUM types that match your DDL
challenge_enum = Enum('code_fixer', 'code_completion', 'output_tracing', name="challenge_type", create_type=False)
difficulty_enum = Enum('easy', 'medium', 'hard', name="difficulty_level", create_type=False)

class Challenge(Base):
    __tablename__ = "challenges"

    id                            = Column(Integer, primary_key=True, index=True)
    subtopic_id                   = Column(Integer, ForeignKey("subtopics.subtopic_id", ondelete="CASCADE"), nullable=False, index=True)
    type                          = Column(challenge_enum, nullable=False, index=True)
    snippet_expectedoutput_choices= Column(JSON, nullable=False)
    difficulty                    = Column(difficulty_enum, nullable=False, index=True)
    hints                         = Column(JSON)
    timer                         = Column(Integer)   # time limit in seconds
    points                        = Column(Integer, default=100)
    is_solved                     = Column(Boolean, default=False)

    subtopic = relationship("Subtopic", back_populates="challenges")
    attempts = relationship("ChallengeAttempt", back_populates="challenge", cascade="all, delete")
