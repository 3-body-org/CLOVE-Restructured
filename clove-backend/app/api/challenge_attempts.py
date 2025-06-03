# app/api/challenge_attempts.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.challenge_attempt import (
    ChallengeAttemptCreate,
    ChallengeAttemptRead,
    ChallengeAttemptUpdate,
)
from app.crud.challenge_attempt import (
    create,
    get_by_id,
    list_for_user,
    list_for_subtopic,
    update,
    delete
)
from app.db.session import get_db

router = APIRouter()

@router.post("/", response_model=ChallengeAttemptRead, status_code=status.HTTP_201_CREATED)
async def create_attempt(attempt_in: ChallengeAttemptCreate, db: AsyncSession = Depends(get_db)):
    created = await create(db, attempt_in)
    return created

@router.get("/{attempt_id}", response_model=ChallengeAttemptRead)
async def read_attempt(attempt_id: int, db: AsyncSession = Depends(get_db)):
    att_obj = await get_by_id(db, attempt_id=attempt_id)
    if not att_obj:
        raise HTTPException(status_code=404, detail="ChallengeAttempt not found")
    return att_obj

@router.get("/", response_model=List[ChallengeAttemptRead])
async def list_attempts(
    user_id: Optional[int] = Query(None),
    subtopic_id: Optional[int] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    if user_id is not None:
        return await list_for_user(db, user_id=user_id)
    if subtopic_id is not None:
        return await list_for_subtopic(db, subtopic_id=subtopic_id)
    raise HTTPException(status_code=400, detail="Either user_id or subtopic_id query parameter is required")

@router.patch("/{attempt_id}", response_model=ChallengeAttemptRead)
async def update_attempt(attempt_id: int, attempt_in: ChallengeAttemptUpdate, db: AsyncSession = Depends(get_db)):
    att_obj = await get_by_id(db, attempt_id=attempt_id)
    if not att_obj:
        raise HTTPException(status_code=404, detail="ChallengeAttempt not found")
    updated = await update(db, att_obj, attempt_in)
    return updated

@router.delete("/{attempt_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attempt(attempt_id: int, db: AsyncSession = Depends(get_db)):
    att_obj = await get_by_id(db, attempt_id=attempt_id)
    if not att_obj:
        raise HTTPException(status_code=404, detail="ChallengeAttempt not found")
    await delete(db, att_obj)
    return
