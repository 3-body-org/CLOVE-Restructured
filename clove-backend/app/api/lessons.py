# app/api/lessons.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession 
from app.schemas.lesson import LessonRead, LessonCreate, LessonUpdate
from app.crud.lesson import get_by_id, list_for_subtopic, create, update, delete
from app.db.session import get_db
from app.api.auth import get_current_superuser
from app.db.models.users import User
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/lessons", tags=["Lessons"])

@router.post("/", response_model=LessonRead, status_code=status.HTTP_201_CREATED)
async def create_lesson(
    lesson_in: LessonCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Create a new lesson. Requires superuser privileges."""
    created = await create(db, lesson_in)
    return created

@router.get("/{lesson_id}", response_model=LessonRead)
async def read_lesson(
    lesson_id: int, 
    db: AsyncSession = Depends(get_db)
):
    """Get a specific lesson by ID. Public endpoint for reading."""
    lesson_obj = await get_by_id(db, lesson_id=lesson_id)
    if not lesson_obj:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson_obj

@router.get("/", response_model=List[LessonRead])
async def list_lessons(
    subtopic_id: Optional[int] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """List lessons for a subtopic. Public endpoint for reading."""
    logger.info(f"🔍 [LessonsAPI] Fetching lessons for subtopic_id: {subtopic_id}")
    
    if subtopic_id is None:
        logger.error("❌ [LessonsAPI] subtopic_id query parameter is required")
        raise HTTPException(status_code=400, detail="subtopic_id query parameter is required")
    
    lessons = await list_for_subtopic(db, subtopic_id=subtopic_id, skip=skip, limit=limit)
    logger.info(f"✅ [LessonsAPI] Found {len(lessons)} lessons for subtopic_id: {subtopic_id}")
    
    return lessons

@router.patch("/{lesson_id}", response_model=LessonRead)
async def update_lesson(
    lesson_id: int, 
    lesson_in: LessonUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Update a lesson. Requires superuser privileges."""
    lesson_obj = await get_by_id(db, lesson_id=lesson_id)
    if not lesson_obj:
        raise HTTPException(status_code=404, detail="Lesson not found")
    updated = await update(db, lesson_obj, lesson_in)
    return updated

@router.delete("/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lesson(
    lesson_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Delete a lesson. Requires superuser privileges."""
    lesson_obj = await get_by_id(db, lesson_id=lesson_id)
    if not lesson_obj:
        raise HTTPException(status_code=404, detail="Lesson not found")
    await delete(db, lesson_obj)
    return
