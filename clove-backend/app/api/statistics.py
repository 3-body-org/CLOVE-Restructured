# app/api/statistics.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.statistic import StatisticRead, StatisticCreate, StatisticUpdate
from app.crud.statistic import get_by_id, list_for_user, create, update, delete
from app.db.session import get_db

router = APIRouter()

@router.post("/", response_model=StatisticRead, status_code=status.HTTP_201_CREATED)
async def create_statistic(stat_in: StatisticCreate, db: AsyncSession = Depends(get_db)):
    created = await create(db, stat_in)
    return created

@router.get("/{stat_id}", response_model=StatisticRead)
async def read_statistic(stat_id: int, db: AsyncSession = Depends(get_db)):
    stat_obj = await get_by_id(db, stat_id=stat_id)
    if not stat_obj:
        raise HTTPException(status_code=404, detail="Statistic not found")
    return stat_obj

@router.get("/", response_model=List[StatisticRead])
async def list_statistics(user_id: Optional[int] = Query(None), db: AsyncSession = Depends(get_db)):
    if user_id is None:
        raise HTTPException(status_code=400, detail="user_id query parameter is required")
    return await list_for_user(db, user_id=user_id)

@router.patch("/{stat_id}", response_model=StatisticRead)
async def update_statistic(stat_id: int, stat_in: StatisticUpdate, db: AsyncSession = Depends(get_db)):
    stat_obj = await get_by_id(db, stat_id=stat_id)
    if not stat_obj:
        raise HTTPException(status_code=404, detail="Statistic not found")
    updated = await update(db, stat_obj, stat_in)
    return updated

@router.delete("/{stat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_statistic(stat_id: int, db: AsyncSession = Depends(get_db)):
    stat_obj = await get_by_id(db, stat_id=stat_id)
    if not stat_obj:
        raise HTTPException(status_code=404, detail="Statistic not found")
    await delete(db, stat_obj)
    return
