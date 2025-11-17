/**
 * @file ChallengesPage.jsx
 * @description Main challenges page with backend integration
 */

import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { MyDeckContext } from '../../../contexts/MyDeckContext';
import { useChallengeService } from '../hooks/useChallengeService';
import { useSidebar } from '../../../components/layout/Sidebar/Layout';
import CodeFixer from '../modes/CodeFixer';
import CodeCompletion from '../modes/CodeCompletion';
import OutputTracing from '../modes/OutputTracing';
import ChallengeSidebar from '../components/ChallengeSidebar';
import ProgressIndicator from '../components/ProgressIndicator';
import ChallengeFeedback from '../components/ChallengeFeedback';
import LoadingScreen from '../../../components/layout/StatusScreen/LoadingScreen';
import ErrorScreen from '../../../components/layout/StatusScreen/ErrorScreen';
import CustomExitWarningModal from '../components/CustomExitWarningModal';
import OtherSessionWarningModal from '../components/OtherSessionWarningModal';
import '../../../styles/components/challenge.scss';
import { useChallengeTheme } from '../hooks/useChallengeTheme';
import { getThemeCursor } from '../../../utils/themeCursors';

const ChallengesPage = () => {
  // Ensure correct theme class is applied before first paint for this route
  const { topicTheme } = useChallengeTheme();
  const navigate = useNavigate();
  const { subtopicId } = useParams();
  const { user: currentUser } = useAuth();
  const { setSubtopicId } = useContext(MyDeckContext);
  const { closeSidebar } = useSidebar();
  
  // Set subtopic ID in context for navigation
  useEffect(() => {
    if (subtopicId) {
      setSubtopicId(parseInt(subtopicId));
    }
  }, [subtopicId, setSubtopicId]);

  // Use challenge service hook
  const {
    challengeState,
    currentChallenge,
    challengeIndex,
    totalChallenges,
    attemptCount,
    getCurrentProgress,
    loading,
    error,
    // Adaptive features
    isTimerEnabled,
    isHintsEnabled,
    adaptiveLoading,
    adaptiveError,
    timerState,
    timeRemaining,
    initialTimerDuration,
    hintsUsed,
    hintsAvailable,
    revealedHints,
    useHint,
    submitAnswer,
    cancelCurrentChallenge,
    isResumed,
    resumeWarning,
    setResumeWarning,
    timerExpiredWarning,
    setTimerExpiredWarning,
    resetChallengeState,
    isSubmitting,
    userAnswer,
    updateUserAnswer,
    // Exit prevention - Option 1: Custom warning modal
    showCustomExitWarning,
    isProcessingExit,
    handleContinueChallenge,
    handleLeaveAnyway,
    // Option 2: Other session warning modal
    showOtherSessionWarning,
    setShowOtherSessionWarning,
    otherSessions,
    forceDeactivateAllSessions,
    // Feedback
    showFeedback,
    feedbackData,
    handleContinueAfterFeedback
  } = useChallengeService(currentUser?.id, parseInt(subtopicId));

  // Handle challenge completion - Use useCallback to prevent unnecessary re-renders
  const handleChallengeComplete = useCallback((result) => {
    submitAnswer(result);
  }, [submitAnswer]);

  // Handle real-time answer updates (for saving partial progress)
  const handleAnswerUpdate = useCallback((answer) => {
    updateUserAnswer(answer);
  }, [updateUserAnswer]);

  // Handle resume after leaving
  const handleResumeConfirm = useCallback(async () => {
    await cancelCurrentChallenge();
    setResumeWarning(false);
  }, [cancelCurrentChallenge, setResumeWarning]);

  // Handle resume cancel
  const handleResumeCancel = useCallback(() => {
    setResumeWarning(false);
    navigate(`/my-deck/${subtopicId}`);
    // Call closeSidebar without including it in dependencies
    closeSidebar();
  }, [setResumeWarning, navigate, subtopicId]); // Removed closeSidebar from dependencies

  // Memoize the challenge component to prevent infinite re-renders
  const challengeComponent = useMemo(() => {
    if (!currentChallenge) return null;
    
    switch (currentChallenge.mode) {
      case 'code_completion':
        return (
          <CodeCompletion
            challengeData={currentChallenge}
            onAnswerSubmit={handleChallengeComplete}
            timeRemaining={timeRemaining}
            initialTimerDuration={initialTimerDuration}
            hintsUsed={hintsUsed}
            hintsAvailable={hintsAvailable}
            onHint={useHint}
            disabled={challengeState !== 'active' || timerState === 'expired'}
            challengeIndex={getCurrentProgress()}
            totalChallenges={totalChallenges}
            revealedHints={revealedHints}
            resetChallengeState={resetChallengeState}
            isSubmitting={isSubmitting}
            isResumed={isResumed}
            userAnswer={userAnswer}
            onAnswerUpdate={handleAnswerUpdate}
            timerState={timerState}
            isTimerEnabled={isTimerEnabled}
            isHintsEnabled={isHintsEnabled}
          />
        );
      case 'code_fixer':
        return (
          <CodeFixer
            challengeData={currentChallenge}
            onAnswerSubmit={handleChallengeComplete}
            timeRemaining={timeRemaining}
            initialTimerDuration={initialTimerDuration}
            hintsUsed={hintsUsed}
            hintsAvailable={hintsAvailable}
            onHint={useHint}
            disabled={challengeState !== 'active' || timerState === 'expired'}
            challengeIndex={getCurrentProgress()}
            totalChallenges={totalChallenges}
            revealedHints={revealedHints}
            resetChallengeState={resetChallengeState}
            isSubmitting={isSubmitting}
            isResumed={isResumed}
            userAnswer={userAnswer}
            onAnswerUpdate={handleAnswerUpdate}
            timerState={timerState}
            isTimerEnabled={isTimerEnabled}
            isHintsEnabled={isHintsEnabled}
          />
        );
      case 'output_tracing':
        return (
          <OutputTracing
            challengeData={currentChallenge}
            onAnswerSubmit={handleChallengeComplete}
            timeRemaining={timeRemaining}
            initialTimerDuration={initialTimerDuration}
            hintsUsed={hintsUsed}
            hintsAvailable={hintsAvailable}
            onHint={useHint}
            disabled={challengeState !== 'active' || timerState === 'expired'}
            challengeIndex={getCurrentProgress()}
            totalChallenges={totalChallenges}
            revealedHints={revealedHints}
            resetChallengeState={resetChallengeState}
            isSubmitting={isSubmitting}
            isResumed={isResumed}
            userAnswer={userAnswer}
            onAnswerUpdate={handleAnswerUpdate}
            timerState={timerState}
            isTimerEnabled={isTimerEnabled}
            isHintsEnabled={isHintsEnabled}
          />
        );
      default:
        return <div>Unknown challenge mode: {currentChallenge.mode}</div>;
    }
  }, [
    currentChallenge,
    timeRemaining,
    initialTimerDuration,
    hintsUsed,
    hintsAvailable,
    useHint,
    challengeState,
    timerState,
    challengeIndex,
    totalChallenges,
    revealedHints,
    resetChallengeState,
    isSubmitting,
    isResumed,
    userAnswer,
    handleAnswerUpdate,
    handleChallengeComplete,
    isTimerEnabled,
    isHintsEnabled
  ]);

  // Close sidebar when component mounts
  useEffect(() => {
    closeSidebar();
  }, [closeSidebar]);

  // Show loading screen
  if (loading) {
    return <LoadingScreen />;
  }

  // Show error screen
  if (error) {
    return <ErrorScreen error={error} />;
  }

  // Show progress indicator if no current challenge
  if (!currentChallenge) {
    return <ProgressIndicator />;
  }

  return (
    <div className={`challenges-container theme-${topicTheme || 'space'}`} style={{ cursor: getThemeCursor(topicTheme || 'space') }}>
      {/* Custom Exit Warning Modal - Option 1 */}
      <CustomExitWarningModal
        isVisible={showCustomExitWarning}
        onContinueChallenge={handleContinueChallenge}
        onLeaveAnyway={handleLeaveAnyway}
        isLoading={isProcessingExit}
        challengeState={challengeState}
      />

      {/* Other Session Warning Modal - Option 2 */}
      <OtherSessionWarningModal
        isVisible={showOtherSessionWarning}
        otherSessions={otherSessions}
        onCloseOtherTabs={forceDeactivateAllSessions}
        onCancel={() => setShowOtherSessionWarning(false)}
        isLoading={false}
      />

      {/* Resume Warning Modal */}
      {resumeWarning && (
        <div className="resume-warning">
          <div className="warning-content">
            <h3>⚠️ Warning</h3>
            <p>If you leave now, the current challenge will be counted as wrong.</p>
            <div className="warning-actions">
              <button onClick={handleResumeConfirm}>Continue Challenge</button>
              <button onClick={handleResumeCancel}>Leave Anyway</button>
            </div>
          </div>
        </div>
      )}

      {/* Timer Expired Warning Modal - Only show when not on feedback page */}
      {timerExpiredWarning && !showFeedback && (
        <div className="timer-expired-warning">
          <div className="warning-content">
            <h3>⏰ Time's Up!</h3>
            <p>You ran out of time! Your answer will be counted as wrong regardless of what you submit.</p>
            <div className="warning-actions">
              <button onClick={() => setTimerExpiredWarning(false)}>Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      {!showFeedback && currentChallenge && (
        <ChallengeSidebar
          mode={currentChallenge.mode}
          scenario={currentChallenge.scenario}
          timeRemaining={timeRemaining}
          hintsUsed={hintsUsed}
          hintsAvailable={hintsAvailable}
          onHint={useHint}
          disabled={challengeState !== 'active' || timerState === 'expired'}
          challengeIndex={getCurrentProgress()}
          totalChallenges={totalChallenges}
          revealedHints={revealedHints}
          initialTimerDuration={initialTimerDuration}
          showTimer={isTimerEnabled}
          showHints={isHintsEnabled}
          timerState={timerState}
        />
      )}

      {/* Right Challenge Area */}
      <div className="challenge-wrapper">
        <div className="full-width-challenge">
          {showFeedback && feedbackData ? (
            <ChallengeFeedback
              isCorrect={feedbackData.isCorrect}
              feedback={feedbackData.feedback}
              userAnswer={feedbackData.userAnswer}
              correctAnswer={feedbackData.correctAnswer}
              challengeMode={feedbackData.challengeMode}
              onContinue={handleContinueAfterFeedback}
              points={feedbackData.points}
              timeSpent={feedbackData.timeSpent}
              hintsUsed={feedbackData.hintsUsed}
              timerEnabled={feedbackData.timerEnabled}
              hintsEnabled={feedbackData.hintsEnabled}
              isCancelled={feedbackData.isCancelled}
              isTimeExpired={feedbackData.isTimeExpired}
              isCancelledChallenge={feedbackData.isCancelledChallenge}
              challengeCode={feedbackData.challengeCode}
              explanation={feedbackData.explanation}
            />
          ) : (
            challengeComponent
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengesPage;
