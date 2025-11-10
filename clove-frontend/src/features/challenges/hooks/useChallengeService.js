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
  const { post } = useApi();
  const { topicId: contextTopicId, subtopicId: contextSubtopicId, completeSubtopicComponent } = useContext(MyDeckContext);
  
  const fullTopicId = location.pathname.split('/')[2] || '1-data-types-and-variables';
  
  const topicId = contextTopicId || (fullTopicId ? parseInt(fullTopicId.split('-')[0]) : 1);
  const subtopicId = contextSubtopicId || paramSubtopicId;
  
  const memoizedApi = useMemo(() => challengeApi, []);
  
  const [challengeState, setChallengeState] = useState(CHALLENGE_STATES.LOADING);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [userChallengeId, setUserChallengeId] = useState(null);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [totalChallenges] = useState(5);
  const [attemptCount, setAttemptCount] = useState(0);
  
  const [isInTake, setIsInTake] = useState(false);
  const [currentTakeAttempts, setCurrentTakeAttempts] = useState(0);
  
  const { isTimerEnabled, isHintsEnabled, isLoading: adaptiveLoading, error: adaptiveError, refreshAdaptiveFeatures } = useAdaptiveFeatures(subtopicId, currentTakeAttempts);
  
  const initialLoadRef = useRef(false);
  
  const [showCustomExitWarning, setShowCustomExitWarning] = useState(false);
  const [isProcessingExit, setIsProcessingExit] = useState(false);
  const [pendingExitAction, setPendingExitAction] = useState(null);

  const CHALLENGE_SESSION_KEY = `challenge_active_${userId}_${subtopicId}`;

  const [sessionToken, setSessionToken] = useState(null);
  const [showOtherSessionWarning, setShowOtherSessionWarning] = useState(false);
  const [otherSessions, setOtherSessions] = useState([]);

  const executingExitRef = useRef(false);

  const currentChallengeRef = useRef(null);
  const userChallengeIdRef = useRef(null);
  const timeSpentRef = useRef(0);
  const hintsUsedRef = useRef(0);
  const userIdRef = useRef(userId);
  const sessionTokenRef = useRef(null);

  const [timerState, setTimerState] = useState(TIMER_STATES.ACTIVE);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [initialTimerDuration, setInitialTimerDuration] = useState(300);
  const timerRef = useRef(null);
  
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedHints, setRevealedHints] = useState([]);
  const [hintsAvailable, setHintsAvailable] = useState(0);
  
  const [userAnswer, setUserAnswer] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isResumed, setIsResumed] = useState(false);
  const [resumeWarning, setResumeWarning] = useState(false);
  const [timerExpiredWarning, setTimerExpiredWarning] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);

  useEffect(() => {
    currentChallengeRef.current = currentChallenge;
    userChallengeIdRef.current = userChallengeId;
    timeSpentRef.current = timeSpent;
    hintsUsedRef.current = hintsUsed;
    userIdRef.current = userId;
  }, [currentChallenge, userChallengeId, timeSpent, hintsUsed, userId]);

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
    }
  }, [memoizedApi, userId, sessionToken]);

  const forceDeactivateAllSessions = useCallback(async () => {
    try {
      const response = await memoizedApi.forceDeactivateAllSessions(userId);
      setShowOtherSessionWarning(false);
      setOtherSessions([]);
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, message: 'Failed to deactivate sessions' };
    }
  }, [memoizedApi, userId]);

  const startTimer = useCallback((duration) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setTimeRemaining(duration);
    setTimerState(TIMER_STATES.ACTIVE);
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setTimerState(TIMER_STATES.EXPIRED);
          setChallengeState(CHALLENGE_STATES.EXPIRED);
          if (isTimerEnabled) {
            setTimerExpiredWarning(true);
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

  const completeChallengeRun = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    try {
      await completeSubtopicComponent(subtopicId, 'challenge');
    } catch (error) {
      // Don't set error state - we still want to navigate to results
    }
    
    const resultsUrl = `/lesson/${fullTopicId}/${subtopicId}/challenges/results`;
    localStorage.removeItem(CHALLENGE_SESSION_KEY);
    navigate(resultsUrl);
    closeSidebar();
  }, [memoizedApi, userId, subtopicId, navigate, closeSidebar, fullTopicId]);

  const loadNextChallenge = useCallback(async (passedCurrentTakeAttempts = null, passedAttemptCount = null) => {
    const effectiveCurrentTakeAttempts = passedCurrentTakeAttempts !== null ? passedCurrentTakeAttempts : currentTakeAttempts;
    const effectiveAttemptCount = passedAttemptCount !== null ? passedAttemptCount : attemptCount;
    
    if (effectiveCurrentTakeAttempts === 5) {
      await completeChallengeRun();
      return;
    }
    
    if (effectiveAttemptCount === 5 && effectiveCurrentTakeAttempts === 0) {
      setCurrentTakeAttempts(0);
    }
    
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
        setChallengeState(CHALLENGE_STATES.RESUMED);
        setIsResumed(true);
        
        setCurrentTakeAttempts(effectiveAttemptCount);
        
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
                
                // Check if the parsed answer is valid (could be object or string)
                if (parsedAnswer !== null && parsedAnswer !== undefined) {
                  // For CodeFixer: parsedAnswer is a string (the code)
                  // For CodeCompletion/OutputTracing: parsedAnswer is an object
                  if (typeof parsedAnswer === 'string' && parsedAnswer.trim() !== '') {
                    setUserAnswer(parsedAnswer);
                  } else if (typeof parsedAnswer === 'object' && Object.keys(parsedAnswer).length > 0) {
                    setUserAnswer(parsedAnswer);
                  } else {
                    setUserAnswer(null);
                  }
                } else {
                  setUserAnswer(null);
                }
              } catch (e) {
                setUserAnswer(null);
              }
            } else {
              setUserAnswer(null);
            }
          }
        } catch (error) {
        }
        setTimerExpiredWarning(false);
      } else {
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
    // Don't set error state - we still want to navigate to results
  }}, [memoizedApi, userId, subtopicId, challengeIndex, totalChallenges, completeChallengeRun, startTimer, activateServerSession, attemptCount, currentTakeAttempts, isTimerEnabled, isHintsEnabled]);

  const loadAttemptCount = useCallback(async () => {
    try {
      const count = await memoizedApi.getChallengeAttemptCount(userId, subtopicId);
      setAttemptCount(count);
    } catch (error) {
      setAttemptCount(0);
    }
  }, [memoizedApi, userId, subtopicId]);

  const getCurrentProgress = useCallback(() => {
    const currentChallengeNumber = currentTakeAttempts;
    
    return currentChallengeNumber;
  }, [currentTakeAttempts]);

  const submitAnswer = useCallback(async (answer) => {
    if (challengeState === CHALLENGE_STATES.SUBMITTED) {
      return;
    }

    if (isSubmitting) {
      return;
    }

    if (!userChallengeId) {
      setError('Unable to submit: Challenge not properly initialized');
      return;
    }

    if (currentChallenge?.id && challengeState !== CHALLENGE_STATES.RESUMED && !(challengeState === CHALLENGE_STATES.EXPIRED && isResumed)) {
      const sessionValidation = await validateServerSession(currentChallenge.id);
      if (!sessionValidation.valid) {
        
        if (!sessionToken) {
        } else if (sessionValidation.message === 'Invalid session token') {
        } else {
          setError(`Session expired: ${sessionValidation.message}. Please restart the challenge.`);
          setIsSubmitting(false);
          return;
        }
      }
    } else if (challengeState === CHALLENGE_STATES.RESUMED || (challengeState === CHALLENGE_STATES.EXPIRED && isResumed)) {
    }

    setIsSubmitting(true);
    setUserAnswer(answer);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setTimerState(TIMER_STATES.ACTIVE);
    setTimerExpiredWarning(false);
    
    try {
      const { validateChallenge } = await import('../services/challengeValidation');
      
      const validationResult = validateChallenge(currentChallenge.mode, answer, currentChallenge);
      
      let adaptiveTimeSpent = timeSpent;
      let adaptiveHintsUsed = hintsUsed;
      
      if (!isTimerEnabled) {
        adaptiveTimeSpent = 0;
      }
      
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
      
      try {
        const statisticsPayload = {
          type: currentChallenge.mode,
          is_correct: (challengeState === CHALLENGE_STATES.RESUMED || challengeState === CHALLENGE_STATES.EXPIRED) ? false : validationResult.isCorrect,
          time_spent: adaptiveTimeSpent,
          completed_type: true,
          points: (challengeState === CHALLENGE_STATES.RESUMED || challengeState === CHALLENGE_STATES.EXPIRED) ? 0 : validationResult.points
        };
        
        await post('/statistics/challenge', statisticsPayload);
      } catch (statsError) {
      }
      
      if (currentChallenge?.id && challengeState !== CHALLENGE_STATES.RESUMED && !(challengeState === CHALLENGE_STATES.EXPIRED && isResumed)) {
        await deactivateServerSession(currentChallenge.id);
      } else if (challengeState === CHALLENGE_STATES.RESUMED || (challengeState === CHALLENGE_STATES.EXPIRED && isResumed)) {
      }
      
      setChallengeState(CHALLENGE_STATES.SUBMITTED);
      
      const feedbackInfo = {
        isCorrect: (challengeState === CHALLENGE_STATES.RESUMED || challengeState === CHALLENGE_STATES.EXPIRED) ? false : validationResult.isCorrect,
        feedback: challengeState === CHALLENGE_STATES.RESUMED 
          ? "This challenge was marked as incorrect because you cancelled it earlier. When you cancel a challenge, it is automatically counted as wrong regardless of your progress. This helps maintain the integrity of the challenge system and ensures fair scoring."
          : challengeState === CHALLENGE_STATES.EXPIRED
          ? "This challenge was marked as incorrect because you ran out of time. When the timer expires, your answer is automatically counted as wrong regardless of your progress. This helps maintain the integrity of the challenge system and ensures fair scoring."
          : (validationResult.detailedFeedback || validationResult.feedback || currentChallenge.explanation),
        userAnswer: answer,
        correctAnswer: validationResult.correctAnswer || currentChallenge.solution_code || currentChallenge.expected_output,
        challengeMode: currentChallenge.mode,
        points: (challengeState === CHALLENGE_STATES.RESUMED || challengeState === CHALLENGE_STATES.EXPIRED) ? 0 : validationResult.points,
        timeSpent: timeSpent,
        hintsUsed: hintsUsed,
        timerEnabled: isTimerEnabled,
        hintsEnabled: isHintsEnabled,
        isCancelled: challengeState === CHALLENGE_STATES.RESUMED || challengeState === CHALLENGE_STATES.EXPIRED,
        isTimeExpired: challengeState === CHALLENGE_STATES.EXPIRED,
        isCancelledChallenge: challengeState === CHALLENGE_STATES.RESUMED,
        challengeCode: currentChallenge.challengeCode || currentChallenge.initialCode || currentChallenge.code,
        explanation: currentChallenge.explanation
      };
      
      setFeedbackData(feedbackInfo);
      setShowFeedback(true);
      setIsSubmitting(false);
      
      setTimerExpiredWarning(false);
      
      refreshAdaptiveFeatures();
      
    } catch (error) {
      setError(error.message);
      setIsSubmitting(false);
    }
  }, [memoizedApi, currentChallenge, userChallengeId, timeSpent, hintsUsed, challengeState, loadNextChallenge, loadAttemptCount, isSubmitting, validateServerSession, deactivateServerSession, sessionToken, isTimerEnabled, isHintsEnabled]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setTimerState(TIMER_STATES.PAUSED);
    }
  }, []);

  const resumeTimer = useCallback(() => {
    if (timerState === TIMER_STATES.PAUSED) {
      setTimerState(TIMER_STATES.ACTIVE);
    }
  }, [timerState]);

  const useHint = useCallback(() => {
    if (hintsUsed < hintsAvailable && challengeState === CHALLENGE_STATES.ACTIVE && currentChallenge?.hints) {
      const hintKey = `${hintsUsed + 1}`;
      const actualHint = currentChallenge.hints[hintKey];
      
      if (actualHint) {
        const newHint = `Hint ${hintsUsed + 1}: ${actualHint}`;
        setHintsUsed(prev => prev + 1);
        setRevealedHints(prev => [...prev, newHint]);
      }
    }
  }, [hintsUsed, hintsAvailable, challengeState, currentChallenge]);

  const cancelCurrentChallenge = useCallback(async () => {
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
        
        try {
          const statisticsPayload = {
            type: currentChallenge.mode,
            is_correct: false,
            time_spent: timeSpent,
            completed_type: false
          };
          
          await post('/statistics/challenge', statisticsPayload);
        } catch (statsError) {
        }
        
        setIsResumed(true);
        setChallengeState(CHALLENGE_STATES.RESUMED);
      } catch (error) {
      }
    }
  }, [memoizedApi, currentChallenge, userChallengeId, userId, timeSpent, hintsUsed, userAnswer, isTimerEnabled, isHintsEnabled, post]);

  const handleContinueAfterFeedback = useCallback(async () => {
    setShowFeedback(false);
    setFeedbackData(null);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setTimerState(TIMER_STATES.ACTIVE);
    setTimerExpiredWarning(false);
    
    setLoading(true);
    
    await loadAttemptCount();
    
    setCurrentTakeAttempts(prev => prev + 1);
    const newCurrentTakeAttempts = currentTakeAttempts + 1;
    
    if (newCurrentTakeAttempts === 5) {
      setTimeout(() => {
        completeChallengeRun();
      }, 1000);
    } else {
      setTimeout(() => {
        loadNextChallenge(newCurrentTakeAttempts);
      }, 1000);
    }
  }, [loadAttemptCount, currentTakeAttempts, completeChallengeRun, loadNextChallenge]);

  const handleAnyExit = useCallback(() => {
    if ((challengeState === CHALLENGE_STATES.ACTIVE || 
         challengeState === CHALLENGE_STATES.RESUMED || 
         challengeState === CHALLENGE_STATES.EXPIRED ||
         challengeState === CHALLENGE_STATES.SUBMITTED) && !executingExitRef.current) {
      setShowCustomExitWarning(true);
      return true;
    }
    return false;
  }, [challengeState, executingExitRef]);

  useEffect(() => {
    const handleRouteChange = () => {
      if ((challengeState === CHALLENGE_STATES.ACTIVE || 
           challengeState === CHALLENGE_STATES.EXPIRED ||
           challengeState === CHALLENGE_STATES.SUBMITTED) && !executingExitRef.current) {
        if (handleAnyExit()) {
          return;
        }
      }
    };

    const unlisten = navigate(handleRouteChange);
    
    return () => {
      if (unlisten) unlisten();
    };
  }, [navigate, challengeState, executingExitRef, handleAnyExit]);

  useEffect(() => {
    const existingSession = localStorage.getItem(CHALLENGE_SESSION_KEY);
    if (existingSession && challengeState === CHALLENGE_STATES.ACTIVE) {
    }

    return () => {
      if (executingExitRef.current) {
        return;
      }
      
      setTimeout(() => {
        if (!executingExitRef.current) {
          localStorage.removeItem(CHALLENGE_SESSION_KEY);
        } else {
        }
      }, 100);
    };
  }, []);

  const handleContinueChallenge = useCallback(() => {
    setShowCustomExitWarning(false);
    setPendingExitAction(null);
  }, []);

  const handleLeaveAnyway = useCallback(async () => {
    setIsProcessingExit(true);
    executingExitRef.current = true;
    
    try {
      const challengeToCancel = currentChallengeRef.current || currentChallenge;
      const challengeIdToUse = userChallengeIdRef.current || userChallengeId;
      
      if (challengeState === CHALLENGE_STATES.SUBMITTED) {
        try {
          const deleteResult = await memoizedApi.deleteAllChallengeAttemptsForSubtopic(userId, subtopicId);
        } catch (deleteError) {
        }
      } else {
        if (challengeToCancel?.id) {
          await deactivateServerSession(challengeToCancel.id);
        }

        if (challengeToCancel && challengeIdToUse && challengeToCancel.id) {
          const cancelData = {
            time_spent: timeSpentRef.current || timeSpent,
            hints_used: hintsUsedRef.current || hintsUsed,
            partial_answer: userAnswer ? JSON.stringify(userAnswer) : null,
            timer_enabled: isTimerEnabled,
            hints_enabled: isHintsEnabled
          };  
          await memoizedApi.cancelChallenge(userId, challengeToCancel.id, cancelData);
        } else {
          throw new Error('Missing challenge ID');
        }
      }
    } catch (error) {
      if (challengeState !== CHALLENGE_STATES.SUBMITTED) {
        try {
          const attemptData = {
            user_challenge_id: userChallengeIdRef.current || userChallengeId,
            user_answer: "",
            time_spent: timeSpentRef.current || timeSpent,
            hints_used: hintsUsedRef.current || hintsUsed,
            is_successful: false,
            points: 0
          };
          await memoizedApi.submitChallengeAttempt(attemptData);
        } catch (fallbackError) {
        }
      }
    } finally {
      setIsProcessingExit(false);
      setShowCustomExitWarning(false);
      
      localStorage.removeItem(CHALLENGE_SESSION_KEY);
      
      if (pendingExitAction) {
        setTimeout(() => {
          pendingExitAction();
          setPendingExitAction(null);
          setTimeout(() => {
            executingExitRef.current = false;
          }, 200);
        }, 100);
      } else {
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
      setChallengeState(CHALLENGE_STATES.RESUMED);
      setTimerState(TIMER_STATES.EXPIRED);
    }
  }, [isResumed]);

  const updateUserAnswer = useCallback((answer) => {
    setUserAnswer(answer);
  }, []);

  const resetChallengeState = useCallback(() => {
    setUserAnswer(null);
    setTimerExpiredWarning(false);
  }, []);

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
    
    localStorage.removeItem(CHALLENGE_SESSION_KEY);
    setSessionToken(null);
    setShowOtherSessionWarning(false);
    setOtherSessions([]);
    
    initialLoadRef.current = false;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
  }, []);

  useEffect(() => {
    if (!initialLoadRef.current && userId && subtopicId && !adaptiveLoading && !adaptiveError) {
      initialLoadRef.current = true;
      setChallengeIndex(0);
      
      const initializeChallenge = async () => {
        try {
          const count = await memoizedApi.getChallengeAttemptCount(userId, subtopicId);
          setAttemptCount(count);
          
          await loadNextChallenge(null, count);
        } catch (error) {
          try {
            await loadNextChallenge();
          } catch (loadError) {
            setError('Failed to load challenge. Please try again.');
          }
        }
      };
      
      initializeChallenge();
    } else if (adaptiveError) {
      setError('Failed to load adaptive features. Please try again.');
    }
  }, [memoizedApi, userId, subtopicId, adaptiveLoading, adaptiveError]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handlePopState = (e) => {
      if (handleAnyExit()) {
        e.preventDefault();
        e.stopPropagation();
        setPendingExitAction(() => () => {
          navigate(`/my-deck/${fullTopicId}`);
        });
        return false;
      }
    };

    const handleClick = (e) => {
      const link = e.target.closest('a');
      if (link && link.href) {
        const isLeavingChallenges = !link.href.includes('/challenges');
        if (isLeavingChallenges && handleAnyExit()) {
          e.preventDefault();
          e.stopPropagation();
          setPendingExitAction(() => () => {
            const url = new URL(link.href);
            const path = url.pathname + url.search + url.hash;
            navigate(path);
          });
        }
      }

      const button = e.target.closest('button');
      if (button) {
        const isChallengeButton = button.closest('.challengeArea') || 
                                 button.closest('.codeFixerContainer') ||
                                 button.closest('.codeCompletionContainer') ||
                                 button.closest('.outputTracingContainer') ||
                                 button.closest('.outputTracingChoicesContainer') ||
                                 button.closest('.outputTracingChoiceButton') ||
                                 button.closest('.outputTracingSubmitButton') ||
                                 button.closest('.outputTracingCodeDisplayContainer') ||
                                 button.closest('.outputTracingQuestionContainer') ||
                                 button.closest('.choicesContainer') ||
                                 button.closest('.submitButton') ||
                                 button.closest('.hintButton') ||
                                 button.closest('.timerContainer') ||
                                 button.closest('.progressIndicator') ||
                                 button.closest('.sidebar') ||
                                 button.closest('.challengeSidebar');
        
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
            setPendingExitAction(() => () => {
              if (buttonText?.includes('back to practice') || buttonText?.includes('practice')) {
                navigate(`/lesson/${fullTopicId}/${subtopicId}/practice`);
              } else if (buttonText?.includes('back')) {
                navigate(`/my-deck/${fullTopicId}`);
              } else if (buttonText?.includes('dashboard')) {
                navigate('/dashboard');
              } else if (buttonText?.includes('my deck')) {
                navigate('/my-deck');
              } else if (buttonText?.includes('progress')) {
                navigate('/progress');
              } else if (buttonText?.includes('logout') || buttonText?.includes('sign out') || buttonText?.includes('log out')) {
                navigate('/login');
              }
            });
          }
        }
      }
    };

    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.key === 'r') || e.key === 'F5' || (e.ctrlKey && e.shiftKey && e.key === 'R')) {
        if (handleAnyExit()) {
          e.preventDefault();
          e.stopPropagation();
          setPendingExitAction(() => () => {
            navigate(`/my-deck/${fullTopicId}`);
          });
        }
      }

      if (e.key === 'Enter' && document.activeElement === document.querySelector('input[type="url"], input[name="url"]')) {
          e.preventDefault();
          e.stopPropagation();
      }
    };

    const handleBeforeUnload = (e) => {
      if ((challengeState === CHALLENGE_STATES.ACTIVE || 
           challengeState === CHALLENGE_STATES.RESUMED || 
           challengeState === CHALLENGE_STATES.EXPIRED ||
           challengeState === CHALLENGE_STATES.SUBMITTED) && !executingExitRef.current) {
        
        e.preventDefault();
        e.returnValue = 'If you leave now, this challenge will be counted as wrong.';
        return e.returnValue;
      }
    };

    const handleHashChange = (e) => {
      if (handleAnyExit()) {
        e.preventDefault();
        e.stopPropagation();
        setPendingExitAction(() => () => {
          navigate(`/my-deck/${fullTopicId}`);
        });
        return false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && (challengeState === CHALLENGE_STATES.ACTIVE || 
                              challengeState === CHALLENGE_STATES.RESUMED || 
                              challengeState === CHALLENGE_STATES.EXPIRED ||
                              challengeState === CHALLENGE_STATES.SUBMITTED)) {
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('hashchange', handleHashChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('click', handleClick, true);
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

  const testExitPrevention = useCallback(() => {
    if (challengeState === CHALLENGE_STATES.ACTIVE || 
        challengeState === CHALLENGE_STATES.RESUMED || 
        challengeState === CHALLENGE_STATES.EXPIRED ||
        challengeState === CHALLENGE_STATES.SUBMITTED) {
    } else {
    }
  }, [challengeState, showCustomExitWarning]);

  if (process.env.NODE_ENV === 'development') {
    window.testExitPrevention = testExitPrevention;
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return {
    challengeState,
    currentChallenge,
    challengeIndex,
    totalChallenges,
    attemptCount,
    getCurrentProgress,
    loading,
    error,
    
    isTimerEnabled,
    isHintsEnabled,
    adaptiveLoading,
    adaptiveError,
    refreshAdaptiveFeatures,
    
    timerState,
    timeRemaining,
    timeSpent,
    initialTimerDuration,
    startTimer,
    pauseTimer,
    resumeTimer,
    
    hintsUsed,
    revealedHints,
    hintsAvailable,
    useHint,
    
    userAnswer,
    setUserAnswer,
    updateUserAnswer,
    submitAnswer,
    
    cancelCurrentChallenge,
    handleResume,
    resetChallengeSession,
    
    isResumed,
    resumeWarning,
    setResumeWarning,
    timerExpiredWarning,
    setTimerExpiredWarning,
    resetChallengeState,
    
    showCustomExitWarning,
    isProcessingExit,
    handleContinueChallenge,
    handleLeaveAnyway,
    
    sessionToken,
    showOtherSessionWarning,
    otherSessions,
    forceDeactivateAllSessions,
    
    isSubmitting,
    showFeedback,
    feedbackData,
    handleContinueAfterFeedback
  };
}; 
