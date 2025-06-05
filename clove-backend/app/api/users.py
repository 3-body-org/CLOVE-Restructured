# app/api/users.py

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.user import UserCreate, UserRead
from app.crud.user import (
    get_by_email,
    get_by_username,
    get_by_id,
    create_user,
    delete_user
)
from app.db.session import get_db
from app.utils.security import get_password_hash  

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user_endpoint(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new user. Checks for existing email/username first.
    """
    # 1) Check for duplicate email
    existing = await get_by_email(db, email=user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # 2) Check for duplicate username
    existing = await get_by_username(db, username=user_in.username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    # 3) Hash the password, then create
    hashed_pw = get_password_hash(user_in.password)
    user = await create_user(
        db,
        username=user_in.username,
        email=user_in.email,
        password_hash=hashed_pw
    )
    return user

@router.get("/{user_id}", response_model=UserRead)
async def read_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch a user by their ID.
    """
    user_obj = await get_by_id(db, user_id)
    if not user_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user_obj

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_endpoint(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a user by their ID. Returns 204 No Content on success.
    """
    user_obj = await get_by_id(db, user_id)
    if not user_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    await delete_user(db, user_obj)
    return  
