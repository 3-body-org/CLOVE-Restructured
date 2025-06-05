# app/core/rl.py

import random
import numpy as np
from app.core.utils import (
    alpha, gamma, epsilon, epsilon_decay, min_epsilon,
    CHALLENGE_TYPES, initialize_q_table
)

class QLearning:
    def __init__(self):
        self.alpha = float(alpha)
        self.gamma = float(gamma)
        self.epsilon = float(epsilon)  # Convert to float
        self.epsilon_decay = float(epsilon_decay)
        self.min_epsilon = float(min_epsilon)
        self.q_table = {}  # keys: state tuples, values: dict(action→q)

    def get_q_values(self, state):
        """Get Q-values for a given state"""
        return self.q_table.get(state, {})

    def initialize_state(self, state, actions=None):
        """Initialize Q-values for a state if it doesn't exist"""
        if state not in self.q_table:
            actions = actions or CHALLENGE_TYPES
            self.q_table[state] = {action: random.uniform(-1, 1) for action in actions}

    def select_action(self, state):
        """
        Select action using epsilon-greedy policy exactly as in pseudocode:
        if np.random.random() < epsilon:
            return np.random.choice(CHALLENGE_TYPES)  # Exploration
        else:
            return max(Q[state], key=Q[state].get)  # Exploitation
        """
        state_key = str(state)
        if state_key not in self.q_table:
            self.q_table[state_key] = {action: random.uniform(-1, 1) for action in CHALLENGE_TYPES}
        
        if random.random() < self.epsilon:
            return random.choice(CHALLENGE_TYPES)  # Exploration
        return max(self.q_table[state_key], key=self.q_table[state_key].get)  # Exploitation

    def update_q_value(self, current_state, action, reward, next_state):
        """
        Update Q-value using Q-learning update rule exactly as in pseudocode:
        old_q = Q[current_state][challenge_type]
        max_future_q = max(Q[next_state].values())
        Q[current_state][challenge_type] = old_q + alpha * (reward + gamma * max_future_q - old_q)
        """
        current_state_key = str(current_state)
        next_state_key = str(next_state)
        
        # Initialize states if they don't exist
        if current_state_key not in self.q_table:
            self.q_table[current_state_key] = {action: random.uniform(-1, 1) for action in CHALLENGE_TYPES}
        if next_state_key not in self.q_table:
            self.q_table[next_state_key] = {action: random.uniform(-1, 1) for action in CHALLENGE_TYPES}
        
        # Get current Q-value and max future Q-value
        old_q = self.q_table[current_state_key][action]
        max_future_q = max(self.q_table[next_state_key].values())
        
        # Update Q-value for current state and action
        self.q_table[current_state_key][action] = old_q + self.alpha * (
            reward + self.gamma * max_future_q - old_q
        )

    def decay_epsilon(self):
        """
        Decay exploration rate exactly as in pseudocode:
        epsilon = max(epsilon * epsilon_decay, min_epsilon)
        """
        # Convert epsilon to float if it's a Decimal
        self.epsilon = float(self.epsilon)
        self.epsilon = round(max(self.min_epsilon, self.epsilon * self.epsilon_decay), 2)
