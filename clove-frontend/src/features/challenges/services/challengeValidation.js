/**
 * @file challengeValidation.js
 * @description Validation service for all challenge modes
 */

/**
 * Normalize code for comparison by removing comments, extra whitespace, and line breaks
 * @param {string} code - Raw code string
 * @returns {string} Normalized code string
 */
const normalizeCode = (code) => {
  if (!code || typeof code !== 'string') {
    return '';
  }
  
  return code
    // Remove single-line comments (// ...)
    .replace(/\/\/.*$/gm, '')
    // Remove multi-line comments (/* ... */)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove extra whitespace and line breaks
    .replace(/\s+/g, ' ')
    // Trim leading/trailing whitespace
    .trim();
};

/**
 * Validate Code Completion challenge
 * @param {Object} userChoices - User's choices with position information (e.g., { "slot_1": { choice: "String", position: {...}, slotId: "slot_1" } })
 * @param {Object} challengeData - Challenge data from backend
 * @returns {Object} Validation result
 */
export const validateCodeCompletion = (userChoices, challengeData) => {
  const { completion_slots, points = 10 } = challengeData;
  
  if (!completion_slots || completion_slots.length === 0) {
    return {
      isCorrect: false,
      score: 0,
      points: 0,
      feedback: "No completion slots found in challenge data.",
      details: { error: "Missing completion_slots" }
    };
  }
  
  // Check if user has any choices (empty submission is allowed but wrong)
  const hasAnyChoices = userChoices && Object.keys(userChoices).length > 0;
  
  // Count correct choices
  const correctChoices = completion_slots.filter((slot) => {
    const slotId = slot.id;
    const userChoice = userChoices && userChoices[slotId];
    return userChoice && userChoice.choice === slot.correct_answer;
  }).length;
  
  // Calculate score based on percentage of correct answers
  const totalSlots = completion_slots.length;
  const scorePercentage = totalSlots > 0 ? (correctChoices / totalSlots) * 100 : 0;
  const earnedPoints = Math.round((scorePercentage / 100) * points);
  
  // Determine if completely correct
  const isCorrect = correctChoices === totalSlots && totalSlots > 0;
  
  // Generate feedback based on results
  let feedback;
  if (!hasAnyChoices) {
    feedback = "No answers submitted. Challenge marked as incorrect.";
  } else if (isCorrect) {
    feedback = "Perfect! All choices are correct.";
  } else if (correctChoices === 0) {
    feedback = "None of the choices are correct. Make sure you select the right answers for each slot.";
  } else {
    feedback = `${correctChoices}/${totalSlots} choices are correct. You need to select the correct answer for all slots to complete the challenge.`;
  }

  // Generate detailed explanation
  let detailedFeedback = "";
  if (hasAnyChoices && !isCorrect) {
    const incorrectSlots = completion_slots.filter((slot) => {
      const slotId = slot.id;
      const userChoice = userChoices && userChoices[slotId];
      return !userChoice || userChoice.choice !== slot.correct_answer;
    });
    
    if (incorrectSlots.length > 0) {
      detailedFeedback = `Incorrect selections: ${incorrectSlots.map(slot => 
        `Slot ${slot.id} (expected: ${slot.correct_answer})`
      ).join(', ')}.`;
    }
  }
  
  return {
    isCorrect,
    score: scorePercentage,
    points: earnedPoints,
    feedback,
    detailedFeedback,
    correctAnswer: completion_slots.map(slot => slot.correct_answer),
    details: {
      correct: correctChoices,
      total: totalSlots,
      hasAnyChoices,
      userChoices: userChoices ? Object.fromEntries(
        Object.entries(userChoices).map(([key, value]) => [key, value.choice])
      ) : {},
      expectedAnswers: completion_slots.map(slot => slot.correct_answer),
      maxPoints: points
    }
  };
};

/**
 * Validate Code Fixer challenge
 * @param {string} userCode - User's edited code
 * @param {Object} challengeData - Challenge data from backend
 * @returns {Object} Validation result
 */
