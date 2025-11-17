/**
 * @file contentMerger.js
 * @description Service to merge backend data with frontend UI content for subtopic pages.
 */

import { subtopicContent } from '../content/subtopicContent';

/**
 * Merge backend overview data with frontend UI content
 * @param {Object} backendOverview - Data from /user_topics/user/{user_id}/topic/{topic_id}/overview
 * @param {Object} frontendContent - UI content from subtopicContent.js
 * @returns {Object} Merged content with backend data and UI elements
 */
export const mergeBackendAndFrontendContent = (backendOverview, frontendContent) => {
  if (!backendOverview || !frontendContent) {
    return null;
  }
  
  const { pre_assessment, subtopics, post_assessment } = backendOverview;
  const { uiContent, story, styling, nodeOrder } = frontendContent;
  
  return {
    story,
    styling,
    nodeOrder,
    subtopics: nodeOrder.map(key => {
      const backendData = getBackendData(key, pre_assessment, subtopics, post_assessment);
      const frontendData = uiContent[key] || {};
      return {
        ...backendData,
        ...frontendData,
        key
      };
    })
  };
};

/**
 * Get backend data for a specific subtopic key
 * @param {string} key - Subtopic key (e.g., 'pre-assessment', 'arithmetic')
 * @param {Object} preAssessment - Pre-assessment data from backend
 * @param {Array} subtopics - Subtopics data from backend
 * @param {Object} postAssessment - Post-assessment data from backend
 * @returns {Object} Backend data for the subtopic
 */
const getBackendData = (key, preAssessment, subtopics, postAssessment) => {
  // Pre-assessment
  if (key === 'pre-assessment') {
    return {
      id: preAssessment?.pre_assessment_id || 'preassessment',
      title: 'Pre-Assessment',
      description: 'Test your knowledge before starting',
      isCompleted: preAssessment?.is_completed || false,
      isLocked: !preAssessment?.is_unlocked, // Use backend is_unlocked field
      progress: preAssessment?.total_items || 0,
      maxProgress: 15,
      attemptCount: preAssessment?.attempt_count || 0,
      canTake: preAssessment?.is_unlocked && (!preAssessment?.is_completed || (preAssessment?.attempt_count || 0) < 2),
      type: 'assessment'
    };
  }
  
  // Post-assessment
  if (key === 'post-assessment') {
    if (!postAssessment) {
      return {
        id: 'postassessment',
        title: 'Post-Assessment',
        description: 'Complete all subtopics to unlock this assessment',
        isUnlocked: false,
        isCompleted: false,
        progress: 0,
        maxProgress: 15,
        attemptCount: 0,
        canTake: false,
        type: 'assessment'
      };
    }
    return {
      id: postAssessment?.post_assessment_id || 'postassessment',
      title: 'Post-Assessment',
      description: 'Complete all subtopics to unlock this assessment',
      isUnlocked: postAssessment.is_unlocked || false,
      isCompleted: postAssessment.is_completed || false,
      progress: postAssessment.total_items || 0,
      maxProgress: 15,
      attemptCount: postAssessment.attempt_count || 0,
      canTake: postAssessment?.is_unlocked && (!postAssessment?.is_completed || (postAssessment?.attempt_count || 0) < 2),
      type: 'assessment'
    };
  }
  
  // Regular subtopic - find by title match with comprehensive key mapping
  const subtopic = subtopics.find(s => {
    // Handle cases where subtopic data might be malformed
    if (!s || !s.subtopic || !s.subtopic.title) {
      return false;
    }
    
    const backendTitle = s.subtopic.title.toLowerCase();
    const frontendKey = key.toLowerCase();
    
    // Direct match
    if (backendTitle === frontendKey) return true;
    
    // Convert frontend key to backend format (remove hyphens)
    const frontendKeyNoHyphens = frontendKey.replace(/-/g, ' ');
    if (backendTitle === frontendKeyNoHyphens) return true;
    
    // Topic 1: Variables and Data Types (exact backend titles)
    if (frontendKey === 'declaring-variables' && backendTitle === 'declaring variables') return true;
    if (frontendKey === 'primitive-data-types' && backendTitle === 'primitive data types') return true;
    if (frontendKey === 'non-primitive-data-types' && backendTitle === 'non-primitive data types') return true;
    
    // Topic 2: Operators (exact backend titles)
    if (frontendKey === 'arithmetic' && backendTitle === 'arithmetic') return true;
    if (frontendKey === 'comparison' && backendTitle === 'comparison') return true;
    if (frontendKey === 'logical' && backendTitle === 'logical') return true;
    
    // Topic 3: Control Structures (exact backend titles)
    if (frontendKey === 'if-else' && backendTitle === 'if-else') return true;
    if (frontendKey === 'while-do-while-loop' && backendTitle === 'while and do while loop') return true;
    if (frontendKey === 'for-loop' && backendTitle === 'for loop') return true;
    
    // Fallback: check if key is contained in title
    return backendTitle.includes(frontendKey);
  });

  if (!subtopic) {
    return {
      id: key,
      title: key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: 'Description not available',
      isUnlocked: false,
      isCompleted: false,
      progress: 0,
      lessonsCompleted: false,
      practiceCompleted: false,
      challengesCompleted: false
    };
  }

  return {
    id: key, // Use frontend key for navigation
    backendId: subtopic.subtopic_id, // Keep backend ID for reference
    title: subtopic.subtopic.title,
    description: subtopic.subtopic.description,
    isUnlocked: subtopic.is_unlocked,
    isCompleted: subtopic.is_completed,
    progress: subtopic.progress_percent,
    lessonsCompleted: subtopic.lessons_completed,
    practiceCompleted: subtopic.practice_completed,
    challengesCompleted: subtopic.challenges_completed,
    knowledgeLevel: subtopic.knowledge_level,
    unlockedAt: subtopic.unlocked_at || null
  };
};

/**
 * Get frontend content for a specific topic
 * @param {number|string} topicId - Topic ID
 * @returns {Object} Frontend UI content
 */
export const getFrontendContent = (topicId) => {
  return subtopicContent[topicId] || subtopicContent[1]; // fallback to topic 1
};

/**
 * Check if a subtopic is locked based on backend data
 * @param {Object} subtopic - Subtopic data from merged content
 * @returns {boolean} True if subtopic is locked
 */
export const isSubtopicLocked = (subtopic) => {
  if (!subtopic) return true;
  
  if (subtopic.type === 'assessment') {
    return !subtopic.canTake;
  }
  
  return !subtopic.isUnlocked;
};

/**
 * Get progress percentage for visualization
 * @param {Object} subtopic - Subtopic data from merged content
 * @returns {number} Progress percentage (0-1)
 */
export const getSubtopicProgress = (subtopic) => {
  if (!subtopic) return 0;
  
  if (subtopic.type === 'assessment') {
    // For assessments, use total_items as progress indicator
    return (subtopic.progress || 0) / (subtopic.maxProgress || 15);
  }
  
  // For regular subtopics, use progress_percent (0-100)
  return (subtopic.progress || 0) / 100;
}; 