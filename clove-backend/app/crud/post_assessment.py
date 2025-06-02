# app/crud/post_assessment.py
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.post_assessments import PostAssessment
from app.schemas.post_assessment import PostAssessmentCreate, PostAssessmentUpdate

async def get_by_id(db: AsyncSession, post_id: int) -> PostAssessment | None:
    result = await db.execute(select(PostAssessment).where(PostAssessment.post_assessment_id == post_id))
    return result.scalars().first()

async def list_for_user_topic(db: AsyncSession, user_id: int, topic_id: int) -> list[PostAssessment]:
    result = await db.execute(
        select(PostAssessment).where(
            PostAssessment.user_id == user_id,
            PostAssessment.topic_id == topic_id
        )
    )
    return result.scalars().all()

async def create(db: AsyncSession, post_in: PostAssessmentCreate) -> PostAssessment:
    new_post = PostAssessment(
        user_id=post_in.user_id,
        topic_id=post_in.topic_id,
        total_score=post_in.total_score,
        total_items=post_in.total_items,
        is_unlocked=post_in.is_unlocked,
        subtopic_scores=post_in.subtopic_scores,
        questions_answers_iscorrect=post_in.questions_answers_iscorrect
    )
    db.add(new_post)
    await db.commit()
    await db.refresh(new_post)
    return new_post

async def update(db: AsyncSession, post_db: PostAssessment, post_in: PostAssessmentUpdate) -> PostAssessment:
    post_db.total_score = post_in.total_score
    post_db.total_items = post_in.total_items
    post_db.is_unlocked = post_in.is_unlocked
    post_db.subtopic_scores = post_in.subtopic_scores
    post_db.questions_answers_iscorrect = post_in.questions_answers_iscorrect
    db.add(post_db)
    await db.commit()
    await db.refresh(post_db)
    return post_db

async def delete(db: AsyncSession, post_db: PostAssessment) -> None:
    await db.delete(post_db)
    await db.commit()
