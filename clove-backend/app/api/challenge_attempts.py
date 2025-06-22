# app/api/challenge_attempts.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.schemas.challenge_attempt import (
    ChallengeAttemptCreate,
    ChallengeAttemptRead,
)
from app.schemas.challenge import ChallengeRead
from app.schemas.user_challenge import UserChallengeRead
from app.crud.challenge_attempt import create, get_by_user_id
from app.crud.user_subtopic import get_by_user_and_subtopic as get_user_subtopic_by_user_and_subtopic
from app.crud.user_challenge import (
    upsert as upsert_user_challenge,
    get_by_id as get_user_challenge_by_id,
    get_by_user_and_challenge
)
from app.services.selection import select_challenge
from app.db.session import get_db
from app.crud.challenge_attempt import delete_last_take_if_full
from app.api.auth import get_current_user, get_current_superuser
from app.db.models.users import User

router = APIRouter(prefix="/challenge_attempts", tags=["ChallengeAttempts"])

# Create a response model that includes both challenge and user_challenge_id
class ChallengeSelectionResponse(BaseModel):
    challenge: ChallengeRead
    user_challenge_id: int

@router.get("/me", response_model=List[ChallengeAttemptRead])
async def get_my_challenge_attempts(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's challenge attempts"""
    return await get_by_user_id(db, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/select-challenge/user/{user_id}/subtopic/{subtopic_id}", response_model=ChallengeSelectionResponse)
async def get_next_challenge(
    user_id: int,
    subtopic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can only select challenges for themselves
    if user_id != current_user.id:
        raise HTTPException(403, "Not authorized to select challenges for this user")

    # Get user_subtopic by user_id and subtopic_id
    user_subtopic = await get_user_subtopic_by_user_and_subtopic(db, user_id, subtopic_id)
    if not user_subtopic:
        raise HTTPException(404, "User subtopic not found")

    # ❗️Delete all 5 attempts if we've just completed a take
    await delete_last_take_if_full(
        db,
        user_id=user_id,
        subtopic_id=subtopic_id,
        take_size=5
    )
        
    try:
        # Get the selected challenge
        challenge = await select_challenge(
            db=db,
            user_subtopic_id=user_subtopic.id,
            knowledge=user_subtopic.knowledge_level
        )

        # Check if there's an existing cancelled user_challenge for this challenge
        existing_uc = await get_by_user_and_challenge(
            db,
            user_id=user_id,
            challenge_id=challenge.id
        )

        if existing_uc and existing_uc.status == "cancelled":
            # Reuse the cancelled user_challenge
            user_challenge = existing_uc
        else:
            # Create a new user_challenge only if no cancelled one exists
            user_challenge = await upsert_user_challenge(
                db,
                user_id=user_id,
                challenge_id=challenge.id,
                is_solved=False,
                status="pending"
            )

        return {
            "challenge": challenge,
            "user_challenge_id": user_challenge.id
        }
    except Exception as e:
        raise HTTPException(500, str(e))

@router.post("/", response_model=ChallengeAttemptRead, status_code=status.HTTP_201_CREATED)
async def create_attempt(
    attempt_in: ChallengeAttemptCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Validate FK: user_challenge
    user_challenge = await get_user_challenge_by_id(db, attempt_in.user_challenge_id)
    if not user_challenge:
        raise HTTPException(404, "User challenge not found")

    # Users can only create attempts for their own user_challenges
    if user_challenge.user_id != current_user.id:
        raise HTTPException(403, "Not authorized to create attempts for this user challenge")

    # 2. Insert the raw attempt record
    attempt = await create(db, attempt_in)

    # 3. Upsert user_challenges (persist last attempt & solved flag)
    await upsert_user_challenge(
        db,
        user_id=user_challenge.user_id,
        challenge_id=user_challenge.challenge_id,
        is_solved=attempt_in.is_successful,
        status="completed" 
    )

    return attempt

@router.post("/cancel/user/{user_id}/challenge/{challenge_id}", status_code=200)
async def cancel_challenge(
    user_id: int,
    challenge_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can only cancel their own challenges
    if user_id != current_user.id:
        raise HTTPException(403, "Not authorized to cancel this challenge")
    
    uc = await get_by_user_and_challenge(db, user_id, challenge_id)
    if not uc:
        raise HTTPException(404, "Not found")
    
    await upsert_user_challenge(
        db,
        user_id=uc.user_id,
        challenge_id=uc.challenge_id,
        is_solved=uc.is_solved,
        status="cancelled"
    )
    return {"message": "Marked cancelled"}
