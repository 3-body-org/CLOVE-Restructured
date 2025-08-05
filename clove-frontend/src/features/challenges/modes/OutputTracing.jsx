/**
 * @file OutputTracing.jsx
 * @description Output Tracing challenge mode with backend integration
 */

import React, { useState, useEffect, useRef } from 'react';
import MonacoCodeBlock from '../components/MonacoCodeBlock';
import ChallengeSidebar from '../components/ChallengeSidebar';
import ProgressIndicator from '../components/ProgressIndicator';
import ChallengeThemeProvider from '../components/ChallengeThemeProvider';
import styles from '../styles/OutputTracing.module.scss';

const OutputTracing = ({
  challengeData,
  onAnswerSubmit,
  timeRemaining,
  initialTimerDuration,
  hintsUsed,
  hintsAvailable,
  onHint,
  disabled = false,
  challengeIndex = 0,
  totalChallenges = 5,
  revealedHints = [],
  resetChallengeState,
  isSubmitting = false,
  isResumed = false,
  userAnswer = null,
  onAnswerUpdate = null,
  timerState = 'active',
  isTimerEnabled = true,
  isHintsEnabled = true
}) => {
  const [selectedChoices, setSelectedChoices] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const editorRef = useRef(null);

  const { code, choices, correctOutput, scenario } = challengeData;

  // Reset state when challenge data changes
  useEffect(() => {
    setSelectedChoices([]);
    setIsSubmitted(false);
  }, [challengeData]);

  // Restore user answer when resuming a cancelled challenge
  useEffect(() => {
    if (userAnswer && isResumed) {
      console.log('🔄 RESTORING: User selections for cancelled challenge:', userAnswer);
      // Only restore if userAnswer is not empty
      if (userAnswer && Array.isArray(userAnswer) && userAnswer.length > 0) {
        setSelectedChoices(userAnswer);
      } else {
        console.log('🔄 EMPTY USER ANSWER: Not restoring empty userAnswer');
      }
    }
  }, [userAnswer, isResumed]);

  // Update parent component with current answer for partial progress saving
  useEffect(() => {
    if (onAnswerUpdate) {
      onAnswerUpdate(selectedChoices);
    }
  }, [selectedChoices, onAnswerUpdate]);

  const handleChoiceToggle = (choice) => {
    if (disabled || isSubmitted || timerState === 'expired') return;
    
    setSelectedChoices(prev => {
      const newChoices = prev.includes(choice)
        ? prev.filter(c => c !== choice)
        : [...prev, choice];
      return newChoices;
    });
  };

  const handleSubmit = () => {
    if (isSubmitted || isSubmitting) return;
    
    // Set submitted state
    setIsSubmitted(true);
    
    onAnswerSubmit(selectedChoices);
  };

  return (
    <ChallengeThemeProvider>
      <div className={styles.outputTracingContainer}>
        {/* Left Sidebar */}
        <ChallengeSidebar
          mode="output_tracing"
          scenario={challengeData.scenario}
          timeRemaining={timeRemaining}
          hintsUsed={hintsUsed}
          hintsAvailable={hintsAvailable}
          onHint={onHint}
          disabled={disabled}
          challengeIndex={challengeIndex}
          totalChallenges={totalChallenges}
          revealedHints={revealedHints}
          initialTimerDuration={initialTimerDuration}
          showTimer={isTimerEnabled}
          showHints={isHintsEnabled}
          timerState={timerState}
        >
          {/* Custom content for sidebar */}
        </ChallengeSidebar>

        {/* Right Challenge Area */}
        <div className={styles.challengeArea}>
          {/* Progress Indicator at the very top */}
          <ProgressIndicator
            challengeIndex={challengeIndex}
            totalChallenges={totalChallenges}
          />
          
          <h1 className={styles.challengeTitle}>OUTPUT TRACING CHALLENGE</h1>
          
          <div className={styles.codeDisplayContainer}>
            <h3>CODE TO ANALYZE:</h3>
            <MonacoCodeBlock
              value={challengeData.code}
              language="java"
              mode="output_tracing" // NEW: Pass mode to ensure read-only
              height="100%"
              timerState={timerState}
              disabled={disabled}
              isResumed={isResumed}
            />
          </div>

          <div className={styles.questionContainer}>
            <h3>What is the output of the following code?</h3>
            <div className={styles.selectionInfo}>
              Selected: {selectedChoices.length} option(s)
            </div>
          </div>

          <div className={styles.choicesContainer}>
            {choices.map((choice, index) => (
              <button
                key={index}
                className={`${styles.choiceButton} ${
                  selectedChoices.includes(choice) ? styles.selected : ''
                }`}
                onClick={() => handleChoiceToggle(choice)}
                disabled={disabled || isSubmitted || timerState === 'expired'}
              >
                {choice}
              </button>
            ))}
          </div>

          <div className={styles.submitButton}>
            <button
              className={`${styles.submitButton} ${isSubmitting ? styles.submitting : ''} ${isSubmitted ? styles.submitted : ''}`}
              onClick={handleSubmit}
              disabled={isSubmitted || isSubmitting}
              title={isSubmitting ? "Submitting..." : "Submit your answer (empty submissions allowed)"}
            >
              {isSubmitting ? 'Submitting...' : isSubmitted ? 'Submitted' : 'Submit'}
            </button>
            {isResumed && (
              <p className={styles.submitHint}>
                This challenge was cancelled earlier. Your answers will be counted as wrong regardless of your progress.
              </p>
            )}
            {timerState === 'expired' && (
              <p className={styles.submitHint}>
                Time's up! Your answers will be counted as wrong regardless of your progress.
              </p>
            )}
          </div>
        </div>
      </div>
    </ChallengeThemeProvider>
  );
};

export default OutputTracing;
