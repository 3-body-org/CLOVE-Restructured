from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.q_values import QValue
from app.core.utils import initialize_q_table, round_q_table_values, CHALLENGE_TYPES

async def get_q_table(
    db: AsyncSession,
    user_id: int,
    subtopic_id: int
) -> QValue | None:
    """Get existing Q-table from database"""
    stmt = select(QValue).where(
        QValue.user_id == user_id,
        QValue.subtopic_id == subtopic_id
    )
    result = await db.execute(stmt)
    return result.scalars().first()

async def create_q_table(
    db: AsyncSession,
    user_id: int,
    subtopic_id: int
) -> QValue:
    """Create new Q-table using initialize_q_table from utils.py"""
    # Get initialized Q-table with random values
    q_table = initialize_q_table()
    
    # Round values for consistency
    q_table = round_q_table_values(q_table)
    
    # Create database object
    q = QValue(
        user_id=user_id,
        subtopic_id=subtopic_id,
        q_table=q_table,
        epsilon=0.8
    )
    
    # Save to database
    db.add(q)
    await db.commit()
    await db.refresh(q)
    return q

async def update_q_table(
    db: AsyncSession,
    q_obj: QValue,
    new_q_table: dict,
    new_epsilon: float
) -> None:
    """Update existing Q-table with new values"""
    # Round values for consistency
    new_q_table = round_q_table_values(new_q_table)
    
    # Update database object
    q_obj.q_table = new_q_table
    q_obj.epsilon = round(new_epsilon, 2)
    await db.commit()

async def get_qvalue(
    db: AsyncSession,
    user_id: int,
    subtopic_id: int,
    mastery: int,
    timer_active: int,
    hint_active: int,
    action: str
) -> QValue | None:
    stmt = select(QValue).where(
        QValue.user_id == user_id,
        QValue.subtopic_id == subtopic_id,
        QValue.mastery == mastery,
        QValue.timer_active == timer_active,
        QValue.hint_active == hint_active,
        QValue.action == action
    )
    result = await db.execute(stmt)
    return result.scalars().first()

async def create_qvalue(
    db: AsyncSession,
    user_id: int,
    subtopic_id: int,
    mastery: int,
    timer_active: int,
    hint_active: int,
    action: str
) -> QValue:
    # Initialize Q-table for this state
    q_table = initialize_q_table()
    state_key = str([mastery, timer_active, hint_active])
    initial_q_value = q_table[state_key][action]

    q = QValue(
        user_id=user_id,
        subtopic_id=subtopic_id,
        mastery=mastery,
        timer_active=timer_active,
        hint_active=hint_active,
        action=action,
        q_value=initial_q_value
    )
    db.add(q)
    await db.commit()
    await db.refresh(q)
    return q

async def update_qvalue(
    db: AsyncSession,
    q_obj: QValue,
    new_q_value: float
) -> None:
    q_obj.q_value = new_q_value
    await db.commit()

async def get_by_qid(
    db: AsyncSession,
    qv_id: int
) -> QValue | None:
    """Get Q-table by ID"""
    stmt = select(QValue).where(QValue.id == qv_id)
    result = await db.execute(stmt)
    return result.scalars().first()

async def delete_qvalue(
    db: AsyncSession,
    q_obj: QValue
) -> None:
    """Delete Q-table"""
    await db.delete(q_obj)
    await db.commit()
