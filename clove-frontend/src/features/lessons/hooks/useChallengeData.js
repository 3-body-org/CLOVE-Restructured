import { useState, useEffect, useCallback } from 'react';
import { useChallengeService } from '../services/challengeService';

export const useChallengeData = (subtopicId, user) => {
  const [challenges, setChallenges] = useState({
    codeFixer: null,
    outputTracing: null,
    codeCompletion: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { 
    getChallengesForSubtopic, 
    getUserSubtopic, 
    getChallengesForSubtopicWithDifficulty,
    getDifficultyFromKnowledgeLevel,
    getRandomFromArray
  } = useChallengeService();

  const fetchChallengeData = useCallback(async () => {
    if (!subtopicId) {
      setError('No subtopic ID provided');
      setLoading(false);
      return;
    }

    if (!user || !user.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [useChallengeData] Fetching challenges for user:', user.id, 'subtopic:', subtopicId);
      
      // Step 1: Check cache first
      const cacheKey = `challenges_${subtopicId}_${user.id}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      
      if (cachedData) {
        console.log('🔍 [useChallengeData] Using cached challenge data');
        const parsedData = JSON.parse(cachedData);
        setChallenges(parsedData);
        setLoading(false);
        return;
      }
      
      // Step 2: Get user's knowledge level for this subtopic
      let userSubtopic;
      try {
        userSubtopic = await getUserSubtopic(user.id, subtopicId);
        console.log('🔍 [useChallengeData] User subtopic data:', userSubtopic);
      } catch (error) {
        console.warn('⚠️ [useChallengeData] Could not fetch user subtopic data, using default difficulty:', error);
        // Fallback to easy difficulty if we can't get user data
        userSubtopic = { knowledge_level: 0.1 };
      }
      
      // Step 3: Determine difficulty based on knowledge level
      const knowledgeLevel = userSubtopic.knowledge_level || 0.1;
      const difficulty = getDifficultyFromKnowledgeLevel(knowledgeLevel);
      console.log('🔍 [useChallengeData] Knowledge level:', knowledgeLevel, '→ Difficulty:', difficulty);
      
      // Step 4: Check difficulty-specific cache
      const difficultyCacheKey = `challenges_${subtopicId}_${difficulty}_${user.id}`;
      const difficultyCachedData = sessionStorage.getItem(difficultyCacheKey);
      
      let allChallenges;
      if (difficultyCachedData) {
        console.log('🔍 [useChallengeData] Using cached data for difficulty:', difficulty);
        allChallenges = JSON.parse(difficultyCachedData);
      } else {
        // Step 5: Fetch challenges with specific difficulty
        try {
          allChallenges = await getChallengesForSubtopicWithDifficulty(subtopicId, difficulty);
          console.log('🔍 [useChallengeData] Found', allChallenges.length, 'challenges with difficulty:', difficulty);
          // Cache the difficulty-specific data
          sessionStorage.setItem(difficultyCacheKey, JSON.stringify(allChallenges));
        } catch (error) {
          console.warn('⚠️ [useChallengeData] Could not fetch challenges with difficulty, trying all challenges:', error);
          // Fallback: fetch all challenges if difficulty-specific fetch fails
          allChallenges = await getChallengesForSubtopic(subtopicId);
        }
      }
      
      // Step 6: Group challenges by type
      const codeFixerChallenges = allChallenges.filter(c => c.type === 'code_fixer');
      const outputTracingChallenges = allChallenges.filter(c => c.type === 'output_tracing');
      const codeCompletionChallenges = allChallenges.filter(c => c.type === 'code_completion');

      console.log('🔍 [useChallengeData] Challenges by type:', {
        codeFixer: codeFixerChallenges.length,
        outputTracing: outputTracingChallenges.length,
        codeCompletion: codeCompletionChallenges.length
      });

      // Step 7: Check if we have challenges for each type
      if (codeFixerChallenges.length === 0 && outputTracingChallenges.length === 0 && codeCompletionChallenges.length === 0) {
        setError('No practice challenges available for this lesson.');
        return;
      }

      // Step 8: Pick random challenges from each type
      const selectedChallenges = {
        codeFixer: getRandomFromArray(codeFixerChallenges),
        outputTracing: getRandomFromArray(outputTracingChallenges),
        codeCompletion: getRandomFromArray(codeCompletionChallenges)
      };
      
      setChallenges(selectedChallenges);
      
      // Step 9: Cache the selected challenges for this session
      sessionStorage.setItem(cacheKey, JSON.stringify(selectedChallenges));
      
      console.log('✅ [useChallengeData] Random challenges selected and cached successfully');
      
    } catch (err) {
      console.error('❌ [useChallengeData] Error fetching challenges:', err);
      setError('Failed to load practice challenges');
    } finally {
      setLoading(false);
    }
  }, [subtopicId, user]); // Removed service functions from dependencies to prevent infinite loops

  useEffect(() => {
    fetchChallengeData();
  }, [fetchChallengeData]);

  const refetch = useCallback(() => {
    // Clear cache and fetch fresh data
    const cacheKey = `challenges_${subtopicId}_${user?.id}`;
    const difficultyCacheKey = `challenges_${subtopicId}_*_${user?.id}`;
    
    // Clear all related cache entries
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(`challenges_${subtopicId}_`) && key.includes(`_${user?.id}`)) {
        sessionStorage.removeItem(key);
      }
    });
    
    fetchChallengeData();
  }, [fetchChallengeData, subtopicId, user]);

  // Cleanup function to clear old cache data
  const clearCache = useCallback(() => {
    if (user?.id) {
      // Clear all challenge cache entries for this user
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('challenges_') && key.includes(`_${user.id}`)) {
          sessionStorage.removeItem(key);
        }
      });
      console.log('🧹 [useChallengeData] Cleared challenge cache for user:', user.id);
    }
  }, [user]);

  return {
    challenges,
    loading,
    error,
    refetch,
    clearCache
  };
}; 