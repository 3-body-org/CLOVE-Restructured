from sqlalchemy import (
    Column, Integer, ForeignKey, Date, JSON, TIMESTAMP, func
)
from sqlalchemy.orm import relationship
from app.db.base import Base

class Statistic(Base):
    __tablename__ = "statistics"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)

    # — Relationships —
    user            = relationship("User", back_populates="statistics")
    recent_topic_id = Column(Integer, ForeignKey("topics.topic_id"), nullable=True, default=None)
    recent_topic    = relationship("Topic", lazy="joined")

    # — Daily Streak —
    last_login_date = Column(Date, nullable=True, default=None)
    current_streak  = Column(Integer, default=0, nullable=False)

    # — Challenges & Modes, raw counts —
    total_challenges_solved = Column(Integer, default=0, nullable=False)
    mode_stats      = Column(
        JSON,
        nullable=False,
        default=lambda: {
            "code_fixer":      {"attempts":0,"correct":0,"time_spent":0,"completed":0},
            "code_completion": {"attempts":0,"correct":0,"time_spent":0,"completed":0},
            "output_tracing":  {"attempts":0,"correct":0,"time_spent":0,"completed":0},
        }
    )

    # — Precomputed floats for frontend —
    accuracy           = Column(
        JSON,
        nullable=False,
        default=lambda: {"code_fixer":0.0,"code_completion":0.0,"output_tracing":0.0}
    )
    hours_spent        = Column(
        JSON,
        nullable=False,
        default=lambda: {"code_fixer":0.0,"code_completion":0.0,"output_tracing":0.0}
    )
    completion_rate    = Column(
        JSON,
        nullable=False,
        default=lambda: {"code_fixer":0.0,"code_completion":0.0,"output_tracing":0.0}
    )

    # — Timestamp —
    last_updated    = Column(
        TIMESTAMP,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
