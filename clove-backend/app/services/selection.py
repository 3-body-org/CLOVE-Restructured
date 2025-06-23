import random
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rl import QLearning
from app.core.utils import classify_mastery, determine_streak_flags, get_difficulty
from app.crud.q_value import get_q_table, create_q_table
from app.crud.challenge import get_challenges_by_type_and_difficulty, get_by_id as get_challenge_by_id, get_unsolved_challenges_by_difficulty, get_all_challenges_by_subtopic, get_challenges_by_difficulty
from app.crud.user_subtopic import get_by_id as get_user_subtopic_by_id
from app.crud.user_challenge import get_by_user_and_challenge, get_last_cancelled 
from app.crud.challenge_attempt import get_last_attempts_for_user_subtopic
from app.crud.user import get_by_id as get_user_by_id

from app.db.models.challenges import Challenge


async def _select_non_adaptive_challenge(
    db: AsyncSession,
    user_subtopic_id: int, 
) -> Challenge:
    """
    Selects a challenge based on a fixed sequential progression (2 easy, 2 medium, 1 hard)
    determined by the user's attempt count in the current take.
    """
    us = await get_user_subtopic_by_id(db, user_subtopic_id)
    user_id = us.user_id
    subtopic_id = us.subtopic_id

    # 1) Top Priority: Return a cancelled challenge if any, so the user can resume.
    cancelled_uc = await get_last_cancelled(db, user_id=user_id, subtopic_id=subtopic_id)
    if cancelled_uc:
        return await get_challenge_by_id(db, cancelled_uc.challenge_id)

    # 2) Determine the current position in the 5-challenge sequence based on attempt count.
    # The API endpoint logic deletes attempts after a take of 5 is full.
    recent_attempts = await get_last_attempts_for_user_subtopic(db, user_id, subtopic_id, 5)
    attempt_index = len(recent_attempts)

    # This handles the case where a take is full but not yet deleted, or for any count > 4.
    if attempt_index >= 5:
        attempt_index = 4 # Default to the last step in the sequence

    # Extract challenge IDs that have already been attempted in this take to prevent duplication
    attempted_challenge_ids = {attempt.user_challenge.challenge_id for attempt in recent_attempts}

    sequence_map = {
        0: "easy",
        1: "easy",
        2: "medium",
        3: "medium",
        4: "hard"
    }
    target_difficulty = sequence_map[attempt_index]

    # 3) Fetch all candidate challenges matching the target difficulty for the subtopic.
    # This might require a new CRUD function: get_challenges_by_difficulty
    candidates = await get_challenges_by_difficulty(db, subtopic_id, target_difficulty)

    # Filter out challenges that have already been attempted in this take
    candidates = [c for c in candidates if c.id not in attempted_challenge_ids]

    if not candidates:
        # Fallback: If no challenges exist for the target difficulty (e.g., no "hard" ones created),
        # try to find any unsolved challenge to prevent a crash.
        all_unsolved = []
        for difficulty in ["easy", "medium", "hard"]:
             all_unsolved.extend(
                await get_unsolved_challenges_by_difficulty(db, user_id, subtopic_id, difficulty)
            )
        # Filter out already attempted challenges from fallback candidates
        all_unsolved = [c for c in all_unsolved if c.id not in attempted_challenge_ids]
        if all_unsolved:
            return random.choice(all_unsolved)
        # If all are solved, just return any challenge from the subtopic
        all_challenges = await get_all_challenges_by_subtopic(db, subtopic_id)
        # Filter out already attempted challenges
        all_challenges = [c for c in all_challenges if c.id not in attempted_challenge_ids]
        return random.choice(all_challenges)

    # 4) Partition candidates using the same priority as the adaptive system
    pending, unsolved, solved = [], [], []
    for c in candidates:
        uc = await get_by_user_and_challenge(db, user_id, c.id)
        if not uc or uc.status == 'pending':
            pending.append(c)
        elif uc.status == 'completed' and not uc.is_solved:
            unsolved.append(c)
        elif uc.status == 'completed' and uc.is_solved:
            solved.append(c)
    
    # 5) Return a challenge based on the priority: pending -> unsolved -> solved
    if pending:
        return random.choice(pending)
    if unsolved:
        return random.choice(unsolved)
    if solved:
        return random.choice(solved)
    
    # Ultimate fallback: If candidates were found but none fit the partitions (unlikely), return any of them.
    return random.choice(candidates)


