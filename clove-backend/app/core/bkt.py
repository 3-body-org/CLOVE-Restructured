# app/core/bkt.py
from app.core.utils import p_T, p_G, p_S

class BKT:
    def __init__(self):
        self.p_T = float(p_T)  # Convert to float
        self.p_G = float(p_G)  # Convert to float
        self.p_S = float(p_S)  # Convert to float

    def update_knowledge(self, knowledge_prob: float, is_correct: bool) -> float:
        """
        Updates knowledge probability using BKT formula exactly as in pseudocode:
        if is_correct:
            numerator = knowledge_prob * (1 - p_S)
            denominator = numerator + (1 - knowledge_prob) * p_G
        else:
            numerator = knowledge_prob * p_S
            denominator = numerator + (1 - knowledge_prob) * (1 - p_G)
        p_Kn_given_action = numerator / denominator
        knowledge_prob = p_Kn_given_action + (1 - p_Kn_given_action) * p_T
        """
        # Convert Decimal to float if needed and ensure it's between 0 and 1
        knowledge_prob = min(1.0, max(0.0, float(knowledge_prob)))
        
        if is_correct:
            numerator = knowledge_prob * (1 - self.p_S)
            denominator = numerator + (1 - knowledge_prob) * self.p_G
        else:
            numerator = knowledge_prob * self.p_S
            denominator = numerator + (1 - knowledge_prob) * (1 - self.p_G)

        p_Kn_given_action = numerator / denominator if denominator else 0.0
        updated_knowledge = p_Kn_given_action + (1 - p_Kn_given_action) * self.p_T
        
        # Only ensure knowledge doesn't exceed 1.0, no minimum limit
        return round(min(1.0, updated_knowledge), 2)
