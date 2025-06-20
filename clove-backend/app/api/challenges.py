# app/api/challenges.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession 
from app.schemas.challenge import ChallengeRead, ChallengeCreate, ChallengeUpdate
from app.crud.challenge import get_by_id, list_for_subtopic, create, update, delete, count_all
from app.db.session import get_db

router = APIRouter(prefix="/challenges", tags=["Challenges"])

@router.post("/", response_model=ChallengeRead, status_code=status.HTTP_201_CREATED)
async def create_challenge(chal_in: ChallengeCreate, db: AsyncSession = Depends(get_db)):
    created = await create(db, chal_in)
    return created

@router.get("/{challenge_id}", response_model=ChallengeRead)
async def read_challenge(challenge_id: int, db: AsyncSession = Depends(get_db)):
    chal_obj = await get_by_id(db, challenge_id=challenge_id)
    if not chal_obj:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return chal_obj

@router.get("/", response_model=List[ChallengeRead])
async def list_challenges(
    subtopic_id: Optional[int] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    if subtopic_id is None:
        raise HTTPException(status_code=400, detail="subtopic_id query parameter is required")
    return await list_for_subtopic(db, subtopic_id=subtopic_id, skip=skip, limit=limit)

@router.patch("/{challenge_id}", response_model=ChallengeRead)
async def update_challenge(challenge_id: int, chal_in: ChallengeUpdate, db: AsyncSession = Depends(get_db)):
    chal_obj = await get_by_id(db, challenge_id=challenge_id)
    if not chal_obj:
        raise HTTPException(status_code=404, detail="Challenge not found")
    updated = await update(db, chal_obj, chal_in)
    return updated

@router.delete("/{challenge_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_challenge(challenge_id: int, db: AsyncSession = Depends(get_db)):
    chal_obj = await get_by_id(db, challenge_id=challenge_id)
    if not chal_obj:
        raise HTTPException(status_code=404, detail="Challenge not found")
    await delete(db, chal_obj)
    return

@router.get("/count", response_model=int)
async def get_challenge_count(db: AsyncSession = Depends(get_db)):
    return await count_all(db)