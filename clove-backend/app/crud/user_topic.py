from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.user_topics import UserTopic
from app.schemas.user_topic import UserTopicCreate, UserTopicUpdate

async def get_by_id(db: AsyncSession, user_topic_id: int) -> UserTopic | None:
    result = await db.execute(select(UserTopic).where(UserTopic.id == user_topic_id))
    return result.scalars().first()

async def get_by_user_and_topic(db: AsyncSession, user_id: int, topic_id: int) -> UserTopic | None:
    result = await db.execute(
        select(UserTopic).where(
            UserTopic.user_id == user_id,
            UserTopic.topic_id == topic_id
        )
    )
    return result.scalars().first()

async def list_for_user(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100) -> list[UserTopic]:
    result = await db.execute(
        select(UserTopic).where(UserTopic.user_id == user_id).offset(skip).limit(limit)
    )
    return result.scalars().all()

async def create(db: AsyncSession, user_topic_in: UserTopicCreate) -> UserTopic:
    new_user_topic = UserTopic(**user_topic_in.model_dump())
    db.add(new_user_topic)
    await db.commit()
    await db.refresh(new_user_topic)
    return new_user_topic

async def update(db: AsyncSession, user_topic_db: UserTopic, user_topic_in: UserTopicUpdate) -> UserTopic:
    for field, value in user_topic_in.model_dump(exclude_unset=True).items():
        setattr(user_topic_db, field, value)
    db.add(user_topic_db)
    await db.commit()
    await db.refresh(user_topic_db)
    return user_topic_db

async def delete(db: AsyncSession, user_topic_db: UserTopic) -> None:
    await db.delete(user_topic_db)
    await db.commit() 