/**
 * @file CodeFixer.jsx
 * @description Code Fixer challenge mode with backend integration
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import MonacoCodeBlock from '../components/MonacoCodeBlock';
import ChallengeSidebar from '../components/ChallengeSidebar';
import ProgressIndicator from '../components/ProgressIndicator';
import ChallengeThemeProvider from '../components/ChallengeThemeProvider';
import styles from '../styles/CodeFixer.module.scss';

const CodeFixer = ({
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
  const [userCode, setUserCode] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const editorRef = useRef(null);

  const { initialCode, solutionCode, expectedOutput, scenario } = challengeData;

  useEffect(() => {
    if (initialCode) {
      setUserCode(initialCode);
    }
  }, [initialCode]);

  // Restore user answer when resuming a cancelled challenge
  useEffect(() => {
    if (userAnswer && isResumed) {
      console.log('🔄 CODEFIXER: userAnswer =', userAnswer, 'isResumed =', isResumed);
      console.log('🔄 RESTORING: User code for cancelled challenge:', userAnswer);
      // Only set userCode if userAnswer is not empty
      if (userAnswer && typeof userAnswer === 'string' && userAnswer.trim() !== '') {
        console.log('🔄 RESTORING: Setting userCode to:', userAnswer);
        setUserCode(userAnswer);
      } else {
        console.log('🔄 EMPTY USER ANSWER: Not setting empty userAnswer to editor');
      }
    }
  }, [userAnswer, isResumed]);

  // Reset state when challenge data changes (new challenge loaded)
  useEffect(() => {
    setIsSubmitted(false);
  }, [challengeData]);

  // Update parent component with current answer for partial progress saving
  useEffect(() => {
    console.log('🔄 CODEFIXER SAVE: userCode =', userCode, 'onAnswerUpdate =', !!onAnswerUpdate);
    if (onAnswerUpdate) {
      console.log('🔄 CODEFIXER SAVE: Calling onAnswerUpdate with:', userCode);
      onAnswerUpdate(userCode);
    }
  }, [userCode, onAnswerUpdate]);

  const handleCodeChange = (value) => {
    console.log('🔄 CODEFIXER CHANGE: New value =', value, 'disabled =', disabled, 'isResumed =', isResumed, 'timerState =', timerState);
    if (disabled || isSubmitted || isResumed || timerState === 'expired') return;
    console.log('🔄 CODEFIXER CHANGE: Setting userCode to:', value);
    setUserCode(value);
  };

  const handleSubmit = () => {
    if (isSubmitted || isSubmitting) return;
    
    // Set submitted state
    setIsSubmitted(true);
    
    onAnswerSubmit(userCode);
  };

  return (
    <ChallengeThemeProvider>
      <div className={styles.codeFixerContainer}>
        {/* Left Sidebar */}
        <ChallengeSidebar
          mode="code_fixer"
          scenario={scenario}
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
        />

        {/* Right Challenge Area */}
        <div className={styles.challengeArea}>
          {/* Progress Indicator at the very top */}
          <ProgressIndicator
            challengeIndex={challengeIndex}
            totalChallenges={totalChallenges}
          />

          {/* Challenge Title */}
          <h1 className={styles.challengeTitle}>CODE FIXER CHALLENGE</h1>
          
          <div className={styles.codeEditorContainer}>
            <h3>EDIT THE CODE:</h3>
            <MonacoCodeBlock
              key={`${isResumed}-${disabled}-${timerState}`} // Force re-render when readOnly state changes
              value={userCode}
              language="java"
              mode="code_fixer" // NEW: Pass mode to allow editing
              height="100%"
              timerState={timerState}
              disabled={disabled}
              isResumed={isResumed}
              onMount={(editor, monaco) => {
                editorRef.current = editor;
              }}
              onChange={handleCodeChange}
            />
          </div>

          <div className={styles.expectedOutput}>
            <h3>Expected Output:</h3>
            <div className={styles.outputText}>
              {Array.isArray(expectedOutput) 
                ? expectedOutput.map((output, index) => (
                    <div key={index}>{output}</div>
                  ))
                : expectedOutput
              }
            </div>
          </div>

          <div className={styles.submitButton}>
            <button
              onClick={handleSubmit}
              disabled={isSubmitted || isSubmitting}
              className={`${isSubmitted ? styles.submitted : ''} ${isSubmitting ? styles.submitting : ''}`}
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

export default CodeFixer;
