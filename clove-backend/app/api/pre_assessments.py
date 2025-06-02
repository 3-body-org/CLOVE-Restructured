# app/api/pre_assessments.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession 
from app.schemas.pre_assessment import PreAssessmentRead, PreAssessmentCreate, PreAssessmentUpdate
from app.crud.pre_assessment import get_by_id, list_for_user_topic, create, update, delete
from app.db.session import get_db

router = APIRouter()

@router.post("/", response_model=PreAssessmentRead, status_code=status.HTTP_201_CREATED)
async def create_pre(pre_in: PreAssessmentCreate, db: AsyncSession = Depends(get_db)):
    created = await create(db, pre_in)
    return created

@router.get("/{pre_id}", response_model=PreAssessmentRead)
async def read_pre(pre_id: int, db: AsyncSession = Depends(get_db)):
    pre_obj = await get_by_id(db, pre_id=pre_id)
    if not pre_obj:
        raise HTTPException(status_code=404, detail="PreAssessment not found")
    return pre_obj

@router.get("/", response_model=List[PreAssessmentRead])
async def list_pres(
    user_id: Optional[int] = Query(None),
    topic_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    if user_id is None or topic_id is None:
        raise HTTPException(status_code=400, detail="Both user_id and topic_id query parameters are required")
    return await list_for_user_topic(db, user_id=user_id, topic_id=topic_id)

@router.patch("/{pre_id}", response_model=PreAssessmentRead)
async def update_pre(pre_id: int, pre_in: PreAssessmentUpdate, db: AsyncSession = Depends(get_db)):
    pre_obj = await get_by_id(db, pre_id=pre_id)
    if not pre_obj:
        raise HTTPException(status_code=404, detail="PreAssessment not found")
    updated = await update(db, pre_obj, pre_in)
    return updated

@router.delete("/{pre_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pre(pre_id: int, db: AsyncSession = Depends(get_db)):
    pre_obj = await get_by_id(db, pre_id=pre_id)
    if not pre_obj:
        raise HTTPException(status_code=404, detail="PreAssessment not found")
    await delete(db, pre_obj)
    return
