# app/crud/challenge_attempt.py

from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.challenge_attempts import ChallengeAttempt
from app.schemas.challenge_attempt import ChallengeAttemptCreate, ChallengeAttemptUpdate

# Keep the import of run_adaptive_updates here:
from app.services.adaptive_engine import run_adaptive_updates

async def get_by_id(
    db: AsyncSession,
    attempt_id: int
) -> Optional[ChallengeAttempt]:
    result = await db.execute(
        select(ChallengeAttempt).where(ChallengeAttempt.id == attempt_id)
    )
    return result.scalar_one_or_none()

async def list_for_user(
    db: AsyncSession,
    user_id: int
) -> List[ChallengeAttempt]:
    result = await db.execute(
        select(ChallengeAttempt).where(ChallengeAttempt.user_id == user_id)
    )
    return result.scalars().all()

async def list_for_subtopic(
    db: AsyncSession,
    subtopic_id: int
) -> List[ChallengeAttempt]:
    result = await db.execute(
        select(ChallengeAttempt).where(ChallengeAttempt.subtopic_id == subtopic_id)
    )
    return result.scalars().all()

async def get_last_n_attempts(
    db: AsyncSession,
    user_id: int,
    subtopic_id: int,
    n: int
) -> list[ChallengeAttempt]:
    stmt = (
        select(ChallengeAttempt)
        .where(
            ChallengeAttempt.user_id == user_id,
            ChallengeAttempt.subtopic_id == subtopic_id
        )
        .order_by(ChallengeAttempt.attempted_at.desc())
        .limit(n)
    )
    result = await db.execute(stmt)
    return result.scalars().all()

async def create(
    db: AsyncSession,
    attempt_in: ChallengeAttemptCreate
) -> ChallengeAttempt:
    """Create a new challenge attempt"""
    attempt = ChallengeAttempt(**attempt_in.model_dump())
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)

    # 2. Run BKT-RL adaptiveness (imported above)
    await run_adaptive_updates(
        db=db,
        attempt=attempt,
        user_id=attempt.user_id,
        subtopic_id=attempt.subtopic_id,
        challenge_type=attempt.challenge_type,
        is_correct=attempt.is_successful,
        hints_used=attempt.hints_used,
        time_spent=attempt.time_spent,
    )

    return attempt

async def update(
    db: AsyncSession,
    attempt_db: ChallengeAttempt,
    attempt_in: ChallengeAttemptUpdate
) -> ChallengeAttempt:
    """Update a challenge attempt"""
    update_data = attempt_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(attempt_db, field, value)
    db.add(attempt_db)
    await db.commit()
    await db.refresh(attempt_db)
    return attempt_db

async def delete(
    db: AsyncSession,
    attempt_db: ChallengeAttempt
) -> None:
    """Delete a challenge attempt"""
    await db.delete(attempt_db)
    await db.commit()
