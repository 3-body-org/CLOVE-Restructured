# app/api/user_topics.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.user_topic import UserTopicRead, UserTopicCreate, UserTopicUpdate
from app.crud.user_topic import get_by_id, get_by_user_and_topic, list_for_user, create, update, delete
from app.db.session import get_db
from app.api.auth import get_current_user, get_current_superuser
from app.db.models.users import User

router = APIRouter(prefix="/user_topics", tags=["UserTopics"])

@router.post("/", response_model=UserTopicRead, status_code=status.HTTP_201_CREATED)
async def create_user_topic(
    user_topic_in: UserTopicCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user_topic already exists
    existing = await get_by_user_and_topic(db, user_topic_in.user_id, user_topic_in.topic_id)
    if existing:
        raise HTTPException(status_code=400, detail="User topic already exists")
    created = await create(db, user_topic_in)
    return created

@router.get("/user/{user_id}/topic/{topic_id}", response_model=UserTopicRead)
async def read_user_topic(
    user_id: int,
    topic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can only view their own user_topics, superusers can view any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this user topic")
    
    user_topic = await get_by_user_and_topic(db, user_id, topic_id)
    if not user_topic:
        raise HTTPException(status_code=404, detail="User topic not found")
    
    return user_topic

@router.get("/user/{user_id}", response_model=List[UserTopicRead])
async def list_user_topics(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can only view their own user_topics, superusers can view any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this user's topics")
    
    return await list_for_user(db, user_id=user_id, skip=skip, limit=limit)

@router.patch("/user/{user_id}/topic/{topic_id}", response_model=UserTopicRead)
async def update_user_topic(
    user_id: int,
    topic_id: int,
    user_topic_in: UserTopicUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can only update their own user_topics, superusers can update any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this user topic")
    
    user_topic = await get_by_user_and_topic(db, user_id, topic_id)
    if not user_topic:
        raise HTTPException(status_code=404, detail="User topic not found")
    
    updated = await update(db, user_topic, user_topic_in)
    return updated

@router.delete("/user/{user_id}/topic/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_topic(
    user_id: int,
    topic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can only delete their own user_topics, superusers can delete any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this user topic")
    
    user_topic = await get_by_user_and_topic(db, user_id, topic_id)
    if not user_topic:
        raise HTTPException(status_code=404, detail="User topic not found")
    
    await delete(db, user_topic)
    return 
