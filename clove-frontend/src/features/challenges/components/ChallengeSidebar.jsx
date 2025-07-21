import React from "react";
import styles from "../styles/ChallengeSidebar.module.scss";
import { useChallengeTheme } from '../hooks/useChallengeTheme';

const ChallengeSidebar = ({
  missionTitle,
  missionDescription,
  timerLabel,
  timerValue,
  timerPercent,
  hintTitle,
  hintBtnText,
  hintBtnDisabled,
  onHintClick,
  hintsRevealed,
  hints,
  showTimer = true,
  showHints = false,
  scenarioTitle = "🧪 Scenario:",
  scenarioDescription,
  children,
}) => {
  const { getThemeStyles } = useChallengeTheme();
  
  return (
    <div className={styles.sidebarContainer} style={getThemeStyles()}>
    <div className={styles.missionDetails}>
      {/* General Instruction Box inside missionDetails, above missionInfo */}
      {children}
    </div>
    <div className={styles.controlsPanel}>
      {/* Scenario box at the top of controlsPanel, above timer */}
      {scenarioDescription && (
        <div className={styles.scenarioBox}>
          <h3 className={styles.scenarioTitle}>{scenarioTitle}</h3>
          <p className={styles.scenarioDescription}>
            {scenarioDescription}
          </p>
        </div>
      )}
      {showTimer && (
        <div className={styles.timerIntegrityContainer}>
          <div className={styles.timerLabel}>{timerLabel}</div>
          <div className={styles.timer}>{timerValue}</div>
          <div className={styles.integrityMeter}>
            <div
              className={styles.integrityFill}
              style={{ width: `${timerPercent}%` }}
            ></div>
            <span className={styles.integrityValue}>{timerPercent}%</span>
          </div>
        </div>
      )}
      {showHints && (
        <div className={styles.hintSystem}>
          <div className={styles.hintTitle}>{hintTitle}</div>
          <button
            className={styles.hintBtn}
            onClick={onHintClick}
            disabled={hintBtnDisabled}
          >
            {hintBtnText}
          </button>
          {hintsRevealed > 0 && (
            <div className={styles.hintContent}>
              <p>Available Hints:</p>
              <ul>
                {hints.slice(0, hintsRevealed).map((hint, idx) => (
                  <li key={idx}>{hint}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
  );
};

export default ChallengeSidebar; 