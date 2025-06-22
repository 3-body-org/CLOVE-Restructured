# app/crud/lesson.py
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.lessons import Lesson
from app.schemas.lesson import LessonCreate, LessonUpdate

async def get_by_id(db: AsyncSession, lesson_id: int) -> Lesson | None:
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    return result.scalars().first()

async def list_for_subtopic(db: AsyncSession, subtopic_id: int, skip: int = 0, limit: int = 100) -> list[Lesson]:
    result = await db.execute(
        select(Lesson).where(Lesson.subtopic_id == subtopic_id).offset(skip).limit(limit)
    )
    return result.scalars().all()

async def create(db: AsyncSession, lesson_in: LessonCreate) -> Lesson:
    new_lesson = Lesson(
        subtopic_id=lesson_in.subtopic_id,
        title=lesson_in.title,
        introduction=lesson_in.introduction,
        content=lesson_in.content,
        question_id=lesson_in.question_id,
        matching_game=lesson_in.matching_game
    )
    db.add(new_lesson)
    await db.commit()
    await db.refresh(new_lesson)
    
    return new_lesson

async def update(db: AsyncSession, lesson_db: Lesson, lesson_in: LessonUpdate) -> Lesson:
    for field, value in lesson_in.model_dump(exclude_unset=True).items():
        setattr(lesson_db, field, value)
    db.add(lesson_db)
    await db.commit()
    await db.refresh(lesson_db)
    return lesson_db

async def delete(db: AsyncSession, lesson_db: Lesson) -> None:
    await db.delete(lesson_db)
    await db.commit()
