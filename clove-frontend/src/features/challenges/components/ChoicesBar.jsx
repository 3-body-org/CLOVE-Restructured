/**
 * @file ChoicesBar.jsx
 * @description Choices bar component for Code Completion challenges
 */

import React from 'react';
import styles from '../styles/CodeCompletion.module.scss';
import { useChallengeTheme } from '../hooks/useChallengeTheme';

const ChoicesBar = ({ choices = [], onDragStart, disabled = false }) => {
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
  
  const handleDragStart = (e, choice) => {
    if (disabled) return;
    
    if (onDragStart) {
      onDragStart(e, choice);
    } else {
      // Default drag behavior
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