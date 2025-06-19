# app/api/user_subtopics.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.user_subtopic import UserSubtopicRead, UserSubtopicCreate, UserSubtopicUpdate
from app.crud.user_subtopic import (
    get_by_id, get_by_user_and_subtopic, list_for_user,
    list_for_user_topic, create, update, delete
)
from app.db.session import get_db
from app.api.auth import get_current_user

router = APIRouter(prefix="/user_subtopics", tags=["UserSubtopics"], dependencies=[Depends(get_current_user)])

@router.post("/", response_model=UserSubtopicRead, status_code=status.HTTP_201_CREATED)
async def create_user_subtopic(user_subtopic_in: UserSubtopicCreate, db: AsyncSession = Depends(get_db)):
    # Check if user_subtopic already exists
    existing = await get_by_user_and_subtopic(db, user_subtopic_in.user_id, user_subtopic_in.subtopic_id)
    if existing:
        raise HTTPException(status_code=400, detail="User subtopic already exists")
    created = await create(db, user_subtopic_in)
    return created

@router.get("/{user_subtopic_id}", response_model=UserSubtopicRead)
async def read_user_subtopic(user_subtopic_id: int, db: AsyncSession = Depends(get_db)):
    user_subtopic = await get_by_id(db, user_subtopic_id=user_subtopic_id)
    if not user_subtopic:
        raise HTTPException(status_code=404, detail="User subtopic not found")
    return user_subtopic

@router.get("/user/{user_id}", response_model=List[UserSubtopicRead])
async def list_user_subtopics(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    return await list_for_user(db, user_id=user_id, skip=skip, limit=limit)

@router.get("/user-topic/{user_topic_id}", response_model=List[UserSubtopicRead])
async def list_user_subtopics_for_topic(
    user_topic_id: int,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    return await list_for_user_topic(db, user_topic_id=user_topic_id, skip=skip, limit=limit)

@router.patch("/{user_subtopic_id}", response_model=UserSubtopicRead)
async def update_user_subtopic(
    user_subtopic_id: int,
    user_subtopic_in: UserSubtopicUpdate,
    db: AsyncSession = Depends(get_db)
):
    user_subtopic = await get_by_id(db, user_subtopic_id=user_subtopic_id)
    if not user_subtopic:
        raise HTTPException(status_code=404, detail="User subtopic not found")
    updated = await update(db, user_subtopic, user_subtopic_in)
    return updated

@router.delete("/{user_subtopic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_subtopic(user_subtopic_id: int, db: AsyncSession = Depends(get_db)):
    user_subtopic = await get_by_id(db, user_subtopic_id=user_subtopic_id)
    if not user_subtopic:
        raise HTTPException(status_code=404, detail="User subtopic not found")
    await delete(db, user_subtopic)
    return 