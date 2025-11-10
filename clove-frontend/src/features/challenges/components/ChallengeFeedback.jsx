import React, { useState, useEffect, useRef } from 'react';
import '../../../styles/components/challenge.scss';
import { useChallengeTheme } from '../hooks/useChallengeTheme';

const ChallengeFeedback = ({ 
  isCorrect, 
  feedback, 
  userAnswer, 
  correctAnswer, 
  challengeMode,
  onContinue,
  points,
  timeSpent,
  hintsUsed,
  timerEnabled = true,
  hintsEnabled = true,
  isCancelled = false,
  isTimeExpired = false,
  isCancelledChallenge = false,
  challengeCode,
  explanation
}) => {
  const { currentTheme } = useChallengeTheme();
  
  // Format time spent
  const formatTimeSpent = (seconds, timerEnabled) => {
    if (!timerEnabled) return 'OFF';
    if (!seconds) return '0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  // Format hints used
  const formatHintsUsed = (hintsUsed, hintsEnabled) => {
    if (!hintsEnabled) return 'OFF';
    if (!hintsUsed) return '0 hints';
    return `${hintsUsed} hint${hintsUsed !== 1 ? 's' : ''}`;
  };
  
  const getFeedbackIcon = () => {
    if (isTimeExpired) return '⏰';
    if (isCancelledChallenge) return '⚠️';
    return isCorrect ? '✅' : '❌';
  };

  const getFeedbackTitle = () => {
    if (isTimeExpired) return "Time's Up!";
    if (isCancelledChallenge) return 'Challenge Cancelled';
    return isCorrect ? 'Correct!' : 'Incorrect';
  };

  const getFeedbackColor = () => {
    if (isTimeExpired || isCancelledChallenge) return 'cancelled';
    return isCorrect ? 'correct' : 'incorrect';
  };

  const formatAnswer = (answer, mode) => {
    if (mode === 'code_fixer') {
      return typeof answer === 'string' ? answer : JSON.stringify(answer);
    } else if (mode === 'output_tracing') {
      // Format output tracing answers for better readability
      if (Array.isArray(answer)) {
        if (answer.length === 0) {
          return "No outputs selected";
        }
        return answer.map((output, index) => `• ${output}`).join('\n');
      }
      return typeof answer === 'string' ? answer : JSON.stringify(answer);
    } else if (mode === 'code_completion') {
      // Format code completion answers for better readability
      if (typeof answer === 'object' && answer !== null) {
        // If it's a slot-based object, extract just the choices
        if (Object.keys(answer).some(key => key.startsWith('slot_'))) {
          const choices = Object.entries(answer)
            .filter(([key, value]) => key.startsWith('slot_') && value && value.choice)
            .map(([key, value]) => `${key}: ${value.choice}`)
            .join('\n');
          return choices || JSON.stringify(answer, null, 2);
        }
        // If it's an array, format it nicely
        if (Array.isArray(answer)) {
          return answer.map((item, index) => `Slot ${index + 1}: ${item}`).join('\n');
        }
        return JSON.stringify(answer, null, 2);
      }
      return answer;
    }
    return answer;
  };

  return (
    <div 
      className={`feedback-container ${getFeedbackColor()} theme-${currentTheme}`}
    >
      <div className="feedback-header">
        <div className="feedback-icon">
          {getFeedbackIcon()}
        </div>
        <h2 className="feedback-title">{getFeedbackTitle()}</h2>
      </div>

      {/* Points and Stats - Moved to top */}
      <div className="stats-container">
        <div className="stat">
          <span className="stat-label">Points:</span>
          <span className="stat-value">{isCorrect ? points : 0}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Time:</span>
          <span className="stat-value">{formatTimeSpent(timeSpent, timerEnabled)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Hints Used:</span>
          <span className="stat-value">{formatHintsUsed(hintsUsed, hintsEnabled)}</span>
        </div>
      </div>

      <div className="feedback-content">
        {/* User's Answer */}
        <div className="answer-section">
          <h3>Your Answer:</h3>
          <div className="answer-box">
            <pre>{formatAnswer(userAnswer, challengeMode)}</pre>
          </div>
        </div>

        {/* Correct Answer (always show for learning) */}
        {correctAnswer && (
          <div className="answer-section">
            <h3>Correct Answer:</h3>
            <div className="answer-box">
              <pre>{formatAnswer(correctAnswer, challengeMode)}</pre>
            </div>
          </div>
        )}

        {/* Feedback (always present) */}
        <div className="feedback-section">
          <h3>Feedback:</h3>
          <div className="feedback-box">
            <p>{feedback || "No feedback available for this challenge."}</p>
          </div>
        </div>

        {/* Challenge Code (always present) */}
        <div className="code-section">
          <h3>Challenge Code:</h3>
          <div className="code-box">
            <pre>{challengeCode || "No challenge code available."}</pre>
          </div>
        </div>

        {/* Explanation (always present) */}
        <div className="explanation-section">
          <h3>Explanation:</h3>
          <div className="explanation-box">
            <p>{explanation || "No detailed explanation available for this challenge."}</p>
          </div>
        </div>
      </div>

      <div className="feedback-actions">
        <button 
          className="continue-button"
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ChallengeFeedback; 