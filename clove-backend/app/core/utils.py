# app/core/utils.py
import numpy as np

# BKT Parameters
p_T = 0.1  # Transition probability
p_G = 0.2  # Guess probability
p_S = 0.1  # Slip probability

# RL Parameters
alpha = 0.1        # Learning rate
gamma = 0.9        # Discount factor
epsilon = 0.8      # Initial exploration rate
epsilon_decay = 0.95  # Exploration decay per challenge
min_epsilon = 0.1  # Minimum exploration probability

# Challenge Types
CHALLENGE_TYPES = [
    "code_fixer",
    "code_completion",
    "output_tracing"
]

# Difficulty Levels
DIFFICULTY_MAP = {
    1: "easy",    # Beginner (0-33% knowledge)
    2: "medium",  # Intermediate (34-66%)
    3: "hard"     # Advanced (67-100%)
}

# Mastery Thresholds
MASTERY_THRESHOLDS = {
    "beginner": 0.33,
    "intermediate": 0.66
}

def round_q_table_values(q_table):
    """Round all Q-values to 2 decimal places"""
    if not isinstance(q_table, dict):
        raise ValueError("Q-table must be a dictionary")
    
    return {
        k: {a: round(v, 2) for a, v in actions.items()} 
        for k, actions in q_table.items()
    }

def classify_mastery(p_kn: float) -> int:
    """
    Map knowledge probability to discrete mastery exactly as in pseudocode:
    if p_Kn <= 0.33: return 1  # Beginner
    elif p_Kn <= 0.66: return 2  # Intermediate
    else: return 3  # Advanced
    """
    # Ensure p_kn is between 0 and 1
    p_kn = min(1.0, max(0.0, p_kn))
    
    if p_kn <= MASTERY_THRESHOLDS["beginner"]:
        return 1
    elif p_kn <= MASTERY_THRESHOLDS["intermediate"]:
        return 2
    return 3

def determine_streak_flags(incorrect_streak: int, correct_streak: int) -> tuple[int, int]:
    """
    Determine timer and hint flags based on streaks:
    - If incorrect streak >= 2: Activate hint (1) to help struggling user
    - If correct streak >= 2: Activate timer (1) to challenge successful user
    - Otherwise: No timer (0), no hint (0)
    """
    # If incorrect streak >= 2, activate hint (1) to help struggling user
    if incorrect_streak >= 2:
        return 0, 1  # (timer_active=0, hint_active=1)
    
    # If correct streak >= 2, activate timer (1) to challenge successful user
    elif correct_streak >= 2:
        return 1, 0  # (timer_active=1, hint_active=0)
    
    # Default: no timer, no hint
    return 0, 0  # (timer_active=0, hint_active=0)

def calculate_reward(is_correct: bool, hints_used: int, timer_active: int, answered_on_time: int) -> float:
    """
    Calculate reward exactly as in pseudocode:
    C = 1 if is_correct else 0
    H = hints_used
    T = timer_active
    OT = answered_on_time
    return C*(1.0 - 0.5*(H/3) + 0.2*T*OT) + (1-C)*(-1.0 - 0.5*(H/3) + 0.2*T*OT)
    """
    C = 1 if is_correct else 0
    H = hints_used
    T = timer_active
    OT = answered_on_time
    return C * (1.0 - 0.5 * (H / 3) + 0.2 * T * OT) + (1 - C) * (-1.0 - 0.5 * (H / 3) + 0.2 * T * OT)

def get_difficulty(mastery: int) -> str:
    """Get difficulty level based on mastery as in pseudocode"""
    return DIFFICULTY_MAP[mastery]

def initialize_q_table():
    """
    Initialize Q-table exactly as in pseudocode:
    states = [
        (1,0,0), (1,0,1), (1,1,0),  # Beginner states
        (2,0,0), (2,0,1), (2,1,0),  # Intermediate states
        (3,0,0), (3,0,1), (3,1,0)   # Advanced states
    ]
    return {
        state: {ctype: np.random.uniform(-1, 1) for ctype in CHALLENGE_TYPES}
        for state in states
    }
    """
    states = [
        (1, 0, 0), (1, 0, 1), (1, 1, 0),  # Beginner states
        (2, 0, 0), (2, 0, 1), (2, 1, 0),  # Intermediate states
        (3, 0, 0), (3, 0, 1), (3, 1, 0)   # Advanced states
    ]
    return {
        str(state): {ctype: np.random.uniform(-1, 1) for ctype in CHALLENGE_TYPES}
        for state in states
    }