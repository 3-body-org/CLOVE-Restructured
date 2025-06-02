# app/crud/topic.py
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.topics import Topic
from app.schemas.topic import TopicCreate, TopicUpdate

async def get_by_id(db: AsyncSession, topic_id: int) -> Topic | None:
    result = await db.execute(select(Topic).where(Topic.topic_id == topic_id))
    return result.scalars().first()

async def list_for_user(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100) -> list[Topic]:
    result = await db.execute(
        select(Topic).where(Topic.user_id == user_id).offset(skip).limit(limit)
    )
    return result.scalars().all()

async def create(db: AsyncSession, topic_in: TopicCreate) -> Topic:
    new_topic = Topic(
        user_id=topic_in.user_id,
        title=topic_in.title,
        description=topic_in.description,
        unlock_threshold=topic_in.unlock_threshold
    )
    db.add(new_topic)
    await db.commit()
    await db.refresh(new_topic)
    return new_topic

async def update(db: AsyncSession, topic_db: Topic, topic_in: TopicUpdate) -> Topic:
    for field, value in topic_in:
        if value is not None:
            setattr(topic_db, field, value)
    db.add(topic_db)
    await db.commit()
    await db.refresh(topic_db)
    return topic_db

async def delete(db: AsyncSession, topic_db: Topic) -> None:
    await db.delete(topic_db)
    await db.commit()
