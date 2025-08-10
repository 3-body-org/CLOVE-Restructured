/**
 * @file ProgressIndicator.jsx
 * @description Reusable progress indicator component for challenges
 */

import React from "react";
import styles from "../styles/ProgressIndicator.module.scss";
import { useChallengeTheme } from '../hooks/useChallengeTheme';

const ProgressIndicator = ({
  challengeIndex = 0,
  totalChallenges = 5,
  className = ""
}) => {
  const { getThemeStyles, currentTheme } = useChallengeTheme();
  
  const themeStyles = getThemeStyles();
  
  const progressPercentage = ((challengeIndex + 1) / totalChallenges) * 100;

  return (
    <div className={`${styles.progressIndicator} ${className} theme-${currentTheme || 'space'}`} style={themeStyles}>
      <span className={styles.progressText}>
        Challenge {challengeIndex + 1} of {totalChallenges}
      </span>
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressIndicator; 