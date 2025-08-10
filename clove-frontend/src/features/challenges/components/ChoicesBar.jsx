/**
 * @file ChoicesBar.jsx
 * @description Choices bar component for Code Completion challenges
 */

import React from 'react';
import styles from '../styles/CodeCompletion.module.scss';
import { useChallengeTheme } from '../hooks/useChallengeTheme';

const ChoicesBar = ({ choices = [], onDragStart, disabled = false }) => {
  const { getThemeStyles, currentTheme } = useChallengeTheme();
  
  const themeStyles = getThemeStyles();
  
  const handleDragStart = (e, choice) => {
    if (disabled) return;
    
    if (onDragStart) {
      onDragStart(e, choice);
    } else {
      e.dataTransfer.setData('choice', choice);
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  return (
    <div className={`${styles.choicesBar} theme-${currentTheme || 'space'}`} style={themeStyles}>
      {choices.map((choice, index) => (
        <div
          key={index}
          className={`${styles.choiceItem} ${disabled ? styles.disabled : ''}`}
          draggable={!disabled}
          onDragStart={(e) => handleDragStart(e, choice)}
        >
          {choice}
        </div>
      ))}
    </div>
  );
};

export default ChoicesBar; 