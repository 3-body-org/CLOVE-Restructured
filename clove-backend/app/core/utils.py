# app/core/utils.py

def classify_mastery(p_kn: float) -> int:
    """
    Map knowledge probability to discrete mastery:
    1 → Beginner (<= 0.33), 2 → Intermediate (<= 0.66), 3 → Advanced (> 0.66)
    """
    if p_kn <= 0.33:
        return 1
    elif p_kn <= 0.66:
        return 2
    return 3

def determine_streak_flags(incorrect_streak: int, correct_streak: int) -> tuple[int, int]:
    """
    After 2 consecutive incorrect → enable hint (hint_active=1, timer_active=0)
    After 2 consecutive correct → enable timer (timer_active=1, hint_active=0)
    Otherwise both off
    """
    if incorrect_streak >= 2:
        return 0, 1  # (timer_active=0, hint_active=1)
    elif correct_streak >= 2:
        return 1, 0  # (timer_active=1, hint_active=0)
    return 0, 0

def calculate_reward(is_correct: bool, hints_used: int, timer_active: int, answered_on_time: int) -> float:
    """
    R = C [1 - 0.5*(H/3) + 0.2*T*OT] + (1-C)[-1 - 0.5*(H/3) + 0.2*T*OT]
    where C=1 if correct else 0, H=hints_used, T=timer_active, OT=answered_on_time
    """
    C = 1 if is_correct else 0
    H = hints_used
    T = timer_active
    OT = answered_on_time
    return C * (1.0 - 0.5 * (H / 3) + 0.2 * T * OT) + (1 - C) * (-1.0 - 0.5 * (H / 3) + 0.2 * T * OT)
