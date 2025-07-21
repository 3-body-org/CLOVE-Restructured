/**
 * @file subtopicContent.js
 * @description Modular, maintainable subtopic content for all themes in the MyDeck feature.
 * Each topic contains theme, story, node order, subtopics, and styling.
 */

// --- Icon Imports ---
// Common
import placeholderIconPath from 'assets/icons/common/icon-placeholder.svg';
// Noir (Detective)
import noirPreAss from 'assets/icons/noir/icon-pre-ass.svg';
import noirSubtopic1 from 'assets/icons/noir/icon-subtopic1.svg';
import noirSubtopic2 from 'assets/icons/noir/icon-subtopic2.svg';
import noirSubtopic3 from 'assets/icons/noir/icon-subtopic3.svg';
import noirPostAss from 'assets/icons/noir/icon-post-ass.svg';
// Wizard
import wizardPreAss from 'assets/icons/wizard/icon-pre-ass.svg';
import wizardSubtopic1 from 'assets/icons/wizard/icon-subtopic1.svg';
import wizardSubtopic2 from 'assets/icons/wizard/icon-subtopic2.svg';
import wizardSubtopic3 from 'assets/icons/wizard/icon-subtopic3.svg';
import wizardPostAss from 'assets/icons/wizard/icon-post-ass.svg';
// Space
import spacePreAss from 'assets/icons/space/icon-pre-ass.svg';
import spaceSubtopic1 from 'assets/icons/space/icon-subtopic1.svg';
import spaceSubtopic2 from 'assets/icons/space/icon-subtopic2.svg';
import spaceSubtopic3 from 'assets/icons/space/icon-subtopic3.svg';
import spacePostAss from 'assets/icons/space/icon-post-ass.svg';

/**
 * @typedef {Object} Subtopic
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} time
 * @property {string} icon
 * @property {string|null} requires
 */

/**
 * @typedef {Object} TopicContent
 * @property {string} theme
 * @property {Object} story
 * @property {string[]} nodeOrder
 * @property {Object.<string, Subtopic>} subtopics
 * @property {Object} styling
 */

/**
 * All subtopic content, keyed by topic number.
 * @type {Object.<number, TopicContent>}
 */
