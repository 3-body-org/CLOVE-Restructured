import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faThumbsUp,
  faExclamationCircle,
  faBrain,
  faChartLine,
  faChevronUp,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import styles from "features/progress/styles/ProgressPage.module.scss";

// --- Moved from ProgressPage.jsx ---

// Category label based on accuracy
export const getCategory = (accuracy) => {
  if (accuracy >= 90) return "Excellent";
  if (accuracy >= 75) return "Good";
  if (accuracy >= 50) return "Fair";
  if (accuracy > 0) return "Needs Improvement";
  return "Needs Improvement";
};

// Color class for accuracy
export const getAccuracyClass = (accuracy) => {
  if (accuracy >= 75) return styles.accuracyHigh;
  if (accuracy >= 40) return styles.accuracyMedium;
  return styles.accuracyLow;
};

// Export getMasteryLevel for use in other components
export const getMasteryLevel = (knowledge) => {
  if (knowledge > 0.66) return "Advanced";
  if (knowledge > 0.33) return "Intermediate";
  return "Beginner";
};

// Helper to get strengths/weaknesses for a topic
export const getStrengthsWeaknesses = (subtopics = []) => {
  const isDefault = (k) => k === 0.1;
  const strengths = subtopics.filter(
    (st) => st.knowledge_level >= 0.75 && !isDefault(st.knowledge_level)
  );
  const weaknesses = subtopics.filter(
    (st) => st.knowledge_level <= 0.4 && !isDefault(st.knowledge_level)
  );
  strengths.sort((a, b) => b.knowledge_level - a.knowledge_level);
  weaknesses.sort((a, b) => a.knowledge_level - b.knowledge_level);
  return { strengths, weaknesses };
};

// Card for each learning mode
export const ModeCard = ({ icon, name, category, stats = [] }) => (
  <div className={styles.modeCard}>
    <div className={styles.modeHeader}>
      <div className={styles.modeIcon}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className={styles.modeInfo}>
        <div className={styles.modeName}>{name}</div>
        <div className={styles.modeCategory}>{category}</div>
      </div>
    </div>
    <div className={styles.modeStats}>
      {stats.map((stat, index) => (
        <div key={index} className={styles.statItem}>
          <span className={`${styles.statValue} ${stat.className || ""}`}>
            {stat.value}
          </span>
          <span className={styles.statLabel}>{stat.label}</span>
        </div>
      ))}
    </div>
  </div>
);

// Card for each subtopic
export const SubtopicCard = ({
  name = "Untitled Subtopic",
  masteryLevel = "Beginner",
  progress = 0,
  knowledge = 0,
}) => {
  const [expanded, setExpanded] = React.useState(false);
  return (
    <div
      className={`${styles.subtopicCard} ${expanded ? styles.expanded : ""}`}
    >
      <div
        className={styles.subtopicHeader}
        onClick={() => setExpanded((prev) => !prev)}
        tabIndex={0}
        role="button"
        aria-expanded={expanded}
        aria-label={`Toggle details for ${name}`}
      >
        <h3 className={styles.subtopicName}>{name}</h3>
        <div className={styles.headerRight}>
          {!expanded && (
            <span
              className={`${styles.masteryLevel} ${
                styles[`status${masteryLevel}`]
              }`}
            >
              {masteryLevel}
            </span>
          )}
          <FontAwesomeIcon
            icon={expanded ? faChevronUp : faChevronDown}
            className={styles.chevronIcon}
          />
        </div>
      </div>
      {expanded && (
        <div className={styles.subtopicContent}>
          <ProgressAnalytics progress={progress} knowledge={knowledge} />
        </div>
      )}
    </div>
  );
};

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

// ProgressAnalytics: Shows progress and knowledge bars for a subtopic
const ProgressAnalytics = ({
  progress = 0,
  knowledge = 0,
  hideHeader = false,
}) => {
  // Color badge based on knowledge percent
  const getStatusColor = (level) => {
    if (level === "Advanced") return styles.statusAdvanced;
    if (level === "Intermediate") return styles.statusIntermediate;
    return styles.statusBeginner;
  };

  return (
    <div className={styles.progressDetails}>
      <div className={styles.progressMetrics}>
        <div className={styles.progressSection}>
          {!hideHeader && (
            <div className={styles.progressHeader}>
              <h4 className={styles.sectionTitle}>Progress Overview</h4>
              <span
                className={`${styles.statusBadge} ${getStatusColor(getMasteryLevel(knowledge / 100))}`}
              >
                {getMasteryLevel(knowledge / 100)}
              </span>
            </div>
          )}

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

      {/* Performance Analysis removed, now handled at topic level */}
    </div>
  );
};

export { ProgressAnalytics };
