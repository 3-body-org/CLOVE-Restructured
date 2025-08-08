/**
 * @file ChoicesBar.jsx
 * @description Choices bar component for Code Completion challenges
 */

import React from 'react';
import styles from '../styles/CodeCompletion.module.scss';

const ChoicesBar = ({ choices = [], onDragStart, disabled = false }) => {
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
    <div className={styles.choicesBar}>
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