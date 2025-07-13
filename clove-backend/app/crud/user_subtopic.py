from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.user_subtopics import UserSubtopic
from app.schemas.user_subtopic import UserSubtopicCreate, UserSubtopicUpdate
from app.db.models.subtopics import Subtopic
from app.db.models.user_topics import UserTopic
from sqlalchemy.orm import joinedload
from app.db.models.topics import Topic

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
        select(UserSubtopic)
        .options(joinedload(UserSubtopic.subtopic))
        .where(UserSubtopic.user_id == user_id)
        .offset(skip)
        .limit(limit)
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

async def update_knowledge_levels_from_assessment(
    db: AsyncSession,
    user_id: int,
    subtopic_scores: dict
):
    """Update knowledge_level for multiple subtopics based on assessment scores"""
    for subtopic_id, score_data in subtopic_scores.items():
        # Calculate percentage from correct and total
        correct = score_data.get('correct', 0)
        total = score_data.get('total', 0)
        
        # Calculate percentage (avoid division by zero)
        if total > 0:
            score_percentage = (correct / total) * 100
        else:
            score_percentage = 0.0
        
        # Convert percentage to 0-1 scale (divide by 100)
        knowledge_level = score_percentage / 100.0
        
        # Get or create user_subtopic record
        user_subtopic = await get_by_user_and_subtopic(db, user_id, int(subtopic_id))
        if user_subtopic:
            user_subtopic.knowledge_level = knowledge_level
            await db.commit()
            await db.refresh(user_subtopic)

async def update_user_subtopic_progress(db, user_id, subtopic_id):
    user_subtopic = await db.execute(
        select(UserSubtopic).where(
            UserSubtopic.user_id == user_id,
            UserSubtopic.subtopic_id == subtopic_id
        )
    )
    user_subtopic = user_subtopic.scalars().first()
    if not user_subtopic:
        return

    progress_percent = (
        int(user_subtopic.lessons_completed) +
        int(user_subtopic.practice_completed) +
        int(user_subtopic.challenges_completed)
    ) / 3.0

    user_subtopic.progress_percent = progress_percent
    was_completed = user_subtopic.is_completed
    user_subtopic.is_completed = progress_percent == 1.0

    await db.commit()
    await db.refresh(user_subtopic)

    # Unlock next subtopic or post-assessment if just completed
    if not was_completed and user_subtopic.is_completed:
        await unlock_next_subtopic_or_post_assessment(db, user_id, subtopic_id)

    # Update parent topic progress
    subtopic = await db.execute(
        select(Subtopic).where(Subtopic.subtopic_id == subtopic_id)
    )
    subtopic = subtopic.scalars().first()
    if subtopic:
        await update_user_topic_progress(db, user_id, subtopic.topic_id)

async def update_user_topic_progress(db, user_id, topic_id):
    from app.db.models.pre_assessments import PreAssessment
    from app.db.models.post_assessments import PostAssessment

    # Get all subtopics for this topic
    subtopics = await db.execute(select(Subtopic).where(Subtopic.topic_id == topic_id))
    subtopics = subtopics.scalars().all()
    total_subtopics = len(subtopics)

    progress_sum = 0.0
    for sub in subtopics:
        user_subtopic = await db.execute(
            select(UserSubtopic).where(
                UserSubtopic.user_id == user_id,
                UserSubtopic.subtopic_id == sub.subtopic_id
            )
        )
        user_subtopic = user_subtopic.scalars().first()
        if user_subtopic:
            progress_sum += user_subtopic.progress_percent or 0.0

    # Fetch user_topic
    user_topic = await db.execute(
        select(UserTopic).where(
            UserTopic.user_id == user_id,
            UserTopic.topic_id == topic_id
        )
    )
    user_topic = user_topic.scalars().first()

    # Fetch pre- and post-assessment for this user/topic
    pre_assessment = await db.execute(
        select(PreAssessment).where(PreAssessment.user_topic_id == user_topic.id)
    )
    pre_assessment = pre_assessment.scalars().first()

    post_assessment = await db.execute(
        select(PostAssessment).where(PostAssessment.user_topic_id == user_topic.id)
    )
    post_assessment = post_assessment.scalars().first()

    # Add pre- and post-assessment completion to progress
    pre_complete = 1.0 if pre_assessment and pre_assessment.is_completed else 0.0
    post_complete = 1.0 if post_assessment and post_assessment.is_completed else 0.0

    progress_sum += pre_complete + post_complete
    total_units = total_subtopics + 2  # +2 for pre and post

    progress_percent = progress_sum / total_units if total_units > 0 else 0.0

    if user_topic:
        user_topic.progress_percent = progress_percent
        await db.commit()
        await db.refresh(user_topic)

        # Unlock next topic if progress_percent >= 0.75
        if progress_percent >= 0.75:
            next_topic = await db.execute(
                select(Topic)
                .where(Topic.topic_id > topic_id)
                .order_by(Topic.topic_id.asc())
            )
            next_topic = next_topic.scalars().first()
            if next_topic:
                next_user_topic = await db.execute(
                    select(UserTopic).where(
                        UserTopic.user_id == user_id,
                        UserTopic.topic_id == next_topic.topic_id
                    )
                )
                next_user_topic = next_user_topic.scalars().first()
                if next_user_topic and not next_user_topic.is_unlocked:
                    next_user_topic.is_unlocked = True
                    await db.commit()
                    await db.refresh(next_user_topic)

