/**
 * @file CodeFixer.jsx
 * @description Code Fixer challenge mode with backend integration
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import MonacoCodeBlock from '../components/MonacoCodeBlock';
import ProgressIndicator from '../components/ProgressIndicator';
import "../../../styles/components/challenge.scss";

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
      // Only set userCode if userAnswer is not empty
      if (userAnswer && typeof userAnswer === 'string' && userAnswer.trim() !== '') {
        setUserCode(userAnswer);
      }
    }
  }, [userAnswer, isResumed]);

  // Reset state when challenge data changes (new challenge loaded)
  useEffect(() => {
    setIsSubmitted(false);
  }, [challengeData]);

  // Update parent component with current answer for partial progress saving
  useEffect(() => {
    if (onAnswerUpdate) {
      onAnswerUpdate(userCode);
    }
  }, [userCode, onAnswerUpdate]);

  const handleCodeChange = (value) => {
    if (disabled || isSubmitted || isResumed || timerState === 'expired') return;
    setUserCode(value);
  };

  const handleSubmit = () => {
    if (isSubmitted || isSubmitting) return;
    
    // Set submitted state
    setIsSubmitted(true);
    
    onAnswerSubmit(userCode);
  };

  return (
        <div className="challengeArea">
          {/* Progress Indicator at the very top */}
          <ProgressIndicator
            challengeIndex={challengeIndex}
            totalChallenges={totalChallenges}
          />

          {/* Challenge Title */}
          <h1 className="challengeTitle">CODE FIXER CHALLENGE</h1>
          
          <div className="codeFixerCodeEditorContainer">
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

          <div className="codeFixerExpectedOutput">
            <h3>Expected Output:</h3>
            <div className="codeFixerOutputText">
              {Array.isArray(expectedOutput) 
                ? expectedOutput.map((output, index) => (
                    <div key={index}>{output}</div>
                  ))
                : expectedOutput
              }
            </div>
          </div>

          <div className="codeFixerSubmitButton">
            <button
              onClick={handleSubmit}
              disabled={isSubmitted || isSubmitting}
              className={`${isSubmitted ? 'submitted' : ''} ${isSubmitting ? 'submitting' : ''}`}
              title={isSubmitting ? "Submitting..." : "Submit your answer (empty submissions allowed)"}
            >
              {isSubmitting ? 'Submitting...' : isSubmitted ? 'Submitted' : 'Submit'}
            </button>
            {isResumed && (
              <p className="submitHint">
                This challenge was cancelled earlier. Your answers will be counted as wrong regardless of your progress.
              </p>
            )}
            {timerState === 'expired' && (
              <p className="submitHint">
                Time's up! Your answers will be counted as wrong regardless of your progress.
              </p>
            )}
          </div>
        </div>
  );
};

export default CodeFixer;
