# app/services/adaptive_engine.py

from app.core.bkt import BKT
from app.core.rl import QLearning
from app.core.utils import classify_mastery, determine_streak_flags, calculate_reward

# Remove any top‐level import of challenge_attempt CRUD. We’ll import inside the function.

async def run_adaptive_updates(
    db,
    attempt,
    user_id: int,
    subtopic_id: int,
    challenge_type: str,
    is_correct: bool,
    hints_used: int,
    time_spent: int,
):
    # Import these here to avoid circular imports:
    from app.crud.challenge_attempt import get_last_n_attempts
    from app.crud.challenge import get_by_id as get_challenge_by_id
    from app.crud.subtopic import get_by_id as get_subtopic_by_id, update_knowledge_level
    from app.crud.q_value import get_qvalue, create_qvalue, update_qvalue

    # 1. Compute streaks from last 2 attempts
    prev_attempts = await get_last_n_attempts(
        db, user_id=user_id, subtopic_id=subtopic_id, n=2
    )
    correct_streak = 0
    incorrect_streak = 0
    for a in prev_attempts:
        if a.is_successful:
            correct_streak += 1
            incorrect_streak = 0
        else:
            incorrect_streak += 1
            correct_streak = 0

    # 2. Load current subtopic & knowledge
    subtopic = await get_subtopic_by_id(db, subtopic_id)
    knowledge_prob = subtopic.knowledge_level

    # 3. BKT update
    bkt = BKT()
    updated_knowledge = bkt.update_knowledge(knowledge_prob, is_correct)
    await update_knowledge_level(db, subtopic, updated_knowledge)

    # 4. Build RL state
    mastery = classify_mastery(updated_knowledge)  # 1,2,3
    timer_active, hint_active = determine_streak_flags(incorrect_streak, correct_streak)
    state = (mastery, timer_active, hint_active)

    # 5. Fetch or create QValue
    q_obj = await get_qvalue(
        db, user_id, subtopic_id, mastery, timer_active, hint_active, challenge_type
    )
    if not q_obj:
        q_obj = await create_qvalue(
            db, user_id, subtopic_id, mastery, timer_active, hint_active, challenge_type
        )

    # 6. Calculate reward
    challenge = await get_challenge_by_id(db, attempt.challenge_id)
    answered_on_time = 1 if time_spent <= challenge.timer else 0
    reward = calculate_reward(is_correct, hints_used, timer_active, answered_on_time)

    # 7. Q‐Learning update
    rl = QLearning()
    rl.initialize_state(state, list(rl.q_table.get(state, {}).keys()) or [challenge_type])
    old_q = q_obj.q_value
    # Next_state = state (single-step)
    rl.q_table[state] = {challenge_type: old_q}
    rl.update_q_value(state, challenge_type, reward, next_state=state)
    new_q = rl.q_table[state][challenge_type]
    await update_qvalue(db, q_obj, new_q)

    return updated_knowledge, reward
