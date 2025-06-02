# app/core/rl.py

import random

class QLearning:
    def __init__(self, alpha=0.1, gamma=0.9, epsilon=0.8, epsilon_decay=0.95, min_epsilon=0.1):
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_decay = epsilon_decay
        self.min_epsilon = min_epsilon
        self.q_table = {}  # keys: state tuples, values: dict(action→q)

    def get_q_values(self, state):
        return self.q_table.get(state, {})

    def initialize_state(self, state, actions):
        if state not in self.q_table:
            self.q_table[state] = {action: random.uniform(-1, 1) for action in actions}

    def select_action(self, state, actions):
        self.initialize_state(state, actions)
        if random.random() < self.epsilon:
            return random.choice(actions)
        return max(self.q_table[state], key=self.q_table[state].get)

    def update_q_value(self, state, action, reward, next_state):
        # Ensure states exist
        self.initialize_state(state, list(self.q_table.get(state, {}).keys()))
        self.initialize_state(next_state, list(self.q_table.get(state, {}).keys()))
        max_future_q = max(self.q_table[next_state].values())
        current_q = self.q_table[state][action]
        self.q_table[state][action] = current_q + self.alpha * (reward + self.gamma * max_future_q - current_q)

    def decay_epsilon(self):
        self.epsilon = max(self.min_epsilon, self.epsilon * self.epsilon_decay)