async def _select_adaptive_challenge(
    db: AsyncSession,
    user_subtopic_id: int, 
    knowledge: float
) -> Challenge:
    mastery = classify_mastery(knowledge)
    us = await get_user_subtopic_by_id(db, user_subtopic_id)

    #0) Top Priority: Return a cancelled challenge if any, so the user can resume.
    cancelled_uc = await get_last_cancelled(
        db,
        user_id=us.user_id,
        subtopic_id=us.subtopic_id
    )
    if cancelled_uc:
        return await get_challenge_by_id(db, cancelled_uc.challenge_id)

    # 1) Get previous attempts to determine streaks and prevent duplication
    attempts = await get_last_attempts_for_user_subtopic(db, us.user_id, us.subtopic_id, 2)
    recent_attempts = await get_last_attempts_for_user_subtopic(db, us.user_id, us.subtopic_id, 5)
    
    # Extract challenge IDs that have already been attempted in this take to prevent duplication
    attempted_challenge_ids = {attempt.user_challenge.challenge_id for attempt in recent_attempts}

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

    # 4) Fetch candidates based on AI recommendation
    diff = get_difficulty(mastery)
    candidates = await get_challenges_by_type_and_difficulty(db, us.subtopic_id, action, diff)

    # Filter out challenges that have already been attempted in this take
    candidates = [c for c in candidates if c.id not in attempted_challenge_ids]

    # 5) Fallback: If RL selects an action for which no challenges exist, find any other challenge.
    if not candidates:
        # First, try to find any unsolved challenge to allow for continued practice.
        all_unsolved = []
        for difficulty in ["easy", "medium", "hard"]:
            all_unsolved.extend(
                await get_unsolved_challenges_by_difficulty(db, us.user_id, us.subtopic_id, difficulty)
            )
        # Filter out already attempted challenges from fallback candidates
        all_unsolved = [c for c in all_unsolved if c.id not in attempted_challenge_ids]
        if all_unsolved:
            return random.choice(all_unsolved)
        
        # If all challenges are solved, just pick a random one from the subtopic for review.
        all_challenges = await get_all_challenges_by_subtopic(db, us.subtopic_id)
        # Filter out already attempted challenges
        all_challenges = [c for c in all_challenges if c.id not in attempted_challenge_ids]
        return random.choice(all_challenges)

    # 6) Partition candidates using the standard priority
    pending, unsolved, solved = [], [], []
    for c in candidates:
        uc = await get_by_user_and_challenge(db, us.user_id, c.id)
        if not uc or uc.status == 'pending':
            pending.append(c)
        elif uc.status == 'completed' and not uc.is_solved:
            unsolved.append(c)
        else: # Handles uc.status == 'completed' and uc.is_solved
            solved.append(c)

    # 7) Final priority: pending -> unsolved -> solved
    if pending:
        return random.choice(pending)
    if unsolved:
        return random.choice(unsolved)
    
    # If only solved challenges are left from the candidates, return one of them for review.
    return random.choice(solved)


async def select_challenge(
    db: AsyncSession,
    user_subtopic_id: int, 
    knowledge: float
) -> Challenge:
    """
    Selects a challenge for a user based on their learning mode (adaptive or non-adaptive).
    """
    us = await get_user_subtopic_by_id(db, user_subtopic_id)
    user = await get_user_by_id(db, us.user_id)

    if user.is_adaptive:
        return await _select_adaptive_challenge(db, user_subtopic_id, knowledge)
    else:
        return await _select_non_adaptive_challenge(db, user_subtopic_id)
