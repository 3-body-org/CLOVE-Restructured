import React from 'react';
import { useChallengeTheme } from '../hooks/useChallengeTheme';
import "../../../styles/components/challenge.scss";

const CustomExitWarningModal = ({ 
  isVisible, 
  onContinueChallenge, 
  onLeaveAnyway,
  isLoading = false,
  challengeState = 'active'
}) => {
  const { getThemeStyles, currentTheme } = useChallengeTheme();
  
  const themeStyles = getThemeStyles();
  
  if (!isVisible) return null;

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
      default:
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
    <div className={`customExitWarningModalOverlay theme-${currentTheme || 'space'}`} style={themeStyles}>
      <div className="customExitWarningModalContent">
        <div className="customExitWarningModalWarningIcon">
          {content.icon}
        </div>
        
        <h2 className="customExitWarningModalTitle">{content.title}</h2>
        
        <p className="customExitWarningModalMessage">
          {content.message}
        </p>
        
        <div className="customExitWarningModalButtonContainer">
          <button
            className="customExitWarningModalButton customExitWarningModalContinueButton"
            onClick={onContinueChallenge}
            disabled={isLoading}
          >
            {content.continueText}
          </button>
          
          <button
            className="customExitWarningModalButton customExitWarningModalLeaveButton"
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