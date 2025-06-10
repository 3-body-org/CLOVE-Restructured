# app/crud/user.py

from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.users import User

async def get_by_email(db: AsyncSession, email: str) -> User | None:
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    return result.scalars().first()

async def get_by_username(db: AsyncSession, username: str) -> User | None:
    stmt = select(User).where(User.username == username)
    result = await db.execute(stmt)
    return result.scalars().first()

async def get_by_id(db: AsyncSession, user_id: int) -> User | None:
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    return result.scalars().first()

async def create_user(
    db: AsyncSession,
    username: str,
    email: str,
    password_hash: str
) -> User:
    user = User(
        username=username,
        email=email,
        password_hash=password_hash
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def delete_user(
    db: AsyncSession,
    user_obj: User
) -> None:
    await db.delete(user_obj)
    await db.commit()
