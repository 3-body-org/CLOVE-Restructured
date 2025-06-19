import random
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rl import QLearning
from app.core.utils import classify_mastery, determine_streak_flags, get_difficulty
from app.crud.q_value import get_q_table, create_q_table
from app.crud.challenge import get_challenges_by_type_and_difficulty, get_by_id as get_challenge_by_id
from app.crud.user_subtopic import get_by_id as get_user_subtopic_by_id
from app.crud.user_challenge import get_by_user_and_challenge, get_last_cancelled 
from app.crud.challenge_attempt import get_last_attempts_for_user_subtopic

from app.db.models.challenges import Challenge

async def select_challenge(
    db: AsyncSession,
    user_subtopic_id: int, 
    knowledge: float
) -> Challenge:
    mastery = classify_mastery(knowledge)
    us = await get_user_subtopic_by_id(db, user_subtopic_id)

    #0) Return cancelled challenge if any
    cancelled_uc = await get_last_cancelled(
        db,
        user_id=us.user_id,
        subtopic_id=us.subtopic_id
    )
    if cancelled_uc:
        return await get_challenge_by_id(db, cancelled_uc.challenge_id)

    # 1) Get previous attempts
    attempts = await get_last_attempts_for_user_subtopic(db, us.user_id, us.subtopic_id, 2)

    # 2) Timer/hint flags - compute for all challenges
    correct_streak, incorrect_streak = 0, 0
    for attempt in attempts:
        if attempt.is_successful:
            correct_streak += 1
            incorrect_streak = 0
        else:
            incorrect_streak += 1
            correct_streak = 0

    # Always use streak flags for timer/hint
    timer_active, hint_active = determine_streak_flags(incorrect_streak, correct_streak)
    state = (mastery, timer_active, hint_active)

    # 3) Q‑learning pick
    q_obj = await get_q_table(db, user_subtopic_id) or await create_q_table(db, user_subtopic_id)
    rl = QLearning()
    rl.q_table, rl.epsilon = q_obj.q_table, q_obj.epsilon
    action = rl.select_action(state)

    # 4) Fetch candidates
    diff = get_difficulty(mastery)
    candidates = await get_challenges_by_type_and_difficulty(db, us.subtopic_id, action, diff)

    # 5) Partition by user_challenge record
    pending, in_progress, solved = [], [], []
    for c in candidates:
        uc = await get_by_user_and_challenge(db, us.user_id, c.id)
        if not uc:
            pending.append(c)
        elif not uc.is_solved:
            in_progress.append(c)
        else:
            solved.append(c)

    # 6) Final priority: pending → in_progress → solved
    if pending:
        return random.choice(pending)
    if in_progress:
        return random.choice(in_progress)
    return random.choice(solved)