export const validateCodeFixer = (userCode, challengeData) => {
  const { solutionCode, solution_code, points = 10 } = challengeData;
  
  // Use solution_code if solutionCode is not available (for code_fixer challenges)
  const actualSolutionCode = solutionCode || solution_code;
  
  // Safety check for solution code
  if (!actualSolutionCode) {
    return {
      isCorrect: false,
      score: 0,
      points: 0,
      feedback: "Challenge data error: Solution code not found.",
      details: {
        error: "No solution code",
        maxPoints: points
      }
    };
  }
  
  // Check if user has submitted any code
  const hasSubmittedCode = userCode && userCode.trim().length > 0;
  
  // 🎯 NEW: Use intelligent code comparison that ignores comments and formatting
  const normalizedUserCode = normalizeCode(userCode);
  const normalizedSolutionCode = normalizeCode(actualSolutionCode);
  
  // Method 1: Intelligent code comparison (ignores comments, whitespace, formatting)
  const codeMatches = hasSubmittedCode && normalizedUserCode === normalizedSolutionCode;
  
  // Method 2: Syntax validation (optional)
  const syntaxValid = hasSubmittedCode && validateSyntax(userCode);
  
  // Calculate score (all-or-nothing for code fixer)
  const isCorrect = codeMatches && syntaxValid;
  const earnedPoints = isCorrect ? points : 0;
  
  // Generate feedback
  let feedback;
  let detailedFeedback = "";
  
  if (!hasSubmittedCode) {
    feedback = "No code submitted. Challenge marked as incorrect.";
  } else if (isCorrect) {
    feedback = "Code fixed successfully! All syntax errors have been corrected.";
  } else {
    feedback = "Some errors remain in the code.";
    
    // Generate detailed feedback
    if (!codeMatches) {
      detailedFeedback = "Your code doesn't match the expected solution. Check for missing semicolons, variable declarations, or incorrect syntax. Note: Comments and formatting differences are ignored.";
    } else if (!syntaxValid) {
      detailedFeedback = "Your code has syntax errors. Check for balanced braces, parentheses, and proper Java syntax.";
    } else {
      detailedFeedback = "Your code has other errors. Make sure all variables are properly declared and used correctly.";
    }
  }
  
  return {
    isCorrect,
    score: isCorrect ? 100 : 0,
    points: earnedPoints,
    feedback,
    detailedFeedback,
    correctAnswer: actualSolutionCode?.trim() || "",
    details: {
      codeMatches,
      syntaxValid,
      hasSubmittedCode,
      userCode: userCode?.trim() || "",
      solutionCode: actualSolutionCode?.trim() || "",
      normalizedUserCode,
      normalizedSolutionCode,
      maxPoints: points
    }
  };
};

/**
 * Validate Output Tracing challenge
 * @param {Array} userSelections - User's selected outputs
 * @param {Object} challengeData - Challenge data from backend
 * @returns {Object} Validation result
 */
