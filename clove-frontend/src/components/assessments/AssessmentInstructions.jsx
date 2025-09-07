import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/assessment.scss';
import { getSubtopicContent } from 'features/mydeck/content/subtopicContent';

const AssessmentInstructions = ({ 
  isVisible, 
  onClose, 
  onStart, 
  assessmentType = 'pre',
  topicId
}) => {
  const navigate = useNavigate();
  // Handle both string (e.g., "1-3") and numeric (e.g., 1) topicId formats
  const numericTopicId = topicId ? 
    (typeof topicId === 'string' ? topicId.split('-')[0] : topicId.toString()) : 
    null;
  const frontendContent = getSubtopicContent(numericTopicId);
  const topicTheme = frontendContent ? frontendContent.theme : 'space';

  if (!isVisible) return null;

  const handleStart = () => {
    onStart();
    if (assessmentType === 'retention-test') {
      navigate(`/my-deck/${topicId}/retention-test`);
    } else {
      navigate(`/my-deck/${topicId}/assessment/${assessmentType}`);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const getAssessmentTitle = () => {
    if (assessmentType === 'retention-test') return 'Retention Test';
    return assessmentType === 'pre' ? 'Pre-Assessment' : 'Post-Assessment';
  };

  return (
    <div className="assessment-instructions-overlay">
      <div className={`assessment-instructions-modal theme-${topicTheme}`}>
        <div className="instructions-header">
          <h2>{getAssessmentTitle()} Instructions</h2>
          <p>Please read carefully before starting</p>
        </div>
        
        <div className="instructions-content">
          <div className="instructions-section">
            <h3>📋 {assessmentType === 'retention-test' ? 'Retention Test' : 'Assessment'} Overview</h3>
            <ul>
              <li>This {assessmentType === 'retention-test' ? 'retention test' : 'assessment'} contains <strong>15 questions</strong></li>
              <li>You must complete all 15 questions to finish the {assessmentType === 'retention-test' ? 'retention test' : 'assessment'}</li>
              <li>Once completed, you cannot retake this {assessmentType === 'retention-test' ? 'retention test' : 'assessment'}</li>
              {assessmentType === 'retention-test' && (
                <li>This test measures how well you've retained knowledge from this topic</li>
              )}
            </ul>
          </div>

          <div className="instructions-section">
            <h3>⚠️ Important Rules</h3>
            <ul>
              <li><strong>Be careful with your choices!</strong> Once you click an option, it's automatically recorded as your answer</li>
              <li>You can exit the assessment and return later to continue from where you left off</li>
              <li>Your progress is saved automatically after each question</li>
              <li>You cannot change your answer once submitted</li>
            </ul>
          </div>

          <div className="instructions-section">
            <h3>🎯 How to Proceed</h3>
            <ul>
              <li>Read each question carefully</li>
              <li>Select your answer by clicking on one of the options</li>
              <li>Click "Next Question" to proceed to the next question</li>
              <li>On the final question, click "Finish" to complete the assessment</li>
            </ul>
          </div>

          <div className="instructions-section">
            <h3>📊 After Completion</h3>
            <ul>
              <li>You'll see detailed results with explanations</li>
              <li>Your progress will be updated in the topic overview</li>
              <li>You can review your answers and learn from explanations</li>
            </ul>
          </div>
        </div>

        <div className="instructions-buttons">
          <button 
            className="start-button"
            onClick={handleStart}
          >
            I Understand - Start {assessmentType === 'retention-test' ? 'Retention Test' : 'Assessment'}
          </button>
          <button 
            className="cancel-button"
            onClick={handleCancel}
          >
            Cancel - Return to Topic
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentInstructions; 
