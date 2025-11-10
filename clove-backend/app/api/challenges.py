# app/api/challenges.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession 
from app.schemas.challenge import ChallengeRead, ChallengeCreate, ChallengeUpdate
from app.crud.challenge import get_by_id, list_for_subtopic, create, update, delete, count_all, list_by_type_and_difficulty, get_available_types, get_challenges_by_difficulty
from app.db.session import get_db
from app.api.auth import get_current_superuser, get_current_user
from app.db.models.users import User

router = APIRouter(prefix="/challenges", tags=["Challenges"])

@router.post("/", response_model=ChallengeRead, status_code=status.HTTP_201_CREATED)
async def create_challenge(
    chal_in: ChallengeCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Create a new challenge. Requires superuser privileges."""
    created = await create(db, chal_in)
    return created

@router.get("/{challenge_id}", response_model=ChallengeRead)
async def read_challenge(
    challenge_id: int, 
    db: AsyncSession = Depends(get_db)
):
    """Get a specific challenge by ID. Public endpoint for reading."""
    chal_obj = await get_by_id(db, challenge_id=challenge_id)
    if not chal_obj:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return chal_obj

@router.get("/", response_model=List[ChallengeRead])
async def list_challenges(
    subtopic_id: Optional[int] = Query(None),
    type: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """List challenges with optional filtering. Public endpoint for reading."""
    # If type and difficulty are provided, filter by those
    if type and difficulty:
        return await list_by_type_and_difficulty(db, type=type, difficulty=difficulty, skip=skip, limit=limit)
    
    # If subtopic_id and difficulty are provided, filter by both
    if subtopic_id and difficulty:
        return await get_challenges_by_difficulty(db, subtopic_id=subtopic_id, difficulty=difficulty)
    
    # If only subtopic_id is provided, filter by subtopic
    if subtopic_id:
        return await list_for_subtopic(db, subtopic_id=subtopic_id, skip=skip, limit=limit)
    
    # If no filters provided, return error
    raise HTTPException(status_code=400, detail="Either subtopic_id or both type and difficulty query parameters are required")

@router.get("/types", response_model=List[str])
async def get_challenge_types(db: AsyncSession = Depends(get_db)):
    """Get all available challenge types. Public endpoint for reading."""
    return await get_available_types(db)

@router.patch("/{challenge_id}", response_model=ChallengeRead)
async def update_challenge(
    challenge_id: int, 
    chal_in: ChallengeUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Update a challenge. Requires superuser privileges."""
    chal_obj = await get_by_id(db, challenge_id=challenge_id)
    if not chal_obj:
        raise HTTPException(status_code=404, detail="Challenge not found")
    updated = await update(db, chal_obj, chal_in)
    return updated

@router.delete("/{challenge_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_challenge(
    challenge_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """Delete a challenge. Requires superuser privileges."""
    chal_obj = await get_by_id(db, challenge_id=challenge_id)
    if not chal_obj:
        raise HTTPException(status_code=404, detail="Challenge not found")
    await delete(db, chal_obj)
    return

@router.get("/count", response_model=int)
async def get_challenge_count(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get total challenge count. Requires authentication."""
    return await count_all(db)