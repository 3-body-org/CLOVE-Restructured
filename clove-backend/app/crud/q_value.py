from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.q_values import QValue

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
    q = QValue(
        user_id=user_id,
        subtopic_id=subtopic_id,
        mastery=mastery,
        timer_active=timer_active,
        hint_active=hint_active,
        action=action,
        q_value=0.0
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
    stmt = select(QValue).where(QValue.id == qv_id)
    result = await db.execute(stmt)
    return result.scalars().first()

async def delete_qvalue(
    db: AsyncSession,
    q_obj: QValue
) -> None:
    await db.delete(q_obj)
    await db.commit()
