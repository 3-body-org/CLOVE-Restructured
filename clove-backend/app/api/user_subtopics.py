# app/api/user_subtopics.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.user_subtopic import UserSubtopicRead, UserSubtopicCreate, UserSubtopicUpdate
from app.crud.user_subtopic import (
    get_by_id, get_by_user_and_subtopic, list_for_user,
    create, update, delete, update_user_subtopic_progress
)
from app.db.session import get_db
from app.api.auth import get_current_user, get_current_superuser
from app.db.models.users import User

router = APIRouter(prefix="/user_subtopics", tags=["UserSubtopics"])

@router.post("/", response_model=UserSubtopicRead, status_code=status.HTTP_201_CREATED)
async def create_user_subtopic(
    user_subtopic_in: UserSubtopicCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user_subtopic already exists
    existing = await get_by_user_and_subtopic(db, user_subtopic_in.user_id, user_subtopic_in.subtopic_id)
    if existing:
        raise HTTPException(status_code=400, detail="User subtopic already exists")
    created = await create(db, user_subtopic_in)
    return created

@router.get("/user/{user_id}/subtopic/{subtopic_id}", response_model=UserSubtopicRead)
async def read_user_subtopic(
    user_id: int,
    subtopic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can only view their own user_subtopics, superusers can view any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this user subtopic")
    
    user_subtopic = await get_by_user_and_subtopic(db, user_id, subtopic_id)
    if not user_subtopic:
        raise HTTPException(status_code=404, detail="User subtopic not found")
    
    return user_subtopic

@router.get("/user/{user_id}", response_model=List[UserSubtopicRead])
async def list_user_subtopics(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can only view their own user_subtopics, superusers can view any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this user's subtopics")
    
    return await list_for_user(db, user_id=user_id, skip=skip, limit=limit)

@router.patch("/user/{user_id}/subtopic/{subtopic_id}", response_model=UserSubtopicRead)
async def update_user_subtopic(
    user_id: int,
    subtopic_id: int,
    user_subtopic_in: UserSubtopicUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can only update their own user_subtopics, superusers can update any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this user subtopic")
    
    user_subtopic = await get_by_user_and_subtopic(db, user_id, subtopic_id)
    if not user_subtopic:
        raise HTTPException(status_code=404, detail="User subtopic not found")
    
    updated = await update(db, user_subtopic, user_subtopic_in)
    return updated

@router.delete("/user/{user_id}/subtopic/{subtopic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_subtopic(
    user_id: int,
    subtopic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can only delete their own user_subtopics, superusers can delete any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this user subtopic")
    
    user_subtopic = await get_by_user_and_subtopic(db, user_id, subtopic_id)
    if not user_subtopic:
        raise HTTPException(status_code=404, detail="User subtopic not found")
    
    await delete(db, user_subtopic)
    return 

@router.post("/user/{user_id}/subtopic/{subtopic_id}/complete-lesson", response_model=UserSubtopicRead)
async def complete_lesson(
    user_id: int,
    subtopic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this user subtopic")
    user_subtopic = await get_by_user_and_subtopic(db, user_id, subtopic_id)
    if not user_subtopic:
        raise HTTPException(status_code=404, detail="User subtopic not found")
    user_subtopic.lessons_completed = True
    await db.commit()
    await db.refresh(user_subtopic)
    await update_user_subtopic_progress(db, user_id, subtopic_id)
    return user_subtopic

@router.post("/user/{user_id}/subtopic/{subtopic_id}/complete-practice", response_model=UserSubtopicRead)
async def complete_practice(
    user_id: int,
    subtopic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this user subtopic")
    user_subtopic = await get_by_user_and_subtopic(db, user_id, subtopic_id)
    if not user_subtopic:
        raise HTTPException(status_code=404, detail="User subtopic not found")
    user_subtopic.practice_completed = True
    await db.commit()
    await db.refresh(user_subtopic)
    await update_user_subtopic_progress(db, user_id, subtopic_id)
    return user_subtopic

@router.post("/user/{user_id}/subtopic/{subtopic_id}/complete-challenge", response_model=UserSubtopicRead)
async def complete_challenge(
    user_id: int,
    subtopic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this user subtopic")
    user_subtopic = await get_by_user_and_subtopic(db, user_id, subtopic_id)
    if not user_subtopic:
        raise HTTPException(status_code=404, detail="User subtopic not found")
    user_subtopic.challenges_completed = True
    await db.commit()
    await db.refresh(user_subtopic)
    await update_user_subtopic_progress(db, user_id, subtopic_id)
    return user_subtopic 