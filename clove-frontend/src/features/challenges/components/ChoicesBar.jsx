import React from 'react';
import styles from '../styles/CodeCompletion.module.scss';

const ChoicesBar = ({
  availableChoices,
  currentDragItem,
  isDragging,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  return (
    <div 
      className={`${styles.choicesBar} ${isDragging ? styles.dragOver : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {availableChoices.map((choice, idx) => (
        <div
          key={idx}
          className={`${styles.choice} ${
            currentDragItem?.value === choice.value ? styles.dragging : ''
          }`}
          draggable
          onDragStart={(e) => onDragStart(e, choice)}
          onDragEnd={onDragEnd}
          onDragOver={(e) => e.preventDefault()}
        >
          {choice.value}
          <span className={styles.dragHandle}>⋮⋮</span>
        </div>
      ))}
    </div>
  );
};

export default ChoicesBar; 