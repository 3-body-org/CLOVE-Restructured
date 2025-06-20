# app/crud/user_challenge.py
from typing import List, Optional
from sqlalchemy import select, update, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.user_challenges import UserChallenge
from app.db.models.challenges import Challenge
from sqlalchemy import delete
from app.db.models.user_subtopics import UserSubtopic

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
    status: Optional[str] = None
) -> UserChallenge:
    uc = await get_by_user_and_challenge(db, user_id, challenge_id)
    if uc:
        data = {"is_solved": is_solved, "last_attempted_at": func.now()}
        if status is not None:
            data["status"] = status
        await db.execute(
            update(UserChallenge)
            .where(UserChallenge.id == uc.id)
            .values(**data)
        )
        await db.commit()
        return await get_by_id(db, uc.id)
    else:
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
            UserChallenge.status == "cancelled",
        )
        .order_by(UserChallenge.last_attempted_at.desc())
        .limit(1)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

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