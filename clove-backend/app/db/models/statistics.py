from sqlalchemy import Column, Integer, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.base import Base

challenge_enum = Enum('code_fixer', 'code_completion', 'output_tracing', name="challenge_type", create_type=False)

class Statistic(Base):
    __tablename__ = "statistics"

    id                       = Column(Integer, primary_key=True, index=True)
    user_id                  = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type                     = Column(challenge_enum, nullable=False, index=True)
    total_number_attempts    = Column(Integer, nullable=False)
    total_number_correct     = Column(Integer, nullable=False)
    total_time_spent         = Column(Integer, nullable=False)
    total_each_modes_solved  = Column(Integer, nullable=False)
    total_all_mode_solved    = Column(Integer, nullable=False)

    user = relationship("User", back_populates="statistics")
