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
from app.api.auth import get_current_user

router = APIRouter(prefix="/user_challenges", tags=["UserChallenges"], dependencies=[Depends(get_current_user)])

@router.post("/", response_model=UserChallengeRead, status_code=status.HTTP_201_CREATED)
async def create_user_challenge(
    payload: UserChallengeCreate,
    db: AsyncSession = Depends(get_db),
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

@router.get("/{uc_id}", response_model=UserChallengeRead)
async def read_user_challenge(
    uc_id: int,
    db: AsyncSession = Depends(get_db),
):
    uc = await get_by_id(db, uc_id)
    if not uc:
        raise HTTPException(status_code=404, detail="Not found")
    return uc

@router.patch("/{uc_id}", response_model=UserChallengeRead)
async def update_user_challenge(
    uc_id: int,
    payload: UserChallengeUpdate,
    db: AsyncSession = Depends(get_db),
):
    uc = await get_by_id(db, uc_id)
    if not uc:
        raise HTTPException(status_code=404, detail="Not found")
    data = payload.model_dump(exclude_unset=True)
    await db.execute(
        update(UserChallenge)
        .where(UserChallenge.id == uc_id)
        .values(**data, last_attempted_at=func.now())
    )
    await db.commit()
    return await get_by_id(db, uc_id)

@router.get("/by_user/{user_id}", response_model=List[UserChallengeRead])
async def list_user_challenges(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
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
    db: AsyncSession = Depends(get_db)
):
    """
    Removes every UserChallenge for the given user_id.
    """
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
    db: AsyncSession = Depends(get_db)
):
    """
    ⚠️ Deletes every row in user_challenges. Use with caution!
    """
    deleted = await delete_all(db)
    return {"deleted_count": deleted}