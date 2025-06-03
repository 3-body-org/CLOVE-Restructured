import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faQuestionCircle,
  faLayerGroup,
  faTrophy,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import styles from "features/progress/styles/ProgressPage.module.scss";
import TitleAndProfile from "components/layout/Navbar/TitleAndProfile";
import ProgressAnalytics from "features/progress/components/ProgressAnalytics";

const ModeCard = ({ icon, name, category, stats }) => (
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

const SubtopicCard = ({ name, masteryLevel, ...analyticsProps }) => (
  <div className={styles.subtopicCard}>
    <div className={styles.subtopicHeader}>
      <h3 className={styles.subtopicName}>{name}</h3>
      <span
        className={`${styles.masteryLevel} ${styles[`mastery${masteryLevel}`]}`}
      >
        <FontAwesomeIcon icon={faStar} />
        {masteryLevel}
      </span>
    </div>
    <ProgressAnalytics {...analyticsProps} />
  </div>
);

const ProgressPage = () => {
  const learningModes = [
    {
      icon: faCheckCircle,
      name: "Code Completion Mode",
      category: "Needs Improvement",
      stats: [
        { value: "0%", label: "Accuracy Rate", className: styles.accuracyLow },
        { value: "0", label: "Attempts" },
        { value: "0h", label: "Time Spent" },
        { value: "0%", label: "Completion Rate" },
      ],
    },
    {
      icon: faQuestionCircle,
      name: "Code Fixer Mode",
      category: "Needs Improvement",
      stats: [
        { value: "0%", label: "Accuracy Rate", className: styles.accuracyLow },
        { value: "0", label: "Attempts" },
        { value: "0h", label: "Time Spent" },
        { value: "0%", label: "Completion Rate" },
      ],
    },
    {
      icon: faLayerGroup,
      name: "Output Tracing Mode",
      category: "Needs Improvement",
      stats: [
        { value: "0%", label: "Accuracy Rate", className: styles.accuracyLow },
        { value: "0", label: "Attempts" },
        { value: "0h", label: "Time Spent" },
        { value: "0%", label: "Completion Rate" },
      ],
    },
  ];

  const subtopics = [
    {
      name: "Subtopic 1: Declaring Variables",
      masteryLevel: "Beginner",
      progress: 0,
      knowledge: 0,
      strengths: [],
      weaknesses: [],
    },
    {
      name: "Subtopic 2: Primitive Data Types",
      masteryLevel: "Beginner",
      progress: 0,
      knowledge: 0,
      strengths: [],
      weaknesses: [],
    },
    {
      name: "Subtopic 3: Non-Primitive Data Types",
      masteryLevel: "Beginner",
      progress: 0,
      knowledge: 0,
      strengths: [],
      weaknesses: [],
    },
  ];

  return (
    <main className={styles.progressContent}>
      <TitleAndProfile
        nonColored={"Learning"}
        colored={"Progress"}
        description={"Detailed analysis of your learning performance 📊"}
      />

      <section className={styles.learningModesSection}>
        <div className={styles.performanceCard}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faTrophy} />
            Learning Mode Performance
          </h2>
          <div className={styles.modePerformanceGrid}>
            {learningModes.map((mode, index) => (
              <ModeCard key={index} {...mode} />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.topicProgress}>
        <div className={styles.topicCard}>
          <div className={styles.topicHeader}>
            <h2 className={styles.topicTitle}>
              Topic 1 : Variables and Data Types
            </h2>
            <div className={styles.overallProgress}>
              <div className={styles.progressCircle}>
                <span className={styles.progressPercent}>0%</span>
              </div>
              <span>Overall Progress</span>
            </div>
          </div>

          {subtopics.map((subtopic, index) => (
            <SubtopicCard key={index} {...subtopic} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default ProgressPage;
