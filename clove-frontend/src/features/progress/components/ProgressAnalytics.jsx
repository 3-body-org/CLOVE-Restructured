import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faBrain,
  faChartPie,
  faThumbsUp,
  faThumbsDown,
} from "@fortawesome/free-solid-svg-icons";
import styles from "features/progress/styles/ProgressPage.module.scss";

const ProgressMetric = ({ icon, title, progress, description }) => (
  <div className={styles.metricCard}>
    <div className={styles.metricTitle}>
      <FontAwesomeIcon icon={icon} />
      {title}
    </div>
    <div className={styles.progressBarContainer}>
      <div
        className={styles.progressBar}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
    <small>{description}</small>
  </div>
);

const StrengthsWeaknesses = ({ type, items }) => (
  <div className={`${styles.swCard} ${styles[`${type}Card`]}`}>
    <h5 className={styles.swTitle}>
      <FontAwesomeIcon icon={type === "strength" ? faThumbsUp : faThumbsDown} />
      {type === "strength" ? "Strengths" : "Weaknesses"}
    </h5>
    <div className={styles.swList}>
      {items.map((item, index) => (
        <div key={index} className={styles.swItem}>
          {item}
        </div>
      ))}
    </div>
  </div>
);

const ProgressAnalytics = ({ progress, knowledge, strengths, weaknesses }) => (
  <div className={styles.progressDetails}>
    <div className={styles.progressMetrics}>
      <ProgressMetric
        icon={faChartLine}
        title="Progress Completion"
        progress={progress}
        description={`${progress}% completed`}
      />
      <ProgressMetric
        icon={faBrain}
        title="Highest Knowledge Level"
        progress={knowledge}
        description={`${knowledge}% knowledge score`}
      />
    </div>

    <div className={styles.performanceAnalytics}>
      <div className={styles.metricCard}>
        <h4 className={styles.metricTitle}>
          <FontAwesomeIcon icon={faChartPie} />
          Performance Analysis
        </h4>
        <div className={styles.strengthsWeaknesses}>
          <StrengthsWeaknesses type="strength" items={strengths} />
          <StrengthsWeaknesses type="weakness" items={weaknesses} />
        </div>
      </div>
    </div>
  </div>
);

export default ProgressAnalytics;
