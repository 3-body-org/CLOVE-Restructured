# app/crud/assessment_question.py
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.assessment_questions import AssessmentQuestion
from app.schemas.assessment_question import AssessmentQuestionCreate, AssessmentQuestionUpdate

async def get_by_id(db: AsyncSession, question_id: int) -> AssessmentQuestion | None:
    result = await db.execute(select(AssessmentQuestion).where(AssessmentQuestion.id == question_id))
    return result.scalars().first()

async def list_for_subtopic(db: AsyncSession, subtopic_id: int, skip: int = 0, limit: int = 100) -> list[AssessmentQuestion]:
    result = await db.execute(
        select(AssessmentQuestion).where(AssessmentQuestion.subtopic_id == subtopic_id).offset(skip).limit(limit)
    )
    return result.scalars().all()

async def create(db: AsyncSession, ques_in: AssessmentQuestionCreate) -> AssessmentQuestion:
    new_q = AssessmentQuestion(
        subtopic_id=ques_in.subtopic_id,
        question_choices_correctanswer=ques_in.question_choices_correctanswer,
        difficulty=ques_in.difficulty
    )
    db.add(new_q)
    await db.commit()
    await db.refresh(new_q)
    return new_q

async def update(db: AsyncSession, ques_db: AssessmentQuestion, ques_in: AssessmentQuestionUpdate) -> AssessmentQuestion:
    ques_db.question_choices_correctanswer = ques_in.question_choices_correctanswer
    ques_db.difficulty = ques_in.difficulty
    db.add(ques_db)
    await db.commit()
    await db.refresh(ques_db)
    return ques_db

async def delete(db: AsyncSession, ques_db: AssessmentQuestion) -> None:
    await db.delete(ques_db)
    await db.commit()
