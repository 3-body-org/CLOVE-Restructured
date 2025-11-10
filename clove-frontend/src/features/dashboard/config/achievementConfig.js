// Achievement configuration constants
export const ACHIEVEMENT_DEFINITIONS = {
  STREAK: {
    THREE_DAYS: { threshold: 3, name: 'Getting Warmed Up', description: 'Maintain a 3-day streak', icon: '🔥', rarity: 'common' },
    SEVEN_DAYS: { threshold: 7, name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', rarity: 'rare' },
    THIRTY_DAYS: { threshold: 30, name: 'Unstoppable', description: 'Maintain a 30-day streak', icon: '⚡', rarity: 'legendary' }
  },
  CHALLENGES: {
    TEN: { threshold: 10, name: 'Challenge Starter', description: 'Solve 10 challenges', icon: '🎯', rarity: 'common' },
    FIFTY: { threshold: 50, name: 'Challenge Master', description: 'Solve 50 challenges', icon: '🏆', rarity: 'epic' },
    HUNDRED: { threshold: 100, name: 'Centurion', description: 'Solve 100 challenges', icon: '👑', rarity: 'legendary' }
  },
  TOPICS: {
    ONE: { threshold: 1, name: 'First Steps', description: 'Complete your first topic', icon: '🌟', rarity: 'common' },
    TWO: { threshold: 2, name: 'Knowledge Seeker', description: 'Complete 2 topics', icon: '📚', rarity: 'rare' },
    ALL: { threshold: 3, name: 'Master of All', description: 'Complete all 3 topics', icon: '🎓', rarity: 'epic' }
  },
  ACCURACY: {
    SEVENTY_FIVE: { threshold: 75, name: 'Sharp Shooter', description: 'Achieve 75% average accuracy', icon: '🎯', rarity: 'rare' },
    NINETY: { threshold: 90, name: 'Perfectionist', description: 'Achieve 90% average accuracy', icon: '💯', rarity: 'epic' }
  }
};

// Rarity configuration
export const RARITY_CONFIG = {
  common: { 
    color: '#8b5cf6', 
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', 
    glow: 'rgba(139, 92, 246, 0.4)', 
    particle: '#8b5cf6' 
  },
  rare: { 
    color: '#3b82f6', 
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
    glow: 'rgba(59, 130, 246, 0.4)', 
    particle: '#3b82f6' 
  },
  epic: { 
    color: '#a855f7', 
    gradient: 'linear-gradient(135deg, #a855f7, #9333ea)', 
    glow: 'rgba(168, 85, 247, 0.4)', 
    particle: '#a855f7' 
  },
  legendary: { 
    color: '#f59e0b', 
    gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)', 
    glow: 'rgba(245, 158, 11, 0.4)', 
    particle: '#fbbf24' 
  }
};

// Animation constants
export const ANIMATION_CONFIG = {
  HEXAGON_COUNT: 10,
  TROPHY_COUNT: 6,
  ORB_COUNT: 3,
  PROGRESS_PARTICLE_COUNT: 4,
  FLOATING_PARTICLE_COUNT: 4,
  CELEBRATION_PARTICLE_COUNT: 8,
  SPARKLE_COUNT: 6,
  ANIMATION_DURATION: {
    HEXAGON: { min: 8, max: 13 },
    TROPHY: { min: 4, max: 6 },
    ORB: { min: 10, max: 13 },
    PROGRESS_PARTICLE: 2,
    FLOATING_PARTICLE: { min: 2, max: 2.8 }
  }
};

