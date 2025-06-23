# app/api/topics.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.topic import TopicRead, TopicCreate, TopicUpdate
from app.crud.topic import get_by_id, list_all, create, update, delete
from app.db.session import get_db
from app.api.auth import get_current_superuser
from app.db.models.users import User

router = APIRouter(prefix="/topics", tags=["Topics"])

@router.get("/", response_model=List[TopicRead])
async def list_topics(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """Get all topics. Public endpoint for reading."""
    return await list_all(db, skip=skip, limit=limit)

@router.get("/{topic_id}", response_model=TopicRead)
async def read_topic(
    topic_id: int, 
    db: AsyncSession = Depends(get_db)
):
    """Get a specific topic by ID. Public endpoint for reading."""
    topic_obj = await get_by_id(db, topic_id=topic_id)
    if not topic_obj:
        raise HTTPException(status_code=404, detail="Topic not found")
    return topic_obj

@router.post("/", response_model=TopicRead, status_code=status.HTTP_201_CREATED)
async def create_topic(
    topic_in: TopicCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Create a new topic. Requires superuser privileges."""
    created = await create(db, topic_in)
    return created

@router.patch("/{topic_id}", response_model=TopicRead)
async def update_topic(
    topic_id: int, 
    topic_in: TopicUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Update a topic. Requires superuser privileges."""
    topic_obj = await get_by_id(db, topic_id=topic_id)
    if not topic_obj:
        raise HTTPException(status_code=404, detail="Topic not found")
    updated = await update(db, topic_obj, topic_in)
    return updated

@router.delete("/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_topic(
    topic_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Delete a topic. Requires superuser privileges."""
    topic_obj = await get_by_id(db, topic_id=topic_id)
    if not topic_obj:
        raise HTTPException(status_code=404, detail="Topic not found")
    await delete(db, topic_obj)
    return
