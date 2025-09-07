import { createContext, useState, useEffect, useCallback } from "react";
import { registerLogoutReset } from "./AuthContext";
import { useMyDeckService } from "../features/mydeck/hooks/useMydeckService";

const MyDeckContext = createContext();

const MyDeckProvider = ({ children }) => {
  // Core state for topic/subtopic navigation
  const [topicId, setTopicId] = useState(null);
  const [subtopicId, setSubtopicId] = useState(null);

  // Topics state for MyDeck section
  const [topics, setTopics] = useState([]);

  // Topic cache for storing topic data
  const [topicCache, setTopicCache] = useState({});

  // Backend state - aligned with /user/{user_id}/topic/{topic_id}/overview endpoint
  const [topicOverview, setTopicOverview] = useState(null);
  const [unlockStatus, setUnlockStatus] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [completionLoading, setCompletionLoading] = useState({});
  const [topicsRefreshing, setTopicsRefreshing] = useState(false);

  // Assessment questions tracking
  const [assessmentQuestions, setAssessmentQuestions] = useState({});

  // Use service layer for API calls
  const myDeckService = useMyDeckService();

  // Register a reset function to clear all state on logout
  useEffect(() => {
    registerLogoutReset(() => {
      setTopicId(null);
      setSubtopicId(null);
      setTopics([]);
      setTopicCache({});
      setTopicOverview(null);
      setUnlockStatus(null);
      setOverviewLoading(false);
      setCompletionLoading({});
      setTopicsRefreshing(false);
      setAssessmentQuestions({});
    });
  }, []);

  // Load topic overview using service layer (memoized to prevent infinite loops)
  const loadTopicOverview = useCallback(async (topicId, force = false) => {
    if (!topicId) {
      return;
    }
    
    // Prevent multiple simultaneous calls for the same topic
    if (overviewLoading) {
      return;
    }
    
    // Check if we already have fresh data for this topic (unless force refresh is requested)
    if (!force && topicOverview && topicOverview.topicId === topicId) {
      return;
    }
    
    setOverviewLoading(true);
    try {
      // Add cache busting timestamp to prevent stale data
      const timestamp = Date.now();
      const overview = await myDeckService.getTopicOverview(topicId, timestamp);
      
      // Add topicId to the overview data to track which topic this belongs to
      const overviewWithTopicId = {
        ...overview,
        topicId: topicId
      };
      
      const unlock = getUnlockStatus(overviewWithTopicId);
      
      setTopicOverview(overviewWithTopicId);
      setUnlockStatus(unlock);
    } catch (error) {
      // Failed to load topic overview
    } finally {
      setOverviewLoading(false);
    }
  }, [myDeckService]);

  // Get unlock status from overview data - aligned with backend structure
  const getUnlockStatus = (overviewData) => {
    const { pre_assessment, subtopics, post_assessment } = overviewData;
    
    return {
      preAssessment: {
        isUnlocked: pre_assessment?.is_unlocked || false, // Use backend is_unlocked field
        isCompleted: pre_assessment?.is_completed || false,
        canTake: pre_assessment?.is_unlocked && (!pre_assessment?.is_completed || pre_assessment?.attempt_count < 2),
        progress: pre_assessment?.total_items || 0,
        maxProgress: 15,
        attemptCount: pre_assessment?.attempt_count || 0
      },
      subtopics: subtopics.map(subtopic => ({
        id: subtopic.subtopic_id,
        title: subtopic.subtopic.title,
        description: subtopic.subtopic.description,
        isUnlocked: subtopic.is_unlocked,
        isCompleted: subtopic.is_completed,
        progress: subtopic.progress_percent,
        lessonsCompleted: subtopic.lessons_completed,
        practiceCompleted: subtopic.practice_completed,
        challengesCompleted: subtopic.challenges_completed,
        knowledgeLevel: subtopic.knowledge_level
      })),
      postAssessment: {
        isUnlocked: post_assessment?.is_unlocked || false,
        isCompleted: post_assessment?.is_completed || false,
        canTake: post_assessment?.is_unlocked && !post_assessment?.is_completed,
        progress: post_assessment?.total_items || 0,
        maxProgress: 15,
        attemptCount: post_assessment?.attempt_count || 0
      }
    };
  };

  // Refresh topics list with latest progress data
  const refreshTopics = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (topicsRefreshing) {
      return;
    }
    
    setTopicsRefreshing(true);
    try {
      const updatedTopics = await myDeckService.getTopicsWithProgress();
      setTopics(updatedTopics);
      return updatedTopics;
    } catch (error) {
      throw error;
    } finally {
      setTopicsRefreshing(false);
    }
  }, [myDeckService]);

  // Complete subtopic component using service layer (memoized)
  const completeSubtopicComponent = useCallback(async (subtopicId, component) => {
    if (!subtopicId || !component) {
      return;
    }
    
    setCompletionLoading(prev => ({ ...prev, [`${subtopicId}-${component}`]: true }));
    try {
      await myDeckService.completeSubtopicComponent(subtopicId, component);
      
      // Refresh overview to get updated unlock status
      if (topicId) {
        await loadTopicOverview(topicId);
      }
      
      // Refresh topics list to update progress bars on Topic Page
      await refreshTopics();
    } catch (error) {
      // Failed to complete subtopic component
    } finally {
      setCompletionLoading(prev => ({ ...prev, [`${subtopicId}-${component}`]: false }));
    }
  }, [myDeckService, topicId, loadTopicOverview, refreshTopics]);

  // Submit assessment answer using service layer (memoized)
  const submitAssessmentAnswer = useCallback(async (topicId, type, questionId, answer) => {
    if (!topicId || !type || !questionId) {
      throw new Error('Missing required parameters for assessment submission');
    }
    
    try {
      const result = await myDeckService.submitAssessmentAnswer(topicId, type, questionId, answer);
      
      // Refresh overview to get updated unlock status
      if (topicId) {
        await loadTopicOverview(topicId);
      }
      
      // Refresh topics list to update progress bars on Topic Page
      await refreshTopics();
      
      return result;
    } catch (error) {
      throw error;
    }
  }, [myDeckService, loadTopicOverview, refreshTopics]);

  // Get and store assessment questions summary
  const getAssessmentQuestionsSummary = useCallback(async (topicId, assessmentType) => {
    if (!topicId || !assessmentType) {
      return;
    }
    
    try {
      const summary = await myDeckService.getRandomizedQuestionsSummary(topicId, assessmentType);
      setAssessmentQuestions(prev => ({
        ...prev,
        [`${topicId}-${assessmentType}`]: summary
      }));
      return summary;
    } catch (error) {
      // Don't throw the error - just log it and return null
      // This prevents the assessment from failing completely
      return null;
    }
  }, [myDeckService]);

  const value = {
    // Core navigation state
    topicId,
    setTopicId,
    subtopicId,
    setSubtopicId,
    
    // Topics state for MyDeck section
    topics,
    setTopics,

    // Topic cache for storing topic data
    topicCache,
    setTopicCache,

    // Backend state - aligned with /user/{user_id}/topic/{topic_id}/overview
    topicOverview,
    setTopicOverview,
    unlockStatus,
    setUnlockStatus,
    overviewLoading,
    completionLoading,
    
    // Service functions
    loadTopicOverview,
    completeSubtopicComponent,
    submitAssessmentAnswer,
    refreshTopics,
    getAssessmentQuestionsSummary,
    
    // Assessment questions state
    assessmentQuestions
  };

  return (
    <MyDeckContext.Provider value={value}>{children}</MyDeckContext.Provider>
  );
};

export { MyDeckContext, MyDeckProvider };


