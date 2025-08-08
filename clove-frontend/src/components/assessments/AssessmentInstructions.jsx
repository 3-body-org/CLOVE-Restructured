import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/AssessmentInstructions.module.scss';

const AssessmentInstructions = ({ 
  isVisible, 
  onClose, 
  onStart, 
  assessmentType = 'pre',
  topicId,
  theme = 'space'
}) => {
  const navigate = useNavigate();

  if (!isVisible) return null;

  const handleStart = () => {
    onStart();
    navigate(`/my-deck/${topicId}/assessment/${assessmentType}`);
  };

  const handleCancel = () => {
    onClose();
  };

  const getAssessmentTitle = () => {
    return assessmentType === 'pre' ? 'Pre-Assessment' : 'Post-Assessment';
  };

  return (
    <div className={styles.instructionOverlay}>
      <div className={styles.instructionModal} data-theme={theme}>
        <div className={styles.instructionHeader}>
          <h2>{getAssessmentTitle()} Instructions</h2>
          <p>Please read carefully before starting</p>
        </div>
        
        <div className={styles.instructionContent}>
          <div className={styles.instructionSection}>
            <h3>📋 Assessment Overview</h3>
            <ul>
              <li>This assessment contains <strong>15 questions</strong></li>
              <li>You must complete all 15 questions to finish the assessment</li>
              <li>Once completed, you cannot retake this assessment</li>
            </ul>
          </div>

          <div className={styles.instructionSection}>
            <h3>⚠️ Important Rules</h3>
            <ul>
              <li><strong>Be careful with your choices!</strong> Once you click an option, it's automatically recorded as your answer</li>
              <li>You can exit the assessment and return later to continue from where you left off</li>
              <li>Your progress is saved automatically after each question</li>
              <li>You cannot change your answer once submitted</li>
            </ul>
          </div>

          <div className={styles.instructionSection}>
            <h3>🎯 How to Proceed</h3>
            <ul>
              <li>Read each question carefully</li>
              <li>Select your answer by clicking on one of the options</li>
              <li>Click "Next Question" to proceed to the next question</li>
              <li>On the final question, click "Finish" to complete the assessment</li>
            </ul>
          </div>

          <div className={styles.instructionSection}>
            <h3>📊 After Completion</h3>
            <ul>
              <li>You'll see detailed results with explanations</li>
              <li>Your progress will be updated in the topic overview</li>
              <li>You can review your answers and learn from explanations</li>
            </ul>
          </div>
        </div>

        <div className={styles.instructionActions}>
          <button 
            className={styles.startButton}
            onClick={handleStart}
          >
            I Understand - Start Assessment
          </button>
          <button 
            className={styles.cancelButton}
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