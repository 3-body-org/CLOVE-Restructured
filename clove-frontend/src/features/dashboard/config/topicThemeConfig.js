/**
 * Topic Theme Configuration
 * Centralized configuration for topic themes, colors, and status logic
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
    color: '#0EA5E9',
    bgGradient: 'linear-gradient(135deg, #0EA5E9, #06B6D4)'
  },
  [THEME_TYPES.DETECTIVE]: {
    color: '#d1b773',
    bgGradient: 'linear-gradient(135deg, #d1b773, #c9b08a)'
  },
  [THEME_TYPES.SPACE]: {
    color: '#8b5cf6',
    bgGradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
  },
  [THEME_TYPES.DEFAULT]: {
    color: '#6b7280',
    bgGradient: 'linear-gradient(135deg, #6b7280, #4b5563)'
  }
};

// Status configuration
export const STATUS_CONFIG = {
  COMPLETED: {
    status: 'Completed',
    icon: '✓',
    threshold: 100
  },
  IN_PROGRESS: {
    status: 'In Progress',
    icon: '⚡',
    threshold: 0 // > 0 and < 100
  },
  NOT_STARTED: {
    status: 'Not Started',
    icon: '🔒',
    threshold: 0
  }
};

/**
 * Determines the theme type based on topic name
 * @param {string} topicName - The name of the topic
 * @returns {string} Theme type (wizard, detective, space, or default)
 */
export const getTopicTheme = (topicName) => {
  if (!topicName) return THEME_TYPES.DEFAULT;
  
  const lowerTopic = topicName.toLowerCase();
  
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
 * @returns {Object} Theme colors object with color and bgGradient
 */
export const getThemeColors = (themeType) => {
  return THEME_COLORS[themeType] || THEME_COLORS[THEME_TYPES.DEFAULT];
};

/**
 * Determines the status based on completion percentage
 * @param {number} percentage - Completion percentage (0-100)
 * @returns {Object} Status object with status text and icon
 */
export const getStatus = (percentage) => {
  if (percentage === 100) {
    return STATUS_CONFIG.COMPLETED;
  }
  if (percentage > 0 && percentage < 100) {
    return STATUS_CONFIG.IN_PROGRESS;
  }
  return STATUS_CONFIG.NOT_STARTED;
};

/**
 * Gets complete theme configuration for a topic
 * @param {string} topicName - The name of the topic
 * @param {number} percentage - Completion percentage
 * @returns {Object} Complete theme object with colors, status, and icon
 */
export const getTopicThemeConfig = (topicName, percentage) => {
  const themeType = getTopicTheme(topicName);
  const themeColors = getThemeColors(themeType);
  const status = getStatus(percentage);
  
  return {
    ...themeColors,
    ...status,
    themeType
  };
};

