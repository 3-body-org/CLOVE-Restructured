from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.q_value import QValueRead, QValueCreate, QValueUpdate
from app.crud.q_value import (
    get_q_table,
    create_q_table,
    update_q_table,
    delete
)
from app.db.session import get_db
from app.api.auth import get_current_user

router = APIRouter(prefix="/q_values", tags=["QValues"], dependencies=[Depends(get_current_user)])

def tuple_keys_to_str_for_api(q_table):
    return {str(k): v for k, v in q_table.items()}

@router.post("/", response_model=QValueRead, status_code=status.HTTP_201_CREATED)
async def create_q_table_route(
    qv_in: QValueCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new Q-table for a user-subtopic pair"""
    created = await create_q_table(db, qv_in.user_subtopic_id)
    if created and created.q_table:
        created.q_table = tuple_keys_to_str_for_api(created.q_table)
    return created

@router.get("/user-subtopic/{user_subtopic_id}", response_model=QValueRead)
async def read_q_table_by_user_subtopic(
    user_subtopic_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a Q-table by user_subtopic_id"""
    qv_obj = await get_q_table(db, user_subtopic_id)
    if not qv_obj:
        raise HTTPException(status_code=404, detail="Q-table not found")
    if qv_obj and qv_obj.q_table:
        qv_obj.q_table = tuple_keys_to_str_for_api(qv_obj.q_table)
    return qv_obj

@router.patch("/user-subtopic/{user_subtopic_id}", response_model=QValueRead)
async def update_q_table_route(
    user_subtopic_id: int,
    qv_in: QValueUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a Q-table with new values and epsilon"""
    qv_obj = await get_q_table(db, user_subtopic_id)
    if not qv_obj:
        raise HTTPException(status_code=404, detail="Q-table not found")
    await update_q_table(db, qv_obj, qv_in.q_table, qv_in.epsilon)
    if qv_obj and qv_obj.q_table:
        qv_obj.q_table = tuple_keys_to_str_for_api(qv_obj.q_table)
    return qv_obj

@router.delete("/user-subtopic/{user_subtopic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_q_table_route(
    user_subtopic_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete a Q-table"""
    qv_obj = await get_q_table(db, user_subtopic_id)
    if not qv_obj:
        raise HTTPException(status_code=404, detail="Q-table not found")
    await delete(db, qv_obj)
    return
