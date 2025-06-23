import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faThumbsUp,
  faExclamationCircle,
  faBrain,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import styles from "features/progress/styles/ProgressPage.module.scss";

const ProgressMetric = ({
  icon,
  title,
  progress,
  description,
  className = "",
}) => (
  <div className={`${styles.metricCard} ${className}`}>
    <div className={styles.metricTitle}>
      <FontAwesomeIcon icon={icon} className={styles.metricIcon} />
      <span>{title}</span>
    </div>
    <div className={styles.progressBarContainer}>
      <div
        className={styles.progressBar}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
    <div className={styles.progressInfo}>
      <span className={styles.progressPercent}>{progress}%</span>
      <span className={styles.progressLabel}>{description}</span>
    </div>
  </div>
);

const StrengthsWeaknesses = ({ type, items }) => (
  <div className={`${styles.swCard} ${styles[`${type}Card`]}`}>
    <div className={styles.swHeader}>
      <FontAwesomeIcon
        icon={type === "strength" ? faThumbsUp : faExclamationCircle}
        className={styles.swIcon}
      />
      <h5 className={styles.swTitle}>
        {type === "strength" ? "Strengths" : "Weaknesses"}
      </h5>
    </div>
    <div className={styles.swList}>
      {items && items.length > 0 ? (
        items.map((item, index) => (
          <div key={index} className={styles.swItem}>
            {item}
          </div>
        ))
      ) : (
        <div className={styles.swItem}>No {type} identified yet</div>
      )}
    </div>
  </div>
);

const ProgressAnalytics = ({
  progress = 0,
  knowledge = 0,
  strengths = [],
  weaknesses = [],
}) => {
  const getStatusColor = (percentage) => {
    if (percentage >= 75) return styles.statusAdvanced;
    if (percentage >= 50) return styles.statusIntermediate;
    return styles.statusBeginner;
  };

  return (
    <div className={styles.progressDetails}>
      <div className={styles.progressMetrics}>
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <h4 className={styles.sectionTitle}>Progress Overview</h4>
            <span
              className={`${styles.statusBadge} ${getStatusColor(progress)}`}
            >
              {progress >= 75
                ? "Advanced"
                : progress >= 50
                ? "Intermediate"
                : "Beginner"}
            </span>
          </div>

          <div className={styles.progressBars}>
            <div className={styles.progressGroup}>
              <div className={styles.progressLabel}>
                <h4 className={styles.sectionTitle}>
                  <FontAwesomeIcon
                    icon={faChartLine}
                    className={styles.sectionIcon}
                  />
                  Completion
                </h4>
                <span>{progress}%</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className={styles.progressGroup}>
              <div className={styles.progressLabel}>
                <h4 className={styles.sectionTitle}>
                  <FontAwesomeIcon
                    icon={faBrain}
                    className={styles.sectionIcon}
                  />
                  Knowledge
                </h4>
                <span>{knowledge}%</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${knowledge}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.performanceAnalytics}>
        <h4 className={styles.sectionTitle}>
          <FontAwesomeIcon icon={faChartPie} className={styles.sectionIcon} />
          Performance Analysis
        </h4>
        <div className={styles.strengthsWeaknesses}>
          <StrengthsWeaknesses type="strength" items={strengths} />
          <StrengthsWeaknesses type="weakness" items={weaknesses} />
        </div>
      </div>
    </div>
  );
};

export default ProgressAnalytics;
