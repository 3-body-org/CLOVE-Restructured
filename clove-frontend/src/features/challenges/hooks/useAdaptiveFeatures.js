import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useApi } from '../../../hooks/useApi';

export const useAdaptiveFeatures = (subtopicId, currentTakeAttempts = 0) => {
  const { user } = useAuth();
  const { get } = useApi();
  
  const [adaptiveState, setAdaptiveState] = useState({
    isTimerEnabled: false,
    isHintsEnabled: false,
    isLoading: true,
    error: null
  });
  
  const cacheRef = useRef(new Map());
  const fetchingRef = useRef(false);

  // Clear cache when subtopicId changes (new challenge run)
  useEffect(() => {
    cacheRef.current.clear();
    fetchingRef.current = false;
  }, [subtopicId]);

  // Memoize the API call function to prevent infinite re-renders
  const fetchAdaptiveData = useCallback(async () => {
    if (!user || !subtopicId) {
      setAdaptiveState({
        isTimerEnabled: false,
        isHintsEnabled: false,
        isLoading: false,
        error: null
      });
      return;
    }

    if (!user.is_adaptive) {
      setAdaptiveState({
        isTimerEnabled: true,
        isHintsEnabled: true,
        isLoading: false,
        error: null
      });
      return;
    }

    // 🎯 NEW LOGIC: If we're on the first challenge of any take, disable both timer and hints
    if (currentTakeAttempts === 0) {
      console.log('🎯 FIRST CHALLENGE: Disabling timer and hints for first challenge of take');
      setAdaptiveState({
        isTimerEnabled: false,
        isHintsEnabled: false,
        isLoading: false,
        error: null
      });
      return;
    }

    const cacheKey = `${user.id}_${subtopicId}_${currentTakeAttempts}`;
    if (cacheRef.current.has(cacheKey)) {
      const cachedData = cacheRef.current.get(cacheKey);
      setAdaptiveState({ ...cachedData, isLoading: false });
      return;
    }

    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const response = await get(
        `challenge_attempts/last-attempts/user/${user.id}/subtopic/${subtopicId}?limit=2`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch previous attempts');
      }

      const subtopicAttempts = await response.json();
      
      let correctStreak = 0;
      let incorrectStreak = 0;

      for (const attempt of subtopicAttempts) {
        if (attempt.is_successful) {
          correctStreak++;
          incorrectStreak = 0;
        } else {
          incorrectStreak++;
          correctStreak = 0;
        }
      }

      let isTimerEnabled = false;
      let isHintsEnabled = false;

      if (correctStreak >= 2) {
        isTimerEnabled = true;
        isHintsEnabled = false;
      } else if (incorrectStreak >= 2) {
        isTimerEnabled = false;
        isHintsEnabled = true;
      } else {
        isTimerEnabled = false;
        isHintsEnabled = false;
      }

      const result = {
        isTimerEnabled,
        isHintsEnabled,
        isLoading: false,
        error: null
      };

      cacheRef.current.set(cacheKey, result);
      setAdaptiveState(result);

    } catch (error) {
      console.error('Error determining adaptive features:', error);
      const fallbackResult = {
        isTimerEnabled: false,
        isHintsEnabled: false,
        isLoading: false,
        error: error.message
      };
      cacheRef.current.set(cacheKey, fallbackResult);
      setAdaptiveState(fallbackResult);
    } finally {
      fetchingRef.current = false;
    }
  }, [user, subtopicId, currentTakeAttempts]); // Added currentTakeAttempts to dependencies

  // Function to refresh adaptive features (clear cache and refetch)
  const refreshAdaptiveFeatures = useCallback(() => {
    const cacheKey = `${user?.id}_${subtopicId}_${currentTakeAttempts}`;
    cacheRef.current.delete(cacheKey);
    fetchingRef.current = false;
    fetchAdaptiveData();
  }, [user?.id, subtopicId, currentTakeAttempts, fetchAdaptiveData]);

  useEffect(() => {
    fetchAdaptiveData();
  }, [fetchAdaptiveData]);

  return {
    ...adaptiveState,
    refreshAdaptiveFeatures
  };
}; 