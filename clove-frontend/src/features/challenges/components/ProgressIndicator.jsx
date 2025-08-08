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
  // Safely get theme with fallback
  let themeData;
  try {
    themeData = useChallengeTheme();
  } catch (error) {
    console.warn('Failed to get theme data, using fallback:', error);
    themeData = {
      getThemeStyles: () => ({}),
      currentTheme: 'space'
    };
  }
  
  const { getThemeStyles, currentTheme } = themeData;
  
  // Get theme-specific styles with fallback
  const themeStyles = getThemeStyles ? getThemeStyles() : {};
  
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