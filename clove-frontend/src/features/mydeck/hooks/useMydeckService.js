import { useApi } from '../../../hooks/useApi';
import { useAuth } from 'contexts/AuthContext';

export const useMyDeckService = () => {
  const { get, post, patch } = useApi();
  const { user } = useAuth();

  /**
   * Get all topics with user progress for MyDeck
   */
  const getTopicsWithProgress = async () => {
    if (!user) throw new Error('User not authenticated');
    
    const response = await get(`/user_topics/user/${user.id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch topics');
    }
    
    const userTopics = await response.json();
    
    // Sort topics by topic_id (or another order field)
    userTopics.sort((a, b) => a.topic.topic_id - b.topic.topic_id);

    // Transform to MyDeck format
    return userTopics.map(ut => ({
      id: ut.topic?.topic_id, // numeric ID for backend
      slug: ut.topic?.title?.toLowerCase().replace(/\s+/g, '-') || `topic-${ut.topic_id}`,
      name: ut.topic?.title || `Topic ${ut.topic_id}`,
      description: ut.topic?.description || '',
      theme: ut.topic?.theme || 'space',
      progress: ut.progress_percent || 0,
      is_unlocked: ut.is_unlocked,
      subtopics: (ut.subtopics || []).map(st => ({
        id: st.subtopic?.subtopic_id, // numeric
        slug: st.subtopic?.title?.toLowerCase().replace(/\s+/g, '-') || `subtopic-${st.subtopic_id}`,
        name: st.subtopic?.title || `Subtopic ${st.subtopic_id}`,
        completed: st.is_completed || false
      }))
    }));
  };

  /**
   * Get specific topic by ID
   */
  const getTopicById = async (topicId) => {
    if (!user) throw new Error('User not authenticated');
    
    const response = await get(`/user_topics/user/${user.id}/topic/${topicId}`);
    if (!response.ok) {
      throw new Error('Topic not found');
    }
    
    const userTopic = await response.json();
    
    return {
      id: userTopic.topic?.title?.toLowerCase().replace(/\s+/g, '-') || `topic-${userTopic.topic_id}`,
      name: userTopic.topic?.title || `Topic ${userTopic.topic_id}`,
      description: userTopic.topic?.description || '',
      theme: userTopic.topic?.theme || 'space',
      progress: userTopic.progress_percent || 0,
      is_unlocked: userTopic.is_unlocked,
      introduction_seen: userTopic.introduction_seen, // <-- Added this line
      subtopics: (userTopic.subtopics || []).map(st => ({
        id: st.subtopic?.title?.toLowerCase().replace(/\s+/g, '-') || `subtopic-${st.subtopic_id}`,
        name: st.subtopic?.title || `Subtopic ${st.subtopic_id}`,
        completed: st.is_completed || false
      }))
    };
  };

  /**
   * Update user's recent topic
   */
  const updateRecentTopic = async (topicId) => {
    if (!user) throw new Error('User not authenticated');
    
    const response = await post(`/statistics/update-recent-topic/${topicId}`);
    if (!response.ok) {
      throw new Error('Failed to update recent topic');
    }
    
    return response.json();
  };

  /**
   * Update user topic progress
   */
  const updateTopicProgress = async (topicId, progressData) => {
    if (!user) throw new Error('User not authenticated');
    
    const response = await patch(`/user_topics/user/${user.id}/topic/${topicId}`, progressData);
    if (!response.ok) {
      throw new Error('Failed to update topic progress');
    }
    
    return response.json();
  };

  /**
   * Complete a subtopic lesson
   */
  const completeSubtopicLesson = async (subtopicId) => {
    if (!user) throw new Error('User not authenticated');
    
    const response = await post(`/user_subtopics/user/${user.id}/subtopic/${subtopicId}/complete-lesson`);
    if (!response.ok) {
      throw new Error('Failed to complete lesson');
    }
    
    return response.json();
  };

  /**
   * Complete a subtopic practice
   */
  const completeSubtopicPractice = async (subtopicId) => {
    if (!user) throw new Error('User not authenticated');
    
    const response = await post(`/user_subtopics/user/${user.id}/subtopic/${subtopicId}/complete-practice`);
    if (!response.ok) {
      throw new Error('Failed to complete practice');
    }
    
    return response.json();
  };

  /**
   * Complete a subtopic challenge
   */
  const completeSubtopicChallenge = async (subtopicId) => {
    if (!user) throw new Error('User not authenticated');
    
    const response = await post(`/user_subtopics/user/${user.id}/subtopic/${subtopicId}/complete-challenge`);
    if (!response.ok) {
      throw new Error('Failed to complete challenge');
    }
    
    return response.json();
  };

  return {
    getTopicsWithProgress,
    getTopicById,
    updateRecentTopic,
    updateTopicProgress,
    completeSubtopicLesson,
    completeSubtopicPractice,
    completeSubtopicChallenge
  };
}; 