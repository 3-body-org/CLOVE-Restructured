# app/crud/challenge_attempt.py

from typing import List, Optional
from sqlalchemy import select, desc, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.challenge_attempts import ChallengeAttempt
from app.db.models.user_challenges import UserChallenge
from app.db.models.challenges import Challenge
from app.schemas.challenge_attempt import ChallengeAttemptCreate

# Keep the import of run_adaptive_updates here:
from app.services.engine import run_updates
from app.crud.user_subtopic import get_by_user_and_subtopic
from app.crud.challenge import get_by_id as get_challenge_by_id
from app.crud.user import get_by_id as get_user_by_id

async def get_by_id(
    db: AsyncSession,
    attempt_id: int
) -> Optional[ChallengeAttempt]:
    result = await db.execute(
        select(ChallengeAttempt).where(ChallengeAttempt.id == attempt_id)
    )
    return result.scalar_one_or_none()

async def get_by_user_id(
    db: AsyncSession,
    user_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[ChallengeAttempt]:
    """Get all challenge attempts for a specific user"""
    stmt = (
        select(ChallengeAttempt)
        .join(UserChallenge, ChallengeAttempt.user_challenge_id == UserChallenge.id)
        .where(UserChallenge.user_id == user_id)
        .order_by(desc(ChallengeAttempt.attempted_at))
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()

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
    user = await get_user_by_id(db, user_challenge.user_id)
    
    if not user:
        # This case should ideally not be reached if FK constraints are solid
        raise ValueError(f"User with ID {user_challenge.user_id} not found.")

    # Get the correct user_subtopic using user_id and subtopic_id
    user_subtopic = await get_by_user_and_subtopic(
        db,
        user_id=user_challenge.user_id,
        subtopic_id=challenge.subtopic_id
    )
    if not user_subtopic:
        raise ValueError(f"No user_subtopic found for user {user_challenge.user_id} and subtopic {challenge.subtopic_id}")

    # Run BKT-RL adaptiveness
    await run_updates(
        db=db,
        user_subtopic_id=user_subtopic.id,
        challenge_id=challenge.id,
        is_correct=attempt.is_successful,
        hints_used=attempt.hints_used,
        time_spent=attempt.time_spent,
        is_adaptive=user.is_adaptive
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
        .options(
            selectinload(ChallengeAttempt.user_challenge).selectinload(UserChallenge.challenge)
        )
        .where(UserChallenge.user_id == user_id)
        .where(Challenge.subtopic_id == subtopic_id)
        .order_by(desc(ChallengeAttempt.attempted_at))
        .limit(n)
    )
    result = await db.execute(stmt)
    return result.scalars().all()

async def get_last_attempts_minimal_for_user_subtopic(
    db: AsyncSession,
    user_id: int,
    subtopic_id: int,
    n: int
):
    """Get minimal challenge attempt data for results page"""
    stmt = (
        select(
            ChallengeAttempt.id,
            ChallengeAttempt.is_successful,
            ChallengeAttempt.time_spent,
            ChallengeAttempt.hints_used,
            ChallengeAttempt.attempted_at,
            Challenge.type.label('challenge_type'),
            Challenge.difficulty.label('challenge_difficulty'),
            UserChallenge.timer_enabled.label('timer_enabled'),
            UserChallenge.hints_enabled.label('hints_enabled'),
            UserChallenge.partial_answer.label('partial_answer'),
            UserChallenge.was_cancelled.label('was_cancelled')
        )
        .join(UserChallenge, ChallengeAttempt.user_challenge_id == UserChallenge.id)
        .join(Challenge, UserChallenge.challenge_id == Challenge.id)
        .where(UserChallenge.user_id == user_id)
        .where(Challenge.subtopic_id == subtopic_id)
        .order_by(desc(ChallengeAttempt.attempted_at))
        .limit(n)
    )
    result = await db.execute(stmt)
    return result.mappings().all()

async def get_attempt_count_by_user_and_subtopic(
    db: AsyncSession,
    user_id: int,
    subtopic_id: int
) -> int:
    """Get the count of challenge attempts for a user and subtopic"""
    stmt = (
        select(func.count(ChallengeAttempt.id))
        .join(UserChallenge, ChallengeAttempt.user_challenge_id == UserChallenge.id)
        .join(Challenge, UserChallenge.challenge_id == Challenge.id)
        .where(UserChallenge.user_id == user_id)
        .where(Challenge.subtopic_id == subtopic_id)
    )
    result = await db.execute(stmt)
    return result.scalar_one() or 0

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

async def delete_by_user_and_subtopic(
    db: AsyncSession,
    user_id: int,
    subtopic_id: int
) -> int:
    """Delete all challenge attempts for a user in a specific subtopic"""
    # Get all challenge attempts for the user in the specified subtopic
    stmt = (
        select(ChallengeAttempt)
        .join(UserChallenge, ChallengeAttempt.user_challenge_id == UserChallenge.id)
        .join(Challenge, UserChallenge.challenge_id == Challenge.id)
        .where(UserChallenge.user_id == user_id)
        .where(Challenge.subtopic_id == subtopic_id)
    )
    result = await db.execute(stmt)
    attempts_to_delete = result.scalars().all()
    
    # Count the attempts before deletion
    deleted_count = len(attempts_to_delete)
    
    # Delete all attempts
    for attempt in attempts_to_delete:
        await db.delete(attempt)
    
    # Commit the changes
    await db.commit()
    
    return deleted_count

