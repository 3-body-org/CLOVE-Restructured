import React from 'react';
import styles from '../styles/CodeCompletion.module.scss';

const TerminalWindow = ({ consoleOutput }) => {
  return (
    <div className={styles.terminalWindow}>
      <div className={styles.terminalHeader}>
        <div className={styles.terminalButtons}>
          <span className={styles.closeBtn}></span>
          <span className={styles.minimizeBtn}></span>
          <span className={styles.expandBtn}></span>
        </div>
        <div className={styles.terminalTitle}>console</div>
      </div>
      <div className={styles.terminalContent}>
        <div className={styles.terminalLine}>
          <span className={styles.prompt}>{'>'}</span>
          <span>{consoleOutput}</span>
        </div>
        <div className={`${styles.terminalLine} ${styles.comment}`}>
          {'// Type your code above and click "VALIDATE SOLUTION" to see the output here'}
        </div>
      </div>
    </div>
  );
};

export default TerminalWindow; 