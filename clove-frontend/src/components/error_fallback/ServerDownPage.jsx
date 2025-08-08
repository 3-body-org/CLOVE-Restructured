import React, { useCallback } from "react";
import styles from "./styles/ErrorBoundary.module.scss";
import { useServerStatus } from "contexts/ServerStatusContext";

const ServerDownPage = () => {
  const { checkServerHealth, isChecking, lastError, retryCount } = useServerStatus();

  const handleTryAgain = useCallback(() => {
    if (!isChecking) {
      checkServerHealth();
    }
  }, [checkServerHealth, isChecking]);

  const getErrorMessage = () => {
    if (!lastError) {
      return "We're having trouble connecting to the server. Please try again later.";
    }

    switch (lastError.type) {
      case 'OFFLINE_ERROR':
        return "You appear to be offline. Please check your internet connection and try again.";
      case 'TIMEOUT_ERROR':
        return "The server is taking too long to respond. Please try again.";
      case 'SERVER_ERROR':
        return "The server is experiencing issues. Our team has been notified.";
      case 'NETWORK_ERROR':
      default:
        return "We're having trouble connecting to the server. Please try again later.";
    }
  };

  const getErrorIcon = () => {
    if (!lastError) return "🌐";
    
    switch (lastError.type) {
      case 'OFFLINE_ERROR':
        return "📡";
      case 'TIMEOUT_ERROR':
        return "⏰";
      case 'SERVER_ERROR':
        return "🔧";
      default:
        return "🌐";
    }
  };

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorIcon}>
        {getErrorIcon()}
      </div>
      
      <h2>Server is unavailable</h2>
      <p>{getErrorMessage()}</p>
      
      {lastError && (
        <div className={styles.errorDetails}>
          <p className={styles.errorType}>
            Error: {lastError.type.replace('_', ' ').toLowerCase()}
          </p>
          {lastError.timestamp && (
            <p className={styles.timestamp}>
              Last checked: {new Date(lastError.timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>
      )}
      
      <div className={styles.buttonGroup}>
        <button
          className={styles.tryAgainButton}
          onClick={handleTryAgain}
          disabled={isChecking}
        >
          {isChecking ? "Checking..." : "Try Again"}
        </button>
        
        {lastError?.type === 'OFFLINE_ERROR' && (
          <button
            className={styles.reloadButton}
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        )}
      </div>
      
      {lastError?.type === 'OFFLINE_ERROR' && (
        <div className={styles.offlineTips}>
          <h4>Offline? Try these steps:</h4>
          <ul>
            <li>Check your Wi-Fi or mobile data connection</li>
            <li>Try refreshing the page</li>
            <li>Check if other websites are working</li>
            <li>Contact your internet service provider if the problem persists</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ServerDownPage; 