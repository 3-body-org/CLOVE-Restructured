import { useApi } from '../../../hooks/useApi';
import { showErrorNotification } from '../../../utils/notifications';

export const useLessonService = () => {
  const { get, post } = useApi();

  const getLessonBySubtopicId = async (subtopicId) => {
    try {
      // Convert string to number if needed
      const numericSubtopicId = parseInt(subtopicId);
      if (isNaN(numericSubtopicId)) {
        throw new Error('Invalid subtopic ID');
      }
      
      const response = await get(`/lessons/?subtopic_id=${numericSubtopicId}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        return data[0]; // Return the first lesson for this subtopic
      }
      
      return null;
    } catch (error) {
      showErrorNotification('Failed to load lesson content');
      throw error;
    }
  };

  const completeLesson = async (userId, subtopicId) => {
    try {
      const response = await post(`/user_subtopics/user/${userId}/subtopic/${subtopicId}/complete-lesson`);
      const data = await response.json();
      return data;
    } catch (error) {
      showErrorNotification('Failed to mark lesson as completed');
      throw error;
    }
  };

  const completePractice = async (userId, subtopicId) => {
    try {
      const response = await post(`/user_subtopics/user/${userId}/subtopic/${subtopicId}/complete-practice`);
      const data = await response.json();
      return data;
    } catch (error) {
      showErrorNotification('Failed to mark practice as completed');
      throw error;
    }
  };

  return {
    getLessonBySubtopicId,
    completeLesson,
    completePractice
  };
}; 