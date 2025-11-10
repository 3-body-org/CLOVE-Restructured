/**
 * @file travelerClasses.js
 * @description Configuration for traveler class options in character creation.
 * Each class represents a different learning personality and approach to coding.
 */

import { THEME_COLORS } from './themeColors';

export const travelerClasses = [
  {
    id: 'syntax-sage',
    name: 'Syntax Sage',
    description: 'Focus on learning code structure, grammar, and writing clean programs',
    icon: '⚡',
    abilities: ['Understanding Syntax', 'Structure & Organization', 'Pattern Recognition'],
    color: THEME_COLORS.GREEN.color,
    bgGradient: THEME_COLORS.GREEN.gradient
  },
  {
    id: 'logic-investigator',
    name: 'Logic Investigator',
    description: 'Specialize in problem-solving, debugging errors, and analytical thinking',
    icon: '🔍',
    abilities: ['Breaking Down Problems', 'Debugging & Testing', 'Critical Analysis'],
    color: THEME_COLORS.GOLD.color,
    bgGradient: THEME_COLORS.GOLD.gradient
  },
  {
    id: 'algorithm-explorer',
    name: 'Algorithm Explorer',
    description: 'Master efficient solutions, optimize performance, and learn computational thinking',
    icon: '🧭',
    abilities: ['Algorithm Design', 'Code Optimization', 'Efficiency Techniques'],
    color: THEME_COLORS.PURPLE.color,
    bgGradient: THEME_COLORS.PURPLE.gradient
  }
];

