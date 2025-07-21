/**
 * @file topics.js
 * @description Topics data for the MyDeck feature. Each topic includes id, slug, title, theme, description, icon, and subtopics.
 */

/**
 * @typedef {Object} TopicSubtopic
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {boolean} completed
 */

/**
 * @typedef {Object} Topic
 * @property {number} id
 * @property {string} slug
 * @property {string} title
 * @property {string} theme
 * @property {string} description
 * @property {string} icon
 * @property {TopicSubtopic[]} subtopics
 */

/**
 * All topics for MyDeck, aligned with subtopicContent structure.
 * @type {Topic[]}
 */
export const topicsData = [
  {
    id: 1,
    slug: 'data-types-and-variables',
    title: 'Data Types and Variables',
    theme: 'wizard',
    description: 'Understanding variables and different data types',
    icon: 'code',
    subtopics: [
      {
        id: 'pre-assessment',
        title: 'Pre-Assessment',
        description: 'Gauge your magical intuition before you begin your wizarding journey.',
        completed: false,
      },
      {
        id: 'declaring-variables',
        title: 'Declaring Variables',
        description: 'Cast your first spell by declaring variables—your magical conduits for storing power and information.',
        completed: false,
      },
      {
        id: 'primitive-data-types',
        title: 'Primitive Data Types',
        description: 'Master the elemental essences: numbers, strings, and booleans—the building blocks of all magic.',
        completed: false,
      },
      {
        id: 'non-primitive-data-types',
        title: 'Non-Primitive Data Types',
        description: 'Unlock advanced magical constructs—arrays, objects, and more—for complex spellwork.',
        completed: false,
      },
      {
        id: 'post-assessment',
        title: 'Post-Assessment',
        description: 'Test your mastery of wizarding fundamentals after completing your magical training.',
        completed: false,
      },
    ],
  },
  {
    id: 2,
    slug: 'operators',
    title: 'Operators',
    theme: 'detective',
    description: 'Investigate the mysterious world of operators—arithmetic, comparison, and logical.',
    icon: 'globe',
    subtopics: [
      {
        id: 'pre-assessment',
        title: 'Pre-Assessment',
        description: 'Take a quick case review before you hit the streets as a code detective.',
        completed: false,
      },
      {
        id: 'arithmetic',
        title: 'Arithmetic',
        description: 'Crunch the numbers and follow the money—learn to use arithmetic operators to solve numeric mysteries.',
        completed: false,
      },
      {
        id: 'comparison',
        title: 'Comparison',
        description: 'Spot the differences and similarities—comparison operators help you make the right call.',
        completed: false,
      },
      {
        id: 'logical',
        title: 'Logical',
        description: 'Combine clues and connect the dots—logical operators let you solve the toughest cases.',
        completed: false,
      },
      {
        id: 'post-assessment',
        title: 'Post-Assessment',
        description: 'Close the case and see if you’ve cracked the code after your investigation.',
        completed: false,
      },
    ],
  },
  {
    id: 3,
    slug: 'control-flow',
    title: 'Control Flow',
    theme: 'space',
    description: 'Master conditionals and loops to keep the starship running smoothly through the unknown.',
    icon: 'puzzle-piece',
    subtopics: [
      {
        id: 'pre-assessment',
        title: 'Pre-Assessment',
        description: 'Run a systems check before launching your mission into the unknown.',
        completed: false,
      },
      {
        id: 'if-else',
        title: 'If-Else',
        description: 'Plot your course through the stars—use if-else statements to make critical decisions in deep space.',
        completed: false,
      },
      {
        id: 'while-do-while-loop',
        title: 'While and Do While Loop',
        description: 'Keep your ship running smoothly—master while and do-while loops for repeated operations.',
        completed: false,
      },
      {
        id: 'for-loop',
        title: 'For Loop',
        description: 'Navigate the cosmos efficiently—use for loops to iterate through star systems and data.',
        completed: false,
      },
      {
        id: 'post-assessment',
        title: 'Post-Assessment',
        description: 'Complete your mission debrief and review your performance after the journey.',
        completed: false,
      },
    ],
  },
];

export default topicsData;
