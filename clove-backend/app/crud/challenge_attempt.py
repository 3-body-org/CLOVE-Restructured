# app/crud/challenge_attempt.py

from typing import List, Optional
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.challenge_attempts import ChallengeAttempt
from app.db.models.user_challenges import UserChallenge
from app.db.models.challenges import Challenge
from app.schemas.challenge_attempt import ChallengeAttemptCreate

# Keep the import of run_adaptive_updates here:
from app.services.adaptive_engine import run_adaptive_updates
from app.crud.user_subtopic import get_by_user_and_subtopic
from app.crud.challenge import get_by_id as get_challenge_by_id

async def get_by_id(
    db: AsyncSession,
    attempt_id: int
) -> Optional[ChallengeAttempt]:
    result = await db.execute(
        select(ChallengeAttempt).where(ChallengeAttempt.id == attempt_id)
    )
    return result.scalar_one_or_none()

async def get_by_user_challenge(
    db: AsyncSession,
    user_challenge_id: int
) -> Optional[ChallengeAttempt]:
    """Get attempt by user_challenge_id"""
    result = await db.execute(
        select(ChallengeAttempt)
        .where(ChallengeAttempt.user_challenge_id == user_challenge_id)
    )
    return result.scalar_one_or_none()

async def create(
    db: AsyncSession,
    attempt_in: ChallengeAttemptCreate
) -> ChallengeAttempt:
    """Create or update a challenge attempt"""
    # Check if attempt already exists for this user_challenge
    existing_attempt = await get_by_user_challenge(db, attempt_in.user_challenge_id)
    
    if existing_attempt:
        # Update existing attempt
        for field, value in attempt_in.model_dump().items():
            setattr(existing_attempt, field, value)
        attempt = existing_attempt
    else:
        # Create new attempt
        attempt = ChallengeAttempt(**attempt_in.model_dump())
        db.add(attempt)

    await db.commit()
    await db.refresh(attempt)

    # Get user_challenge and challenge to access subtopic_id
    user_challenge = attempt.user_challenge
    challenge = await get_challenge_by_id(db, user_challenge.challenge_id)

    # Get the correct user_subtopic using user_id and subtopic_id
    user_subtopic = await get_by_user_and_subtopic(
        db,
        user_id=user_challenge.user_id,
        subtopic_id=challenge.subtopic_id
    )
    if not user_subtopic:
        raise ValueError(f"No user_subtopic found for user {user_challenge.user_id} and subtopic {challenge.subtopic_id}")

    # Run BKT-RL adaptiveness
    await run_adaptive_updates(
        db=db,
        user_subtopic_id=user_subtopic.id,
        challenge_id=challenge.id,
        is_correct=attempt.is_successful,
        hints_used=attempt.hints_used,
        time_spent=attempt.time_spent
    )

    return attempt


async def get_last_attempts_for_user_subtopic(
    db: AsyncSession,
    user_id: int,
    subtopic_id: int,
    n: int
):
    stmt = (
        select(ChallengeAttempt)
        .join(UserChallenge, ChallengeAttempt.user_challenge_id == UserChallenge.id)
        .join(Challenge, UserChallenge.challenge_id == Challenge.id)
        .options(selectinload(ChallengeAttempt.user_challenge))
        .where(UserChallenge.user_id == user_id)
        .where(Challenge.subtopic_id == subtopic_id)
        .order_by(desc(ChallengeAttempt.attempted_at))
        .limit(n)
    )
    result = await db.execute(stmt)
    return result.scalars().all()

async def delete_last_take_if_full(
    db: AsyncSession,
    user_id: int,
    subtopic_id: int,
    take_size: int = 5
):
    stmt = (
        select(ChallengeAttempt)
        .join(UserChallenge, ChallengeAttempt.user_challenge_id == UserChallenge.id)
        .join(Challenge, UserChallenge.challenge_id == Challenge.id)
        .options(selectinload(ChallengeAttempt.user_challenge))
        .where(UserChallenge.user_id == user_id)
        .where(Challenge.subtopic_id == subtopic_id)
        .order_by(ChallengeAttempt.attempted_at.asc())
    )
    result = await db.execute(stmt)
    all_attempts = result.scalars().all()

    # Only delete if exactly 5 COMPLETED attempts exist
    completed_attempts = [
        a for a in all_attempts if a.user_challenge.status == "completed"
    ]

    if len(completed_attempts) == take_size:
        for attempt in completed_attempts:
            await db.delete(attempt)
        await db.commit()