export const subtopicContent = {
  1: {
    theme: 'wizard',
    story: {
      title: 'The Arcane Academy',
      description: 'Step into the hallowed halls of the Arcane Academy, where aspiring wizards master the secrets of variables and data types. Here, every incantation is a line of code, and every lesson brings you closer to becoming a true sorcerer of software. Prepare to unlock the fundamental building blocks of magic and logic!'
    },
    nodeOrder: [
      'pre-assessment',
      'declaring-variables',
      'primitive-data-types',
      'non-primitive-data-types',
      'post-assessment',
    ],
    subtopics: {
      'pre-assessment': {
        id: 'preassessment',
        title: 'Pre-Assessment',
        description: 'Gauge your magical intuition before you begin your wizarding journey.',
        time: '5 min',
        icon: wizardPreAss,
        requires: null,
      },
      'declaring-variables': {
        id: 'declaringvariables',
        title: 'Declaring Variables',
        description: 'Cast your first spell by declaring variables—your magical conduits for storing power and information.',
        time: '10 min',
        icon: wizardSubtopic1,
        requires: 'pre-assessment',
      },
      'primitive-data-types': {
        id: 'primitivedatatypes',
        title: 'Primitive Data Types',
        description: 'Master the elemental essences: numbers, strings, and booleans—the building blocks of all magic.',
        time: '8 min',
        icon: wizardSubtopic2,
        requires: 'declaring-variables',
      },
      'non-primitive-data-types': {
        id: 'nonprimitivedatatypes',
        title: 'Non-Primitive Data Types',
        description: 'Unlock advanced magical constructs—arrays, objects, and more—for complex spellwork.',
        time: '12 min',
        icon: wizardSubtopic3,
        requires: 'primitive-data-types',
      },
      'post-assessment': {
        id: 'postassessment',
        title: 'Post-Assessment',
        description: 'Test your mastery of wizarding fundamentals after completing your magical training.',
        time: '5 min',
        icon: wizardPostAss,
        requires: 'non-primitive-data-types',
      },
    },
    styling: {
      background: 'fog',
      effect: 'rainfall',
      colors: {
        primary: '#00bcd4',
        secondary: '#f4e04d',
        accent: '#2b2f38',
        bg: '#121212',
        text: '#dcdcdc',
      },
    },
  },
  2: {
    theme: 'detective',
    story: {
      title: 'Noir Investigation',
      description: 'The city is shrouded in shadows, and only the sharpest minds can cut through the fog. As a code detective, you’ll investigate the mysterious world of operators—uncovering clues, making comparisons, and piecing together logic to solve the toughest cases. Every operator is a lead, and every bug is a suspect. Can you crack the case?'
    },
    nodeOrder: [
      'pre-assessment',
      'arithmetic',
      'comparison',
      'logical',
      'post-assessment',
    ],
    subtopics: {
      'pre-assessment': {
        id: 'preassessment',
        title: 'Pre-Assessment',
        description: 'Take a quick case review before you hit the streets as a code detective.',
        time: '5 min',
        icon: noirPreAss,
        requires: null,
      },
      'arithmetic': {
        id: 'arithmetic',
        title: 'Arithmetic',
        description: 'Crunch the numbers and follow the money—learn to use arithmetic operators to solve numeric mysteries.',
        time: '8 min',
        icon: noirSubtopic1,
        requires: 'pre-assessment',
      },
      'comparison': {
        id: 'comparison',
        title: 'Comparison',
        description: 'Spot the differences and similarities—comparison operators help you make the right call.',
        time: '8 min',
        icon: noirSubtopic2,
        requires: 'arithmetic',
      },
      'logical': {
        id: 'logical',
        title: 'Logical',
        description: 'Combine clues and connect the dots—logical operators let you solve the toughest cases.',
        time: '8 min',
        icon: noirSubtopic3,
        requires: 'comparison',
      },
      'post-assessment': {
        id: 'postassessment',
        title: 'Post-Assessment',
        description: 'Close the case and see if you’ve cracked the code after your investigation.',
        time: '5 min',
        icon: noirPostAss,
        requires: 'logical',
      },
    },
    styling: {
      background: 'fog',
      effect: 'rainfall',
      colors: {
        primary: '#232323',
        secondary: '#a99fcc',
        accent: '#d1b773',
        bg: '#181818',
        text: '#e0dfdb',
      },
    },
  },
  3: {
    theme: 'space',
    story: {
      title: 'Mission Briefing',
      description: 'Stardate 2347.05: As Chief Systems Engineer on the SS JVM Horizon, you navigate the vast expanse of logic and repetition. Your mission: master conditionals and loops to keep the starship running smoothly through the unknown. In the cold silence of space, only the most efficient code will ensure your crew’s survival.'
    },
    nodeOrder: [
      'pre-assessment',
      'if-else',
      'while-do-while-loop',
      'for-loop',
      'post-assessment',
    ],
    subtopics: {
      'pre-assessment': {
        id: 'preassessment',
        title: 'Pre-Assessment',
        description: 'Run a systems check before launching your mission into the unknown.',
        time: '5 min',
        icon: spacePreAss,
        requires: null,
      },
      'if-else': {
        id: 'ifelse',
        title: 'If-Else',
        description: 'Plot your course through the stars—use if-else statements to make critical decisions in deep space.',
        time: '10 min',
        icon: spaceSubtopic1,
        requires: 'pre-assessment',
      },
      'while-do-while-loop': {
        id: 'whiledowhileloop',
        title: 'While and Do While Loop',
        description: 'Keep your ship running smoothly—master while and do-while loops for repeated operations.',
        time: '10 min',
        icon: spaceSubtopic2,
        requires: 'if-else',
      },
      'for-loop': {
        id: 'forloop',
        title: 'For Loop',
        description: 'Navigate the cosmos efficiently—use for loops to iterate through star systems and data.',
        time: '10 min',
        icon: spaceSubtopic3,
        requires: 'while-do-while-loop',
      },
      'post-assessment': {
        id: 'postassessment',
        title: 'Post-Assessment',
        description: 'Complete your mission debrief and review your performance after the journey.',
        time: '5 min',
        icon: spacePostAss,
        requires: 'for-loop',
      },
    },
    styling: {
      background: 'stars',
      effect: 'starfield',
      colors: {
        primary: '#6c5ce7',
        secondary: '#ff7675',
        accent: '#a8a5e6',
        bg: '#0a0a1a',
        text: '#ffffff',
      },
    },
  },
};

/**
 * Get content for a specific topic (by id or slug).
 * @param {number|string} topicKey
 * @returns {TopicContent}
 */
export const getSubtopicContent = (topicKey) => {
  // Try numeric id first
  if (subtopicContent[topicKey]) {
    return subtopicContent[topicKey];
  }
  // Try slug mapping if needed (add if you want slug support)
  return subtopicContent[1]; // fallback to topic 1
};

/**
 * Get all available topic keys.
 * @returns {string[]}
 */
export const getAvailableTopics = () => Object.keys(subtopicContent); 