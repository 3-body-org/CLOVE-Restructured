/**
 * @file ChoicesBar.jsx
 * @description Choices bar component for Code Completion challenges
 */

import React from 'react';
import '../../../styles/components/challenge.scss';

const ChoicesBar = ({ choices = [], onDragStart, disabled = false }) => {
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
    <div className="choicesBar">
      {choices.map((choice, index) => (
        <div
          key={index}
          className={`choiceItem ${disabled ? 'disabled' : ''}`}
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