export const validateOutputTracing = (userSelections, challengeData) => {
  const { expectedOutput, correctOutput, choices, points = 10 } = challengeData;
  
  // Use correctOutput if expectedOutput is not available (for output_tracing challenges)
  const expectedOutputArray = expectedOutput || correctOutput;
  
  // Safety check for expectedOutputArray
  if (!expectedOutputArray || !Array.isArray(expectedOutputArray)) {
    return {
      isCorrect: false,
      score: 0,
      points: 0,
      feedback: "Challenge data error: Expected outputs not found.",
      details: {
        error: "Invalid expectedOutputArray",
        expectedOutputArray,
        maxPoints: points
      }
    };
  }
  
  // Check if user has made any selections
  const hasAnySelections = userSelections && userSelections.length > 0;
  
  if (!hasAnySelections) {
    return {
      isCorrect: false,
      score: 0,
      points: 0,
      feedback: "No outputs selected. Challenge marked as incorrect.",
      details: {
        selected: 0,
        expected: expectedOutputArray?.length || 0,
        hasAnySelections: false,
        maxPoints: points
      }
    };
  }
  
  // User doesn't know how many answers are correct
  // They can select 0, 1, 2, or more answers
  const userSelectedOutputs = userSelections;
  
  // Check if user selected exactly the correct answers (no more, no less)
  const hasAllCorrect = expectedOutputArray && expectedOutputArray.every(expected => 
    userSelectedOutputs.includes(expected)
  );
  
  const hasNoIncorrect = userSelectedOutputs.every(selected => 
    expectedOutputArray && expectedOutputArray.includes(selected)
  );
  
  const isCorrect = hasAllCorrect && hasNoIncorrect;
  const earnedPoints = isCorrect ? points : 0;
  
  // Generate feedback
  let feedback;
  let detailedFeedback = "";
  
  if (isCorrect) {
    feedback = "Perfect! You selected all correct outputs.";
  } else if (userSelectedOutputs.length === 0) {
    feedback = "No outputs selected. Challenge marked as incorrect.";
  } else {
    feedback = "Incorrect. You need to select exactly the correct outputs.";
    
    // Generate detailed feedback
    const correctSelections = userSelectedOutputs.filter(selected => 
      expectedOutputArray.includes(selected)
    ).length;
    const incorrectSelections = userSelectedOutputs.filter(selected => 
      !expectedOutputArray.includes(selected)
    ).length;
    const missingSelections = expectedOutputArray.filter(expected => 
      !userSelectedOutputs.includes(expected)
    ).length;
    
    if (userSelectedOutputs.length > expectedOutputArray.length) {
      detailedFeedback = `You selected too many outputs (${userSelectedOutputs.length} selected, ${expectedOutputArray.length} expected). You need to select exactly the correct outputs, no more and no less.`;
    } else if (userSelectedOutputs.length < expectedOutputArray.length) {
      detailedFeedback = `You selected too few outputs (${userSelectedOutputs.length} selected, ${expectedOutputArray.length} expected). You need to select all the correct outputs.`;
    } else if (incorrectSelections > 0) {
      detailedFeedback = `You selected ${incorrectSelections} incorrect output(s). Make sure to only select the outputs that will actually be displayed by the program.`;
    } else if (missingSelections > 0) {
      detailedFeedback = `You missed ${missingSelections} correct output(s). Trace through the code carefully to identify all outputs that will be displayed.`;
    }
  }
  
  return {
    isCorrect,
    score: isCorrect ? 100 : 0,
    points: earnedPoints,
    feedback,
    detailedFeedback,
    correctAnswer: expectedOutputArray || [],
    details: {
      selected: userSelectedOutputs.length,
      expected: expectedOutputArray?.length || 0,
      correct: userSelectedOutputs.filter(selected => 
        expectedOutputArray.includes(selected)
      ).length,
      incorrect: userSelectedOutputs.filter(selected => 
        !expectedOutputArray.includes(selected)
      ).length,
      hasAnySelections,
      maxPoints: points
    }
  };
};

/**
 * Main validation function
 * @param {string} mode - Challenge mode
 * @param {any} userAnswer - User's answer
 * @param {Object} challengeData - Challenge data from backend
 * @returns {Object} Validation result
 */
export const validateChallenge = (mode, userAnswer, challengeData) => {
  switch (mode) {
    case 'code_completion':
      return validateCodeCompletion(userAnswer, challengeData);
    
    case 'code_fixer':
      return validateCodeFixer(userAnswer, challengeData);
    
    case 'output_tracing':
      return validateOutputTracing(userAnswer, challengeData);
    
    default:
      throw new Error(`Unknown challenge mode: ${mode}`);
  }
};

/**
 * Validate syntax of user code (simplified)
 * @param {string} code - User's code
 * @returns {boolean} Whether syntax is valid
 */
const validateSyntax = (code) => {
  try {
    // Basic syntax checks
    if (!code.includes('public class')) {
      return false;
    }
    
    // Check for balanced braces
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      return false;
    }
    
    // Check for balanced parentheses
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    
    if (openParens !== closeParens) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Process user answer based on mode
 * @param {string} mode - Challenge mode
 * @param {any} userInput - Raw user input
 * @returns {any} Processed user answer
 */
export const processUserAnswer = (mode, userInput) => {
  switch (mode) {
    case 'code_completion':
      // userInput = { slot_1: { choice: "choice1", ... }, slot_2: { choice: "choice2", ... } }
      // Handle empty submissions
      if (!userInput || Object.keys(userInput).length === 0) {
        return {};
      }
      return userInput;
    
    case 'code_fixer':
      // userInput = "complete code string"
      // Handle empty submissions
      if (!userInput || typeof userInput !== 'string') {
        return "";
      }
      return userInput.trim();
    
    case 'output_tracing':
      // userInput = ["output1", "output2", ...]
      // Handle empty submissions
      if (!userInput || !Array.isArray(userInput)) {
        return [];
      }
      return userInput;
    
    default:
      return userInput;
  }
}; 