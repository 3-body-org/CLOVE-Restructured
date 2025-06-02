from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.q_value import QValueRead, QValueCreate, QValueUpdate
from app.crud.q_value import (
    get_by_qid,
    get_qvalue,
    create_qvalue,
    update_qvalue,
    delete_qvalue
)
from app.db.session import get_db

router = APIRouter()

@router.post("/", response_model=QValueRead, status_code=status.HTTP_201_CREATED)
async def create_q_value(
    qv_in: QValueCreate,
    db: AsyncSession = Depends(get_db)
):
    created = await create_qvalue(
        db,
        qv_in.user_id,
        qv_in.subtopic_id,
        qv_in.mastery,
        qv_in.timer_active,
        qv_in.hint_active,
        qv_in.action
    )
    return created

@router.get("/{qv_id}", response_model=QValueRead)
async def read_q_value(
    qv_id: int,
    db: AsyncSession = Depends(get_db)
):
    qv_obj = await get_by_qid(db, qv_id=qv_id)
    if not qv_obj:
        raise HTTPException(status_code=404, detail="QValue not found")
    return qv_obj

@router.get("/", response_model=List[QValueRead])
async def list_q_values(
    user_id: Optional[int] = Query(None),
    subtopic_id: Optional[int] = Query(None),
    mastery: Optional[int] = Query(None),
    timer_active: Optional[int] = Query(None),
    hint_active: Optional[int] = Query(None),
    action: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    if not all([user_id, subtopic_id, mastery, timer_active, hint_active, action]):
        raise HTTPException(
            status_code=400,
            detail="All state parameters (user_id, subtopic_id, mastery, timer_active, hint_active, action) are required"
        )
    qv_obj = await get_qvalue(
        db,
        user_id,
        subtopic_id,
        mastery,
        timer_active,
        hint_active,
        action
    )
    if not qv_obj:
        raise HTTPException(status_code=404, detail="QValue not found for provided state")
    return [qv_obj]

@router.patch("/{qv_id}", response_model=QValueRead)
async def update_q_value_route(
    qv_id: int,
    qv_in: QValueUpdate,
    db: AsyncSession = Depends(get_db)
):
    qv_obj = await get_by_qid(db, qv_id=qv_id)
    if not qv_obj:
        raise HTTPException(status_code=404, detail="QValue not found")
    await update_qvalue(db, qv_obj, qv_in.q_value)
    return qv_obj

@router.delete("/{qv_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_q_value_route(
    qv_id: int,
    db: AsyncSession = Depends(get_db)
):
    qv_obj = await get_by_qid(db, qv_id=qv_id)
    if not qv_obj:
        raise HTTPException(status_code=404, detail="QValue not found")
    await delete_qvalue(db, qv_obj)
    return
