/**
 * Tour steps configuration for the post-onboarding joyride
 * Guides users through Dashboard, My Deck, and Progress pages
 */

export const tourSteps = [
  // ========== DASHBOARD PAGE STEPS ==========
  
  // Step 1: Sidebar Navigation
  {
    target: '[data-joyride="sidebar-nav"]',
    content: 'Navigate between the three main sections: Dashboard, Progress, and My Deck. These are your primary learning hubs!',
    placement: 'right',
    disableBeacon: true,
    route: '/dashboard',
  },
  
  // Step 2: Profile Button
  {
    target: '[data-joyride="profile-button"]',
    content: 'Access your profile settings and view your account information here.',
    placement: 'left',
    disableBeacon: true,
    route: '/dashboard',
  },
  
  // Step 3: Level/XP Bar
  {
    target: '[data-joyride="level-xp-bar"]',
    content: 'Track your progress and level up! Earn points by completing lessons and challenges to advance through different tiers.',
    placement: 'bottom',
    disableBeacon: true,
    route: '/dashboard',
  },
  
  // Step 4: Continue Learning Card
  {
    target: '[data-joyride="continue-learning"]',
    content: 'Quickly resume your last studied topic or start a new learning journey from here.',
    placement: 'bottom',
    disableBeacon: true,
    route: '/dashboard',
  },
  
  // Step 5: Your Streak Card
  {
    target: '[data-joyride="streak-card"]',
    content: 'Build your learning streak! Log in daily to maintain your streak and unlock achievements.',
    placement: 'bottom',
    disableBeacon: true,
    route: '/dashboard',
  },
  
  // Step 6: Progress Overview Card
  {
    target: '[data-joyride="progress-overview"]',
    content: 'See your overall progress across all topics. Track how much you\'ve completed in each realm.',
    placement: 'top',
    disableBeacon: true,
    route: '/dashboard',
  },
  
  // Step 7: Challenges Solved Card
  {
    target: '[data-joyride="challenges-solved"]',
    content: 'Monitor your challenge completion rate. Solve more challenges to improve your skills!',
    placement: 'top',
    disableBeacon: true,
    route: '/dashboard',
  },
  
  // Step 8: Achievements Section
  {
    target: '[data-joyride="achievements"]',
    content: 'Unlock achievements as you progress! Complete milestones to earn badges and track your accomplishments.',
    placement: 'top',
    disableBeacon: true,
    route: '/dashboard',
  },
  
  // Step 9: Completed Topics Card
  {
    target: '[data-joyride="completed-topics"]',
    content: 'View all the topics you\'ve mastered. Your completed topics will appear here with achievement badges!',
    placement: 'top',
    disableBeacon: true,
    route: '/dashboard',
  },
  
  // Step 10: Navigate to My Deck (User clicks the link)
  {
    target: '[data-joyride="my-deck-nav-link"]',
    content: 'Click on "My Deck" in the sidebar to explore your lesson cards and start learning!',
    placement: 'right',
    disableBeacon: true,
    route: '/dashboard',
    disableOverlay: false,
  },
  
  // ========== MY DECK PAGE STEPS ==========
  
  // Step 11: First Topic Card (Data Types and Variables)
  {
    target: '[data-joyride="topic-card-1"]',
    content: 'Start with "Data Types and Variables" - Learn about variables, data types, and how to declare and use them in programming.',
    placement: 'top',
    disableBeacon: true,
    route: '/my-deck',
  },
  
  // Step 12: Second Topic Card (Operators)
  {
    target: '[data-joyride="topic-card-2"]',
    content: 'Explore "Operators" - Master different types of operators used in programming for calculations and comparisons.',
    placement: 'top',
    disableBeacon: true,
    route: '/my-deck',
  },
  
  // Step 13: Third Topic Card (Conditional and Loops)
  {
    target: '[data-joyride="topic-card-3"]',
    content: 'Dive into "Conditional and Loops" - Understand control flow with conditional statements and different types of loops.',
    placement: 'top',
    disableBeacon: true,
    route: '/my-deck',
  },
  
  // Step 14: Navigate to Progress (User clicks the link)
  {
    target: '[data-joyride="progress-nav-link"]',
    content: 'Click on "Progress" in the sidebar to view your detailed learning statistics and track your mastery!',
    placement: 'right',
    disableBeacon: true,
    route: '/my-deck',
    disableOverlay: false,
  },
  
  // ========== PROGRESS PAGE STEPS ==========
  
  // Step 15: Recent Activity Feed
  {
    target: '[data-joyride="activity-feed"]',
    content: 'View your recent learning activity! See milestones, completed subtopics, and visited realms from the last 30 days.',
    placement: 'bottom',
    disableBeacon: true,
    route: '/progress',
  },
  
  // Step 16: Learning Mode Performance
  {
    target: '[data-joyride="learning-modes"]',
    content: 'Track your performance across different learning modes: Code Completion, Code Fixer, and Output Tracing. Improve your accuracy!',
    placement: 'top',
    disableBeacon: true,
    route: '/progress',
  },
  
  // Step 17: Learning Realms Section
  {
    target: '[data-joyride="learning-realms"]',
    content: 'Explore all learning realms and track your progress. Each realm can be mastered independently - choose your path!',
    placement: 'top',
    disableBeacon: true,
    route: '/progress',
  },
  
  // Step 18: Realm Performance Analysis
  {
    target: '[data-joyride="realm-details"]',
    content: 'Dive deep into performance analysis! See your strengths, focus areas, and detailed progress for each subtopic.',
    placement: 'top',
    disableBeacon: true,
    route: '/progress',
  },
];

