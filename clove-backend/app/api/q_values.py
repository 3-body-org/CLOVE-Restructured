from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.q_value import QValueRead, QValueCreate, QValueUpdate
from app.crud.q_value import (
    get_q_table,
    create_q_table,
    update_q_table,
    delete,
    list_for_user,
    get_by_user_and_subtopic
)
from app.db.session import get_db
from app.api.auth import get_current_user, get_current_superuser
from app.db.models.users import User

router = APIRouter(prefix="/q_values", tags=["QValues"])

def tuple_keys_to_str_for_api(q_table):
    return {str(k): v for k, v in q_table.items()}

@router.get("/me", response_model=List[QValueRead])
async def get_my_q_values(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's Q-learning values"""
    q_values = await list_for_user(db, user_id=current_user.id, skip=skip, limit=limit)
    # Convert tuple keys to strings for API response
    for qv in q_values:
        if qv.q_table:
            qv.q_table = tuple_keys_to_str_for_api(qv.q_table)
    return q_values

@router.post("/", response_model=QValueRead, status_code=status.HTTP_201_CREATED)
async def create_q_table_route(
    qv_in: QValueCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new Q-table for a user-subtopic pair"""
    created = await create_q_table(db, qv_in.user_subtopic_id)
    if created and created.q_table:
        created.q_table = tuple_keys_to_str_for_api(created.q_table)
    return created

@router.get("/user/{user_id}/subtopic/{subtopic_id}", response_model=QValueRead)
async def read_q_table_by_user_subtopic(
    user_id: int,
    subtopic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a Q-table by user_id and subtopic_id"""
    # Users can only view their own Q-values, superusers can view any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this Q-table")
    
    qv_obj = await get_by_user_and_subtopic(db, user_id, subtopic_id)
    if not qv_obj:
        raise HTTPException(status_code=404, detail="Q-table not found")
    
    if qv_obj and qv_obj.q_table:
        qv_obj.q_table = tuple_keys_to_str_for_api(qv_obj.q_table)
    return qv_obj

@router.patch("/user/{user_id}/subtopic/{subtopic_id}", response_model=QValueRead)
async def update_q_table_route(
    user_id: int,
    subtopic_id: int,
    qv_in: QValueUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a Q-table with new values and epsilon"""
    # Users can only update their own Q-values, superusers can update any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this Q-table")
    
    qv_obj = await get_by_user_and_subtopic(db, user_id, subtopic_id)
    if not qv_obj:
        raise HTTPException(status_code=404, detail="Q-table not found")
    
    await update_q_table(db, qv_obj, qv_in.q_table, qv_in.epsilon)
    if qv_obj and qv_obj.q_table:
        qv_obj.q_table = tuple_keys_to_str_for_api(qv_obj.q_table)
    return qv_obj

@router.delete("/user/{user_id}/subtopic/{subtopic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_q_table_route(
    user_id: int,
    subtopic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a Q-table"""
    # Users can only delete their own Q-values, superusers can delete any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this Q-table")
    
    qv_obj = await get_by_user_and_subtopic(db, user_id, subtopic_id)
    if not qv_obj:
        raise HTTPException(status_code=404, detail="Q-table not found")
    
    await delete(db, qv_obj)
    return
