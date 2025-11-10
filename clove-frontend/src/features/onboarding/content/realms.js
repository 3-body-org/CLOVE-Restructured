/**
 * @file realms.js
 * @description Configuration for realm options in realm selection.
 * Each realm represents a different themed learning environment.
 * Note: Preview components are passed in from the component due to JSX requirements.
 */

import { THEME_COLORS } from './themeColors';

export const getRealms = (previewComponents) => [
  {
    id: 'wizard-academy',
    name: 'Wizard Academy',
    description: 'Master the ancient art of Code Magic',
    story: 'The legendary academy where syntax becomes spells and logic becomes magic. Here, you will learn to cast powerful code spells and summon solutions from the digital realm.',
    mentor: 'Master Gandalf the Code Wizard',
    difficulty: 'Beginner',
    theme: 'wizard',
    color: THEME_COLORS.GREEN.color,
    bgGradient: THEME_COLORS.GREEN.gradient,
    features: ['Spell Casting', 'Magic Syntax', 'Mystical Debugging'],
    preview: previewComponents.WizardAcademyPreview
  },
  {
    id: 'detective-agency',
    name: 'Detective Agency',
    description: 'Solve mysteries and catch code criminals',
    story: 'In the neon-lit streets of Code City, bugs lurk in the shadows. As a detective, you must use your analytical skills to solve complex cases and bring justice to the digital world.',
    mentor: 'Detective Sherlock of the Code Division',
    difficulty: 'Intermediate',
    theme: 'detective',
    color: THEME_COLORS.GOLD.color,
    bgGradient: THEME_COLORS.GOLD.gradient,
    features: ['Case Solving', 'Evidence Analysis', 'Crime Investigation'],
    preview: previewComponents.DetectiveAgencyPreview
  },
  {
    id: 'space-station',
    name: 'Space Station Alpha',
    description: 'Command the systems of a futuristic space station',
    story: 'The space station Alpha is your new home. As the programming officer, you must maintain the ship\'s systems, debug critical errors, and ensure the safety of your crew in the vastness of space.',
    mentor: 'Captain Nova, Chief Systems Officer',
    difficulty: 'Advanced',
    theme: 'space',
    color: THEME_COLORS.PURPLE.color,
    bgGradient: THEME_COLORS.PURPLE.gradient,
    features: ['System Control', 'Space Navigation', 'Crew Management'],
    preview: previewComponents.SpaceStationPreview
  }
];

