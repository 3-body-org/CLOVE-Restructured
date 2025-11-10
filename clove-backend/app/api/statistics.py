from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date
from app.db.session import get_db
from app.api.auth import get_current_user
from app.db.models.users import User
from app.schemas.statistic import StatisticRead, StatisticCreate
from app.crud import statistic as crud_stat
from app.crud.challenge import count_all as count_all_challenges

router = APIRouter(prefix="/statistics", tags=["Statistics"], dependencies=[Depends(get_current_user)])

@router.get("/me", response_model=StatisticRead)
async def get_my_statistics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stat = await crud_stat.get_by_user_id(db, current_user.id)
    if not stat:
        raise HTTPException(404, "Statistic record not found")
    total_challenges = await count_all_challenges(db)
    # Convert stat to dict if needed
    stat_dict = stat.__dict__.copy()
    stat_dict["total_challenges"] = total_challenges
    # Remove SQLAlchemy state if present
    stat_dict.pop("_sa_instance_state", None)
    return stat_dict

@router.post("/", response_model=StatisticRead)
async def create_statistic(
    data: StatisticCreate,
    db: AsyncSession = Depends(get_db),
):
    return await crud_stat.create_statistic(db, data)

@router.post("/update-streak", response_model=StatisticRead)
async def update_streak(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await crud_stat.update_login_streak(db, current_user.id, date.today())

@router.post("/update-recent-topic/{topic_id}", response_model=StatisticRead)
async def update_recent_topic(
    topic_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await crud_stat.update_recent_topic(db, current_user.id, topic_id)

@router.post("/challenge", response_model=StatisticRead)
async def record_challenge(
    payload: dict,  # {"type", "is_correct", "time_spent", "completed_type", "points"}
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await crud_stat.increment_challenges_solved(
        db,
        current_user.id,
        payload["type"],
        payload["is_correct"],
        payload["time_spent"],
        payload.get("completed_type", False),
        payload.get("points", 0)
    )
