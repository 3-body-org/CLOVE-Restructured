/**
 * @file ProgressIndicator.jsx
 * @description Reusable progress indicator component for challenges
 */

import React from "react";
import "../../../styles/components/challenge.scss";
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
    <div className={`progress-indicator ${className} theme-${currentTheme || 'space'}`} style={themeStyles}>
      <span className="progress-text">
        Challenge {challengeIndex + 1} of {totalChallenges}
      </span>
      <div className="progress-bar">
        <div 
          className="challenge-progress-fill" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressIndicator; 