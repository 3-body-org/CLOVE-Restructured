# app/api/subtopics.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.subtopic import SubtopicRead, SubtopicCreate, SubtopicUpdate
from app.crud.subtopic import get_by_id, list_for_topic, list_for_user, create, update, delete
from app.db.session import get_db
from app.api.auth import get_current_superuser
from app.db.models.users import User

router = APIRouter(prefix="/subtopics", tags=["Subtopics"])

@router.post("/", response_model=SubtopicRead, status_code=status.HTTP_201_CREATED)
async def create_subtopic(
    subtopic_in: SubtopicCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Create a new subtopic. Requires superuser privileges."""
    created = await create(db, subtopic_in)
    return created

@router.get("/{subtopic_id}", response_model=SubtopicRead)
async def read_subtopic(
    subtopic_id: int, 
    db: AsyncSession = Depends(get_db)
):
    """Get a specific subtopic by ID. Public endpoint for reading."""
    sub_obj = await get_by_id(db, subtopic_id=subtopic_id)
    if not sub_obj:
        raise HTTPException(status_code=404, detail="Subtopic not found")
    return sub_obj

@router.get("/", response_model=List[SubtopicRead])
async def list_subtopics(
    topic_id: Optional[int] = Query(None),
    user_id: Optional[int] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """List subtopics. Public endpoint for reading."""
    if topic_id is not None:
        return await list_for_topic(db, topic_id=topic_id, skip=skip, limit=limit)
    if user_id is not None:
        return await list_for_user(db, user_id=user_id, skip=skip, limit=limit)
    raise HTTPException(status_code=400, detail="Either topic_id or user_id query parameter is required")

@router.patch("/{subtopic_id}", response_model=SubtopicRead)
async def update_subtopic(
    subtopic_id: int, 
    subtopic_in: SubtopicUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Update a subtopic. Requires superuser privileges."""
    sub_obj = await get_by_id(db, subtopic_id=subtopic_id)
    if not sub_obj:
        raise HTTPException(status_code=404, detail="Subtopic not found")
    updated = await update(db, sub_obj, subtopic_in)
    return updated

@router.delete("/{subtopic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subtopic(
    subtopic_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Delete a subtopic. Requires superuser privileges."""
    sub_obj = await get_by_id(db, subtopic_id=subtopic_id)
    if not sub_obj:
        raise HTTPException(status_code=404, detail="Subtopic not found")
    await delete(db, sub_obj)
    return
