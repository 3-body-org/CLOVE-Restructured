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
      console.error('Error fetching challenges for subtopic:', error);
      showErrorNotification('Failed to load challenges for this lesson');
      throw error;
    }
  };

  // New function to get user subtopic data (including knowledge_level)
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
      console.error('Error fetching user subtopic data:', error);
      showErrorNotification('Failed to load user progress data');
      throw error;
    }
  };

  // New function to get challenges with specific difficulty
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
      console.error('Error fetching challenges with difficulty:', error);
      showErrorNotification('Failed to load challenges for this difficulty');
      throw error;
    }
  };

  // Helper function to map knowledge level to difficulty
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

  // Helper function to get random item from array
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