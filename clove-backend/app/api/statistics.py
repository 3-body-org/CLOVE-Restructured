from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date
from app.db.session import get_db
from app.api.auth import get_current_user
from app.schemas.statistic import StatisticRead, StatisticCreate
from app.crud import statistic as crud_stat

router = APIRouter(prefix="/statistics", tags=["Statistics"], dependencies=[Depends(get_current_user)])

@router.get("/me", response_model=StatisticRead)
async def get_my_statistics(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    stat = await crud_stat.get_by_user_id(db, current_user.id)
    if not stat:
        raise HTTPException(404, "Statistic record not found")
    return stat

@router.post("/", response_model=StatisticRead)
async def create_statistic(
    data: StatisticCreate,
    db: AsyncSession = Depends(get_db),
):
    return await crud_stat.create_statistic(db, data)

@router.post("/update-streak", response_model=StatisticRead)
async def update_streak(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await crud_stat.update_login_streak(db, current_user.id, date.today())

@router.post("/update-recent-topic/{topic_id}", response_model=StatisticRead)
async def update_recent_topic(
    topic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await crud_stat.update_recent_topic(db, current_user.id, topic_id)

@router.post("/challenge", response_model=StatisticRead)
async def record_challenge(
    payload: dict,  # {"type", "is_correct", "time_spent", "completed_type"}
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await crud_stat.increment_challenges_solved(
        db,
        current_user.id,
        payload["type"],
        payload["is_correct"],
        payload["time_spent"],
        payload.get("completed_type", False)
    )
