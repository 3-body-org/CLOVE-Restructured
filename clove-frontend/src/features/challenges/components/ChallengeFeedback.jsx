import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/ChallengeFeedback.module.scss';
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
  const { getThemeValue, getThemeStyles, currentTheme } = useChallengeTheme();
  
  // Get theme-specific styles
  const themeStyles = getThemeStyles();
  
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
    if (isTimeExpired || isCancelledChallenge) return styles.cancelled;
    return isCorrect ? styles.correct : styles.incorrect;
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
      className={`${styles.feedbackContainer} ${getFeedbackColor()} theme-${currentTheme}`}
      style={themeStyles}
    >
      <div className={styles.feedbackHeader}>
        <div className={styles.feedbackIcon}>
          {getFeedbackIcon()}
        </div>
        <h2 className={styles.feedbackTitle}>{getFeedbackTitle()}</h2>
      </div>

      {/* Points and Stats - Moved to top */}
      <div className={styles.statsContainer}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Points:</span>
          <span className={styles.statValue}>{isCorrect ? points : 0}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Time:</span>
          <span className={styles.statValue}>{formatTimeSpent(timeSpent, timerEnabled)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Hints Used:</span>
          <span className={styles.statValue}>{formatHintsUsed(hintsUsed, hintsEnabled)}</span>
        </div>
      </div>

      <div className={styles.feedbackContent}>
        {/* User's Answer */}
        <div className={styles.answerSection}>
          <h3>Your Answer:</h3>
          <div className={styles.answerBox}>
            <pre>{formatAnswer(userAnswer, challengeMode)}</pre>
          </div>
        </div>

        {/* Correct Answer (always show for learning) */}
        {correctAnswer && (
          <div className={styles.answerSection}>
            <h3>Correct Answer:</h3>
            <div className={styles.answerBox}>
              <pre>{formatAnswer(correctAnswer, challengeMode)}</pre>
            </div>
          </div>
        )}

        {/* Feedback (always present) */}
        <div className={styles.feedbackSection}>
          <h3>Feedback:</h3>
          <div className={styles.feedbackBox}>
            <p>{feedback || "No feedback available for this challenge."}</p>
          </div>
        </div>

        {/* Challenge Code (always present) */}
        <div className={styles.codeSection}>
          <h3>Challenge Code:</h3>
          <div className={styles.codeBox}>
            <pre>{challengeCode || "No challenge code available."}</pre>
          </div>
        </div>

        {/* Explanation (always present) */}
        <div className={styles.explanationSection}>
          <h3>Explanation:</h3>
          <div className={styles.explanationBox}>
            <p>{explanation || "No detailed explanation available for this challenge."}</p>
          </div>
        </div>
      </div>

      <div className={styles.feedbackActions}>
        <button 
          className={styles.continueButton}
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ChallengeFeedback; 