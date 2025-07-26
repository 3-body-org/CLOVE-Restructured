/**
 * @file TopicCard.jsx
 * @description Renders a topic card with progress, lock state, and theme-aware styles.
 */

import React from "react";
import PropTypes from "prop-types";
import { Col } from "react-bootstrap";
import styles from "features/mydeck/styles/TopicCard.module.scss";

/**
 * TopicCard
 * Renders a topic card with progress, lock state, and theme-aware styles.
 * @param {Object} props
 * @param {Object} props.topic - Topic data (must include .name, .description, .progress, .is_unlocked).
 * @param {Function} props.onClick - Click handler for the card.
 * @param {Object} [props.themeStyles] - Optional theme style classes.
 * @param {boolean} [props.comingSoon] - If true, renders a "Coming Soon" card.
 */
const TopicCard = React.memo(({ topic, onClick, themeStyles = {}, comingSoon = false }) => {
  if (comingSoon) {
    return (
      <Col
        xs={12}
        sm={6}
        md={4}
        lg={3}
        className={`${themeStyles.floatCard || ""} ${themeStyles.lockedCard || ""}`}
      >
        <div className={themeStyles.lockedEffect || ""}></div>
        <div className={styles.cardContent}>
          <h2 className={styles.cardTitle}>Coming Soon</h2>
          <p className={styles.cardDesc}>New lesson cards will be available soon. Stay tuned!</p>
          <button className={styles.lockedButton} disabled>Coming Soon</button>
        </div>
      </Col>
    );
  }

  const isLocked = !topic.is_unlocked;
  const progress = typeof topic.progress === 'number' ? topic.progress : 0;
  
  // Convert decimal progress (0.0-1.0) to percentage (0-100)
  const progressPercentage = Math.round(progress * 100);

  let buttonLabel = "Start Learning";
  if (isLocked) buttonLabel = "Locked";
  else if (progressPercentage === 100) buttonLabel = "Review Topic";
  else if (progressPercentage > 0) buttonLabel = "Continue Learning";

  return (
    <Col
      xs={12}
      sm={6}
      md={4}
      lg={3}
      className={`${themeStyles.floatCard || ""} ${isLocked ? themeStyles.lockedCard || "" : ""}`}
    >
      <div
        className={`${themeStyles.holographicEffect || ""} ${isLocked ? themeStyles.lockedEffect || "" : ""}`}
      ></div>
      <div className={styles.cardContent}>
        <h2 className={styles.cardTitle}>{topic.name}</h2>
        <p className={styles.cardDesc}>{topic.description}</p>
        <div className={styles.cardProgress}>
          <div
            className={styles.progressFill}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <button
          className={`${styles.startButton} ${isLocked ? styles.lockedButton : ""}`}
          disabled={isLocked}
          onClick={() => onClick(topic)}
        >
          {buttonLabel}
        </button>
      </div>
      {isLocked && <div className={styles.lockedIcon}>🔒</div>}
    </Col>
  );
});

TopicCard.propTypes = {
  topic: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    progress: PropTypes.number,
    is_unlocked: PropTypes.bool.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  themeStyles: PropTypes.object,
  comingSoon: PropTypes.bool,
};

export default TopicCard;
