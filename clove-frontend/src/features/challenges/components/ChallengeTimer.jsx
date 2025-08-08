/**
 * @file ChallengeTimer.jsx
 * @description Challenge timer component with optional visibility
 */

import React from "react";
import styles from "../styles/ChallengeSidebar.module.scss";
import { useChallengeTheme } from '../hooks/useChallengeTheme';

const ChallengeTimer = ({
  timeRemaining,
  initialTimerDuration = 300,
  disabled = false,
  visible = true,
  timerState = 'active'
}) => {
  const { topicTheme } = useChallengeTheme();
  
  // Don't render if not visible or disabled
  if (!visible || disabled) return null;
  
  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  
  // Calculate timer percentage
  const timerPercent = timeRemaining > 0 ? Math.floor((timeRemaining / initialTimerDuration) * 100) : 0;
  
  // Get theme-specific timer title
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

  // Get timer display based on state
  const getTimerDisplay = () => {
    if (timerState === 'paused') {
      return (
        <>
          <span className={styles.timerValue}>{formatTime(timeRemaining)}</span>
          <span className={`${styles.timerStatus} ${styles.timerPaused}`}>PAUSED</span>
        </>
      );
    } else if (timerState === 'expired') {
      return (
        <>
          <span className={styles.timerValue}>00:00</span>
          <span className={`${styles.timerStatus} ${styles.timerExpired}`}>EXPIRED</span>
        </>
      );
    } else {
      return <span className={styles.timerValue}>{formatTime(timeRemaining)}</span>;
    }
  };
  
  return (
    <div className={styles.timerIntegrityContainer} data-theme={topicTheme}>
      <div className={styles.timerTitle}>{getTimerTitle(topicTheme)}</div>
      <div className={styles.timerDisplay}>
        {getTimerDisplay()}
      </div>
      <div className={styles.timerBar}>
        <div
          className={styles.timerFill}
          data-theme={topicTheme}
          style={{ width: `${timerPercent}%` }}
        />
        <span className={styles.timerPercentage}>{timerPercent}%</span>
      </div>
    </div>
  );
};

export default ChallengeTimer; 