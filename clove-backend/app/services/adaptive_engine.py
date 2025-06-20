# app/services/adaptive_engine.py

from app.core.bkt import BKT
from app.core.rl import QLearning
from app.core.utils import classify_mastery, determine_streak_flags, calculate_reward

async def run_adaptive_updates(
    db,
    user_subtopic_id: int,
    challenge_id: int,
    is_correct: bool,
    hints_used: int,
    time_spent: int
):
    # avoid circular imports
    from app.crud.challenge_attempt import get_last_attempts_for_user_subtopic
    from app.crud.challenge import get_by_id as get_challenge_by_id
    from app.crud.user_subtopic import get_by_id as get_user_subtopic_by_id, update
    from app.crud.q_value import get_q_table, create_q_table, update_q_table
    from app.schemas.user_subtopic import UserSubtopicUpdate

    # 1) pull the last 2 UserChallenge rows
    us = await get_user_subtopic_by_id(db, user_subtopic_id)

    attempts = await get_last_attempts_for_user_subtopic(db, us.user_id, us.subtopic_id, 3)
    attempts = [a for a in attempts if a.user_challenge.challenge_id != challenge_id][:2]

    # 2) Compute streak flags over those two
    correct_streak = incorrect_streak = 0
    for attempt in attempts:
        if attempt.is_successful:
            correct_streak += 1
            incorrect_streak = 0
        else:
            incorrect_streak += 1
            correct_streak = 0

    # 3) BKT update
    old_know = us.knowledge_level
    new_know = BKT().update_knowledge(old_know, is_correct)
    await update(db, us, UserSubtopicUpdate(knowledge_level=new_know))

    # 4) Build RL states
    mastery_before = classify_mastery(old_know)
    timer, hint = determine_streak_flags(incorrect_streak, correct_streak)
    current_state = (mastery_before, timer, hint)

    # next state always rolls in current attempt
    next_correct = correct_streak + (1 if is_correct else 0)
    next_incorrect = incorrect_streak + (0 if is_correct else 1)
    mastery_after = classify_mastery(new_know)
    next_timer, next_hint = determine_streak_flags(next_incorrect, next_correct)
    next_state = (mastery_after, next_timer, next_hint)

    # 5) Reward calculation
    chall = await get_challenge_by_id(db, challenge_id)
    on_time = int(time_spent <= chall.timer)
    reward = calculate_reward(is_correct, hints_used, current_state[1], on_time)

    # 6) Q‑learning update
    qobj = await get_q_table(db, user_subtopic_id) or await create_q_table(db, user_subtopic_id)
    rl = QLearning()
    rl.q_table, rl.epsilon = qobj.q_table, qobj.epsilon
    rl.update_q_value(current_state, chall.type, reward, next_state)
    rl.decay_epsilon()

    await update_q_table(db, qobj, rl.q_table, rl.epsilon)

    return new_know, reward
