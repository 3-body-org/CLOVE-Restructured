# app/api/user_challenge.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func

from app.schemas.user_challenge import (
    UserChallengeCreate,
    UserChallengeUpdate,
    UserChallengeRead,
)
from app.crud.user_challenge import (
    get_by_id,
    get_by_user_and_challenge,
    create as create_uc,
    delete_all,
    delete_all_for_user
)
from app.crud.challenge import get_all_challenges_by_subtopic
from app.db.session import get_db
from app.db.models.user_challenges import UserChallenge
from app.api.auth import get_current_user, get_current_superuser
from app.db.models.users import User

router = APIRouter(prefix="/user_challenges", tags=["UserChallenges"])

@router.post("/", response_model=UserChallengeRead, status_code=status.HTTP_201_CREATED)
async def create_user_challenge(
    payload: UserChallengeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if await get_by_user_and_challenge(db, payload.user_id, payload.challenge_id):
        raise HTTPException(status_code=409, detail="Already exists")
    return await create_uc(
        db,
        user_id=payload.user_id,
        challenge_id=payload.challenge_id,
        is_solved=payload.is_solved,
        status=payload.status.value,
    )

@router.get("/user/{user_id}/challenge/{challenge_id}", response_model=UserChallengeRead)
async def read_user_challenge(
    user_id: int,
    challenge_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can only view their own user_challenges, superusers can view any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this user challenge")
    
    uc = await get_by_user_and_challenge(db, user_id, challenge_id)
    if not uc:
        raise HTTPException(status_code=404, detail="Not found")
    
    return uc

@router.patch("/user/{user_id}/challenge/{challenge_id}", response_model=UserChallengeRead)
async def update_user_challenge(
    user_id: int,
    challenge_id: int,
    payload: UserChallengeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can only update their own user_challenges, superusers can update any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this user challenge")
    
    uc = await get_by_user_and_challenge(db, user_id, challenge_id)
    if not uc:
        raise HTTPException(status_code=404, detail="Not found")
    
    data = payload.model_dump(exclude_unset=True)
    await db.execute(
        update(UserChallenge)
        .where(UserChallenge.id == uc.id)
        .values(**data, last_attempted_at=func.now())
    )
    await db.commit()
    return await get_by_user_and_challenge(db, user_id, challenge_id)

@router.get("/by_user/{user_id}", response_model=List[UserChallengeRead])
async def list_user_challenges(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can only view their own user_challenges, superusers can view any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this user's challenges")
    
    stmt = select(UserChallenge).where(UserChallenge.user_id == user_id)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.delete(
    "/by_user/{user_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete all UserChallenge rows for a user"
)
async def delete_user_challenges_for_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Removes every UserChallenge for the given user_id.
    Users can only delete their own challenges, superusers can delete any.
    """
    # Users can only delete their own user_challenges, superusers can delete any
    if not current_user.is_superuser and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this user's challenges")
    
    deleted = await delete_all_for_user(db, user_id=user_id)
    if deleted == 0:
        raise HTTPException(status_code=404, detail="No records found for that user")
    return {"deleted_count": deleted}

@router.delete(
    "/",
    status_code=status.HTTP_200_OK,
    summary="Delete *all* UserChallenge rows (admin only!)"
)
async def delete_all_user_challenges(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """
    ⚠️ Deletes every row in user_challenges. Use with caution!
    Requires superuser privileges.
    """
    deleted = await delete_all(db)
    return {"deleted_count": deleted}

@router.post("/reset-challenge-fields/user/{user_id}/subtopic/{subtopic_id}", status_code=status.HTTP_200_OK)
async def reset_challenge_fields_for_subtopic(
    user_id: int,
    subtopic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Reset challenge-specific fields (partial_answer, time_spent, hints_used, timer_enabled, hints_enabled, was_cancelled) 
    for all challenges in a subtopic when user clicks 'Back to Practice' from results page.
    """
    # Users can only reset their own challenge fields
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to reset challenge fields for this user")
    
    try:
        # Get all challenges for this subtopic
        challenges = await get_all_challenges_by_subtopic(db, subtopic_id)
        if not challenges:
            raise HTTPException(status_code=404, detail="No challenges found for this subtopic")
        
        # Reset fields for all user_challenges in this subtopic
        reset_count = 0
        for challenge in challenges:
            user_challenge = await get_by_user_and_challenge(db, user_id, challenge.id)
            if user_challenge:
                # Reset all challenge-specific fields to defaults
                await db.execute(
                    update(UserChallenge)
                    .where(UserChallenge.id == user_challenge.id)
                    .values(
                        partial_answer=None,
                        time_spent=0,
                        hints_used=0,
                        timer_enabled=None,
                        hints_enabled=None,
                        was_cancelled=False
                    )
                )
                reset_count += 1
        
        await db.commit()
        
        return {
            "message": f"Successfully reset challenge fields for {reset_count} challenges in subtopic {subtopic_id}",
            "user_id": user_id,
            "subtopic_id": subtopic_id,
            "reset_count": reset_count
        }
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error resetting challenge fields: {str(e)}")