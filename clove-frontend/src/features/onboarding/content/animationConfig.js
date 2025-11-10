/**
 * @file animationConfig.js
 * @description Centralized animation timing and configuration constants for the onboarding feature.
 * Provides consistency across all animated components.
 */

export const ANIMATION_DELAYS = {
  // Entrance animation delays (in seconds)
  HEADER: 0.2,
  FORM: 0.4,
  CLASS_SELECTION: 0.6,
  FEATURE_TAG: 0.6,
  ACTIONS: 1.2,
  
  // Feature tag stagger delays
  FEATURE_TAG_BASE: 0.6,
  FEATURE_TAG_CARD_OFFSET: 0.1,
  FEATURE_TAG_ITEM_OFFSET: 0.05,
};

export const ANIMATION_DURATIONS = {
  // Transition durations (in seconds)
  PAGE_TRANSITION: 0.5,
  FADE: 0.3,
  EASE_OUT: 0.2,
  EASE_IN: 0.15,
  
  // Ripple effect (in milliseconds)
  RIPPLE: 600,
  
  // Typewriter effect (in milliseconds)
  TYPEWRITER_CHAR: 50,
};

export const ANIMATION_EASING = {
  DEFAULT: "easeOut",
  SMOOTH: "easeInOut",
};

