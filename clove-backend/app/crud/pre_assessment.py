# app/crud/pre_assessment.py
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.pre_assessments import PreAssessment
from app.schemas.pre_assessment import PreAssessmentCreate, PreAssessmentUpdate

async def get_by_id(db: AsyncSession, pre_id: int) -> PreAssessment | None:
    result = await db.execute(select(PreAssessment).where(PreAssessment.pre_assessment_id == pre_id))
    return result.scalars().first()

async def list_for_user_topic(db: AsyncSession, user_id: int, topic_id: int) -> list[PreAssessment]:
    result = await db.execute(
        select(PreAssessment).where(
            PreAssessment.user_id == user_id,
            PreAssessment.topic_id == topic_id
        )
    )
    return result.scalars().all()

async def create(db: AsyncSession, pre_in: PreAssessmentCreate) -> PreAssessment:
    new_pre = PreAssessment(
        user_id=pre_in.user_id,
        topic_id=pre_in.topic_id,
        total_score=pre_in.total_score,
        total_items=pre_in.total_items,
        is_unlocked=pre_in.is_unlocked,
        subtopic_scores=pre_in.subtopic_scores,
        questions_answers_iscorrect=pre_in.questions_answers_iscorrect
    )
    db.add(new_pre)
    await db.commit()
    await db.refresh(new_pre)
    return new_pre

async def update(db: AsyncSession, pre_db: PreAssessment, pre_in: PreAssessmentUpdate) -> PreAssessment:
    pre_db.total_score = pre_in.total_score
    pre_db.total_items = pre_in.total_items
    pre_db.is_unlocked = pre_in.is_unlocked
    pre_db.subtopic_scores = pre_in.subtopic_scores
    pre_db.questions_answers_iscorrect = pre_in.questions_answers_iscorrect
    db.add(pre_db)
    await db.commit()
    await db.refresh(pre_db)
    return pre_db

async def delete(db: AsyncSession, pre_db: PreAssessment) -> None:
    await db.delete(pre_db)
    await db.commit()
