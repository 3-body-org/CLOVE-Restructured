/**
 * Constants and configuration values for Joyride tour
 * Centralizes all magic numbers and configuration
 */

// Timeout values (in milliseconds)
export const TIMEOUTS = {
  ELEMENT_WAIT: 5000, // Maximum time to wait for element to appear
  NAVIGATION_DELAY: 300, // Delay after navigation before advancing step
  COMPLETION_DELAY: 500, // Delay before showing completion modal
  VISIBILITY_CHECK: 100, // Interval for checking element visibility
  STEP_VALIDATION: 2000, // Timeout for step validation
};

// Z-index values
export const Z_INDEX = {
  JOYRIDE: 10000,
  COMPLETION_MODAL: 10001,
};

// Colors (matching app theme)
export const COLORS = {
  PRIMARY: '#8b5cf6',
  TEXT: '#ffffff',
  BACKGROUND: '#1a1a2e',
  OVERLAY: 'rgba(0, 0, 0, 0.7)',
  ARROW: '#8b5cf6',
  BUTTON_SKIP: '#a0a0a0',
};

// Tour configuration
export const TOUR_CONFIG = {
  CONTINUOUS: true,
  SHOW_PROGRESS: true,
  SHOW_SKIP_BUTTON: true,
  DISABLE_OVERLAY_CLOSE: true,
  DISABLE_SCROLLING: false,
  SPOTLIGHT_CLICKS: false, // Allow clicks on highlighted elements
  SPOTLIGHT_PADDING: 5, // Padding around spotlight
};

// Locale strings
export const LOCALE = {
  back: 'Back',
  close: 'Close',
  last: 'Finish',
  next: 'Next',
  skip: 'Skip Tour',
};

// Step validation options
export const VALIDATION_OPTIONS = {
  WAIT_FOR_ELEMENTS: false, // Don't wait by default (let hooks handle it)
  WAIT_TIMEOUT: TIMEOUTS.STEP_VALIDATION,
  STRICT: true, // Fail if any step is invalid
};

// Special step identifiers
export const STEP_TARGETS = {
  SIDEBAR_NAV: '[data-joyride="sidebar-nav"]',
  PROFILE_BUTTON: '[data-joyride="profile-button"]',
  LEVEL_XP_BAR: '[data-joyride="level-xp-bar"]',
  CONTINUE_LEARNING: '[data-joyride="continue-learning"]',
  STREAK_CARD: '[data-joyride="streak-card"]',
  PROGRESS_OVERVIEW: '[data-joyride="progress-overview"]',
  CHALLENGES_SOLVED: '[data-joyride="challenges-solved"]',
  ACHIEVEMENTS: '[data-joyride="achievements"]',
  COMPLETED_TOPICS: '[data-joyride="completed-topics"]',
  TOPIC_CARD_1: '[data-joyride="topic-card-1"]',
  TOPIC_CARD_2: '[data-joyride="topic-card-2"]',
  TOPIC_CARD_3: '[data-joyride="topic-card-3"]',
  ACTIVITY_FEED: '[data-joyride="activity-feed"]',
  LEARNING_MODES: '[data-joyride="learning-modes"]',
  LEARNING_REALMS: '[data-joyride="learning-realms"]',
  REALM_DETAILS: '[data-joyride="realm-details"]',
};

// Routes
export const ROUTES = {
  DASHBOARD: '/dashboard',
  MY_DECK: '/my-deck',
  PROGRESS: '/progress',
};

