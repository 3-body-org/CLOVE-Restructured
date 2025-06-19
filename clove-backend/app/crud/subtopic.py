# app/crud/subtopic.py
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.subtopics import Subtopic
from app.schemas.subtopic import SubtopicCreate, SubtopicUpdate

async def get_by_id(db: AsyncSession, subtopic_id: int) -> Subtopic | None:
    result = await db.execute(select(Subtopic).where(Subtopic.subtopic_id == subtopic_id))
    return result.scalars().first()

async def list_for_topic(db: AsyncSession, topic_id: int, skip: int = 0, limit: int = 100) -> list[Subtopic]:
    result = await db.execute(
        select(Subtopic).where(Subtopic.topic_id == topic_id).offset(skip).limit(limit)
    )
    return result.scalars().all()

async def list_for_user(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100) -> list[Subtopic]:
    result = await db.execute(
        select(Subtopic).where(Subtopic.user_id == user_id).offset(skip).limit(limit)
    )
    return result.scalars().all()

async def create(db: AsyncSession, subtopic_in: SubtopicCreate) -> Subtopic:
    new_sub = Subtopic(
        topic_id=subtopic_in.topic_id,
        title=subtopic_in.title
    )
    db.add(new_sub)
    await db.commit()
    await db.refresh(new_sub)
    return new_sub

async def update(db: AsyncSession, subtopic_db: Subtopic, subtopic_in: SubtopicUpdate) -> Subtopic:
    for field, value in subtopic_in:
        if value is not None:
            setattr(subtopic_db, field, value)
    db.add(subtopic_db)
    await db.commit()
    await db.refresh(subtopic_db)
    return subtopic_db

async def delete(db: AsyncSession, subtopic_db: Subtopic) -> None:
    await db.delete(subtopic_db)
    await db.commit()

async def update_knowledge_level(db: AsyncSession, subtopic: Subtopic, new_knowledge: float) -> Subtopic:
    subtopic.knowledge_level = round(new_knowledge, 2)
    db.add(subtopic)
    await db.commit()
    await db.refresh(subtopic)
    return subtopic
