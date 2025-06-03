# app/core/bkt.py

class BKT:
    def __init__(self, p_trans=0.1, p_guess=0.2, p_slip=0.1):
        self.p_T = p_trans
        self.p_G = p_guess
        self.p_S = p_slip

    def update_knowledge(self, knowledge_prob: float, is_correct: bool) -> float:
        if is_correct:
            numerator = knowledge_prob * (1 - self.p_S)
            denominator = numerator + (1 - knowledge_prob) * self.p_G
        else:
            numerator = knowledge_prob * self.p_S
            denominator = numerator + (1 - knowledge_prob) * (1 - self.p_G)

        posterior = numerator / denominator if denominator else 0.0
        updated_knowledge = posterior + (1 - posterior) * self.p_T
        return max(0.2, min(1.0, updated_knowledge))
