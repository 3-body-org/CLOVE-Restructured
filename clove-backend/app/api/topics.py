# app/api/topics.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.topic import TopicRead, TopicCreate, TopicUpdate
from app.crud.topic import get_by_id, list_for_user, create, update, delete
from app.db.session import get_db

router = APIRouter()

@router.post("/", response_model=TopicRead, status_code=status.HTTP_201_CREATED)
async def create_topic(topic_in: TopicCreate, db: AsyncSession = Depends(get_db)):
    created = await create(db, topic_in)
    return created

@router.get("/{topic_id}", response_model=TopicRead)
async def read_topic(topic_id: int, db: AsyncSession = Depends(get_db)):
    topic_obj = await get_by_id(db, topic_id=topic_id)
    if not topic_obj:
        raise HTTPException(status_code=404, detail="Topic not found")
    return topic_obj

@router.get("/", response_model=List[TopicRead])
async def list_topics(
    user_id: Optional[int] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    if user_id is None:
        raise HTTPException(status_code=400, detail="user_id query parameter is required")
    return await list_for_user(db, user_id=user_id, skip=skip, limit=limit)

@router.patch("/{topic_id}", response_model=TopicRead)
async def update_topic(topic_id: int, topic_in: TopicUpdate, db: AsyncSession = Depends(get_db)):
    topic_obj = await get_by_id(db, topic_id=topic_id)
    if not topic_obj:
        raise HTTPException(status_code=404, detail="Topic not found")
    updated = await update(db, topic_obj, topic_in)
    return updated

@router.delete("/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_topic(topic_id: int, db: AsyncSession = Depends(get_db)):
    topic_obj = await get_by_id(db, topic_id=topic_id)
    if not topic_obj:
        raise HTTPException(status_code=404, detail="Topic not found")
    await delete(db, topic_obj)
    return
