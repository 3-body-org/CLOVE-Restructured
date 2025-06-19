from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.user_subtopics import UserSubtopic
from app.schemas.user_subtopic import UserSubtopicCreate, UserSubtopicUpdate

async def get_by_id(db: AsyncSession, user_subtopic_id: int) -> UserSubtopic | None:
    result = await db.execute(select(UserSubtopic).where(UserSubtopic.id == user_subtopic_id))
    return result.scalars().first()

async def get_by_user_and_subtopic(db: AsyncSession, user_id: int, subtopic_id: int) -> UserSubtopic | None:
    result = await db.execute(
        select(UserSubtopic).where(
            UserSubtopic.user_id == user_id,
            UserSubtopic.subtopic_id == subtopic_id
        )
    )
    return result.scalars().first()

async def list_for_user(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100) -> list[UserSubtopic]:
    result = await db.execute(
        select(UserSubtopic).where(UserSubtopic.user_id == user_id).offset(skip).limit(limit)
    )
    return result.scalars().all()

async def list_for_user_topic(db: AsyncSession, user_topic_id: int, skip: int = 0, limit: int = 100) -> list[UserSubtopic]:
    result = await db.execute(
        select(UserSubtopic).where(UserSubtopic.user_topic_id == user_topic_id).offset(skip).limit(limit)
    )
    return result.scalars().all()

async def create(db: AsyncSession, user_subtopic_in: UserSubtopicCreate) -> UserSubtopic:
    new_user_subtopic = UserSubtopic(**user_subtopic_in.model_dump())
    db.add(new_user_subtopic)
    await db.commit()
    await db.refresh(new_user_subtopic)
    return new_user_subtopic

async def update(db: AsyncSession, user_subtopic_db: UserSubtopic, user_subtopic_in: UserSubtopicUpdate) -> UserSubtopic:
    for field, value in user_subtopic_in.model_dump(exclude_unset=True).items():
        setattr(user_subtopic_db, field, value)
    db.add(user_subtopic_db)
    await db.commit()
    await db.refresh(user_subtopic_db)
    return user_subtopic_db

async def delete(db: AsyncSession, user_subtopic_db: UserSubtopic) -> None:
    await db.delete(user_subtopic_db)
    await db.commit() 

async def update_progress(
    db: AsyncSession,
    user_subtopic: UserSubtopic,
    progress_percent: float,
    knowledge_level: float
):
    user_subtopic.progress_percent  = progress_percent
    user_subtopic.knowledge_level   = knowledge_level
    await db.commit()
    await db.refresh(user_subtopic)
    return user_subtopic