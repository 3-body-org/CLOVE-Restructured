# app/crud/topic.py
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.topics import Topic
from app.db.models.users import User
from app.db.models.user_topics import UserTopic
from app.db.models.pre_assessments import PreAssessment
from app.db.models.post_assessments import PostAssessment
from app.schemas.topic import TopicCreate, TopicUpdate


async def seed_new_topic_for_existing_users(db: AsyncSession, topic_id: int):
    """
    When a new topic is created, create UserTopic and Pre/PostAssessment records
    for all existing users. UserSubtopic records will be created when subtopics are added.
    """
    try:
        # Get the new topic
        topic = await db.execute(select(Topic).where(Topic.topic_id == topic_id))
        topic = topic.scalar_one_or_none()
        if not topic:
            raise ValueError(f"Topic with ID {topic_id} not found")

        # Get all existing users
        users = await db.execute(select(User))
        users = users.scalars().all()

        for user in users:
            # 1. Create UserTopic
            user_topic = UserTopic(
                user_id=user.id,
                topic_id=topic.topic_id,
                pre_assessment_completed=False,
                post_assessment_completed=False,
                is_unlocked=False,
                is_completed=False,
                completed_subtopics_count=0,
                progress_percent=0.0,
                unlocked_at=None,
                completed_at=None,
                last_accessed_at=None
            )
            db.add(user_topic)
            await db.flush()  # To get user_topic.id for FKs

            # 2. Create PreAssessment and PostAssessment for the topic
            pre_assessment = PreAssessment(
                user_topic_id=user_topic.id,
                total_score=0.0,
                total_items=0,
                is_unlocked=False,
                subtopic_scores={},
                questions_answers_iscorrect={},
                attempt_count=0
            )
            db.add(pre_assessment)

            post_assessment = PostAssessment(
                user_topic_id=user_topic.id,
                total_score=0.0,
                total_items=0,
                is_unlocked=True,  # Post-assessment always unlocked (same as pre-assessment)
                subtopic_scores={},
                questions_answers_iscorrect={},
                attempt_count=0
            )
            db.add(post_assessment)

        await db.commit()

    except Exception as e:
        await db.rollback()
        raise


async def get_by_id(db: AsyncSession, topic_id: int) -> Topic | None:
    result = await db.execute(select(Topic).where(Topic.topic_id == topic_id))
    return result.scalars().first()

async def list_all(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[Topic]:
    result = await db.execute(
        select(Topic).offset(skip).limit(limit)
    )
    return result.scalars().all()

async def create(db: AsyncSession, topic_in: TopicCreate) -> Topic:
    new_topic = Topic(
        title=topic_in.title,
        description=topic_in.description
    )
    db.add(new_topic)
    await db.commit()
    await db.refresh(new_topic)
    
    # Seed user data for existing users
    await seed_new_topic_for_existing_users(db, new_topic.topic_id)
    
    return new_topic

async def update(db: AsyncSession, topic_db: Topic, topic_in: TopicUpdate) -> Topic:
    for field, value in topic_in.model_dump(exclude_unset=True).items():
        setattr(topic_db, field, value)
    db.add(topic_db)
    await db.commit()
    await db.refresh(topic_db)
    return topic_db

async def delete(db: AsyncSession, topic_db: Topic) -> None:
    await db.delete(topic_db)
    await db.commit()
