import React from "react";
import { Col } from "react-bootstrap";
import styles from "features/mydeck/styles/TopicCard.module.scss";

const TopicCard = React.memo(({ topic, onClick, themeStyles }) => (
  <Col
    xs={12}
    sm={6}
    md={4}
    lg={3}
    className={`${themeStyles?.floatCard || ""} ${
      topic.locked ? themeStyles?.lockedCard || "" : ""
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
        topic.locked ? themeStyles?.lockedEffect || "" : ""
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
          topic.locked ? styles.lockedButton : ""
        }`}
        disabled={topic.locked}
        onClick={() => onClick(topic)}
      >
        {topic.locked ? "Coming Soon" : "Continue Learning"}
      </button>
    </div>
    {topic.locked && <div className={styles.lockedIcon}>🔒</div>}
  </Col>
));

export default TopicCard;
