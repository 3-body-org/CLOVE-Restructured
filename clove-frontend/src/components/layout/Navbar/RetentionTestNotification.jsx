/**
 * @file RetentionTestNotification.jsx
 * @description Notification icon with badge and dropdown for retention tests
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRetentionTestNotifications } from '../../../hooks/useRetentionTestNotifications';
import RetentionTestPopup from '../../assessments/RetentionTestPopup';
import styles from './RetentionTestNotification.module.scss';

const RetentionTestNotification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, loading, count } = useRetentionTestNotifications();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification) => {
    setSelectedTopic({ id: notification.topicId, name: notification.topicName });
    setShowPopup(true);
    setIsOpen(false);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedTopic(null);
  };

  return (
    <>
      <div className={styles.notificationContainer} ref={dropdownRef}>
        <button
          className={styles.notificationButton}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Retention test notifications"
          aria-expanded={isOpen}
        >
          <svg
            className={styles.notificationIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          {count > 0 && (
            <span className={styles.badge}>{count > 99 ? '99+' : count}</span>
          )}
        </button>

        {isOpen && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownHeader}>
              <h3>Retention Tests</h3>
              <button
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className={styles.dropdownContent}>
              {loading ? (
                <div className={styles.loading}>
                  <div className={styles.spinner}></div>
                  <span>Loading notifications...</span>
                </div>
              ) : count === 0 ? (
                <div className={styles.noNotifications}>
                  <svg
                    className={styles.emptyIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <p>No retention tests available</p>
                  <span className={styles.emptyMessage}>
                    Complete topics to unlock retention tests
                  </span>
                </div>
              ) : (
                <div className={styles.notificationsList}>
                  {notifications.map((notification) => (
                    <div
                      key={notification.topicId}
                      className={styles.notificationItem}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className={styles.notificationContent}>
                        <div className={styles.topicName}>{notification.topicName}</div>
                        <div className={styles.stages}>
                          {notification.firstStageAvailable && (
                            <span className={styles.stageBadge}>Stage 1</span>
                          )}
                          {notification.secondStageAvailable && (
                            <span className={styles.stageBadge}>Stage 2</span>
                          )}
                        </div>
                      </div>
                      <svg
                        className={styles.arrowIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 18l6-6-6-6"></path>
                      </svg>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showPopup && selectedTopic && (
        <RetentionTestPopup
          topicId={selectedTopic.id}
          isOpen={showPopup}
          onClose={handleClosePopup}
          showResults={false}
        />
      )}
    </>
  );
};

export default RetentionTestNotification;

