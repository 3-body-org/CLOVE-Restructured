/**
 * @file ChallengeHints.jsx
 * @description Challenge hints component with optional visibility
 */

import React from "react";
import styles from "../styles/ChallengeSidebar.module.scss";
import { useChallengeTheme } from '../hooks/useChallengeTheme';

const ChallengeHints = ({
  hintsUsed,
  hintsAvailable,
  onHint,
  revealedHints = [],
  disabled = false,
  visible = true
}) => {
  const { topicTheme } = useChallengeTheme();
  
  if (!visible) return null;
  
  const handleHint = () => {
    if (!disabled && onHint) {
      onHint();
    }
  };
  
  return (
    <div className={styles.hintSystem} data-theme={topicTheme}>
      <div className={styles.hintTitle}>HINTS</div>
      
      <div className={styles.hintDotsCorner}>
        {[...Array(hintsAvailable)].map((_, i) => (
          <div 
            key={i} 
            className={`${styles.hintDot} ${i < (hintsAvailable - hintsUsed) ? styles.available : styles.used}`}
            title={i < (hintsAvailable - hintsUsed) ? 'Available hint' : 'Used hint'}
          ></div>
        ))}
      </div>
      
      <button
        className={styles.hintBtn}
        data-theme={topicTheme}
        onClick={handleHint}
        disabled={disabled || hintsUsed >= hintsAvailable}
      >
        {hintsUsed >= hintsAvailable ? 'No Hints Left' : 'Get Hint'}
      </button>
      
      <div className={styles.hintDisplay}>
        {revealedHints.map((hint, index) => (
          <div key={index} className={styles.hintContent}>
            <h4>Hint {index + 1}:</h4>
            <p>{hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChallengeHints; 