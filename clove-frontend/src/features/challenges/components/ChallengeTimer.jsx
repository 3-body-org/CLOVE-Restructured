/**
 * @file ChallengeTimer.jsx
 * @description Challenge timer component with optional visibility
 */

import React from "react";
import "../../../styles/components/challenge.scss";
import { useChallengeTheme } from '../hooks/useChallengeTheme';

const ChallengeTimer = ({
  timeRemaining,
  initialTimerDuration = 300,
  disabled = false,
  visible = true,
  timerState = 'active'
}) => {
  const { topicTheme } = useChallengeTheme();
  
  if (!visible || disabled) return null;
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  
  const timerPercent = timeRemaining > 0 ? Math.floor((timeRemaining / initialTimerDuration) * 100) : 0;
  
  const getTimerTitle = (theme) => {
    switch (theme) {
      case 'space':
        return "MISSION TIMER";
      case 'wizard':
        return "ARCANE TIMER";
      case 'detective':
        return "INVESTIGATION TIMER";
      default:
        return "EMERGENCY TIMER";
    }
  };

  const getTimerDisplay = () => {
    if (timerState === 'paused') {
      return (
        <>
          <span className="timer-value">{formatTime(timeRemaining)}</span>
          <span className="timer-status timer-paused">PAUSED</span>
        </>
      );
    } else if (timerState === 'expired') {
      return (
        <>
          <span className="timer-value">00:00</span>
          <span className="timer-status timer-expired">EXPIRED</span>
        </>
      );
    } else {
      return <span className="timer-value">{formatTime(timeRemaining)}</span>;
    }
  };
  
  return (
    <div className="timer-integrity-container" data-theme={topicTheme}>
      <div className="timer-title">{getTimerTitle(topicTheme)}</div>
      <div className="timer-display">
        {getTimerDisplay()}
      </div>
      <div className="timer-bar">
        <div
          className="timer-fill"
          data-theme={topicTheme}
          style={{ width: `${timerPercent}%` }}
        />
        <span className="timer-percentage">{timerPercent}%</span>
      </div>
    </div>
  );
};

export default ChallengeTimer; 