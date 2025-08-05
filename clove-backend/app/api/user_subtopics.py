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

@router.get("/user/{user_id}/subtopic/{subtopic_id}")
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
    
    # Return a simple dict to avoid relationship serialization issues
    return {
        "id": user_subtopic.id,
        "user_id": user_subtopic.user_id,
        "subtopic_id": user_subtopic.subtopic_id,
        "lessons_completed": user_subtopic.lessons_completed,
        "practice_completed": user_subtopic.practice_completed,
        "challenges_completed": user_subtopic.challenges_completed,
        "is_unlocked": user_subtopic.is_unlocked,
        "is_completed": user_subtopic.is_completed,
        "progress_percent": user_subtopic.progress_percent,
        "knowledge_level": user_subtopic.knowledge_level,
        "unlocked_at": user_subtopic.unlocked_at,
        "completed_at": user_subtopic.completed_at
    }

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

@router.post("/user/{user_id}/subtopic/{subtopic_id}/complete-lesson")
async def complete_lesson(
    user_id: int,
    subtopic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        if not current_user.is_superuser and user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this user subtopic")
        
        user_subtopic = await get_by_user_and_subtopic(db, user_id, subtopic_id)
        if not user_subtopic:
            raise HTTPException(status_code=404, detail="User subtopic not found")
        
        user_subtopic.lessons_completed = True
        await db.commit()
        await db.refresh(user_subtopic)
        
        # Update progress
        await update_user_subtopic_progress(db, user_id, subtopic_id)
        await db.refresh(user_subtopic)
        
        return {
            "id": user_subtopic.id,
            "user_id": user_subtopic.user_id,
            "subtopic_id": user_subtopic.subtopic_id,
            "lessons_completed": user_subtopic.lessons_completed,
            "practice_completed": user_subtopic.practice_completed,
            "challenges_completed": user_subtopic.challenges_completed,
            "is_unlocked": user_subtopic.is_unlocked,
            "is_completed": user_subtopic.is_completed,
            "progress_percent": user_subtopic.progress_percent,
            "knowledge_level": user_subtopic.knowledge_level,
            "unlocked_at": user_subtopic.unlocked_at,
            "completed_at": user_subtopic.completed_at
        }
        
    except Exception as e:
        print(f"Error in complete_lesson: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/user/{user_id}/subtopic/{subtopic_id}/complete-practice")
async def complete_practice(
    user_id: int,
    subtopic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        if not current_user.is_superuser and user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this user subtopic")
        
        user_subtopic = await get_by_user_and_subtopic(db, user_id, subtopic_id)
        if not user_subtopic:
            raise HTTPException(status_code=404, detail="User subtopic not found")
        
        # Use the proper update function instead of direct modification
        user_subtopic.practice_completed = True
        await db.commit()
        await db.refresh(user_subtopic)
        
        # Update progress
        await update_user_subtopic_progress(db, user_id, subtopic_id)
        await db.refresh(user_subtopic)
        
        return {
            "id": user_subtopic.id,
            "user_id": user_subtopic.user_id,
            "subtopic_id": user_subtopic.subtopic_id,
            "lessons_completed": user_subtopic.lessons_completed,
            "practice_completed": user_subtopic.practice_completed,
            "challenges_completed": user_subtopic.challenges_completed,
            "is_unlocked": user_subtopic.is_unlocked,
            "is_completed": user_subtopic.is_completed,
            "progress_percent": user_subtopic.progress_percent,
            "knowledge_level": user_subtopic.knowledge_level,
            "unlocked_at": user_subtopic.unlocked_at,
            "completed_at": user_subtopic.completed_at
        }
        
    except Exception as e:
        print(f"Error in complete_practice: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/user/{user_id}/subtopic/{subtopic_id}/complete-challenge")
async def complete_challenge(
    user_id: int,
    subtopic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        if not current_user.is_superuser and user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this user subtopic")
        
        user_subtopic = await get_by_user_and_subtopic(db, user_id, subtopic_id)
        if not user_subtopic:
            raise HTTPException(status_code=404, detail="User subtopic not found")
        
        user_subtopic.challenges_completed = True
        await db.commit()
        await db.refresh(user_subtopic)
        
        await update_user_subtopic_progress(db, user_id, subtopic_id)
        
        # Final refresh to ensure the object is in a valid state
        await db.refresh(user_subtopic)
        
        return {
            "id": user_subtopic.id,
            "user_id": user_subtopic.user_id,
            "subtopic_id": user_subtopic.subtopic_id,
            "lessons_completed": user_subtopic.lessons_completed,
            "practice_completed": user_subtopic.practice_completed,
            "challenges_completed": user_subtopic.challenges_completed,
            "is_unlocked": user_subtopic.is_unlocked,
            "is_completed": user_subtopic.is_completed,
            "progress_percent": user_subtopic.progress_percent,
            "knowledge_level": user_subtopic.knowledge_level,
            "unlocked_at": user_subtopic.unlocked_at,
            "completed_at": user_subtopic.completed_at
        }
        
    except Exception as e:
        print(f"Error in complete_challenge: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}") 