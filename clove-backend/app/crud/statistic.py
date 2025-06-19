from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, update
from app.db.models.statistics import Statistic
from app.db.models.challenges import Challenge
from app.schemas.statistic import StatisticCreate

async def get_by_user_id(db: AsyncSession, user_id: int) -> Statistic | None:
    r = await db.execute(select(Statistic).where(Statistic.user_id == user_id))
    return r.scalars().first()

async def create_statistic(db: AsyncSession, data: StatisticCreate) -> Statistic:
    stat = Statistic(**data.model_dump())
    db.add(stat)
    await db.commit()
    await db.refresh(stat)
    return stat

async def update_statistic(db: AsyncSession, stat: Statistic) -> Statistic:
    await db.commit()
    await db.refresh(stat)
    return stat

async def update_login_streak(db: AsyncSession, user_id: int, today_date):
    stat = await get_by_user_id(db, user_id)
    if not stat:
        raise ValueError("Statistic not found")

    if stat.last_login_date == today_date:
        return stat

    if stat.last_login_date and (today_date - stat.last_login_date).days == 1:
        stat.current_streak += 1
    else:
        stat.current_streak = 1

    stat.last_login_date = today_date
    await db.commit(); await db.refresh(stat)
    return stat

async def update_recent_topic(db: AsyncSession, user_id: int, topic_id: int):
    stat = await get_by_user_id(db, user_id)
    if not stat:
        raise ValueError("Statistic not found")
    stat.recent_topic_id = topic_id
    await db.commit(); await db.refresh(stat)
    return stat

async def increment_challenges_solved(
    db: AsyncSession,
    user_id: int,
    challenge_type: str,
    is_correct: bool,
    time_spent: int,
    completed_type: bool = False
):
    stat = await get_by_user_id(db, user_id)
    if not stat:
        # Create statistics record if it doesn't exist
        stat = Statistic(user_id=user_id)
        db.add(stat)
        await db.commit()
        await db.refresh(stat)

    # ── raw counts ──
    new_total_challenges = stat.total_challenges_solved + (1 if is_correct else 0)
    
    # Ensure mode_stats exists and has the challenge type
    if not stat.mode_stats:
        stat.mode_stats = {
            "code_fixer": {"attempts": 0, "correct": 0, "time_spent": 0, "completed": 0},
            "code_completion": {"attempts": 0, "correct": 0, "time_spent": 0, "completed": 0},
            "output_tracing": {"attempts": 0, "correct": 0, "time_spent": 0, "completed": 0}
        }
    
    if challenge_type not in stat.mode_stats:
        stat.mode_stats[challenge_type] = {"attempts": 0, "correct": 0, "time_spent": 0, "completed": 0}
    
    # Update the mode stats
    m = stat.mode_stats[challenge_type]
    new_attempts = m["attempts"] + 1
    new_correct = m["correct"] + (1 if is_correct else 0)
    new_time_spent = m["time_spent"] + time_spent
    new_completed = m["completed"] + (1 if completed_type else 0)
    
    # Create new mode_stats with updated values
    new_mode_stats = stat.mode_stats.copy()
    new_mode_stats[challenge_type] = {
        "attempts": new_attempts,
        "correct": new_correct,
        "time_spent": new_time_spent,
        "completed": new_completed
    }

    # ── precompute floats ──
    total = await db.execute(
        select(func.count()).select_from(Challenge).where(Challenge.type == challenge_type)
    )
    total = total.scalar_one() or 1

    acc  = round(new_correct / new_attempts * 100, 2) if new_attempts else 0.0
    hrs  = round(new_time_spent / 3600, 2)
    comp = round(new_attempts / total * 100, 2)

    # Ensure accuracy, hours_spent, and completion_rate exist
    if not stat.accuracy:
        stat.accuracy = {"code_fixer": 0.0, "code_completion": 0.0, "output_tracing": 0.0}
    if not stat.hours_spent:
        stat.hours_spent = {"code_fixer": 0.0, "code_completion": 0.0, "output_tracing": 0.0}
    if not stat.completion_rate:
        stat.completion_rate = {"code_fixer": 0.0, "code_completion": 0.0, "output_tracing": 0.0}

    # Create new calculated fields
    new_accuracy = stat.accuracy.copy()
    new_hours_spent = stat.hours_spent.copy()
    new_completion_rate = stat.completion_rate.copy()
    
    new_accuracy[challenge_type] = acc
    new_hours_spent[challenge_type] = hrs
    new_completion_rate[challenge_type] = comp

    # Use explicit UPDATE to ensure all fields are updated
    await db.execute(
        update(Statistic)
        .where(Statistic.id == stat.id)
        .values(
            total_challenges_solved=new_total_challenges,
            mode_stats=new_mode_stats,
            accuracy=new_accuracy,
            hours_spent=new_hours_spent,
            completion_rate=new_completion_rate
        )
    )
    
    await db.commit()
    await db.refresh(stat)
    return stat
