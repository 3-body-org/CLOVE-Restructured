import { useApi } from '../../../hooks/useApi';
import { showErrorNotification } from '../../../utils/notifications';

export const useChallengeService = () => {
  const { get } = useApi();

  const getChallengesForSubtopic = async (subtopicId) => {
    try {
      // Convert string to number if needed
      const numericSubtopicId = parseInt(subtopicId);
      if (isNaN(numericSubtopicId)) {
        throw new Error('Invalid subtopic ID');
      }
      
      const response = await get(`/challenges/?subtopic_id=${numericSubtopicId}`);
      const data = await response.json();
      return data || [];
    } catch (error) {
      showErrorNotification('Failed to load challenges for this lesson');
      throw error;
    }
  };

  const getUserSubtopic = async (userId, subtopicId) => {
    try {
      const numericUserId = parseInt(userId);
      const numericSubtopicId = parseInt(subtopicId);
      
      if (isNaN(numericUserId) || isNaN(numericSubtopicId)) {
        throw new Error('Invalid user ID or subtopic ID');
      }
      
      const response = await get(`/user_subtopics/user/${numericUserId}/subtopic/${numericSubtopicId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      showErrorNotification('Failed to load user progress data');
      throw error;
    }
  };

  const getChallengesForSubtopicWithDifficulty = async (subtopicId, difficulty) => {
    try {
      const numericSubtopicId = parseInt(subtopicId);
      if (isNaN(numericSubtopicId)) {
        throw new Error('Invalid subtopic ID');
      }
      
      const response = await get(`/challenges/?subtopic_id=${numericSubtopicId}&difficulty=${difficulty}`);
      const data = await response.json();
      return data || [];
    } catch (error) {
      showErrorNotification('Failed to load challenges for this difficulty');
      throw error;
    }
  };

  const getDifficultyFromKnowledgeLevel = (knowledgeLevel) => {
    if (knowledgeLevel >= 0 && knowledgeLevel <= 0.33) {
      return 'easy';
    } else if (knowledgeLevel >= 0.34 && knowledgeLevel <= 0.66) {
      return 'medium';
    } else if (knowledgeLevel >= 0.67 && knowledgeLevel <= 1) {
      return 'hard';
    }
    return 'easy'; // fallback
  };

  const getRandomFromArray = (array) => {
    if (!array || array.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  };

  return {
    getChallengesForSubtopic,
    getUserSubtopic,
    getChallengesForSubtopicWithDifficulty,
    getDifficultyFromKnowledgeLevel,
    getRandomFromArray
  };
}; 