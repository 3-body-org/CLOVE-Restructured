/**
 * @file useChallengeService.js
 * @description Hook for challenge state management, timer, hints, and validation
 */

import { useState, useEffect, useCallback, useRef, useMemo, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSidebar } from '../../../components/layout/Sidebar/Layout';
import { useChallengeApi, processChallengeData } from '../services/challengeService';
import { MyDeckContext } from '../../../contexts/MyDeckContext';
import { useAdaptiveFeatures } from './useAdaptiveFeatures';
import { useApi } from '../../../hooks/useApi';

const CHALLENGE_STATES = {
  LOADING: 'loading',
  ACTIVE: 'active',
  EXPIRED: 'expired',
  RESUMED: 'resumed',
  SUBMITTED: 'submitted'
};

const TIMER_STATES = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  PAUSED: 'paused'
};

export const useChallengeService = (userId, paramSubtopicId) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { closeSidebar } = useSidebar();
  const challengeApi = useChallengeApi();
  const { post } = useApi(); // Add direct access to post method for statistics
  const { topicId: contextTopicId, subtopicId: contextSubtopicId } = useContext(MyDeckContext);
  
  // Extract the full topicId with slug from URL for navigation (e.g., "1-data-types-and-variables")
  const fullTopicId = location.pathname.split('/')[2] || '1-data-types-and-variables';
  
  // Use context values if available, otherwise extract from URL
  const topicId = contextTopicId || (fullTopicId ? parseInt(fullTopicId.split('-')[0]) : 1);
  const subtopicId = contextSubtopicId || paramSubtopicId;
  
  // Memoize the API functions to prevent unnecessary re-renders
  const memoizedApi = useMemo(() => challengeApi, []);
  
  // Challenge state
  const [challengeState, setChallengeState] = useState(CHALLENGE_STATES.LOADING);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [userChallengeId, setUserChallengeId] = useState(null);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [totalChallenges] = useState(5);
  const [attemptCount, setAttemptCount] = useState(0);
  
  // State for tracking take progress
  const [isInTake, setIsInTake] = useState(false);
  const [currentTakeAttempts, setCurrentTakeAttempts] = useState(0);
  
  // Adaptive features hook - moved after currentTakeAttempts declaration
  const { isTimerEnabled, isHintsEnabled, isLoading: adaptiveLoading, error: adaptiveError, refreshAdaptiveFeatures } = useAdaptiveFeatures(subtopicId, currentTakeAttempts);
  
  // Track if initial load has been done
  const initialLoadRef = useRef(false);
  
  // Exit prevention state - Simplified and fixed
  const [showCustomExitWarning, setShowCustomExitWarning] = useState(false);
  const [isProcessingExit, setIsProcessingExit] = useState(false);
  const [pendingExitAction, setPendingExitAction] = useState(null);

  // Simplified exit prevention - Option 1: localStorage session key
  const CHALLENGE_SESSION_KEY = `challenge_active_${userId}_${subtopicId}`;

  // Option 2: Server-side session management
  const [sessionToken, setSessionToken] = useState(null);
  const [showOtherSessionWarning, setShowOtherSessionWarning] = useState(false);
  const [otherSessions, setOtherSessions] = useState([]);

  // Track if we're in the process of executing an exit
  const executingExitRef = useRef(false);

  // Refs to store current values for beforeunload handler
  const currentChallengeRef = useRef(null);
  const userChallengeIdRef = useRef(null);
  const timeSpentRef = useRef(0);
  const hintsUsedRef = useRef(0);
  const userIdRef = useRef(userId);
  const sessionTokenRef = useRef(null);

  // Timer state
  const [timerState, setTimerState] = useState(TIMER_STATES.ACTIVE);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [initialTimerDuration, setInitialTimerDuration] = useState(300);
  const timerRef = useRef(null);
  
  // Hint state
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedHints, setRevealedHints] = useState([]);
  const [hintsAvailable, setHintsAvailable] = useState(0);
  
  // User answer state
  const [userAnswer, setUserAnswer] = useState(null);
  
  // Loading and error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Resume state
  const [isResumed, setIsResumed] = useState(false);
  const [resumeWarning, setResumeWarning] = useState(false);
  const [timerExpiredWarning, setTimerExpiredWarning] = useState(false);

  // Submission protection state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);

  // Update refs when values change
  useEffect(() => {
    currentChallengeRef.current = currentChallenge;
    userChallengeIdRef.current = userChallengeId;
    timeSpentRef.current = timeSpent;
    hintsUsedRef.current = hintsUsed;
    userIdRef.current = userId;
  }, [currentChallenge, userChallengeId, timeSpent, hintsUsed, userId]);

  // Option 2: Server-side session functions
  const activateServerSession = useCallback(async (challengeId) => {
    try {
      const response = await memoizedApi.activateChallengeSession(userId, challengeId);
      
      if (response.success) {
        setSessionToken(response.session_token);
        return { 
          success: true, 
          session_token: response.session_token 
        };
      } else {
        return { 
          success: false, 
          message: response.message,
          existingSession: response.existing_session,
          requires_user_action: response.requires_user_action,
          existing_sessions: response.existing_sessions
        };
      }
    } catch (error) {
      console.error('Option 2: Error activating server session:', error);
      return { success: false, message: 'Failed to activate session' };
    }
  }, [memoizedApi, userId]);

  const validateServerSession = useCallback(async (challengeId) => {
    const currentSessionToken = sessionToken || sessionTokenRef.current;
    if (!currentSessionToken) {
      return { valid: false, message: 'No active session' };
    }

    try {
      const response = await memoizedApi.validateChallengeSession(userId, challengeId, currentSessionToken);
      
      if (response.valid) {
        return { valid: true };
      } else {
        return { valid: false, message: response.message };
      }
    } catch (error) {
      console.error('Option 2: Error validating server session:', error);
      return { valid: false, message: 'Session validation failed' };
    }
  }, [memoizedApi, userId, sessionToken]);

  const deactivateServerSession = useCallback(async (challengeId) => {
    const currentSessionToken = sessionToken || sessionTokenRef.current;
    if (!currentSessionToken) {
      return;
    }

    try {
      await memoizedApi.deactivateChallengeSession(userId, challengeId);
      setSessionToken(null);
      sessionTokenRef.current = null;
    } catch (error) {
      console.error('Option 2: Error deactivating server session:', error);
    }
  }, [memoizedApi, userId, sessionToken]);

  const forceDeactivateAllSessions = useCallback(async () => {
    try {
      const response = await memoizedApi.forceDeactivateAllSessions(userId);
      setShowOtherSessionWarning(false);
      setOtherSessions([]);
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Option 2: Error force deactivating sessions:', error);
      return { success: false, message: 'Failed to deactivate sessions' };
    }
  }, [memoizedApi, userId]);

  /**
   * Start timer countdown
   */
  const startTimer = useCallback((duration) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setTimeRemaining(duration);
    setTimerState(TIMER_STATES.ACTIVE);
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Timer expired - behave like cancelled challenge
          setTimerState(TIMER_STATES.EXPIRED);
          setChallengeState(CHALLENGE_STATES.EXPIRED);
          // Only show timer warning if timer was actually enabled for this challenge
          if (isTimerEnabled) {
            setTimerExpiredWarning(true); // Show the warning modal
          }
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
      
      setTimeSpent(prev => {
        const newTimeSpent = prev + 1;
        return newTimeSpent;
      });
    }, 1000);
  }, [isTimerEnabled]);

  /**
   * Complete challenge run
   */
  const completeChallengeRun = useCallback(async () => {
    // 🎯 CRITICAL FIX: Clear any remaining timer when completing challenge run
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    try {
      await memoizedApi.completeSubtopicChallenge(userId, subtopicId);
    } catch (error) {
      console.error('Error completing challenge run:', error);
      // Don't set error state - we still want to navigate to results
    }
    
    // Always navigate to results page, regardless of API success/failure
    const resultsUrl = `/lesson/${fullTopicId}/${subtopicId}/challenges/results`;
    // Clear session when completing
    localStorage.removeItem(CHALLENGE_SESSION_KEY);
    // Navigate to results page instead of subtopic page
    navigate(resultsUrl);
    // Call closeSidebar without including it in dependencies
    closeSidebar();
  }, [memoizedApi, userId, subtopicId, navigate, closeSidebar, fullTopicId]);

  /**
   * Load next challenge
   */
  const loadNextChallenge = useCallback(async (passedCurrentTakeAttempts = null, passedAttemptCount = null) => {
    // Use passed value if provided, otherwise use state value
    const effectiveCurrentTakeAttempts = passedCurrentTakeAttempts !== null ? passedCurrentTakeAttempts : currentTakeAttempts;
    const effectiveAttemptCount = passedAttemptCount !== null ? passedAttemptCount : attemptCount;
    
    console.log(`🔍 LOAD: attemptCount=${effectiveAttemptCount}, currentTakeAttempts=${effectiveCurrentTakeAttempts}`);
    
    // If we have 5 attempts in current take, show results
    if (effectiveCurrentTakeAttempts === 5) {
      console.log('✅ RESULTS: All 5 challenges completed!');
      await completeChallengeRun();
      return;
    }
    
    // If attemptCount is 5 but we have 0 current take attempts, we're starting a new take
    if (effectiveAttemptCount === 5 && effectiveCurrentTakeAttempts === 0) {
      console.log('🔄 NEW TAKE: Starting fresh take');
      setCurrentTakeAttempts(0);
    }
    
    console.log(`📋 LOADING: Challenge ${effectiveCurrentTakeAttempts + 1} of 5`);

    try {
      setLoading(true);
      setError(null);
      setIsSubmitting(false);
      
      // 🎯 CRITICAL FIX: Clear any existing timer before loading new challenge
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // 🎯 CRITICAL FIX: Reset timer state to prevent expired state from persisting
      setTimerState(TIMER_STATES.ACTIVE);
      setTimerExpiredWarning(false);
      
      setSessionToken(null);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const { challenge, user_challenge_id: newUserChallengeId, user_challenge_status } = await memoizedApi.getNextChallenge(userId, subtopicId);
      
      const processedChallenge = processChallengeData(challenge);
      
      setCurrentChallenge(processedChallenge);
      setUserChallengeId(newUserChallengeId);
      
      // Check if this is a cancelled challenge that needs to be resumed
      if (user_challenge_status === 'cancelled') {
        console.log('🔄 RESUME: Loading cancelled challenge');
        setChallengeState(CHALLENGE_STATES.RESUMED);
        setIsResumed(true);
        
        setCurrentTakeAttempts(effectiveAttemptCount);
        console.log(`📊 RESUME: Setting currentTakeAttempts to ${effectiveAttemptCount}`);
        
        try {
          const userChallengeResponse = await memoizedApi.getUserChallenge(userId, processedChallenge.id);
          if (userChallengeResponse) {
            setTimeSpent(userChallengeResponse.time_spent || 0);
            setHintsUsed(userChallengeResponse.hints_used || 0);
            
            // Restore revealed hints based on hints_used count
            const hintsUsed = userChallengeResponse.hints_used || 0;
            const revealedHintsArray = [];
            for (let i = 0; i < hintsUsed; i++) {
              revealedHintsArray.push(i);
            }
            setRevealedHints(revealedHintsArray);
            
            // Calculate remaining time for cancelled challenge
            const originalDuration = processedChallenge.timerDuration || 300;
            const timeSpent = userChallengeResponse.time_spent || 0;
            const remainingTime = Math.max(0, originalDuration - timeSpent);
            
            // 🎯 FIXED: For resumed challenges, use original timer settings (ignore adaptive logic)
            const originalHintsAvailable = processedChallenge.hintsAvailable || 0;
            
            // Set hints based on original challenge settings (not adaptive logic for resumed challenges)
            setHintsAvailable(originalHintsAvailable);
            
            // Set timer based on original challenge settings (not adaptive logic for resumed challenges)
            setInitialTimerDuration(originalDuration);
            setTimeRemaining(remainingTime);
            
            // For cancelled challenges, don't start the timer - keep it paused
            if (remainingTime > 0) {
              setTimerState(TIMER_STATES.PAUSED);
            } else {
              setTimerState(TIMER_STATES.EXPIRED);
              // Keep the challenge state as RESUMED even when time is expired
              // Don't change to EXPIRED for cancelled challenges
            }
            
            if (userChallengeResponse.partial_answer) {
              try {
                const parsedAnswer = JSON.parse(userChallengeResponse.partial_answer);
                console.log('🔄 RESTORING: Partial answer from backend:', parsedAnswer);
                
                // Check if the parsed answer is valid (could be object or string)
                if (parsedAnswer !== null && parsedAnswer !== undefined) {
                  // For CodeFixer: parsedAnswer is a string (the code)
                  // For CodeCompletion/OutputTracing: parsedAnswer is an object
                  if (typeof parsedAnswer === 'string' && parsedAnswer.trim() !== '') {
                    console.log('🔄 RESTORING: Setting string answer (CodeFixer):', parsedAnswer);
                    setUserAnswer(parsedAnswer);
                  } else if (typeof parsedAnswer === 'object' && Object.keys(parsedAnswer).length > 0) {
                    console.log('🔄 RESTORING: Setting object answer (CodeCompletion/OutputTracing):', parsedAnswer);
                    setUserAnswer(parsedAnswer);
                  } else {
                    console.log('🔄 EMPTY PARTIAL ANSWER: Parsed answer is empty, not setting userAnswer');
                    setUserAnswer(null);
                  }
                } else {
                  console.log('🔄 EMPTY PARTIAL ANSWER: Parsed answer is null/undefined, not setting userAnswer');
                  setUserAnswer(null);
                }
              } catch (e) {
                console.error('Error parsing partial answer:', e);
                setUserAnswer(null);
              }
            } else {
              console.log('🔄 NO PARTIAL ANSWER: No partial answer found in user challenge');
              setUserAnswer(null);
            }
          }
        } catch (error) {
          console.error('Error fetching cancelled challenge data:', error);
        }
        setTimerExpiredWarning(false);
      } else {
        console.log('🆕 NEW: Loading fresh challenge');
        setChallengeState(CHALLENGE_STATES.ACTIVE);
        setIsResumed(false);
        setHintsUsed(0);
        setRevealedHints([]);
        
        // Apply adaptive features logic
        const originalHintsAvailable = processedChallenge.hintsAvailable || 0;
        const originalTimerDuration = processedChallenge.timerDuration || 300;
        
        // Set hints based on adaptive logic
        if (isHintsEnabled) {
          setHintsAvailable(originalHintsAvailable);
        } else {
          setHintsAvailable(0); // Disable hints
        }
        
        // Set timer based on adaptive logic
        if (isTimerEnabled) {
          setInitialTimerDuration(originalTimerDuration);
          setTimeRemaining(originalTimerDuration);
          setTimerState(TIMER_STATES.ACTIVE); // Ensure timer state is active
          startTimer(originalTimerDuration);
        } else {
          setInitialTimerDuration(0); // Disable timer
          setTimeRemaining(0);
          setTimerState(TIMER_STATES.ACTIVE); // Reset timer state even when disabled
          setTimerExpiredWarning(false); // Ensure timer warning is off when timer is disabled
          // Don't start timer
        }
        
        setTimeSpent(0); // Reset time spent for fresh challenges
        setTimerExpiredWarning(false);
      }
      
      localStorage.setItem(CHALLENGE_SESSION_KEY, JSON.stringify({
        startTime: Date.now(),
        challengeId: processedChallenge.id,
        userChallengeId: newUserChallengeId,
        status: user_challenge_status || 'active'
      }));

      const sessionResult = await activateServerSession(processedChallenge.id);
      if (!sessionResult.success) {
        console.error('❌ SESSION: Failed to activate server session:', sessionResult.message);
        
        if (sessionResult.requires_user_action && sessionResult.existing_sessions) {
          setOtherSessions(sessionResult.existing_sessions);
          setShowOtherSessionWarning(true);
          setLoading(false);
          return;
        } else if (sessionResult.existingSession) {
          setError('Another challenge is already active in this subtopic');
          setLoading(false);
          return;
        } else {
          setError('Failed to start challenge session. Please try again.');
          setLoading(false);
          return;
        }
      } else {
        if (sessionResult.session_token) {
          setSessionToken(sessionResult.session_token);
          sessionTokenRef.current = sessionResult.session_token;
        }
      }

      setLoading(false);
      
    } catch (error) {
      console.error('❌ ERROR: Loading next challenge:', error);
      setError(error.message);
      setLoading(false);
    }
  }, [memoizedApi, userId, subtopicId, challengeIndex, totalChallenges, completeChallengeRun, startTimer, activateServerSession, attemptCount, currentTakeAttempts, isTimerEnabled, isHintsEnabled]);

  /**
   * Load challenge attempt count
   */
  const loadAttemptCount = useCallback(async () => {
    try {
      const count = await memoizedApi.getChallengeAttemptCount(userId, subtopicId);
      setAttemptCount(count);
    } catch (error) {
      console.error('Error loading attempt count:', error);
      setAttemptCount(0);
    }
  }, [memoizedApi, userId, subtopicId]);

  /**
   * Calculate current progress for display
   * Uses current take attempts to show progress within the current take
   */
  const getCurrentProgress = useCallback(() => {
    // currentTakeAttempts represents completed challenges in current take
    // For display: if currentTakeAttempts is 0, we're on challenge 1
    // If currentTakeAttempts is 1, we're on challenge 2, etc.
    // For cancelled challenges, we're resuming the same challenge number
    const currentChallengeNumber = currentTakeAttempts;
    
    return currentChallengeNumber;
  }, [currentTakeAttempts]);

  /**
   * Submit challenge answer
   */
  const submitAnswer = useCallback(async (answer) => {
    // Multiple layers of protection against duplicate submissions
    if (challengeState === CHALLENGE_STATES.SUBMITTED) {
      return;
    }

    if (isSubmitting) {
      return;
    }

    if (!userChallengeId) {
      console.error('No user challenge ID available for submission');
      setError('Unable to submit: Challenge not properly initialized');
      return;
    }

    // Log the answer being submitted (including empty answers)
    console.log('Submitting challenge answer:', {
      answer,
      answerType: typeof answer,
      isEmpty: answer === null || answer === undefined || answer === '' || 
               (Array.isArray(answer) && answer.length === 0) ||
               (typeof answer === 'object' && Object.keys(answer).length === 0),
      challengeId: currentChallenge?.id,
      userChallengeId
    });

    // Option 2: Validate server session before submission (skip for resumed/expired cancelled challenges)
    console.log('🔍 DEBUG: Current challengeState:', challengeState);
    console.log('🔍 DEBUG: Is RESUMED?', challengeState === CHALLENGE_STATES.RESUMED);
    console.log('🔍 DEBUG: Is EXPIRED?', challengeState === CHALLENGE_STATES.EXPIRED);
    console.log('🔍 DEBUG: Is RESUMED (cancelled)?', isResumed);
    console.log('🔍 DEBUG: Should skip validation?', challengeState === CHALLENGE_STATES.RESUMED || (challengeState === CHALLENGE_STATES.EXPIRED && isResumed));
    
    if (currentChallenge?.id && challengeState !== CHALLENGE_STATES.RESUMED && !(challengeState === CHALLENGE_STATES.EXPIRED && isResumed)) {
      console.log('🔍 DEBUG: Running session validation...');
      const sessionValidation = await validateServerSession(currentChallenge.id);
      if (!sessionValidation.valid) {
        // Check if this is a timing issue with session token
        console.log('Option 2: Session validation failed, checking if this is a timing issue');
        console.log('Current sessionToken:', sessionToken);
        
        // If sessionToken is null but we just activated a session, this might be a timing issue
        // Allow submission in this case since the session was successfully activated
        if (!sessionToken) {
          console.log('Option 2: Session token is null - this might be a timing issue after activation');
          console.log('Option 2: Allowing submission despite session validation failure');
        } else if (sessionValidation.message === 'Invalid session token') {
          // Token mismatch - this can happen when switching between challenges quickly
          console.log('Option 2: Session token mismatch detected - allowing submission anyway');
          console.log('Option 2: This can happen when switching between challenges quickly');
        } else {
          console.error('Option 2: Session validation failed:', sessionValidation.message);
          setError(`Session expired: ${sessionValidation.message}. Please restart the challenge.`);
          setIsSubmitting(false);
          return;
        }
      }
    } else if (challengeState === CHALLENGE_STATES.RESUMED || (challengeState === CHALLENGE_STATES.EXPIRED && isResumed)) {
      console.log('Option 2: Skipping session validation for resumed/expired cancelled challenge');
    }

    setIsSubmitting(true);
    setUserAnswer(answer);
    
    // 🎯 CRITICAL FIX: Clear the timer immediately when submitting to prevent it from persisting to next challenge
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // 🎯 CRITICAL FIX: Reset timer state immediately when submitting to prevent expired state from persisting
    setTimerState(TIMER_STATES.ACTIVE);
    setTimerExpiredWarning(false);
    
    try {
      // Import validation function
      const { validateChallenge } = await import('../services/challengeValidation');
      
      // Validate the answer based on challenge mode
      const validationResult = validateChallenge(currentChallenge.mode, answer, currentChallenge);
      
      // Apply adaptive submission logic
      let adaptiveTimeSpent = timeSpent;
      let adaptiveHintsUsed = hintsUsed;
      
      // If timer is disabled, set time_spent to 0
      if (!isTimerEnabled) {
        adaptiveTimeSpent = 0;
      }
      
      // If hints are disabled, set hints_used to 0
      if (!isHintsEnabled) {
        adaptiveHintsUsed = 0;
      }
      
      const attemptData = {
        user_challenge_id: userChallengeId,
        user_answer: JSON.stringify(answer),
        time_spent: adaptiveTimeSpent,
        hints_used: adaptiveHintsUsed,
        is_successful: (challengeState === CHALLENGE_STATES.RESUMED || challengeState === CHALLENGE_STATES.EXPIRED) ? false : validationResult.isCorrect,
        points: (challengeState === CHALLENGE_STATES.RESUMED || challengeState === CHALLENGE_STATES.EXPIRED) ? 0 : validationResult.points,
        timer_enabled: isTimerEnabled,
        hints_enabled: isHintsEnabled
      };
      
      await memoizedApi.submitChallengeAttempt(attemptData);
      
      // 🎯 NEW: Update statistics for learning mode performance
      try {
        const statisticsPayload = {
          type: currentChallenge.mode, // "code_completion", "code_fixer", or "output_tracing"
          is_correct: (challengeState === CHALLENGE_STATES.RESUMED || challengeState === CHALLENGE_STATES.EXPIRED) ? false : validationResult.isCorrect,
          time_spent: adaptiveTimeSpent,
          completed_type: true // This challenge was completed (not cancelled)
        };
        
        await post('/statistics/challenge', statisticsPayload);
        console.log('✅ Statistics updated successfully for learning mode performance');
      } catch (statsError) {
        console.error('❌ Failed to update statistics:', statsError);
        // Don't fail the entire submission if statistics update fails
      }
      
      // Option 2: Deactivate server session after successful submission (skip for resumed/expired cancelled challenges)
      if (currentChallenge?.id && challengeState !== CHALLENGE_STATES.RESUMED && !(challengeState === CHALLENGE_STATES.EXPIRED && isResumed)) {
        await deactivateServerSession(currentChallenge.id);
      } else if (challengeState === CHALLENGE_STATES.RESUMED || (challengeState === CHALLENGE_STATES.EXPIRED && isResumed)) {
        console.log('Option 2: Skipping session deactivation for resumed/expired cancelled challenge');
      }
      
      setChallengeState(CHALLENGE_STATES.SUBMITTED);
      
      // Show feedback instead of immediately proceeding
      const feedbackInfo = {
        isCorrect: (challengeState === CHALLENGE_STATES.RESUMED || challengeState === CHALLENGE_STATES.EXPIRED) ? false : validationResult.isCorrect, // Use actual validation result for non-cancelled/expired challenges
        feedback: challengeState === CHALLENGE_STATES.RESUMED 
          ? "This challenge was marked as incorrect because you cancelled it earlier. When you cancel a challenge, it is automatically counted as wrong regardless of your progress. This helps maintain the integrity of the challenge system and ensures fair scoring."
          : challengeState === CHALLENGE_STATES.EXPIRED
          ? "This challenge was marked as incorrect because you ran out of time. When the timer expires, your answer is automatically counted as wrong regardless of your progress. This helps maintain the integrity of the challenge system and ensures fair scoring."
          : (validationResult.detailedFeedback || validationResult.feedback || currentChallenge.explanation),
        userAnswer: answer,
        correctAnswer: validationResult.correctAnswer || currentChallenge.solution_code || currentChallenge.expected_output,
        challengeMode: currentChallenge.mode,
        points: (challengeState === CHALLENGE_STATES.RESUMED || challengeState === CHALLENGE_STATES.EXPIRED) ? 0 : validationResult.points, // Use actual points for non-cancelled/expired challenges
        timeSpent: timeSpent,
        hintsUsed: hintsUsed,
        timerEnabled: isTimerEnabled,
        hintsEnabled: isHintsEnabled,
        isCancelled: challengeState === CHALLENGE_STATES.RESUMED || challengeState === CHALLENGE_STATES.EXPIRED,
        isTimeExpired: challengeState === CHALLENGE_STATES.EXPIRED,
        isCancelledChallenge: challengeState === CHALLENGE_STATES.RESUMED,
        // Additional challenge data for enhanced feedback
        challengeCode: currentChallenge.challengeCode || currentChallenge.initialCode || currentChallenge.code,
        explanation: currentChallenge.explanation
      };
      
      setFeedbackData(feedbackInfo);
      setShowFeedback(true);
      setIsSubmitting(false);
      
      // Clear timer warning when showing feedback
      setTimerExpiredWarning(false);
      
      // Refresh adaptive features after submission to update for next challenge
      refreshAdaptiveFeatures();
      
    } catch (error) {
      console.error('Error submitting challenge:', error);
      setError(error.message);
      // Reset submitting state on error to allow retry
      setIsSubmitting(false);
    }
  }, [memoizedApi, currentChallenge, userChallengeId, timeSpent, hintsUsed, challengeState, loadNextChallenge, loadAttemptCount, isSubmitting, validateServerSession, deactivateServerSession, sessionToken, isTimerEnabled, isHintsEnabled]);

  /**
   * Pause timer
   */
  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setTimerState(TIMER_STATES.PAUSED);
    }
  }, []);

  /**
   * Resume timer
   */
  const resumeTimer = useCallback(() => {
    if (timerState === TIMER_STATES.PAUSED) {
      setTimerState(TIMER_STATES.ACTIVE);
      // Don't call startTimer here - just resume the existing timer
    }
  }, [timerState]);

  /**
   * Use hint
   */
  const useHint = useCallback(() => {
    if (hintsUsed < hintsAvailable && challengeState === CHALLENGE_STATES.ACTIVE && currentChallenge?.hints) {
      const hintKey = `${hintsUsed + 1}`; // Use "1", "2", "3" format
      const actualHint = currentChallenge.hints[hintKey];
      
      if (actualHint) {
        const newHint = `Hint ${hintsUsed + 1}: ${actualHint}`;
        setHintsUsed(prev => prev + 1);
        setRevealedHints(prev => [...prev, newHint]);
      }
    }
  }, [hintsUsed, hintsAvailable, challengeState, currentChallenge]);

  /**
   * Cancel current challenge (for resume logic)
   */
  const cancelCurrentChallenge = useCallback(async () => {
    // 🎯 CRITICAL FIX: Clear timer when cancelling challenge
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (currentChallenge && userChallengeId) {
      try {
        const cancelData = {
          time_spent: timeSpent,
          hints_used: hintsUsed,
          partial_answer: userAnswer ? JSON.stringify(userAnswer) : null,
          timer_enabled: isTimerEnabled,
          hints_enabled: isHintsEnabled
        };
        await memoizedApi.cancelChallenge(userId, currentChallenge.id, cancelData);
        
        // 🎯 NEW: Update statistics for cancelled challenge
        try {
          const statisticsPayload = {
            type: currentChallenge.mode, // "code_completion", "code_fixer", or "output_tracing"
            is_correct: false, // Cancelled challenges are always marked as incorrect
            time_spent: timeSpent,
            completed_type: false // This challenge was cancelled (not completed)
          };
          
          await post('/statistics/challenge', statisticsPayload);
          console.log('✅ Statistics updated successfully for cancelled challenge');
        } catch (statsError) {
          console.error('❌ Failed to update statistics for cancelled challenge:', statsError);
          // Don't fail the cancellation if statistics update fails
        }
        
        setIsResumed(true);
        setChallengeState(CHALLENGE_STATES.RESUMED);
      } catch (error) {
        console.error('Error canceling challenge:', error);
      }
    }
  }, [memoizedApi, currentChallenge, userChallengeId, userId, timeSpent, hintsUsed, userAnswer, isTimerEnabled, isHintsEnabled, post]);

  /**
   * Handle continuing after feedback is shown
   */
  const handleContinueAfterFeedback = useCallback(async () => {
    setShowFeedback(false);
    setFeedbackData(null);
    
    // 🎯 CRITICAL FIX: Clear any remaining timer to prevent it from persisting to next challenge
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // 🎯 CRITICAL FIX: Reset timer state immediately when continuing to prevent expired state from persisting
    setTimerState(TIMER_STATES.ACTIVE);
    setTimerExpiredWarning(false);
    
    // Set loading state for challenge transition
    setLoading(true);
    
    // Reload attempt count from server to get the accurate count after backend processing
    await loadAttemptCount();
    
    // Increment current take attempts
    setCurrentTakeAttempts(prev => prev + 1);
    const newCurrentTakeAttempts = currentTakeAttempts + 1;
    
    console.log(`📊 SUBMIT: Current take attempts: ${newCurrentTakeAttempts}/5`);
    
    if (newCurrentTakeAttempts === 5) {
      // This was the last challenge of a take, complete the run
      console.log('✅ COMPLETE: All 5 challenges done!');
      setTimeout(() => {
        completeChallengeRun();
      }, 1000); // Short delay for UX
    } else {
      // Move to next challenge with loading feedback
      console.log(`🔄 NEXT: Loading challenge ${newCurrentTakeAttempts + 1} of 5`);
      setTimeout(() => {
        loadNextChallenge(newCurrentTakeAttempts);
      }, 1000); // Short delay for UX
    }
  }, [loadAttemptCount, currentTakeAttempts, completeChallengeRun, loadNextChallenge]);

  /**
   * Handle any exit attempt
   */
  const handleAnyExit = useCallback(() => {
    // Show warning if challenge is active, resumed (cancelled challenges that need submission), expired (timer ran out), or submitted (feedback page)
    if ((challengeState === CHALLENGE_STATES.ACTIVE || 
         challengeState === CHALLENGE_STATES.RESUMED || 
         challengeState === CHALLENGE_STATES.EXPIRED ||
         challengeState === CHALLENGE_STATES.SUBMITTED) && !executingExitRef.current) {
      setShowCustomExitWarning(true);
      return true;
    }
    return false;
  }, [challengeState, executingExitRef]);

  // React Router integration for better navigation detection
  useEffect(() => {
    const handleRouteChange = () => {
      if ((challengeState === CHALLENGE_STATES.ACTIVE || 
           challengeState === CHALLENGE_STATES.EXPIRED ||
           challengeState === CHALLENGE_STATES.SUBMITTED) && !executingExitRef.current) {
        if (handleAnyExit()) {
          // This will be handled by our custom modal
          return;
        }
      }
    };

    // Listen for React Router navigation
    const unlisten = navigate(handleRouteChange);
    
    return () => {
      if (unlisten) unlisten();
    };
  }, [navigate, challengeState, executingExitRef, handleAnyExit]);

  // Enhanced localStorage session management
  useEffect(() => {
    // Check for existing session on mount
    const existingSession = localStorage.getItem(CHALLENGE_SESSION_KEY);
    if (existingSession && challengeState === CHALLENGE_STATES.ACTIVE) {
    }

    // Cleanup session when component unmounts ONLY
    return () => {
      // Don't cleanup if we're in the process of executing an exit
      if (executingExitRef.current) {
        return;
      }
      
      // Add a small delay to ensure exit process completes
      setTimeout(() => {
        if (!executingExitRef.current) {
          localStorage.removeItem(CHALLENGE_SESSION_KEY);
        } else {
        }
      }, 100);
    };
  }, []); // Empty dependency array - only run on mount/unmount

  /**
   * Handle continue challenge (user chooses to stay)
   */
  const handleContinueChallenge = useCallback(() => {
    setShowCustomExitWarning(false);
    setPendingExitAction(null);
  }, []);

  /**
   * Handle leave anyway (user chooses to leave) - FIXED
   */
  const handleLeaveAnyway = useCallback(async () => {
    setIsProcessingExit(true);
    executingExitRef.current = true; // Prevent multiple executions
    
    try {
      // Use refs to ensure we have the most current data
      const challengeToCancel = currentChallengeRef.current || currentChallenge;
      const challengeIdToUse = userChallengeIdRef.current || userChallengeId;
      
      // If we're on the feedback page (SUBMITTED state), delete all challenge attempts for this subtopic
      if (challengeState === CHALLENGE_STATES.SUBMITTED) {
        console.log('🗑️ DELETE ALL ATTEMPTS: User leaving from feedback page, deleting all attempts for subtopic:', subtopicId);
        try {
          const deleteResult = await memoizedApi.deleteAllChallengeAttemptsForSubtopic(userId, subtopicId);
          console.log('🗑️ DELETE ALL ATTEMPTS: Successfully deleted', deleteResult.deleted_count, 'attempts');
        } catch (deleteError) {
          console.error('🗑️ DELETE ALL ATTEMPTS: Error deleting attempts:', deleteError);
          // Continue with normal flow even if deletion fails
        }
      } else {
        // Normal flow for active/expired/resumed challenges
        // Option 2: Deactivate server session first
        if (challengeToCancel?.id) {
          await deactivateServerSession(challengeToCancel.id);
        }

        // Try to cancel the challenge via API
        if (challengeToCancel && challengeIdToUse && challengeToCancel.id) {
          const cancelData = {
            time_spent: timeSpentRef.current || timeSpent,
            hints_used: hintsUsedRef.current || hintsUsed,
            partial_answer: userAnswer ? JSON.stringify(userAnswer) : null,
            timer_enabled: isTimerEnabled,
            hints_enabled: isHintsEnabled
          };
          console.log('🔄 CANCEL CHALLENGE: userAnswer =', userAnswer);
          console.log('🔄 CANCEL CHALLENGE: Sending cancel data:', cancelData);
          await memoizedApi.cancelChallenge(userId, challengeToCancel.id, cancelData);
        } else {
          throw new Error('Missing challenge ID');
        }
      }
    } catch (error) {
      console.error('Exit prevention: Error canceling challenge:', error);
      // Fallback: Create a failed attempt with current state (only for non-feedback page states)
      if (challengeState !== CHALLENGE_STATES.SUBMITTED) {
        try {
          const attemptData = {
            user_challenge_id: userChallengeIdRef.current || userChallengeId,  // This should now be correctly set
            user_answer: "", // empty string for cancelled challenges
            time_spent: timeSpentRef.current || timeSpent,
            hints_used: hintsUsedRef.current || hintsUsed,
            is_successful: false,
            points: 0
          };
          await memoizedApi.submitChallengeAttempt(attemptData);
        } catch (fallbackError) {
          console.error('Exit prevention: Error creating fallback attempt:', fallbackError);
        }
      }
    } finally {
      setIsProcessingExit(false);
      setShowCustomExitWarning(false);
      
      // Clear session
      localStorage.removeItem(CHALLENGE_SESSION_KEY);
      
      // Execute the pending exit action without triggering browser dialogs
      if (pendingExitAction) {
        setTimeout(() => {
          pendingExitAction();
          setPendingExitAction(null);
          // Keep the flags set for a bit longer to prevent browser dialogs
          setTimeout(() => {
            executingExitRef.current = false;
          }, 200);
        }, 100);
      } else {
        // No pending action, just reset the flag
        setTimeout(() => {
          executingExitRef.current = false;
        }, 200);
      }
    }
  }, [memoizedApi, currentChallenge, userChallengeId, userId, timeSpent, hintsUsed, pendingExitAction, deactivateServerSession, challengeState, subtopicId]);

  /**
   * Handle resume after leaving
   */
  const handleResume = useCallback(async () => {
    if (isResumed) {
      // Current challenge counted as wrong
      setChallengeState(CHALLENGE_STATES.RESUMED);
      setTimerState(TIMER_STATES.EXPIRED);
      // Disable interactions but allow submission
    }
  }, [isResumed]);

  /**
   * Update user answer in real-time (for saving partial progress)
   */
  const updateUserAnswer = useCallback((answer) => {
    console.log('🔄 UPDATE USER ANSWER: Called with:', answer);
    setUserAnswer(answer);
  }, []);

  /**
   * Reset challenge component state
   */
  const resetChallengeState = useCallback(() => {
    setUserAnswer(null);
    setTimerExpiredWarning(false);
  }, []);

  /**
   * Reset entire challenge session (for restarting challenges)
   */
  const resetChallengeSession = useCallback(() => {
    setChallengeIndex(0);
    setAttemptCount(0);
    setChallengeState(CHALLENGE_STATES.LOADING);
    setCurrentChallenge(null);
    setUserChallengeId(null);
    setTimeSpent(0);
    setHintsUsed(0);
    setRevealedHints([]);
    setUserAnswer(null);
    setError(null);
    setLoading(false);
    setIsResumed(false);
    setResumeWarning(false);
    setTimerExpiredWarning(false);
    setIsSubmitting(false);
    
    // Clear session data
    localStorage.removeItem(CHALLENGE_SESSION_KEY);
    setSessionToken(null);
    setShowOtherSessionWarning(false);
    setOtherSessions([]);
    
    // Reset initial load flag to allow fresh start
    initialLoadRef.current = false;
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
  }, []);

  // Load first challenge and attempt count on mount
  useEffect(() => {
    console.log('🔄 INIT: useEffect triggered, initialLoadRef.current =', initialLoadRef.current);
    
    // Only initialize if we haven't already and we have valid parameters
    // Also wait for adaptive features to load (unless there's an error)
    if (!initialLoadRef.current && userId && subtopicId && !adaptiveLoading && !adaptiveError) {
      console.log('🚀 INIT: Starting initialization...');
      initialLoadRef.current = true;
      // Reset challenge index when starting fresh
      setChallengeIndex(0);
      
      // Load attempt count first, then load next challenge
      const initializeChallenge = async () => {
        try {
          console.log('📊 INIT: Getting attempt count...');
          // Get attempt count directly from API
          const count = await memoizedApi.getChallengeAttemptCount(userId, subtopicId);
          console.log('📊 INIT: Got attempt count:', count);
          setAttemptCount(count);
          
          // Pass the count directly to loadNextChallenge
          console.log('📋 INIT: Loading next challenge with count:', count);
          await loadNextChallenge(null, count);
        } catch (error) {
          console.error('❌ INIT: Error initializing challenge:', error);
          // Don't show error screen, just try to load next challenge
          try {
            await loadNextChallenge();
          } catch (loadError) {
            console.error('❌ INIT: Failed to load next challenge:', loadError);
            setError('Failed to load challenge. Please try again.');
          }
        }
      };
      
      initializeChallenge();
    } else if (adaptiveError) {
      console.error('❌ ADAPTIVE: Error loading adaptive features:', adaptiveError);
      setError('Failed to load adaptive features. Please try again.');
    } else {
      console.log('⏭️ INIT: Skipping initialization - already done, missing params, or adaptive features still loading');
    }
  }, [memoizedApi, userId, subtopicId, adaptiveLoading, adaptiveError]); // Remove loadNextChallenge to prevent multiple triggers

  // Separate cleanup effect for timer - only runs on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []); // Empty dependency array - only runs on mount/unmount

  // Simplified event listeners - FIXED
  useEffect(() => {
    // 1. Popstate - for browser back/forward buttons (FIXED)
    const handlePopState = (e) => {
      if (handleAnyExit()) {
        e.preventDefault();
        e.stopPropagation();
        // Store the exit action for later execution - FIXED: Don't use history.go(-1)
        setPendingExitAction(() => () => {
          navigate(`/my-deck/${fullTopicId}`);
        });
        return false;
      }
    };

    // 2. Click - for link clicks and button clicks
    const handleClick = (e) => {
      // Check for links
      const link = e.target.closest('a');
      if (link && link.href) {
        // Check if this is a navigation away from challenges
        const isLeavingChallenges = !link.href.includes('/challenges');
        if (isLeavingChallenges && handleAnyExit()) {
          e.preventDefault();
          e.stopPropagation();
          // Store the exit action for later execution
          setPendingExitAction(() => () => {
            // Extract just the path from the full URL
            const url = new URL(link.href);
            const path = url.pathname + url.search + url.hash;
            navigate(path);
          });
        }
      }

      // Check for buttons that might navigate - ONLY specific navigation buttons
      const button = e.target.closest('button');
      if (button) {
        // Check if this is a challenge-related button (should not trigger exit prevention)
        const isChallengeButton = button.closest('.challengeArea') || 
                                 button.closest('.codeFixerContainer') ||
                                 button.closest('.codeCompletionContainer') ||
                                 button.closest('.outputTracingContainer') ||
                                 button.closest('.choicesContainer') ||
                                 button.closest('.submitButton') ||
                                 button.closest('.hintButton') ||
                                 button.closest('.timerContainer') ||
                                 button.closest('.progressIndicator') ||
                                 button.closest('.sidebar') ||
                                 button.closest('.challengeSidebar');
        
        // Only check for navigation if it's NOT a challenge-related button
        if (!isChallengeButton) {
          const buttonText = button.textContent?.toLowerCase();
          const isNavigationButton = buttonText?.includes('back') || 
                                    buttonText?.includes('dashboard') || 
                                    buttonText?.includes('my deck') || 
                                    buttonText?.includes('progress') ||
                                    buttonText?.includes('practice') ||
                                    buttonText?.includes('logout') ||
                                    buttonText?.includes('sign out') ||
                                    buttonText?.includes('log out');
          
          if (isNavigationButton && handleAnyExit()) {
            e.preventDefault();
            e.stopPropagation();
            // Store the exit action for later execution
            setPendingExitAction(() => () => {
              // Navigate based on button text
              if (buttonText?.includes('back to practice') || buttonText?.includes('practice')) {
                // Navigate to practice page, not subtopic page
                navigate(`/lesson/${fullTopicId}/${subtopicId}/practice`);
              } else if (buttonText?.includes('back')) {
                // Generic back button - go to subtopic page
                navigate(`/my-deck/${fullTopicId}`);
              } else if (buttonText?.includes('dashboard')) {
                navigate('/dashboard');
              } else if (buttonText?.includes('my deck')) {
                navigate('/my-deck');
              } else if (buttonText?.includes('progress')) {
                navigate('/progress');
              } else if (buttonText?.includes('logout') || buttonText?.includes('sign out') || buttonText?.includes('log out')) {
                // Handle logout - redirect to login page
                navigate('/login');
              }
            });
          }
        }
      }
    };

    // 3. Keydown - for keyboard shortcuts (attempt to prevent)
    const handleKeyDown = (e) => {
      // Check for Ctrl+R, F5, or Ctrl+Shift+R
      if ((e.ctrlKey && e.key === 'r') || e.key === 'F5' || (e.ctrlKey && e.shiftKey && e.key === 'R')) {
        if (handleAnyExit()) {
          e.preventDefault();
          e.stopPropagation();
          // Store the exit action for later execution
          setPendingExitAction(() => () => {
            navigate(`/my-deck/${fullTopicId}`);
          });
        }
      }

      // Check for Enter key in URL bar (can't prevent, but can warn)
      if (e.key === 'Enter' && document.activeElement === document.querySelector('input[type="url"], input[name="url"]')) {
          // We can't prevent this, but we can show a warning
          e.preventDefault();
          e.stopPropagation();
      }
    };

    // 4. Beforeunload - for browser close/refresh (can't prevent, but can warn)
    const handleBeforeUnload = (e) => {
      if ((challengeState === CHALLENGE_STATES.ACTIVE || 
           challengeState === CHALLENGE_STATES.RESUMED || 
           challengeState === CHALLENGE_STATES.EXPIRED ||
           challengeState === CHALLENGE_STATES.SUBMITTED) && !executingExitRef.current) {
        
        // Show browser warning
        e.preventDefault();
        e.returnValue = 'If you leave now, this challenge will be counted as wrong.';
        return e.returnValue;
      }
    };

    // 5. Hashchange - for URL hash changes
    const handleHashChange = (e) => {
      if (handleAnyExit()) {
        e.preventDefault();
        e.stopPropagation();
        // Store the exit action for later execution
        setPendingExitAction(() => () => {
          navigate(`/my-deck/${fullTopicId}`);
        });
        return false;
      }
    };

    // 6. Visibility change - for tab switching (detection only)
    const handleVisibilityChange = () => {
      if (document.hidden && (challengeState === CHALLENGE_STATES.ACTIVE || 
                              challengeState === CHALLENGE_STATES.RESUMED || 
                              challengeState === CHALLENGE_STATES.EXPIRED ||
                              challengeState === CHALLENGE_STATES.SUBMITTED)) {
        // We can't prevent tab switching, but we can log it
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('hashchange', handleHashChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('click', handleClick, true); // Use capture phase
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('hashchange', handleHashChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleAnyExit, subtopicId, challengeState, executingExitRef, topicId, subtopicId, fullTopicId]);

  // Test function to verify exit prevention (for debugging)
  const testExitPrevention = useCallback(() => {
    console.log('Challenge state:', challengeState);
    console.log('Is active:', challengeState === CHALLENGE_STATES.ACTIVE);
    console.log('Is resumed:', challengeState === CHALLENGE_STATES.RESUMED);
    console.log('Is expired:', challengeState === CHALLENGE_STATES.EXPIRED);
    console.log('Is submitted:', challengeState === CHALLENGE_STATES.SUBMITTED);
    console.log('Should prevent exit:', challengeState === CHALLENGE_STATES.ACTIVE || 
                challengeState === CHALLENGE_STATES.RESUMED || 
                challengeState === CHALLENGE_STATES.EXPIRED ||
                challengeState === CHALLENGE_STATES.SUBMITTED);
    console.log('Executing exit:', executingExitRef.current);
    console.log('Show warning:', showCustomExitWarning);
    
    if (challengeState === CHALLENGE_STATES.ACTIVE || 
        challengeState === CHALLENGE_STATES.RESUMED || 
        challengeState === CHALLENGE_STATES.EXPIRED ||
        challengeState === CHALLENGE_STATES.SUBMITTED) {
    } else {
    }
  }, [challengeState, showCustomExitWarning]);

  // Expose test function in development
  if (process.env.NODE_ENV === 'development') {
    window.testExitPrevention = testExitPrevention;
  }

  // 🎯 CRITICAL FIX: Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return {
    // Challenge state
    challengeState,
    currentChallenge,
    challengeIndex,
    totalChallenges,
    attemptCount,
    getCurrentProgress,
    loading,
    error,
    
    // Adaptive features
    isTimerEnabled,
    isHintsEnabled,
    adaptiveLoading,
    adaptiveError,
    refreshAdaptiveFeatures,
    
    // Timer state
    timerState,
    timeRemaining,
    timeSpent,
    initialTimerDuration,
    startTimer,
    pauseTimer,
    resumeTimer,
    
    // Hint state
    hintsUsed,
    revealedHints,
    hintsAvailable,
    useHint,
    
    // User answer state
    userAnswer,
    setUserAnswer,
    updateUserAnswer,
    submitAnswer,
    
    // Challenge management
    cancelCurrentChallenge,
    handleResume,
    resetChallengeSession,
    
    // Resume state
    isResumed,
    resumeWarning,
    setResumeWarning,
    timerExpiredWarning,
    setTimerExpiredWarning,
    resetChallengeState,
    
    // Exit prevention - Option 1: Custom warning modal
    showCustomExitWarning,
    isProcessingExit,
    handleContinueChallenge,
    handleLeaveAnyway,
    
    // Option 2: Server-side session management
    sessionToken,
    showOtherSessionWarning,
    otherSessions,
    forceDeactivateAllSessions,
    
    // Submission protection
    isSubmitting,
    showFeedback,
    feedbackData,
    handleContinueAfterFeedback
  };
}; 