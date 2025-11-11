/**
 * Tour steps configuration for the post-onboarding joyride
 * Linear flow: Dashboard → My Deck → Progress → Dashboard (completion)
 * 
 * Each step includes:
 * - target: CSS selector for the target element
 * - content: Tooltip content text
 * - placement: Tooltip placement relative to target
 * - route: Required route for this step
 * - nextRoute: Optional route to navigate to after this step
 * - isLastStep: Flag indicating this is the final step
 * - disableBeacon: Disable beacon animation (default: true)
 * - spotlightClicks: Allow clicks on highlighted element (default: false)
 */

import { ROUTES, STEP_TARGETS } from './tourConstants';

export const tourSteps = [
  // ========== DASHBOARD PAGE STEPS (0-8) ==========
  
  // Step 0: Sidebar Navigation
  {
    target: STEP_TARGETS.SIDEBAR_NAV,
    content: 'Navigate between the three main sections: Dashboard, Progress, and My Deck. These are your primary learning hubs!',
    placement: 'right',
    disableBeacon: true,
    route: ROUTES.DASHBOARD,
    spotlightClicks: false,
  },
  
  // Step 1: Profile Button
  {
    target: STEP_TARGETS.PROFILE_BUTTON,
    content: 'Access your profile settings and view your account information here.',
    placement: 'left',
    disableBeacon: true,
    route: ROUTES.DASHBOARD,
    spotlightClicks: false,
  },
  
  // Step 2: Level/XP Bar
  {
    target: STEP_TARGETS.LEVEL_XP_BAR,
    content: 'Track your progress and level up! Earn points by completing lessons and challenges to advance through different tiers.',
    placement: 'bottom',
    disableBeacon: true,
    route: ROUTES.DASHBOARD,
    spotlightClicks: false,
  },
  
  // Step 3: Continue Learning Card
  {
    target: STEP_TARGETS.CONTINUE_LEARNING,
    content: 'Quickly resume your last studied topic or start a new learning journey from here.',
    placement: 'bottom',
    disableBeacon: true,
    route: ROUTES.DASHBOARD,
    spotlightClicks: false,
  },
  
  // Step 4: Your Streak Card
  {
    target: STEP_TARGETS.STREAK_CARD,
    content: 'Build your learning streak! Log in daily to maintain your streak and unlock achievements.',
    placement: 'bottom',
    disableBeacon: true,
    route: ROUTES.DASHBOARD,
    spotlightClicks: false,
  },
  
  // Step 5: Progress Overview Card
  {
    target: STEP_TARGETS.PROGRESS_OVERVIEW,
    content: 'See your overall progress across all topics. Track how much you\'ve completed in each realm.',
    placement: 'top',
    disableBeacon: true,
    route: ROUTES.DASHBOARD,
    spotlightClicks: false,
  },
  
  // Step 6: Challenges Solved Card
  {
    target: STEP_TARGETS.CHALLENGES_SOLVED,
    content: 'Monitor your challenge completion rate. Solve more challenges to improve your skills!',
    placement: 'top',
    disableBeacon: true,
    route: ROUTES.DASHBOARD,
    spotlightClicks: false,
  },
  
  // Step 7: Achievements Section
  {
    target: STEP_TARGETS.ACHIEVEMENTS,
    content: 'Unlock achievements as you progress! Complete milestones to earn badges and track your accomplishments.',
    placement: 'top',
    disableBeacon: true,
    route: ROUTES.DASHBOARD,
    spotlightClicks: false,
  },
  
  // Step 8: Completed Topics Card (last dashboard step - auto-navigate to My Deck)
  {
    target: STEP_TARGETS.COMPLETED_TOPICS,
    content: 'View all the topics you\'ve mastered. Your completed topics will appear here with achievement badges!',
    placement: 'top',
    disableBeacon: true,
    route: ROUTES.DASHBOARD,
    nextRoute: ROUTES.MY_DECK, // Auto-navigate to My Deck after this step
    spotlightClicks: false,
  },
  
  // ========== MY DECK PAGE STEPS (9-11) ==========
  
  // Step 9: First Topic Card (Data Types and Variables)
  {
    target: STEP_TARGETS.TOPIC_CARD_1,
    content: 'Start with "Data Types and Variables" - Learn about variables, data types, and how to declare and use them in programming.',
    placement: 'top',
    disableBeacon: true,
    route: ROUTES.MY_DECK,
    spotlightClicks: false,
  },
  
  // Step 10: Second Topic Card (Operators)
  {
    target: STEP_TARGETS.TOPIC_CARD_2,
    content: 'Explore "Operators" - Master different types of operators used in programming for calculations and comparisons.',
    placement: 'top',
    disableBeacon: true,
    route: ROUTES.MY_DECK,
    spotlightClicks: false,
  },
  
  // Step 11: Third Topic Card (Conditional and Loops) (last my-deck step - auto-navigate to Progress)
  {
    target: STEP_TARGETS.TOPIC_CARD_3,
    content: 'Dive into "Conditional and Loops" - Understand control flow with conditional statements and different types of loops.',
    placement: 'top',
    disableBeacon: true,
    route: ROUTES.MY_DECK,
    nextRoute: ROUTES.PROGRESS, // Auto-navigate to Progress after this step
    spotlightClicks: false,
  },
  
  // ========== PROGRESS PAGE STEPS (12-15) ==========
  
  // Step 12: Recent Activity Feed
  {
    target: STEP_TARGETS.ACTIVITY_FEED,
    content: 'View your recent learning activity! See milestones, completed subtopics, and visited realms from the last 30 days.',
    placement: 'bottom',
    disableBeacon: true,
    route: ROUTES.PROGRESS,
    spotlightClicks: false,
  },
  
  // Step 13: Learning Mode Performance
  {
    target: STEP_TARGETS.LEARNING_MODES,
    content: 'Track your performance across different learning modes: Code Completion, Code Fixer, and Output Tracing. Improve your accuracy!',
    placement: 'top',
    disableBeacon: true,
    route: ROUTES.PROGRESS,
    spotlightClicks: false,
  },
  
  // Step 14: Learning Realms Section
  {
    target: STEP_TARGETS.LEARNING_REALMS,
    content: 'Explore all learning realms and track your progress. Each realm can be mastered independently - choose your path!',
    placement: 'top',
    disableBeacon: true,
    route: ROUTES.PROGRESS,
    spotlightClicks: false,
    // Special handling: This step may need to expand the realm before showing realm-details
    requiresExpansion: true,
    expansionTarget: STEP_TARGETS.LEARNING_REALMS,
  },
  
  // Step 15: Realm Performance Analysis (last progress step - auto-navigate to Dashboard and show completion)
  {
    target: STEP_TARGETS.REALM_DETAILS,
    content: 'Dive deep into performance analysis! See your strengths, focus areas, and detailed progress for each subtopic.',
    placement: 'top',
    disableBeacon: true,
    route: ROUTES.PROGRESS,
    nextRoute: ROUTES.DASHBOARD, // Auto-navigate back to Dashboard and show completion modal
    isLastStep: true, // Flag to show completion modal
    spotlightClicks: false,
    // Special handling: May need to expand realm first
    requiresExpansion: true,
    expansionTarget: STEP_TARGETS.LEARNING_REALMS,
  },
];

/**
 * Get step by index
 * @param {number} index - Step index
 * @returns {Object|null} - Step object or null if index is invalid
 */
export const getStep = (index) => {
  if (index < 0 || index >= tourSteps.length) {
    return null;
  }
  return tourSteps[index];
};

/**
 * Get total number of steps
 * @returns {number} - Total step count
 */
export const getStepCount = () => tourSteps.length;

/**
 * Check if step is the last step
 * @param {number} index - Step index
 * @returns {boolean} - True if step is the last one
 */
export const isLastStep = (index) => {
  return index === tourSteps.length - 1 || tourSteps[index]?.isLastStep === true;
};

