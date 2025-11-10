# app/crud/challenge.py
from sqlalchemy.future import select
from sqlalchemy import func, and_, distinct
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.challenges import Challenge
from app.db.models.user_challenges import UserChallenge
from app.schemas.challenge import ChallengeCreate, ChallengeUpdate

async def get_by_id(db: AsyncSession, challenge_id: int) -> Challenge | None:
    result = await db.execute(select(Challenge).where(Challenge.id == challenge_id))
    return result.scalars().first()

async def list_for_subtopic(db: AsyncSession, subtopic_id: int, skip: int = 0, limit: int = 100) -> list[Challenge]:
    result = await db.execute(
        select(Challenge).where(Challenge.subtopic_id == subtopic_id).offset(skip).limit(limit)
    )
    return result.scalars().all()

async def list_by_type_and_difficulty(db: AsyncSession, type: str, difficulty: str, skip: int = 0, limit: int = 100) -> list[Challenge]:
    """List challenges filtered by type and difficulty."""
    result = await db.execute(
        select(Challenge)
        .where(
            Challenge.type == type,
            Challenge.difficulty == difficulty
        )
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def get_available_types(db: AsyncSession) -> list[str]:
    """Get all available challenge types."""
    result = await db.execute(
        select(distinct(Challenge.type))
    )
    return [row[0] for row in result.fetchall()]

async def create(db: AsyncSession, challenge_in: ChallengeCreate) -> Challenge:
    new_chal = Challenge(
        subtopic_id=challenge_in.subtopic_id,
        type=challenge_in.type,
        difficulty=challenge_in.difficulty,
        timer=challenge_in.timer,
        points=challenge_in.points,
        scenario=challenge_in.scenario,
        story_context=challenge_in.story_context,
        challenge_data=challenge_in.challenge_data.model_dump(),
        hints=challenge_in.hints,
    )
    db.add(new_chal)
    await db.commit()
    await db.refresh(new_chal)
    
    return new_chal

async def update(db: AsyncSession, challenge_db: Challenge, challenge_in: ChallengeUpdate) -> Challenge:
    for field, value in challenge_in.model_dump(exclude_unset=True).items():
        if field == "challenge_data" and value is not None:
            # Handle challenge_data as a nested model
            setattr(challenge_db, field, value.model_dump())
        else:
            setattr(challenge_db, field, value)
    db.add(challenge_db)
    await db.commit()
    await db.refresh(challenge_db)
    return challenge_db

async def delete(db: AsyncSession, challenge_db: Challenge) -> None:
    await db.delete(challenge_db)
    await db.commit()

async def count_all(db: AsyncSession) -> int:
    result = await db.execute(select(func.count(Challenge.id)))
    return result.scalar_one()

async def get_challenges_by_type_and_difficulty(db, subtopic_id, challenge_type, difficulty):
    stmt = select(Challenge).where(
        Challenge.subtopic_id == subtopic_id,
        Challenge.type == challenge_type,
        Challenge.difficulty == difficulty
    )
    result = await db.execute(stmt)
    return result.scalars().all()

async def get_challenges_by_difficulty(db: AsyncSession, subtopic_id: int, difficulty: str) -> list[Challenge]:
    """
    Fetches all challenges for a given subtopic that match a specific difficulty.
    """
    stmt = select(Challenge).where(
        Challenge.subtopic_id == subtopic_id,
        Challenge.difficulty == difficulty
    )
    result = await db.execute(stmt)
    return result.scalars().all()

async def get_all_challenges_by_subtopic(db: AsyncSession, subtopic_id: int) -> list[Challenge]:
    """
    Fetches all challenges associated with a specific subtopic.
    """
    stmt = select(Challenge).where(Challenge.subtopic_id == subtopic_id)
    result = await db.execute(stmt)
    return result.scalars().all()

async def get_unsolved_challenges_by_difficulty(db: AsyncSession, user_id: int, subtopic_id: int, difficulty: str) -> list[Challenge]:
    """
    Fetches challenges of a specific difficulty for a subtopic that the user has not yet solved.
    
    This includes challenges never attempted and those attempted but not solved.
    """
    stmt = (
        select(Challenge)
        .outerjoin(
            UserChallenge,
            and_(
                Challenge.id == UserChallenge.challenge_id,
                UserChallenge.user_id == user_id,
            ),
        )
        .where(
            Challenge.subtopic_id == subtopic_id,
            Challenge.difficulty == difficulty,
            (UserChallenge.is_solved == None) | (UserChallenge.is_solved == False)
        )
    )
    result = await db.execute(stmt)
    return result.scalars().all()