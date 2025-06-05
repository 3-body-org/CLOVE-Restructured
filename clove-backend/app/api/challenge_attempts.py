# app/api/challenge_attempts.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.challenge_attempt import (
    ChallengeAttemptCreate,
    ChallengeAttemptRead,
    ChallengeAttemptUpdate
)
from app.crud.challenge_attempt import (
    create,
    get_by_id,
    list_for_user,
    list_for_subtopic,
    update,
    delete
)
from app.schemas.challenge import ChallengeRead, ChallengeUpdate
from app.db.session import get_db
from app.services.selection import select_challenge
from app.crud.subtopic import get_by_id as get_subtopic_by_id
from app.crud.challenge import get_by_id as get_challenge_by_id, update as update_challenge

router = APIRouter()

@router.post("/", response_model=ChallengeAttemptRead)
async def create_attempt(
    attempt_in: ChallengeAttemptCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new challenge attempt"""
    # Get the challenge
    challenge = await get_challenge_by_id(db, attempt_in.challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    # Create the attempt
    created = await create(db, attempt_in)
    
    # Update challenge is_solved status while preserving other fields
    challenge_update = ChallengeUpdate(
        is_solved=True,
        snippet_expectedoutput_choices=challenge.snippet_expectedoutput_choices,
        hints=challenge.hints,
        timer=challenge.timer,
        points=challenge.points
    )
    await update_challenge(db, challenge, challenge_update)
    
    return created

@router.get("/{attempt_id}", response_model=ChallengeAttemptRead)
async def get_attempt(
    attempt_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a challenge attempt by ID"""
    attempt = await get_by_id(db, attempt_id)
    if not attempt:
        raise HTTPException(status_code=404, detail="Challenge attempt not found")
    return attempt

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

@router.put("/{attempt_id}", response_model=ChallengeAttemptRead)
async def update_attempt(
    attempt_id: int,
    attempt_in: ChallengeAttemptUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a challenge attempt"""
    attempt = await get_by_id(db, attempt_id)
    if not attempt:
        raise HTTPException(status_code=404, detail="Challenge attempt not found")
    return await update(db, attempt, attempt_in)

@router.delete("/{attempt_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attempt(attempt_id: int, db: AsyncSession = Depends(get_db)):
    att_obj = await get_by_id(db, attempt_id=attempt_id)
    if not att_obj:
        raise HTTPException(status_code=404, detail="ChallengeAttempt not found")
    await delete(db, att_obj)
    return

@router.get("/select-challenge/", response_model=ChallengeRead)
async def get_next_challenge(
    user_id: int,
    subtopic_id: int,
    db: AsyncSession = Depends(get_db)
):
    print("DEBUG: /select-challenge/ route called")
    subtopic = await get_subtopic_by_id(db, subtopic_id)
    if not subtopic:
        raise HTTPException(status_code=404, detail="Subtopic not found")
    try:
        challenge = await select_challenge(
            db=db,
            user_id=user_id,
            subtopic_id=subtopic_id,
            knowledge=subtopic.knowledge_level,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return challenge
