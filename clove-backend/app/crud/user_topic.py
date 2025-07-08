from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from app.db.models.user_topics import UserTopic
from app.schemas.user_topic import UserTopicCreate, UserTopicUpdate
from app.db.models.subtopics import Subtopic
from app.db.models.user_subtopics import UserSubtopic

async def get_by_id(db: AsyncSession, user_topic_id: int) -> UserTopic | None:
    result = await db.execute(select(UserTopic).where(UserTopic.id == user_topic_id))
    return result.scalars().first()

async def get_by_user_and_topic(db: AsyncSession, user_id: int, topic_id: int) -> UserTopic | None:
    result = await db.execute(
        select(UserTopic)
        .options(joinedload(UserTopic.topic))
        .where(
            UserTopic.user_id == user_id,
            UserTopic.topic_id == topic_id
        )
    )
    return result.scalars().first()

async def get_topic_knowledge_level(db: AsyncSession, user_id: int, topic_id: int) -> float:
    subtopics = await db.execute(select(Subtopic).where(Subtopic.topic_id == topic_id))
    subtopics = subtopics.scalars().all()
    if not subtopics:
        return 0.0
    knowledge_levels = []
    for sub in subtopics:
        user_subtopic = await db.execute(
            select(UserSubtopic).where(
                UserSubtopic.user_id == user_id,
                UserSubtopic.subtopic_id == sub.subtopic_id
            )
        )
        user_subtopic = user_subtopic.scalars().first()
        if user_subtopic:
            knowledge_levels.append(user_subtopic.knowledge_level or 0.0)
        else:
            knowledge_levels.append(0.0)
    avg_kl = sum(knowledge_levels) / len(knowledge_levels)
    return avg_kl

async def list_for_user(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100) -> list[UserTopic]:
    result = await db.execute(
        select(UserTopic)
        .options(joinedload(UserTopic.topic))
        .where(UserTopic.user_id == user_id)
        .order_by(UserTopic.topic_id)  # Ensure topics are ordered by topic_id
        .offset(skip)
        .limit(limit)
    )
    user_topics = result.scalars().all()
    # Attach knowledge_level to each UserTopic instance
    for ut in user_topics:
        ut.knowledge_level = await get_topic_knowledge_level(db, user_id, ut.topic_id)
    return user_topics

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