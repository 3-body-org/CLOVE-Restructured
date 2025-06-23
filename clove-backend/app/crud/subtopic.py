# app/crud/subtopic.py
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.subtopics import Subtopic
from app.db.models.user_subtopics import UserSubtopic
from app.db.models.user_topics import UserTopic
from app.schemas.subtopic import SubtopicCreate, SubtopicUpdate


async def seed_new_subtopic_for_existing_users(db: AsyncSession, subtopic_id: int):
    """
    When a new subtopic is created, create UserSubtopic records for all existing users
    who have access to the parent topic.
    """
    try:
        # Get the new subtopic and its parent topic
        subtopic = await db.execute(select(Subtopic).where(Subtopic.subtopic_id == subtopic_id))
        subtopic = subtopic.scalar_one_or_none()
        if not subtopic:
            raise ValueError(f"Subtopic with ID {subtopic_id} not found")

        # Get all existing users who have UserTopic records for this topic
        user_topics = await db.execute(
            select(UserTopic).where(UserTopic.topic_id == subtopic.topic_id)
        )
        user_topics = user_topics.scalars().all()

        for user_topic in user_topics:
            # Check if UserSubtopic already exists (in case of race conditions)
            existing_user_subtopic = await db.execute(
                select(UserSubtopic).where(
                    UserSubtopic.user_id == user_topic.user_id,
                    UserSubtopic.subtopic_id == subtopic_id
                )
            )
            existing_user_subtopic = existing_user_subtopic.scalar_one_or_none()

            if not existing_user_subtopic:
                user_subtopic = UserSubtopic(
                    user_id=user_topic.user_id,
                    subtopic_id=subtopic.subtopic_id,
                    lessons_completed=False,
                    practice_completed=False,
                    challenges_completed=False,
                    is_unlocked=False,
                    is_completed=False,
                    progress_percent=0.0,
                    knowledge_level=0.1,
                    unlocked_at=None,
                    completed_at=None
                )
                db.add(user_subtopic)

        await db.commit()

    except Exception as e:
        await db.rollback()
        raise


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
        select(Subtopic).join(UserSubtopic).where(UserSubtopic.user_id == user_id).offset(skip).limit(limit)
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
    
    # Seed user data for existing users
    await seed_new_subtopic_for_existing_users(db, new_sub.subtopic_id)
    
    return new_sub

async def update(db: AsyncSession, subtopic_db: Subtopic, subtopic_in: SubtopicUpdate) -> Subtopic:
    for field, value in subtopic_in.model_dump(exclude_unset=True).items():
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
