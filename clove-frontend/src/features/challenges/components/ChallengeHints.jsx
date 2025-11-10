/**
 * @file ChallengeHints.jsx
 * @description Challenge hints component with optional visibility
 */

import React from "react";
import "../../../styles/components/challenge.scss";
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
    <div className="hint-system" data-theme={topicTheme}>
      <div className="hint-title">HINTS</div>
      
      <div className="hint-dots-corner">
        {[...Array(hintsAvailable)].map((_, i) => (
          <div 
            key={i} 
            className={`hint-dot ${i < (hintsAvailable - hintsUsed) ? 'available' : 'used'}`}
            title={i < (hintsAvailable - hintsUsed) ? 'Available hint' : 'Used hint'}
          ></div>
        ))}
      </div>
      
      <button
        className="hint-btn"
        data-theme={topicTheme}
        onClick={handleHint}
        disabled={disabled || hintsUsed >= hintsAvailable}
      >
        {hintsUsed >= hintsAvailable ? 'No Hints Left' : 'Get Hint'}
      </button>
      
      <div className="hint-display">
        {revealedHints.map((hint, index) => (
          <div key={index} className="hint-content">
            <h4>Hint {index + 1}:</h4>
            <p>{hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChallengeHints; 