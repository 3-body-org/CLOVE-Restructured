/**
 * @file challengeService.js
 * @description Service layer for challenge API integration using centralized API pattern
 */

import { useApi } from '../../../hooks/useApi';

/**
 * Utility function for making API calls with consistent error handling
 * @param {Function} apiCall - The API call function
 * @param {string} errorMessage - Error message prefix
 * @returns {Promise<any>} API response
 */
const makeApiCall = async (apiCall, errorMessage) => {
  try {
    const response = await apiCall();
    
    if (!response.ok) {
      throw new Error(`${errorMessage}: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Re-throw with original error message if it's already formatted
    if (error.message.includes(errorMessage)) {
      throw error;
    }
    throw new Error(`${errorMessage}: ${error.message}`);
  }
};

/**
 * Create common challenge properties object
 * @param {Object} backendChallenge - Raw challenge data
 * @param {string} mode - Challenge mode
 * @returns {Object} Common properties
 */
const createCommonChallengeProps = (backendChallenge, mode) => {
  const { id, scenario, timer, hints, points } = backendChallenge;
  
  const processedProps = {
    id,
    mode,
    scenario,
    timerDuration: timer,
    hintsAvailable: Object.keys(hints || {}).length,
    hints: hints || {},
    points: points || 10
  };
  
  return processedProps;
};

/**
 * Custom hook for challenge API operations
 * @returns {Object} Object containing all challenge API functions
 */
export const useChallengeApi = () => {
  const api = useApi();

  /**
   * Get next challenge for user
   * @param {number} userId - User ID
   * @param {number} subtopicId - Subtopic ID
   * @returns {Promise<Object>} Challenge data and user_challenge_id
   */
  const getNextChallenge = async (userId, subtopicId) => {
    return makeApiCall(
      () => api.get(`/challenge_attempts/select-challenge/user/${userId}/subtopic/${subtopicId}`),
      'Failed to get next challenge'
    );
  };

  /**
   * Submit challenge attempt
   * @param {Object} attemptData - Challenge attempt data
   * @param {number} attemptData.user_challenge_id - User challenge ID
   * @param {string} attemptData.user_answer - User's answer (JSON string)
   * @param {number} attemptData.time_spent - Time spent in seconds
   * @param {number} attemptData.hints_used - Number of hints used
   * @param {boolean} attemptData.is_successful - Whether attempt was successful
   * @returns {Promise<Object>} Submitted attempt data
   */
  const submitChallengeAttempt = async (attemptData) => {
    try {
      const result = await makeApiCall(
        () => api.post('/challenge_attempts/', attemptData),
        'Failed to submit challenge attempt'
      );
      return result;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Cancel current challenge
   * @param {number} userId - User ID
   * @param {number} challengeId - Challenge ID
   * @param {Object} cancelData - Cancellation data
   * @param {number} cancelData.time_spent - Time spent in seconds
   * @param {number} cancelData.hints_used - Number of hints used
   * @param {string} cancelData.partial_answer - Partial answer (optional)
   * @returns {Promise<Object>} Cancellation result
   */
  const cancelChallenge = async (userId, challengeId, cancelData = {}) => {
    return makeApiCall(
      () => api.post(`/challenge_attempts/cancel/user/${userId}/challenge/${challengeId}`, cancelData),
      'Failed to cancel challenge'
    );
  };

  /**
   * Get user challenge data
   * @param {number} userId - User ID
   * @param {number} challengeId - Challenge ID
   * @returns {Promise<Object>} User challenge data
   */
  const getUserChallenge = async (userId, challengeId) => {
    return makeApiCall(
      () => api.get(`/user_challenges/user/${userId}/challenge/${challengeId}`),
      'Failed to get user challenge data'
    );
  };

  /**
   * Activate challenge session (Option 2)
   * @param {number} userId - User ID
   * @param {number} challengeId - Challenge ID
   * @returns {Promise<Object>} Session activation result
   */
  const activateChallengeSession = async (userId, challengeId) => {
    return makeApiCall(
      () => api.post(`/challenge_attempts/activate-session/user/${userId}/challenge/${challengeId}`),
      'Failed to activate challenge session'
    );
  };

  /**
   * Validate challenge session (Option 2)
   * @param {number} userId - User ID
   * @param {number} challengeId - Challenge ID
   * @param {string} sessionToken - Session token
   * @returns {Promise<Object>} Session validation result
   */
  const validateChallengeSession = async (userId, challengeId, sessionToken) => {
    return makeApiCall(
      () => api.post(`/challenge_attempts/validate-session/user/${userId}/challenge/${challengeId}`, {
        session_token: sessionToken
      }),
      'Failed to validate challenge session'
    );
  };

  /**
   * Deactivate challenge session (Option 2)
   * @param {number} userId - User ID
   * @param {number} challengeId - Challenge ID
   * @returns {Promise<Object>} Session deactivation result
   */
  const deactivateChallengeSession = async (userId, challengeId) => {
    return makeApiCall(
      () => api.post(`/challenge_attempts/deactivate-session/user/${userId}/challenge/${challengeId}`),
      'Failed to deactivate challenge session'
    );
  };

  /**
   * Force deactivate all sessions (Option 2)
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Force deactivation result
   */
  const forceDeactivateAllSessions = async (userId) => {
    return makeApiCall(
      () => api.post(`/challenge_attempts/force-deactivate-all-sessions/user/${userId}`),
      'Failed to force deactivate all sessions'
    );
  };

  /**
   * Cancel challenge with synchronous XMLHttpRequest (for beforeunload) - REMOVED
   * Synchronous XHR is deprecated and unreliable in modern browsers
   * @param {number} userId - User ID
   * @param {number} challengeId - Challenge ID
   * @returns {boolean} Success status
   */
  const cancelChallengeSync = (userId, challengeId) => {
    // Synchronous XHR is deprecated - use localStorage approach instead
    return false;
  };

  /**
   * Create fallback attempt with synchronous XMLHttpRequest (for beforeunload) - REMOVED
   * Synchronous XHR is deprecated and unreliable in modern browsers
   * @param {Object} attemptData - Challenge attempt data
   * @returns {boolean} Success status
   */
  const createFallbackAttemptSync = (attemptData) => {
    // Synchronous XHR is deprecated - use localStorage approach instead
    return false;
  };

  /**
   * Complete subtopic challenge run
   * @param {number} userId - User ID
   * @param {number} subtopicId - Subtopic ID
   * @returns {Promise<Object>} Completion result
   */
  const completeSubtopicChallenge = async (userId, subtopicId) => {
    return makeApiCall(
      () => api.post(`/user_subtopics/user/${userId}/subtopic/${subtopicId}/complete-challenge`),
      'Failed to complete subtopic challenge'
    );
  };

  /**
   * Get challenge attempt count for a user and subtopic
   * @param {number} userId - User ID
   * @param {number} subtopicId - Subtopic ID
   * @returns {Promise<number>} Number of challenge attempts
   */
  const getChallengeAttemptCount = async (userId, subtopicId) => {
    try {
      const data = await makeApiCall(
        () => api.get(`/challenge_attempts/count/user/${userId}/subtopic/${subtopicId}`),
        'Failed to get challenge attempt count'
      );
      return data.count || 0;
    } catch (error) {
      return 0; // Return 0 as fallback
    }
  };

  /**
   * Delete all challenge attempts for user in a specific subtopic
   * @param {number} userId - User ID
   * @param {number} subtopicId - Subtopic ID
   * @returns {Promise<Object>} Deletion result with count
   */
  const deleteAllChallengeAttemptsForSubtopic = async (userId, subtopicId) => {
    return makeApiCall(
      () => api.delete(`/challenge_attempts/user/${userId}/subtopic/${subtopicId}`),
      'Failed to delete challenge attempts'
    );
  };

  /**
   * Get all 5 challenge attempts with user_challenge data for results page
   * @param {number} userId - User ID
   * @param {number} subtopicId - Subtopic ID
   * @returns {Promise<Array>} Array of challenge attempts with user_challenge data
   */
  const getAllChallengeAttemptsForResults = async (userId, subtopicId) => {
    try {
      // Get the last 5 challenge attempts with challenge data included
      const attempts = await makeApiCall(
        () => api.get(`/challenge_attempts/last-attempts/user/${userId}/subtopic/${subtopicId}?limit=5`),
        'Failed to get challenge attempts'
      );

      return attempts;
    } catch (error) {
      throw error;
    }
  };

  return {
    getNextChallenge,
    submitChallengeAttempt,
    cancelChallenge,
    getUserChallenge,
    activateChallengeSession,
    validateChallengeSession,
    deactivateChallengeSession,
    forceDeactivateAllSessions,
    completeSubtopicChallenge,
    getChallengeAttemptCount,
    deleteAllChallengeAttemptsForSubtopic,
    getAllChallengeAttemptsForResults,
    cancelChallengeSync,
    createFallbackAttemptSync
  };
};

/**
 * Process challenge data for frontend consumption
 * @param {Object} backendChallenge - Raw challenge data from backend
 * @returns {Object} Processed challenge data for frontend
 */
export const processChallengeData = (backendChallenge) => {
  const { type } = backendChallenge;
  
  switch (type) {
    case 'code_completion': {
      const snippetData = backendChallenge.snippet_choices || backendChallenge.challenge_data;
      const commonProps = createCommonChallengeProps(backendChallenge, 'code_completion');
      
      return {
        ...commonProps,
        code: snippetData.initial_code || snippetData.code,
        choices: snippetData.choices,
        expectedChoices: snippetData.answer || snippetData.expected_output,
        expectedOutput: snippetData.expected_output, // Keep the full array for UI display
        blankPositions: snippetData.completion_slots || [],
        completion_slots: snippetData.completion_slots || [],
        // Additional data for feedback
        challengeCode: snippetData.initial_code || snippetData.code,
        explanation: snippetData.completion_slots?.[0]?.explanation || null
      };
    }
    
    case 'code_fixer': {
      const fixerData = backendChallenge.challenge_data;
      const commonProps = createCommonChallengeProps(backendChallenge, 'code_fixer');
      
      return {
        ...commonProps,
        initialCode: fixerData.initial_code,
        solutionCode: fixerData.solution_code,
        expectedOutput: fixerData.expected_output, // Keep the full array for UI display
        // Additional data for feedback
        challengeCode: fixerData.initial_code,
        explanation: fixerData.explanation || null
      };
    }
    
    case 'output_tracing': {
      const tracingData = backendChallenge.challenge_data;
      const commonProps = createCommonChallengeProps(backendChallenge, 'output_tracing');
      
      return {
        ...commonProps,
        code: tracingData.code,
        choices: tracingData.choices,
        correctOutput: tracingData.expected_output, // Remove the [0] to keep the full array
        // Additional data for feedback
        challengeCode: tracingData.code,
        explanation: tracingData.explanation || null
      };
    }
    
    default:
      throw new Error(`Unknown challenge type: ${type}`);
  }
}; 