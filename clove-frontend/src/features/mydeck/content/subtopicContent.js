/**
 * @file subtopicContent.js
 * @description Modular, maintainable subtopic content for all themes in the MyDeck feature.
 * Contains only UI/UX content - backend data is handled separately.
 */

// --- Icon Imports ---
// Noir (Detective)
import noirPreAss from 'assets/icons/noir/icon-pre-ass.webp';
import noirSubtopic1 from 'assets/icons/noir/icon-subtopic1.webp';
import noirSubtopic2 from 'assets/icons/noir/icon-subtopic2.webp';
import noirSubtopic3 from 'assets/icons/noir/icon-subtopic3.webp';
import noirPostAss from 'assets/icons/noir/icon-post-ass.webp';
// Wizard
import wizardPreAss from 'assets/icons/wizard/icon-pre-ass.webp';
import wizardSubtopic1 from 'assets/icons/wizard/icon-subtopic1.webp';
import wizardSubtopic2 from 'assets/icons/wizard/icon-subtopic2.webp';
import wizardSubtopic3 from 'assets/icons/wizard/icon-subtopic3.webp';
import wizardPostAss from 'assets/icons/wizard/icon-post-ass.webp';
// Space
import spacePreAss from 'assets/icons/space/icon-pre-ass.webp';
import spaceSubtopic1 from 'assets/icons/space/icon-subtopic1.webp';
import spaceSubtopic2 from 'assets/icons/space/icon-subtopic2.webp';
import spaceSubtopic3 from 'assets/icons/space/icon-subtopic3.webp';
import spacePostAss from 'assets/icons/space/icon-post-ass.webp';

/**
 * @typedef {Object} UIContent
 * @property {string} time
 * @property {string} icon
 * @property {string} theme
 * @property {string} description
 */

/**
 * @typedef {Object} TopicContent
 * @property {string} theme
 * @property {Object} story
 * @property {string[]} nodeOrder
 * @property {Object.<string, UIContent>} uiContent
 * @property {Object} styling
 */

/**
 * All subtopic content, keyed by topic number.
 * Contains only UI/UX content - backend data comes from API.
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
    uiContent: {
      'pre-assessment': {
        time: '5 min',
        icon: wizardPreAss,
        theme: 'wizard',
        description: 'Gauge your magical intuition before you begin your wizarding journey.',
      },
      'declaring-variables': {
        time: '10 min',
        icon: wizardSubtopic1,
        theme: 'wizard',
        description: 'Cast your first spell by declaring variables—your magical conduits for storing power and information.',
      },
      'primitive-data-types': {
        time: '8 min',
        icon: wizardSubtopic2,
        theme: 'wizard',
        description: 'Master the elemental essences: numbers, strings, and booleans—the building blocks of all magic.',
      },
      'non-primitive-data-types': {
        time: '12 min',
        icon: wizardSubtopic3,
        theme: 'wizard',
        description: 'Unlock advanced magical constructs—arrays, objects, and more—for complex spellwork.',
      },
      'post-assessment': {
        time: '5 min',
        icon: wizardPostAss,
        theme: 'wizard',
        description: 'Test your mastery of wizarding fundamentals after completing your magical training.',
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
      description: 'The city is shrouded in shadows, and only the sharpest minds can cut through the fog. As a code detective, you\'ll investigate the mysterious world of operators—uncovering clues, making comparisons, and piecing together logic to solve the toughest cases. Every operator is a lead, and every bug is a suspect. Can you crack the case?'
    },
    nodeOrder: [
      'pre-assessment',
      'arithmetic',
      'comparison',
      'logical',
      'post-assessment',
    ],
    uiContent: {
      'pre-assessment': {
        time: '5 min',
        icon: noirPreAss,
        theme: 'detective',
        description: 'Take a quick case review before you hit the streets as a code detective.',
      },
      'arithmetic': {
        time: '8 min',
        icon: noirSubtopic1,
        theme: 'detective',
        description: 'Crunch the numbers and follow the money—learn to use arithmetic operators to solve numeric mysteries.',
      },
      'comparison': {
        time: '8 min',
        icon: noirSubtopic2,
        theme: 'detective',
        description: 'Spot the differences and similarities—comparison operators help you make the right call.',
      },
      'logical': {
        time: '8 min',
        icon: noirSubtopic3,
        theme: 'detective',
        description: 'Combine clues and connect the dots—logical operators let you solve the toughest cases.',
      },
      'post-assessment': {
        time: '5 min',
        icon: noirPostAss,
        theme: 'detective',
        description: 'Close the case and see if you\'ve cracked the code after your investigation.',
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
      description: 'Stardate 2347.05: As Chief Systems Engineer on the SS JVM Horizon, you navigate the vast expanse of logic and repetition. Your mission: master conditionals and loops to keep the starship running smoothly through the unknown. In the cold silence of space, only the most efficient code will ensure your crew\'s survival.'
    },
    nodeOrder: [
      'pre-assessment',
      'if-else',
      'while-do-while-loop',
      'for-loop',
      'post-assessment',
    ],
    uiContent: {
      'pre-assessment': {
        time: '5 min',
        icon: spacePreAss,
        theme: 'space',
        description: 'Run a systems check before launching your mission into the unknown.',
      },
      'if-else': {
        time: '10 min',
        icon: spaceSubtopic1,
        theme: 'space',
        description: 'Plot your course through the stars—use if-else statements to make critical decisions in deep space.',
      },
      'while-do-while-loop': {
        time: '10 min',
        icon: spaceSubtopic2,
        theme: 'space',
        description: 'Keep your ship running smoothly—master while and do-while loops for repeated operations.',
      },
      'for-loop': {
        time: '10 min',
        icon: spaceSubtopic3,
        theme: 'space',
        description: 'Navigate the cosmos efficiently—use for loops to iterate through star systems and data.',
      },
      'post-assessment': {
        time: '5 min',
        icon: spacePostAss,
        theme: 'space',
        description: 'Complete your mission debrief and review your performance after the journey.',
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

/**
 * Get subtopic description by topic ID and subtopic key.
 * @param {number} topicId
 * @param {string} subtopicKey
 * @returns {string} Description or empty string if not found
 */
export const getSubtopicDescription = (topicId, subtopicKey) => {
  const topicContent = subtopicContent[topicId];
  if (topicContent && topicContent.uiContent[subtopicKey]) {
    return topicContent.uiContent[subtopicKey].description || '';
  }
  return '';
}; 