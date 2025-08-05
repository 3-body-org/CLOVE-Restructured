# app/crud/user_challenge.py
from typing import List, Optional
from sqlalchemy import select, update, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.user_challenges import UserChallenge
from app.db.models.challenges import Challenge
from sqlalchemy import delete
from app.db.models.user_subtopics import UserSubtopic
from datetime import datetime

async def get_by_id(db: AsyncSession, uc_id: int) -> Optional[UserChallenge]:
    result = await db.execute(select(UserChallenge).where(UserChallenge.id == uc_id))
    return result.scalars().first()

async def get_by_user_and_challenge(
    db: AsyncSession, user_id: int, challenge_id: int
) -> Optional[UserChallenge]:
    stmt = select(UserChallenge).where(
        UserChallenge.user_id == user_id,
        UserChallenge.challenge_id == challenge_id
    )
    result = await db.execute(stmt)
    return result.scalars().first()

async def create(
    db: AsyncSession,
    *,
    user_id: int,
    challenge_id: int,
    is_solved: bool = False,
    status: str = "pending",
) -> UserChallenge:
    uc = UserChallenge(
        user_id=user_id,
        challenge_id=challenge_id,
        is_solved=is_solved,
        status=status
    )
    db.add(uc)
    await db.commit()
    await db.refresh(uc)
    return uc

async def upsert(
    db: AsyncSession,
    *,
    user_id: int,
    challenge_id: int,
    is_solved: bool,
    status: Optional[str] = None,
    session_token: Optional[str] = None,
    session_started_at: Optional[datetime] = None,
    last_activity_at: Optional[datetime] = None,
    time_spent: Optional[int] = None,
    hints_used: Optional[int] = None,
    partial_answer: Optional[str] = None,
    timer_enabled: Optional[bool] = None,
    hints_enabled: Optional[bool] = None,
    was_cancelled: Optional[bool] = None
) -> UserChallenge:
    print(f"upsert called: user_id={user_id}, challenge_id={challenge_id}, is_solved={is_solved}, status={status}")
    uc = await get_by_user_and_challenge(db, user_id, challenge_id)
    if uc:
        print(f"Found existing user_challenge: id={uc.id}, current_status={uc.status}")
        data = {"is_solved": is_solved, "last_attempted_at": func.now()}
        if status is not None:
            data["status"] = status
        if session_token is not None:
            data["session_token"] = session_token
        if session_started_at is not None:
            data["session_started_at"] = session_started_at
        if last_activity_at is not None:
            data["last_activity_at"] = last_activity_at
        if time_spent is not None:
            data["time_spent"] = time_spent
        if hints_used is not None:
            data["hints_used"] = hints_used
        if partial_answer is not None:
            data["partial_answer"] = partial_answer
        if timer_enabled is not None:
            data["timer_enabled"] = timer_enabled
        if hints_enabled is not None:
            data["hints_enabled"] = hints_enabled
        if was_cancelled is not None:
            data["was_cancelled"] = was_cancelled
        print(f"Updating with data: {data}")
        await db.execute(
            update(UserChallenge)
            .where(UserChallenge.id == uc.id)
            .values(**data)
        )
        await db.commit()
        updated_uc = await get_by_id(db, uc.id)
        print(f"After update: id={updated_uc.id}, status={updated_uc.status}, is_solved={updated_uc.is_solved}")
        return updated_uc
    else:
        print(f"No existing user_challenge found, creating new one")
        return await create(
            db,
            user_id=user_id,
            challenge_id=challenge_id,
            is_solved=is_solved,
            status=status or "pending"
        )

async def get_last_cancelled(
    db: AsyncSession,
    *,
    user_id: int,
    subtopic_id: int
) -> Optional[UserChallenge]:
    stmt = (
        select(UserChallenge)
        .join(Challenge, UserChallenge.challenge_id == Challenge.id)
        .where(
            UserChallenge.user_id == user_id,
            Challenge.subtopic_id == subtopic_id,
            UserChallenge.status.in_(["cancelled", "active"]),
        )
        .order_by(UserChallenge.last_attempted_at.desc())
        .limit(1)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def get_active_sessions_by_user_and_subtopic(
    db: AsyncSession,
    *,
    user_id: int,
    subtopic_id: int
) -> List[UserChallenge]:
    """Get all active challenge sessions for a user in a specific subtopic"""
    stmt = (
        select(UserChallenge)
        .join(Challenge, UserChallenge.challenge_id == Challenge.id)
        .where(
            UserChallenge.user_id == user_id,
            Challenge.subtopic_id == subtopic_id,
            UserChallenge.status == "active"
            # NO EXPIRATION CHECK - sessions last until manually deactivated
        )
        .order_by(UserChallenge.session_started_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()

async def get_all_active_sessions_by_user(
    db: AsyncSession,
    *,
    user_id: int
) -> List[UserChallenge]:
    """Get all active challenge sessions for a user across all subtopics"""
    stmt = (
        select(UserChallenge)
        .join(Challenge, UserChallenge.challenge_id == Challenge.id)
        .where(
            UserChallenge.user_id == user_id,
            UserChallenge.status == "active"
            # NO EXPIRATION CHECK - sessions last until manually deactivated
        )
        .order_by(UserChallenge.session_started_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()

async def delete_all_for_user(
    db: AsyncSession,
    *,
    user_id: int
) -> int:
    """
    Delete all UserChallenge rows for a given user_id.
    Returns the number of rows deleted.
    """
    # Use direct DELETE query - much more efficient
    stmt = delete(UserChallenge).where(UserChallenge.user_id == user_id)
    result = await db.execute(stmt)
    await db.commit()
    
    return result.rowcount

async def delete_all(
    db: AsyncSession
) -> int:
    """
    Delete all UserChallenge rows in the table (use with caution).
    Returns the number of rows deleted.
    """
    # Use direct DELETE query - much more efficient
    stmt = delete(UserChallenge)
    result = await db.execute(stmt)
    await db.commit()
    
    return result.rowcount