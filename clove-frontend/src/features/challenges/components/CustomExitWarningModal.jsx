import React from 'react';
import styles from './CustomExitWarningModal.module.scss';
import { useChallengeTheme } from '../hooks/useChallengeTheme';

/**
 * Custom Exit Warning Modal Component
 * Beautiful custom warning when user tries to leave the challenge page
 */
const CustomExitWarningModal = ({ 
  isVisible, 
  onContinueChallenge, 
  onLeaveAnyway,
  isLoading = false,
  challengeState = 'active'
}) => {
  // Safely get theme with fallback
  let themeData;
  try {
    themeData = useChallengeTheme();
  } catch (error) {
    console.warn('Failed to get theme data, using fallback:', error);
    themeData = {
      getThemeStyles: () => ({}),
      currentTheme: 'space'
    };
  }
  
  const { getThemeStyles, currentTheme } = themeData;
  
  // Get theme-specific styles with fallback
  const themeStyles = getThemeStyles ? getThemeStyles() : {};
  
  if (!isVisible) return null;

  // Determine the appropriate message based on challenge state
  const getModalContent = () => {
    switch (challengeState) {
      case 'submitted':
        return {
          icon: '📊',
          title: 'Leave Feedback Page?',
          message: 'If you leave now, you\'ll lose your progress in this challenge session. Please continue to complete the challenge flow.',
          continueText: 'Continue to Next Challenge',
          leaveText: 'Leave Anyway'
        };
      case 'expired':
        return {
          icon: '⏰',
          title: 'Leave Challenge?',
          message: 'If you leave now, this challenge will be counted as wrong.',
          continueText: 'Continue Challenge',
          leaveText: 'Leave Anyway'
        };
      case 'resumed':
        return {
          icon: '⚠️',
          title: 'Leave Challenge?',
          message: 'If you leave now, this challenge will be counted as wrong.',
          continueText: 'Continue Challenge',
          leaveText: 'Leave Anyway'
        };
      default: // active
        return {
          icon: '⚠️',
          title: 'Leave Challenge?',
          message: 'If you leave now, this challenge will be counted as wrong.',
          continueText: 'Continue Challenge',
          leaveText: 'Leave Anyway'
        };
    }
  };

  const content = getModalContent();

  return (
    <div className={`${styles.modalOverlay} theme-${currentTheme || 'space'}`} style={themeStyles}>
      <div className={styles.modalContent}>
        <div className={styles.warningIcon}>
          {content.icon}
        </div>
        
        <h2 className={styles.title}>{content.title}</h2>
        
        <p className={styles.message}>
          {content.message}
        </p>
        
        <div className={styles.buttonContainer}>
          <button
            className={`${styles.button} ${styles.continueButton}`}
            onClick={onContinueChallenge}
            disabled={isLoading}
          >
            {content.continueText}
          </button>
          
          <button
            className={`${styles.button} ${styles.leaveButton}`}
            onClick={onLeaveAnyway}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : content.leaveText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomExitWarningModal; 