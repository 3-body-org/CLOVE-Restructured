import React from 'react';
import styles from './OtherSessionWarningModal.module.scss';
import { useChallengeTheme } from '../hooks/useChallengeTheme';

const OtherSessionWarningModal = ({ 
  isVisible, 
  otherSessions, 
  onCloseOtherTabs, 
  onCancel,
  isLoading = false 
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
  
  if (!isVisible) return null;

  const handleCloseOtherTabs = async () => {
    await onCloseOtherTabs();
  };

  return (
    <div className={`${styles.modalOverlay} theme-${currentTheme || 'space'}`} style={themeStyles}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>⚠️ Active Challenge Detected</h2>
        </div>
        
        <div className={styles.modalBody}>
          <p>
            You are currently answering challenges in another subtopic. 
            You must finish or close that tab first before starting a new challenge.
          </p>
          
          {otherSessions.length > 0 && (
            <div className={styles.sessionInfo}>
              <h3>Active Sessions:</h3>
              <ul>
                {otherSessions.map((session, index) => (
                  <li key={index}>
                    <strong>Subtopic:</strong> {session.subtopic_name || `Subtopic ${session.subtopic_id}`}
                    <br />
                    <small>Started: {new Date(session.started_at).toLocaleString()}</small>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className={styles.warning}>
            <p>
              <strong>To proceed:</strong>
            </p>
            <ol>
              <li>Go back to the other tab and complete or cancel that challenge</li>
              <li>Or click "Close Other Tabs" to force close all active sessions</li>
            </ol>
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <button 
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className={styles.closeTabsButton}
            onClick={handleCloseOtherTabs}
            disabled={isLoading}
          >
            {isLoading ? 'Closing...' : 'Close Other Tabs'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtherSessionWarningModal; 