/**
 * @file useMydeckService.js
 * @description Custom hook providing MyDeck-related API services for topics, progress, and subtopics.
 */

import { useApi } from '../../../hooks/useApi';
import { useAuth } from 'contexts/AuthContext';

/**
 * @typedef {Object} MyDeckService
 * @property {Function} getTopicsWithProgress
 * @property {Function} getTopicById
 * @property {Function} getTopicOverview
 * @property {Function} updateRecentTopic
 * @property {Function} updateTopicProgress
 * @property {Function} completeSubtopicLesson
 * @property {Function} completeSubtopicPractice
 * @property {Function} completeSubtopicChallenge
 */

/**
 * Custom hook for MyDeck API services.
 * @returns {MyDeckService}
 */
export const useMyDeckService = () => {
  const { get, post, patch } = useApi();
  const { user } = useAuth();

  /**
   * Get all topics with user progress for MyDeck.
   * @returns {Promise<Array>} Array of topic objects with progress.
   */
  const getTopicsWithProgress = async () => {
    if (!user) throw new Error('User not authenticated');
    const response = await get(`/user_topics/user/${user.id}`);
    if (!response.ok) throw new Error('Failed to fetch topics');
    const userTopics = await response.json();
    userTopics.sort((a, b) => a.topic.topic_id - b.topic.topic_id);
    return userTopics.map(ut => ({
      id: ut.topic?.topic_id,
      slug: ut.topic?.title?.toLowerCase().replace(/\s+/g, '-') || `topic-${ut.topic_id}`,
      name: ut.topic?.title || `Topic ${ut.topic_id}`,
      description: ut.topic?.description || '',
      theme: ut.topic?.theme || 'space',
      progress: ut.progress_percent || 0,
      is_unlocked: ut.is_unlocked,
      subtopics: (ut.subtopics || []).map(st => ({
        id: st.subtopic?.subtopic_id,
        slug: st.subtopic?.title?.toLowerCase().replace(/\s+/g, '-') || `subtopic-${st.subtopic_id}`,
        name: st.subtopic?.title || `Subtopic ${st.subtopic_id}`,
        completed: st.is_completed || false
      }))
    }));
  };

  /**
   * Get specific topic by ID.
   * @param {number|string} topicId
   * @returns {Promise<Object>} Topic object with progress and subtopics.
   */
  const getTopicById = async (topicId) => {
    if (!user) throw new Error('User not authenticated');
    const response = await get(`/user_topics/user/${user.id}/topic/${topicId}`);
    if (!response.ok) throw new Error('Topic not found');
    const userTopic = await response.json();
    return {
      id: userTopic.topic?.title?.toLowerCase().replace(/\s+/g, '-') || `topic-${userTopic.topic_id}`,
      name: userTopic.topic?.title || `Topic ${userTopic.topic_id}`,
      description: userTopic.topic?.description || '',
      theme: userTopic.topic?.theme || 'space',
      progress: userTopic.progress_percent || 0,
      is_unlocked: userTopic.is_unlocked,
      introduction_seen: userTopic.introduction_seen,
      subtopics: (userTopic.subtopics || []).map(st => ({
        id: st.subtopic?.title?.toLowerCase().replace(/\s+/g, '-') || `subtopic-${st.subtopic_id}`,
        name: st.subtopic?.title || `Subtopic ${st.subtopic_id}`,
        completed: st.is_completed || false
      }))
    };
  };

  /**
   * Get complete topic overview including assessments and subtopics.
   * @param {number|string} topicId
   * @returns {Promise<Object>} Complete topic overview with backend data.
   */
  const getTopicOverview = async (topicId, timestamp = Date.now()) => {
    try {
      const response = await get(`/user_topics/user/${user.id}/topic/${topicId}/overview?t=${timestamp}`);
      return response.json();
    } catch (error) {
      console.error('Error fetching topic overview:', error);
      throw error;
    }
  };

  /**
   * Submit assessment answer.
   * @param {number|string} topicId
   * @param {string} type - 'pre' or 'post'
   * @param {number} questionId
   * @param {any} answer
   * @returns {Promise<Object>} Response data.
   */
  const submitAssessmentAnswer = async (topicId, type, questionId, answer) => {
    if (!user) throw new Error('User not authenticated');
    const endpoint = type === 'pre' ? 'pre_assessments' : 'post_assessments';
    const response = await post(`/${endpoint}/submit-single-answer`, {
      user_id: user.id,
      topic_id: topicId,
      question_id: questionId,
      user_answer: answer
    });
    if (!response.ok) throw new Error('Failed to submit assessment answer');
    return response.json();
  };

  /**
   * Complete a subtopic component.
   * @param {number|string} subtopicId
   * @param {string} component - 'lesson', 'practice', or 'challenge'
   * @returns {Promise<Object>} Response data.
   */
  const completeSubtopicComponent = async (subtopicId, component) => {
    if (!user) throw new Error('User not authenticated');
    const response = await post(`/user_subtopics/user/${user.id}/subtopic/${subtopicId}/complete-${component}`);
    if (!response.ok) throw new Error(`Failed to complete ${component}`);
    return response.json();
  };

  /**
   * Update user's recent topic.
   * @param {number|string} topicId
   * @returns {Promise<Object>} Response data.
   */
  const updateRecentTopic = async (topicId) => {
    if (!user) throw new Error('User not authenticated');
    const response = await post(`/statistics/update-recent-topic/${topicId}`);
    if (!response.ok) throw new Error('Failed to update recent topic');
    return response.json();
  };

  /**
   * Update user topic progress.
   * @param {number|string} topicId
   * @param {Object} progressData
   * @returns {Promise<Object>} Response data.
   */
  const updateTopicProgress = async (topicId, progressData) => {
    if (!user) throw new Error('User not authenticated');
    const response = await patch(`/user_topics/user/${user.id}/topic/${topicId}`, progressData);
    if (!response.ok) throw new Error('Failed to update topic progress');
    return response.json();
  };

  /**
   * Complete a subtopic lesson.
   * @param {number|string} subtopicId
   * @returns {Promise<Object>} Response data.
   */
  const completeSubtopicLesson = async (subtopicId) => {
    if (!user) throw new Error('User not authenticated');
    const response = await post(`/user_subtopics/user/${user.id}/subtopic/${subtopicId}/complete-lesson`);
    if (!response.ok) throw new Error('Failed to complete lesson');
    return response.json();
  };

  /**
   * Complete a subtopic practice.
   * @param {number|string} subtopicId
   * @returns {Promise<Object>} Response data.
   */
  const completeSubtopicPractice = async (subtopicId) => {
    if (!user) throw new Error('User not authenticated');
    const response = await post(`/user_subtopics/user/${user.id}/subtopic/${subtopicId}/complete-practice`);
    if (!response.ok) throw new Error('Failed to complete practice');
    return response.json();
  };

  /**
   * Complete a subtopic challenge.
   * @param {number|string} subtopicId
   * @returns {Promise<Object>} Response data.
   */
  const completeSubtopicChallenge = async (subtopicId) => {
    if (!user) throw new Error('User not authenticated');
    const response = await post(`/user_subtopics/user/${user.id}/subtopic/${subtopicId}/complete-challenge`);
    if (!response.ok) throw new Error('Failed to complete challenge');
    return response.json();
  };

  /**
   * Get randomized questions summary for a topic.
   * @param {number|string} topicId
   * @param {string} assessmentType - 'pre' or 'post'
   * @returns {Promise<Object>} Summary of randomized questions with metadata.
   */
  const getRandomizedQuestionsSummary = async (topicId, assessmentType) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      console.log(`🔍 Fetching questions summary for topic ${topicId}, assessment type ${assessmentType}`);
      const response = await get(`/assessment_questions/topic/${topicId}/randomized/summary?assessment_type=${assessmentType}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 API Error Response:', response.status, errorText);
        throw new Error(`Failed to fetch questions summary: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('🔍 Questions summary fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error fetching randomized questions summary:', error);
      throw error;
    }
  };

  /**
   * Get comprehensive assessment results with detailed question breakdown.
   * @param {number|string} topicId
   * @param {string} assessmentType - 'pre' or 'post'
   * @returns {Promise<Object>} Detailed assessment results with question data and subtopic breakdown.
   */
  const getComprehensiveAssessmentResults = async (topicId, assessmentType) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // 1. Get overview data (same as progress page)
      const overview = await getTopicOverview(topicId);
      
      // 2. Get the specific assessment data
      const assessmentData = assessmentType === 'pre' ? overview.pre_assessment : overview.post_assessment;
      
      if (!assessmentData) {
        throw new Error('Assessment not found');
      }
      
      // 3. Create subtopic name mapping from overview data
      const subtopicNames = {};
      if (overview.subtopics) {
        overview.subtopics.forEach(subtopic => {
          if (subtopic.subtopic && subtopic.subtopic.title) {
            subtopicNames[subtopic.subtopic.subtopic_id] = subtopic.subtopic.title;
          }
        });
      }
      
      // Debug subtopic names
      console.log('🔍 Subtopic Names Mapping:', subtopicNames);
      console.log('🔍 Overview Subtopics:', overview.subtopics);
      
      // 4. Get detailed question data for each answered question
      const questionDetails = {};
      const questionsBySubtopic = {};
      
      if (assessmentData.questions_answers_iscorrect) {
        const questionIds = Object.keys(assessmentData.questions_answers_iscorrect);
        
        for (const questionId of questionIds) {
          try {
            const questionResponse = await get(`/assessment_questions/${questionId}`);
            if (questionResponse.ok) {
              const questionData = await questionResponse.json();
              questionDetails[questionId] = questionData;
              
              // Group questions by subtopic
              const subtopicId = questionData.subtopic_id;
              const subtopicName = subtopicNames[subtopicId] || `Subtopic ${subtopicId}`;
              
              if (!questionsBySubtopic[subtopicId]) {
                questionsBySubtopic[subtopicId] = {
                  id: subtopicId,
                  name: subtopicName,
                  questions: [],
                  correctCount: 0,
                  totalCount: 0
                };
              }
              
              // Get the answer data from the assessment
              const answerData = assessmentData.questions_answers_iscorrect[questionId];
              const isCorrect = answerData.is_correct || answerData === true;
              
              // Debug the question data structure
              console.log('🔍 Question Data Structure:', {
                questionId,
                questionData,
                questionText: questionData.question_choices_correctanswer?.question,
                correctAnswer: questionData.question_choices_correctanswer?.correct_answer,
                explanation: questionData.question_choices_correctanswer?.explanation,
                difficulty: questionData.difficulty,
                subtopicName: subtopicName,
                answerData: answerData,
                isCorrect: isCorrect
              });
              
              questionsBySubtopic[subtopicId].questions.push({
                id: questionId,
                question: questionData.question_choices_correctanswer?.question || 'Question text not available',
                choices: questionData.question_choices_correctanswer?.choices || [],
                userAnswer: answerData.user_answer || (isCorrect 
                  ? (questionData.question_choices_correctanswer?.correct_answer || 'Correct answer not available')
                  : (questionData.question_choices_incorrectanswer?.incorrect_answer || 'Incorrect answer not available')),
                correctAnswer: questionData.question_choices_correctanswer?.correct_answer || 'Correct answer not available',
                explanation: questionData.question_choices_correctanswer?.explanation || null,
                isCorrect: isCorrect,
                difficulty: questionData.difficulty || 'Easy'
              });
              
              questionsBySubtopic[subtopicId].totalCount++;
              if (isCorrect) {
                questionsBySubtopic[subtopicId].correctCount++;
              }
            }
          } catch (error) {
            console.error(`Failed to fetch question ${questionId}:`, error);
          }
        }
      }
      
      // 5. Calculate overall scores - use actual answered questions, not hardcoded 15
      const totalCorrect = Object.values(assessmentData.questions_answers_iscorrect || {}).filter(answer => 
        answer.is_correct || answer === true
      ).length;
      const totalQuestions = Object.keys(assessmentData.questions_answers_iscorrect || {}).length;
      
      // Use the actual total items from the assessment data if available
      const actualTotalItems = assessmentData.total_items || totalQuestions;
      
      return {
        overview,
        assessment: assessmentData,
        questionDetails,
        questionsBySubtopic,
        totalCorrect,
        totalQuestions: actualTotalItems, // Use the actual total from assessment data
        scorePercentage: actualTotalItems > 0 ? (totalCorrect / actualTotalItems) * 100 : 0
      };
      
    } catch (error) {
      console.error('Error fetching comprehensive assessment results:', error);
      throw error;
    }
  };

  return {
    getTopicsWithProgress,
    getTopicById,
    getTopicOverview,
    submitAssessmentAnswer,
    completeSubtopicComponent,
    updateRecentTopic,
    updateTopicProgress,
    completeSubtopicLesson,
    completeSubtopicPractice,
    completeSubtopicChallenge,
    getComprehensiveAssessmentResults,
    getRandomizedQuestionsSummary, // Added new function for questions summary
  };
}; 