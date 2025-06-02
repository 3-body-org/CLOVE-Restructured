# app/crud/statistic.py
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.statistics import Statistic
from app.schemas.statistic import StatisticCreate, StatisticUpdate

async def get_by_id(db: AsyncSession, stat_id: int) -> Statistic | None:
    result = await db.execute(select(Statistic).where(Statistic.id == stat_id))
    return result.scalars().first()

async def list_for_user(db: AsyncSession, user_id: int) -> list[Statistic]:
    result = await db.execute(select(Statistic).where(Statistic.user_id == user_id))
    return result.scalars().all()

async def create(db: AsyncSession, stat_in: StatisticCreate) -> Statistic:
    new_stat = Statistic(
        user_id=stat_in.user_id,
        type=stat_in.type,
        total_number_atttempts=stat_in.total_number_atttempts,
        total_number_correct=stat_in.total_number_correct,
        total_time_spent=stat_in.total_time_spent,
        total_each_modes_solved=stat_in.total_each_modes_solved,
        total_all_mode_solved=stat_in.total_all_mode_solved
    )
    db.add(new_stat)
    await db.commit()
    await db.refresh(new_stat)
    return new_stat

async def update(db: AsyncSession, stat_db: Statistic, stat_in: StatisticUpdate) -> Statistic:
    stat_db.total_number_atttempts = stat_in.total_number_atttempts
    stat_db.total_number_correct = stat_in.total_number_correct
    stat_db.total_time_spent = stat_in.total_time_spent
    stat_db.total_each_modes_solved = stat_in.total_each_modes_solved
    stat_db.total_all_mode_solved = stat_in.total_all_mode_solved
    db.add(stat_db)
    await db.commit()
    await db.refresh(stat_db)
    return stat_db

async def delete(db: AsyncSession, stat_db: Statistic) -> None:
    await db.delete(stat_db)
    await db.commit()
