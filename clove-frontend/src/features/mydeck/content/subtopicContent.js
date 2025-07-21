// Modular, maintainable subtopic content for all themes
// To add a new theme or subtopic, copy the structure below and fill in the details.
// To add new fields, add them to the subtopic objects as needed.

import placeholderIconPath from 'assets/icons/common/icon-placeholder.svg';
import noirPreAss from 'assets/icons/noir/icon-pre-ass.svg';
import noirSubtopic1 from 'assets/icons/noir/icon-subtopic1.svg';
import noirSubtopic2 from 'assets/icons/noir/icon-subtopic2.svg';
import noirSubtopic3 from 'assets/icons/noir/icon-subtopic3.svg';
import noirPostAss from 'assets/icons/noir/icon-post-ass.svg';

// Topic-based subtopic content
export const subtopicContent = {
  1: { // Topic 1: Data Types and Variables (wizard)
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
        description: 'Test your knowledge before starting the course.',
        time: '5 min',
        icon: placeholderIconPath,
        requires: null,
      },
      'declaring-variables': {
        id: 'declaringvariables',
        title: 'Declaring Variables',
        description: 'Learn to declare your magical intentions with precise incantations.',
        time: '10 min',
        icon: placeholderIconPath,
        requires: 'pre-assessment',
      },
      'primitive-data-types': {
        id: 'primitivedatatypes',
        title: 'Primitive Data Types',
        description: 'Harness the basic building blocks of magic - numbers, strings, booleans.',
        time: '8 min',
        icon: placeholderIconPath,
        requires: 'declaring-variables',
      },
      'non-primitive-data-types': {
        id: 'nonprimitivedatatypes',
        title: 'Non-Primitive Data Types',
        description: 'Master complex spells and magical constructs.',
        time: '12 min',
        icon: placeholderIconPath,
        requires: 'primitive-data-types',
      },
      'post-assessment': {
        id: 'postassessment',
        title: 'Post-Assessment',
        description: 'Test your knowledge after completing the course.',
        time: '5 min',
        icon: placeholderIconPath,
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
  2: { // Topic 2: Operators (detective)
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
        description: 'Test your knowledge before starting the course.',
        time: '5 min',
        icon: noirPreAss,
        requires: null,
      },
      'arithmetic': {
        id: 'arithmetic',
        title: 'Arithmetic',
        description: 'Learn about arithmetic operators for calculations.',
        time: '8 min',
        icon: noirSubtopic1,
        requires: 'pre-assessment',
      },
      'comparison': {
        id: 'comparison',
        title: 'Comparison',
        description: 'Understand comparison operators for making decisions.',
        time: '8 min',
        icon: noirSubtopic2,
        requires: 'arithmetic',
      },
      'logical': {
        id: 'logical',
        title: 'Logical',
        description: 'Use logical operators to combine conditions.',
        time: '8 min',
        icon: noirSubtopic3,
        requires: 'comparison',
      },
      'post-assessment': {
        id: 'postassessment',
        title: 'Post-Assessment',
        description: 'Test your knowledge after completing the course.',
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
  3: { // Topic 3: Conditional and Loops (space)
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
        description: 'Test your knowledge before starting the course.',
        time: '5 min',
        icon: placeholderIconPath,
        requires: null,
      },
      'if-else': {
        id: 'ifelse',
        title: 'If-Else',
        description: 'Understand conditional branching with if-else statements.',
        time: '10 min',
        icon: placeholderIconPath,
        requires: 'pre-assessment',
      },
      'while-do-while-loop': {
        id: 'whiledowhileloop',
        title: 'While and Do While Loop',
        description: 'Master while and do-while loops for repeated execution.',
        time: '10 min',
        icon: placeholderIconPath,
        requires: 'if-else',
      },
      'for-loop': {
        id: 'forloop',
        title: 'For Loop',
        description: 'Use for loops to iterate efficiently.',
        time: '10 min',
        icon: placeholderIconPath,
        requires: 'while-do-while-loop',
      },
      'post-assessment': {
        id: 'postassessment',
        title: 'Post-Assessment',
        description: 'Test your knowledge after completing the course.',
        time: '5 min',
        icon: placeholderIconPath,
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

// Helper function to get content for a specific topic (by id or slug)
export const getSubtopicContent = (topicKey) => {
  console.log('getSubtopicContent called with:', topicKey, 'Type:', typeof topicKey);
  
  // Try numeric id first
  if (subtopicContent[topicKey]) {
    console.log('Found topic content for key:', topicKey);
    return subtopicContent[topicKey];
  }
  
  console.log('Topic not found for key:', topicKey, 'Available topics:', Object.keys(subtopicContent));
  
  // Try slug mapping if needed (add if you want slug support)
  return subtopicContent[1]; // fallback to topic 1
};

export const getAvailableTopics = () => {
  return Object.keys(subtopicContent);
}; 