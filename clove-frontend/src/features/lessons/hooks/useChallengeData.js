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
      
      const cacheKey = `challenges_${subtopicId}_${user.id}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setChallenges(parsedData);
        setLoading(false);
        return;
      }
      
      let userSubtopic;
      try {
        userSubtopic = await getUserSubtopic(user.id, subtopicId);
      } catch (error) {
        userSubtopic = { knowledge_level: 0.1 };
      }
      
      const knowledgeLevel = userSubtopic.knowledge_level || 0.1;
      const difficulty = getDifficultyFromKnowledgeLevel(knowledgeLevel);
      
      const difficultyCacheKey = `challenges_${subtopicId}_${difficulty}_${user.id}`;
      const difficultyCachedData = sessionStorage.getItem(difficultyCacheKey);
      
      let allChallenges;
      if (difficultyCachedData) {
        allChallenges = JSON.parse(difficultyCachedData);
      } else {
        try {
          allChallenges = await getChallengesForSubtopicWithDifficulty(subtopicId, difficulty);
          sessionStorage.setItem(difficultyCacheKey, JSON.stringify(allChallenges));
        } catch (error) {
          allChallenges = await getChallengesForSubtopic(subtopicId);
        }
      }
      
      const codeFixerChallenges = allChallenges.filter(c => c.type === 'code_fixer');
      const outputTracingChallenges = allChallenges.filter(c => c.type === 'output_tracing');
      const codeCompletionChallenges = allChallenges.filter(c => c.type === 'code_completion');

      if (codeFixerChallenges.length === 0 && outputTracingChallenges.length === 0 && codeCompletionChallenges.length === 0) {
        setError('No practice challenges available for this lesson.');
        return;
      }

      const selectedChallenges = {
        codeFixer: getRandomFromArray(codeFixerChallenges),
        outputTracing: getRandomFromArray(outputTracingChallenges),
        codeCompletion: getRandomFromArray(codeCompletionChallenges)
      };
      
      setChallenges(selectedChallenges);
      
      sessionStorage.setItem(cacheKey, JSON.stringify(selectedChallenges));
      
    } catch (err) {
      setError('Failed to load practice challenges');
    } finally {
      setLoading(false);
    }
  }, [subtopicId, user]);

  useEffect(() => {
    fetchChallengeData();
  }, [fetchChallengeData]);

  const refetch = useCallback(() => {
    const cacheKey = `challenges_${subtopicId}_${user?.id}`;
    const difficultyCacheKey = `challenges_${subtopicId}_*_${user?.id}`;
    
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(`challenges_${subtopicId}_`) && key.includes(`_${user?.id}`)) {
        sessionStorage.removeItem(key);
      }
    });
    
    fetchChallengeData();
  }, [fetchChallengeData, subtopicId, user]);

  const clearCache = useCallback(() => {
    if (user?.id) {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('challenges_') && key.includes(`_${user.id}`)) {
          sessionStorage.removeItem(key);
        }
      });
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