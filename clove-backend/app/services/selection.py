import random
from app.core.rl import QLearning
from app.core.utils import (
    classify_mastery,
    determine_streak_flags,
    get_difficulty,
    CHALLENGE_TYPES
)
from app.crud.q_value import get_q_table, create_q_table
from app.crud.challenge import get_challenges_by_type_and_difficulty
from app.crud.challenge_attempt import get_last_n_attempts
from app.db.models.challenges import Challenge

async def select_challenge(
    db,
    user_id: int,
    subtopic_id: int,
    knowledge: float
) -> Challenge:
    """
    Select a challenge for the user following pseudocode structure.
    """
    # 1. Get current mastery level
    mastery = classify_mastery(knowledge)
    
    # 2. Determine timer and hint flags based on streaks
    prev_attempts = await get_last_n_attempts(db, user_id, subtopic_id, n=2)
    correct_streak = 0
    incorrect_streak = 0
    
    for a in prev_attempts:
        if a.is_successful:
            correct_streak += 1
            incorrect_streak = 0
        else:
            incorrect_streak += 1
            correct_streak = 0

    timer_active, hint_active = determine_streak_flags(incorrect_streak, correct_streak)
    current_state = (mastery, timer_active, hint_active)

    # 3. Load Q-table for this user and subtopic
    q_obj = await get_q_table(db, user_id, subtopic_id)
    if not q_obj:
        q_obj = await create_q_table(db, user_id, subtopic_id)

    # 4. Initialize RL agent with current Q-table and epsilon
    rl = QLearning()
    rl.q_table = q_obj.q_table
    rl.epsilon = q_obj.epsilon

    # 5. Select challenge type using epsilon-greedy policy
    challenge_type = rl.select_action(current_state)

    # 6. Get appropriate difficulty based on mastery
    difficulty = get_difficulty(mastery)

    # 7. Get candidates and filter out solved challenges
    candidates = await get_challenges_by_type_and_difficulty(
        db, subtopic_id, challenge_type, difficulty
    )
    
    # Filter out solved challenges
    unsolved_candidates = [c for c in candidates if not c.is_solved]
    
    # If no unsolved challenges available, fall back to all challenges
    if not unsolved_candidates:
        unsolved_candidates = candidates

    return random.choice(unsolved_candidates)
