# app/api/post_assessments.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession 
from app.schemas.post_assessment import PostAssessmentRead, PostAssessmentCreate, PostAssessmentUpdate
from app.crud.post_assessment import get_by_id, list_for_user_topic, create, update, delete
from app.db.session import get_db

router = APIRouter()

@router.post("/", response_model=PostAssessmentRead, status_code=status.HTTP_201_CREATED)
async def create_post(post_in: PostAssessmentCreate, db: AsyncSession = Depends(get_db)):
    created = await create(db, post_in)
    return created

@router.get("/{post_id}", response_model=PostAssessmentRead)
async def read_post(post_id: int, db: AsyncSession = Depends(get_db)):
    post_obj = await get_by_id(db, post_id=post_id)
    if not post_obj:
        raise HTTPException(status_code=404, detail="PostAssessment not found")
    return post_obj

@router.get("/", response_model=List[PostAssessmentRead])
async def list_posts(
    user_id: Optional[int] = Query(None),
    topic_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    if user_id is None or topic_id is None:
        raise HTTPException(status_code=400, detail="Both user_id and topic_id query parameters are required")
    return await list_for_user_topic(db, user_id=user_id, topic_id=topic_id)

@router.patch("/{post_id}", response_model=PostAssessmentRead)
async def update_post(post_id: int, post_in: PostAssessmentUpdate, db: AsyncSession = Depends(get_db)):
    post_obj = await get_by_id(db, post_id=post_id)
    if not post_obj:
        raise HTTPException(status_code=404, detail="PostAssessment not found")
    updated = await update(db, post_obj, post_in)
    return updated

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(post_id: int, db: AsyncSession = Depends(get_db)):
    post_obj = await get_by_id(db, post_id=post_id)
    if not post_obj:
        raise HTTPException(status_code=404, detail="PostAssessment not found")
    await delete(db, post_obj)
    return
