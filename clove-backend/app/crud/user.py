# app/crud/user.py

from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, datetime
import re
import random

from app.db.models.users             import User
from app.db.models.topics            import Topic
from app.db.models.subtopics         import Subtopic

from app.db.models.user_topics      import UserTopic
from app.db.models.user_subtopics   import UserSubtopic
from app.db.models.pre_assessments  import PreAssessment
from app.db.models.post_assessments import PostAssessment
from app.db.models.statistics       import Statistic

def generate_username(first_name: str, last_name: str, email: str) -> str:
    """
    Generate a unique username from first name, last name, and email.
    Format: firstnamelastname + random 3 digits
    """
    # Clean the names (remove special characters, convert to lowercase)
    clean_first = re.sub(r'[^a-zA-Z0-9]', '', first_name.lower())
    clean_last = re.sub(r'[^a-zA-Z0-9]', '', last_name.lower())
    
    # Create base username
    base_username = f"{clean_first}{clean_last}"
    
    # Add random 3-digit number to ensure uniqueness
    random_suffix = random.randint(100, 999)
    username = f"{base_username}{random_suffix}"
    
    return username

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
    email: str,
    password_hash: str,
    first_name: str,
    last_name: str,
    birthday: date,
    is_superuser: bool = False,
    bio: str | None = None,
    profile_photo_url: str | None = None
) -> User:
    # Generate a unique username
    username = generate_username(first_name, last_name, email)
    
    # Check if username already exists and regenerate if needed
    max_attempts = 10
    attempts = 0
    while attempts < max_attempts:
        existing_user = await get_by_username(db, username)
        if not existing_user:
            break
        # Regenerate with different random number
        username = generate_username(first_name, last_name, email)
        attempts += 1
    
    # If we still have conflicts after max attempts, use email prefix
    if attempts >= max_attempts:
        email_prefix = email.split('@')[0]
        username = f"{email_prefix}{random.randint(1000, 9999)}"
    
    user = User(
        username=username,
        email=email,
        password_hash=password_hash,
        first_name=first_name,
        last_name=last_name,
        birthday=birthday,
        is_superuser=is_superuser,
        bio=bio,
        profile_photo_url=profile_photo_url
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Initialize all user data (UserTopics, UserSubtopics, Pre/PostAssessments, Statistics)
    await init_user_data(db, user.id)
    
    return user

async def update_user(
    db: AsyncSession,
    user: User,
    update_data: dict
) -> User:
    for field, value in update_data.items():
        if field in ['bio', 'profile_photo_url']:
            setattr(user, field, value)
        else:
            setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return user

async def init_user_data(db: AsyncSession, user_id: int, login_days_this_week=None):
    """
    For each Topic/Subtopic/AssessmentQuestion in the system,
    create the corresponding UserTopic, UserSubtopic, Pre/PostAssessment, and a Statistic row.
    """
    if login_days_this_week is None:
        login_days_this_week = []
    
    # Get all topics and subtopics in one query each
    topics = (await db.execute(select(Topic).order_by(Topic.topic_id))).scalars().all()
    all_subtopics = (await db.execute(select(Subtopic))).scalars().all()
    
    # Group subtopics by topic_id for efficient lookup
    subtopics_by_topic = {}
    for subtopic in all_subtopics:
        if subtopic.topic_id not in subtopics_by_topic:
            subtopics_by_topic[subtopic.topic_id] = []
        subtopics_by_topic[subtopic.topic_id].append(subtopic)
    
    # Identify first topic once (lowest topic_id)
    first_topic_id = topics[0].topic_id if topics else None
    current_time = datetime.utcnow()
    
    # Prepare all objects for bulk insertion
    user_topics = []
    user_subtopics = []
    pre_assessments = []
    post_assessments = []
    
    for topic in topics:
        is_first_topic = topic.topic_id == first_topic_id
        
        # 1. Create UserTopic
        user_topic = UserTopic(
            user_id=user_id,
            topic_id=topic.topic_id,
            pre_assessment_completed=False,
            post_assessment_completed=False,
            is_unlocked=is_first_topic,  # Only first topic unlocked
            is_completed=False,
            introduction_seen=False,  # New users haven't seen introduction
            completed_subtopics_count=0,
            progress_percent=0.0,
            unlocked_at=current_time if is_first_topic else None,
            completed_at=None,
            last_accessed_at=None
        )
        user_topics.append(user_topic)
    
    # Bulk add all UserTopics first to get their IDs
    db.add_all(user_topics)
    await db.flush()  # Single flush to get all IDs
    
    # Now create related objects with the user_topic IDs
    for i, topic in enumerate(topics):
        user_topic = user_topics[i]
        is_first_topic = topic.topic_id == first_topic_id

        # 2. Create UserSubtopics for this topic
        topic_subtopics = subtopics_by_topic.get(topic.topic_id, [])
        for subtopic in topic_subtopics:
            user_subtopic = UserSubtopic(
                user_id=user_id,
                subtopic_id=subtopic.subtopic_id,
                lessons_completed=False,
                practice_completed=False,
                challenges_completed=False,
                is_unlocked=False,  # All subtopics locked at creation
                is_completed=False,
                progress_percent=0.0,
                knowledge_level=0.1,
                unlocked_at=None,
                completed_at=None
            )
            user_subtopics.append(user_subtopic)

        # 3. Create PreAssessment and PostAssessment
        pre_assessment = PreAssessment(
            user_topic_id=user_topic.id,
            total_score=0.0,
            total_items=0,
            is_unlocked=True,  # Pre-assessment always unlocked
            subtopic_scores={},
            questions_answers_iscorrect={},
            attempt_count=0
        )
        pre_assessments.append(pre_assessment)

        post_assessment = PostAssessment(
            user_topic_id=user_topic.id,
            total_score=0.0,
            total_items=0,
            is_unlocked=False,  # Post-assessment always locked at creation
            subtopic_scores={},
            questions_answers_iscorrect={},
            attempt_count=0
        )
        post_assessments.append(post_assessment)
    
    # Bulk add all remaining objects
    db.add_all(user_subtopics)
    db.add_all(pre_assessments)
    db.add_all(post_assessments)

    # 4. Create Statistic row
    stat = Statistic(user_id=user_id, login_days_this_week=login_days_this_week)
    db.add(stat)

    # Single commit for everything
    await db.commit()

async def delete_user(
    db: AsyncSession,
    user_obj: User
) -> None:
    await db.delete(user_obj)
    await db.commit()
