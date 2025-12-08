/**
 * @file useRetentionTestNotifications.js
 * @description Custom hook for fetching retention test notifications across all topics
 */

import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { useAuth } from 'contexts/AuthContext';
import { useMyDeckService } from 'features/mydeck/hooks/useMydeckService';

/**
 * Custom hook to fetch all retention test notifications
 * @returns {Object} Object containing notifications, loading state, and refresh function
 */
export const useRetentionTestNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { get } = useApi();
  const { user } = useAuth();
  const { getTopicsWithProgress, getTopicOverview } = useMyDeckService();

  /**
   * Fetch all retention test notifications
   */
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get all topics with progress
      const topics = await getTopicsWithProgress();
      
      const availableTests = [];

      // Check each completed topic for retention test availability
      for (const topic of topics) {
        // Check if topic is completed
        let isTopicCompleted = false;
        
        if (topic.progress === 1 || topic.progress === 100) {
          // Topic might be completed, verify with detailed overview
          try {
            const topicOverview = await getTopicOverview(topic.id);
            const { pre_assessment, subtopics, post_assessment } = topicOverview;
            
            const isPreAssessmentCompleted = pre_assessment?.is_completed || false;
            const areAllSubtopicsCompleted = subtopics?.every(subtopic => subtopic.is_completed) || false;
            const isPostAssessmentCompleted = post_assessment?.is_completed || false;
            
            isTopicCompleted = isPreAssessmentCompleted && areAllSubtopicsCompleted && isPostAssessmentCompleted;
          } catch (err) {
            // If overview fails, use progress as fallback
            isTopicCompleted = topic.progress === 1 || topic.progress === 100;
          }
        }

        if (isTopicCompleted) {
          // Check retention test availability
          try {
            const response = await get(`/assessment_questions/topic/${topic.id}/retention-test/availability`);
            if (response.ok) {
              const data = await response.json();
              const hasAvailableTests = data.first_stage_available || data.second_stage_available;
              
              if (hasAvailableTests) {
                availableTests.push({
                  topicId: topic.id,
                  topicName: topic.name,
                  topicTheme: topic.theme || 'space',
                  isAvailable: true,
                  availability: data,
                  firstStageAvailable: data.first_stage_available,
                  secondStageAvailable: data.second_stage_available,
                  firstStageCompleted: data.first_stage_completed,
                  secondStageCompleted: data.second_stage_completed
                });
              }
            }
          } catch (err) {
            // Silently skip topics with errors
            console.error(`Error checking retention test for topic ${topic.id}:`, err);
          }
        }
      }

      setNotifications(availableTests);
    } catch (err) {
      setError('Failed to load retention test notifications');
      console.error('Error fetching retention test notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, get, getTopicsWithProgress, getTopicOverview]);

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only depend on user.id to avoid infinite loops - fetchNotifications is memoized with all its dependencies

  return {
    notifications,
    loading,
    error,
    refresh: fetchNotifications,
    count: notifications.length
  };
};

