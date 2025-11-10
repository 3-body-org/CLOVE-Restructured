/**
 * Realm Theme Configuration
 * Centralized configuration for realm themes, colors, and status logic
 */

// Theme type constants
export const THEME_TYPES = {
  WIZARD: 'wizard',
  DETECTIVE: 'detective',
  SPACE: 'space',
  DEFAULT: 'default'
};

// Theme color configurations
export const THEME_COLORS = {
  [THEME_TYPES.WIZARD]: {
    color: '#10b981',
    shadowColor: 'rgba(16, 185, 129, 0.4)'
  },
  [THEME_TYPES.DETECTIVE]: {
    color: '#d1b773',
    shadowColor: 'rgba(209, 183, 115, 0.4)'
  },
  [THEME_TYPES.SPACE]: {
    color: '#8b5cf6',
    shadowColor: 'rgba(139, 92, 246, 0.4)'
  },
  [THEME_TYPES.DEFAULT]: {
    color: '#6b7280',
    shadowColor: 'rgba(107, 114, 128, 0.4)'
  }
};

// Status configuration
export const STATUS_TYPES = {
  COMPLETED: 'completed',
  IN_PROGRESS: 'inProgress',
  NOT_STARTED: 'notStarted'
};

/**
 * Determines the theme type based on topic title or explicit theme
 * @param {string} topicTitle - The title of the topic
 * @param {string} topicTheme - Explicit theme if available
 * @returns {string} Theme type (wizard, detective, space, or default)
 */
export const getRealmTheme = (topicTitle, topicTheme) => {
  // If explicit theme is provided, use it
  if (topicTheme && Object.values(THEME_TYPES).includes(topicTheme)) {
    return topicTheme;
  }
  
  // Otherwise, detect from topic title
  if (!topicTitle) return THEME_TYPES.DEFAULT;
  
  const lowerTopic = topicTitle.toLowerCase();
  
  // Wizard Theme - Data Types and Variables
  if (lowerTopic.includes('data types') || lowerTopic.includes('variables')) {
    return THEME_TYPES.WIZARD;
  }
  
  // Detective Theme - Operators
  if (lowerTopic.includes('operator')) {
    return THEME_TYPES.DETECTIVE;
  }
  
  // Space Theme - Conditional and Loops
  if (lowerTopic.includes('conditional') || lowerTopic.includes('loop')) {
    return THEME_TYPES.SPACE;
  }
  
  return THEME_TYPES.DEFAULT;
};

/**
 * Gets theme colors for a given theme type
 * @param {string} themeType - The theme type
 * @returns {Object} Theme colors object with color and shadowColor
 */
export const getThemeColors = (themeType) => {
  return THEME_COLORS[themeType] || THEME_COLORS[THEME_TYPES.DEFAULT];
};

/**
 * Determines the realm status based on progress percentage
 * @param {number} progress - Progress percentage (0-100)
 * @returns {Object} Status object with type, isCompleted, and isInProgress flags
 */
export const getRealmStatus = (progress) => {
  const isCompleted = progress === 100;
  const isInProgress = progress >= 1 && progress < 100;
  
  return {
    type: isCompleted ? STATUS_TYPES.COMPLETED : isInProgress ? STATUS_TYPES.IN_PROGRESS : STATUS_TYPES.NOT_STARTED,
    isCompleted,
    isInProgress
  };
};