async def unlock_first_subtopic_for_user(db: AsyncSession, user_id: int, topic_id: int):
    """Unlock the first subtopic for a user in a given topic."""
    # Get the first subtopic by topic_id and order
    subtopic = await db.execute(
        select(Subtopic)
        .where(Subtopic.topic_id == topic_id)
        .order_by(Subtopic.subtopic_id.asc())
    )
    subtopic = subtopic.scalars().first()
    if not subtopic:
        return
    # Get or create the user_subtopic record
    user_subtopic = await get_by_user_and_subtopic(db, user_id, subtopic.subtopic_id)
    if user_subtopic:
        if not user_subtopic.is_unlocked:
            user_subtopic.is_unlocked = True
            await db.commit()
            await db.refresh(user_subtopic)
    else:
        # Create if not exists
        new_user_subtopic = UserSubtopic(
            user_id=user_id,
            subtopic_id=subtopic.subtopic_id,
            is_unlocked=True
        )
        db.add(new_user_subtopic)
        await db.commit()
        await db.refresh(new_user_subtopic)

async def unlock_next_subtopic_or_post_assessment(db: AsyncSession, user_id: int, subtopic_id: int):
    """Unlock the next subtopic for a user, or unlock post-assessment if last subtopic."""
    # Get the current subtopic and topic
    subtopic = await db.execute(select(Subtopic).where(Subtopic.subtopic_id == subtopic_id))
    subtopic = subtopic.scalars().first()
    if not subtopic:
        return
    topic_id = subtopic.topic_id
    # Get all subtopics for this topic, ordered by subtopic_id
    all_subtopics = await db.execute(
        select(Subtopic).where(Subtopic.topic_id == topic_id).order_by(Subtopic.subtopic_id.asc())
    )
    all_subtopics = all_subtopics.scalars().all()
    # Find the index of the current subtopic
    idx = next((i for i, s in enumerate(all_subtopics) if s.subtopic_id == subtopic_id), None)
    if idx is not None and idx + 1 < len(all_subtopics):
        # Unlock the next subtopic
        next_subtopic = all_subtopics[idx + 1]
        user_subtopic = await get_by_user_and_subtopic(db, user_id, next_subtopic.subtopic_id)
        if user_subtopic and not user_subtopic.is_unlocked:
            user_subtopic.is_unlocked = True
            await db.commit()
            await db.refresh(user_subtopic)
    elif idx is not None and idx + 1 == len(all_subtopics):
        # Last subtopic completed, unlock post-assessment
        # Get user_topic
        user_topic = await db.execute(
            select(UserTopic).where(UserTopic.user_id == user_id, UserTopic.topic_id == topic_id)
        )
        user_topic = user_topic.scalars().first()
        if user_topic:
            from app.db.models.post_assessments import PostAssessment
            post_assessment = await db.execute(
                select(PostAssessment).where(PostAssessment.user_topic_id == user_topic.id)
            )
            post_assessment = post_assessment.scalars().first()
            if post_assessment and not post_assessment.is_unlocked:
                post_assessment.is_unlocked = True
                await db.commit()
                await db.refresh(post_assessment)