# app/services/adaptive_engine.py

from app.core.bkt import BKT
from app.core.rl import QLearning
from app.core.utils import (
    classify_mastery,
    determine_streak_flags,
    calculate_reward
)

# Remove any top‐level import of challenge_attempt CRUD. We'll import inside the function.

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
    """
    Run adaptive updates exactly as in pseudocode:
    1. Track streaks
    2. Update knowledge using BKT
    3. Calculate reward
    4. Update Q-values
    5. Decay epsilon
    """
    # Import these here to avoid circular imports:
    from app.crud.challenge_attempt import get_last_n_attempts
    from app.crud.challenge import get_by_id as get_challenge_by_id
    from app.crud.subtopic import get_by_id as get_subtopic_by_id, update_knowledge_level
    from app.crud.q_value import get_q_table, create_q_table, update_q_table

    # 1. Compute streaks from last 2 attempts (excluding current attempt)
    # Get 3 attempts to ensure we have 2 after filtering out current
    prev_attempts = await get_last_n_attempts(
        db, user_id=user_id, subtopic_id=subtopic_id, n=3
    )
    # Filter out the current attempt if it exists in prev_attempts
    prev_attempts = [a for a in prev_attempts if a.id != attempt.id]
    # Take only the last 2 attempts after filtering
    prev_attempts = prev_attempts[:2]
    
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

    # 3. BKT update (as in pseudocode)
    bkt = BKT()
    updated_knowledge = bkt.update_knowledge(knowledge_prob, is_correct)
    await update_knowledge_level(db, subtopic, updated_knowledge)

    # 4. Build current and next states
    current_mastery = classify_mastery(knowledge_prob)
    next_mastery = classify_mastery(updated_knowledge)
    
    # Current state uses streaks from previous attempts
    current_timer_active, current_hint_active = determine_streak_flags(incorrect_streak, correct_streak)
    
    # Next state includes current attempt in streak calculation
    next_incorrect_streak = incorrect_streak + (0 if is_correct else 1)
    next_correct_streak = correct_streak + (1 if is_correct else 0)
    next_timer_active, next_hint_active = determine_streak_flags(next_incorrect_streak, next_correct_streak)
    
    current_state = (current_mastery, current_timer_active, current_hint_active)
    next_state = (next_mastery, next_timer_active, next_hint_active)

    # 5. Calculate reward (as in pseudocode)
    challenge = await get_challenge_by_id(db, attempt.challenge_id)
    answered_on_time = 1 if time_spent <= challenge.timer else 0
    reward = calculate_reward(is_correct, hints_used, current_timer_active, answered_on_time)

    # 6. Q-Learning update (as in pseudocode)
    q_obj = await get_q_table(db, user_id, subtopic_id)
    if not q_obj:
        q_obj = await create_q_table(db, user_id, subtopic_id)

    rl = QLearning()
    rl.q_table = q_obj.q_table
    rl.epsilon = q_obj.epsilon

    # Update Q-value using current and next states
    rl.update_q_value(current_state, challenge_type, reward, next_state)
    rl.decay_epsilon()

    await update_q_table(db, q_obj, rl.q_table, rl.epsilon)
    return updated_knowledge, reward

