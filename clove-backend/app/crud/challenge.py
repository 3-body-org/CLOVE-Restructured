# app/crud/challenge.py
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.challenges import Challenge
from app.schemas.challenge import ChallengeCreate, ChallengeUpdate

async def get_by_id(db: AsyncSession, challenge_id: int) -> Challenge | None:
    result = await db.execute(select(Challenge).where(Challenge.id == challenge_id))
    return result.scalars().first()

async def list_for_subtopic(db: AsyncSession, subtopic_id: int, skip: int = 0, limit: int = 100) -> list[Challenge]:
    result = await db.execute(
        select(Challenge).where(Challenge.subtopic_id == subtopic_id).offset(skip).limit(limit)
    )
    return result.scalars().all()

async def create(db: AsyncSession, challenge_in: ChallengeCreate) -> Challenge:
    new_chal = Challenge(
        subtopic_id=challenge_in.subtopic_id,
        type=challenge_in.type,
        snippet_expectedoutput_choices=challenge_in.snippet_expectedoutput_choices,
        difficulty=challenge_in.difficulty,
        hints=challenge_in.hints,
        timer=challenge_in.timer,
        points=challenge_in.points if challenge_in.points is not None else 100,
        is_solved=challenge_in.is_solved if challenge_in.is_solved is not None else False
    )
    db.add(new_chal)
    await db.commit()
    await db.refresh(new_chal)
    return new_chal

async def update(db: AsyncSession, challenge_db: Challenge, challenge_in: ChallengeUpdate) -> Challenge:
    for field, value in challenge_in:
        if value is not None:
            setattr(challenge_db, field, value)
    db.add(challenge_db)
    await db.commit()
    await db.refresh(challenge_db)
    return challenge_db

async def delete(db: AsyncSession, challenge_db: Challenge) -> None:
    await db.delete(challenge_db)
    await db.commit()

async def get_challenges_by_type_and_difficulty(db, subtopic_id, challenge_type, difficulty):
    stmt = select(Challenge).where(
        Challenge.subtopic_id == subtopic_id,
        Challenge.type == challenge_type,
        Challenge.difficulty == difficulty
    )
    result = await db.execute(stmt)
    return result.scalars().all()