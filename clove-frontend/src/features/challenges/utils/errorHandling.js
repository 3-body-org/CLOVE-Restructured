// Error handling utilities for challenges

export const validateChallengeData = (challengeData, challengeType) => {
  const errors = [];
  
  if (!challengeData) {
    errors.push(`No challenge data provided for ${challengeType}`);
    return { isValid: false, errors, fallbackData: getFallbackData(challengeType) };
  }

  // Validate required fields based on challenge type
  switch (challengeType) {
    case 'CodeFixer':
      if (!challengeData.code) errors.push('Missing code for CodeFixer challenge');
      if (!challengeData.answers) errors.push('Missing answers for CodeFixer challenge');
      if (!challengeData.question) errors.push('Missing question for CodeFixer challenge');
      break;
      
    case 'OutputTracing':
      if (!challengeData.code) errors.push('Missing code for OutputTracing challenge');
      if (!challengeData.answer) errors.push('Missing answer for OutputTracing challenge');
      if (!challengeData.question) errors.push('Missing question for OutputTracing challenge');
      break;
      
    case 'CodeCompletion':
      if (!challengeData.code) errors.push('Missing code for CodeCompletion challenge');
      if (!challengeData.answer) errors.push('Missing answer for CodeCompletion challenge');
      if (!challengeData.question) errors.push('Missing question for CodeCompletion challenge');
      break;
      
    default:
      errors.push(`Unknown challenge type: ${challengeType}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    fallbackData: errors.length > 0 ? getFallbackData(challengeType) : null
  };
};

export const getFallbackData = (challengeType) => {
  const fallbacks = {
    CodeFixer: {
      id: 'fallback-1',
      type: 'CodeFixer',
      scenarioTitle: '🛠️ System Malfunction:',
      scenarioDescription: 'A system component is malfunctioning. Restore functionality by fixing code errors.',
      question: 'Fix the errors in the code below.',
      code: `public class FallbackClass {\n  public void method() {\n    // Fix the errors here\n  }\n}`,
      answers: { fix1: 'int' },
      hints: ['Check for syntax errors', 'Verify data types', 'Look for missing operators']
    },
    OutputTracing: {
      id: 'fallback-101',
      type: 'OutputTracing',
      scenarioTitle: '🔍 Output Analysis:',
      scenarioDescription: 'Analyze the code and predict the output.',
      question: 'What will be the output of this code?',
      code: `public class FallbackTest {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}`,
      answer: 'Hello World'
    },
    CodeCompletion: {
      id: 'fallback-201',
      type: 'CodeCompletion',
      scenarioTitle: '🧪 Scenario:',
      scenarioDescription: 'Complete the missing code to make the program work.',
      question: 'Fill in the missing part.',
      code: 'System.out.println("Hello " + ____);',
      answer: 'World'
    }
  };

  return fallbacks[challengeType] || fallbacks.CodeCompletion;
};

export const handleChallengeError = (error, challengeType, fallbackData) => {
  console.error(`Challenge error for ${challengeType}:`, error);
  
  // Log error for debugging
  console.warn('Using fallback data:', fallbackData);
  
  // Return fallback data
  return fallbackData;
};

export const safeExecute = (fn, fallback, errorMessage = 'Operation failed') => {
  try {
    return fn();
  } catch (error) {
    console.error(errorMessage, error);
    return fallback;
  }
};

export const validateChallengeConfig = (config) => {
  const { type, difficulty, index } = config;
  
  if (!type || !difficulty || typeof index !== 'number') {
    console.error('Invalid challenge config:', config);
    return false;
  }
  
  const validTypes = ['CodeFixer', 'CodeCompletion', 'OutputTracing'];
  const validDifficulties = ['easy', 'medium', 'hard'];
  
  if (!validTypes.includes(type)) {
    console.error(`Invalid challenge type: ${type}`);
    return false;
  }
  
  if (!validDifficulties.includes(difficulty)) {
    console.error(`Invalid difficulty: ${difficulty}`);
    return false;
  }
  
  if (index < 0) {
    console.error(`Invalid index: ${index}`);
    return false;
  }
  
  return true;
}; 