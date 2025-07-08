import React from "react";
import { Col } from "react-bootstrap";
import styles from "features/mydeck/styles/TopicCard.module.scss";

const TopicCard = React.memo(({ topic, onClick, themeStyles, comingSoon = false }) => {
  if (comingSoon) {
    return (
      <Col
        xs={12}
        sm={6}
        md={4}
        lg={3}
        className={`${themeStyles?.floatCard || ""} ${themeStyles?.lockedCard || ""}`}
        style={{
          "--primary-color": "var(--primary-color)",
          "--secondary-color": "var(--secondary-color)",
          "--card-bg": "var(--card-bg)",
          "--card-hover": "var(--card-hover)",
          "--progress-bg": "var(--progress-bg)",
          "--progress-fill": "var(--progress-fill)",
          "--holographic-effect": "var(--holographic-effect)",
        }}
      >
        <div className={themeStyles?.lockedEffect || ""}></div>
        <div className={styles.cardContent}>
          <h2 className={styles.cardTitle}>Coming Soon</h2>
          <p className={styles.cardDesc}>New lesson cards will be available soon. Stay tuned!</p>
          <button className={styles.lockedButton} disabled>Coming Soon</button>
        </div>
      </Col>
    );
  }

  return (
    <Col
      xs={12}
      sm={6}
      md={4}
      lg={3}
      className={`${themeStyles?.floatCard || ""} ${
        !topic.is_unlocked ? themeStyles?.lockedCard || "" : ""
      }`}
      style={{
        "--primary-color": "var(--primary-color)",
        "--secondary-color": "var(--secondary-color)",
        "--card-bg": "var(--card-bg)",
        "--card-hover": "var(--card-hover)",
        "--progress-bg": "var(--progress-bg)",
        "--progress-fill": "var(--progress-fill)",
        "--holographic-effect": "var(--holographic-effect)",
      }}
    >
      <div
        className={`${themeStyles?.holographicEffect || ""} ${
          !topic.is_unlocked ? themeStyles?.lockedEffect || "" : ""
        }`}
      ></div>
      <div className={styles.cardContent}>
        <h2 className={styles.cardTitle}>{topic.name}</h2>
        <p className={styles.cardDesc}>{topic.description}</p>

        {/* Progress Bar Section */}
        <div className={styles.cardProgress}>
          <div
            className={styles.progressFill}
            style={{ width: `${topic.progress}%` }}
          ></div>
        </div>

        <button
          className={`${styles.startButton} ${
            !topic.is_unlocked ? styles.lockedButton : ""
          }`}
          disabled={!topic.is_unlocked}
          onClick={() => onClick(topic)}
        >
          {!topic.is_unlocked 
            ? "Locked" 
            : topic.progress === 0 
              ? "Start Learning" 
              : topic.progress === 100 
                ? "Review Topic" 
                : "Continue Learning"
          }
        </button>
      </div>
      {!topic.is_unlocked && <div className={styles.lockedIcon}>🔒</div>}
    </Col>
  );
});

export default TopicCard;
