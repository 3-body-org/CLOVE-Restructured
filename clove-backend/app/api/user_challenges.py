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