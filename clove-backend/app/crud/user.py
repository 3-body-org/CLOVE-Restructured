# app/crud/user.py

from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.users             import User
from app.db.models.topics            import Topic
from app.db.models.subtopics         import Subtopic

from app.db.models.user_topics      import UserTopic
from app.db.models.user_subtopics   import UserSubtopic
from app.db.models.pre_assessments  import PreAssessment
from app.db.models.post_assessments import PostAssessment
from app.db.models.statistics       import Statistic

async def get_by_email(db: AsyncSession, email: str) -> User | None:
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    return result.scalars().first()

async def get_by_username(db: AsyncSession, username: str) -> User | None:
    stmt = select(User).where(User.username == username)
    result = await db.execute(stmt)
    return result.scalars().first()

async def get_by_id(db: AsyncSession, user_id: int) -> User | None:
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    return result.scalars().first()

async def get_all_users(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[User]:
    stmt = select(User).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()

async def create_user(
    db: AsyncSession,
    username: str,
    email: str,
    password_hash: str
) -> User:
    user = User(
        username=username,
        email=email,
        password_hash=password_hash
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def update_user(
    db: AsyncSession,
    user: User,
    update_data: dict
) -> User:
    for field, value in update_data.items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return user

async def init_user_data(db: AsyncSession, user_id: int):
    """
    For each Topic/Subtopic/AssessmentQuestion in the system,
    create the corresponding UserTopic, UserSubtopic, Pre/PostAssessment, and a Statistic row.
    """
    topics = (await db.execute(select(Topic))).scalars().all()
    for topic in topics:
        # 1. Create UserTopic with all default fields
        user_topic = UserTopic(
            user_id=user_id,
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

        # 2. Create UserSubtopic for each subtopic
        subtopics = (await db.execute(
            select(Subtopic).where(Subtopic.topic_id == topic.topic_id)
        )).scalars().all()
        for sub in subtopics:
            user_subtopic = UserSubtopic(
                user_id=user_id,
                subtopic_id=sub.subtopic_id,
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

        # 3. Create PreAssessment and PostAssessment for the topic
        pre_assessment = PreAssessment(
            user_topic_id=user_topic.id,
            total_score=0.0,
            total_items=0,
            is_unlocked=False,
            subtopic_scores={},
            questions_answers_iscorrect={}
        )
        db.add(pre_assessment)

        post_assessment = PostAssessment(
            user_topic_id=user_topic.id,
            total_score=0.0,
            total_items=0,
            is_unlocked=False,
            subtopic_scores={},
            questions_answers_iscorrect={}
        )
        db.add(post_assessment)

    # 4. Create Statistic row
    stat = Statistic(user_id=user_id)
    db.add(stat)

    await db.commit()

async def delete_user(
    db: AsyncSession,
    user_obj: User
) -> None:
    await db.delete(user_obj)
    await db.commit()
