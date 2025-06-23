import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faQuestionCircle,
  faLayerGroup,
  faTrophy,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import styles from "features/progress/styles/ProgressPage.module.scss";
import TitleAndProfile from "components/layout/Navbar/TitleAndProfile";
import ProgressAnalytics from "features/progress/components/ProgressAnalytics";

const ModeCard = ({ icon, name, category, stats = [] }) => (
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

const SubtopicCard = ({
  name,
  masteryLevel,
  progress = 0,
  knowledge = 0,
  strengths = [],
  weaknesses = [],
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`${styles.subtopicCard} ${expanded ? styles.expanded : ""}`}
    >
      <div
        className={styles.subtopicHeader}
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className={styles.subtopicName}>{name}</h3>
        <div className={styles.headerRight}>
          <span
            className={`${styles.masteryLevel} ${
              styles[`status${masteryLevel}`]
            }`}
          >
            {masteryLevel}
          </span>
          <FontAwesomeIcon
            icon={expanded ? faChevronUp : faChevronDown}
            className={styles.chevronIcon}
          />
        </div>
      </div>
      {expanded && (
        <div className={styles.subtopicContent}>
          <ProgressAnalytics
            progress={progress}
            knowledge={knowledge}
            strengths={strengths}
            weaknesses={weaknesses}
          />
        </div>
      )}
    </div>
  );
};

const ProgressPage = () => {
  const [expandedTopics, setExpandedTopics] = useState({});

  // Sample topics data - this would typically come from props or an API
  const topics = [
    {
      id: 1,
      title: "Data Types and Variables",
      subtopics: [
        {
          id: 1,
          name: "Declaring Variables",
          progress: 0,
          knowledge: 0,
          strengths: [],
          weaknesses: [],
        },
        {
          id: 2,
          name: "Primitive Data Types",
          progress: 0,
          knowledge: 0,
          strengths: [],
          weaknesses: [],
        },
        {
          id: 3,
          name: "Non-primitive Data Types",
          progress: 0,
          knowledge: 0,
          strengths: [],
          weaknesses: [],
        },
      ],
    },
    {
      id: 2,
      title: "Operators",
      subtopics: [
        {
          id: 4,
          name: "Arithmetic",
          progress: 0,
          knowledge: 0,
          strengths: [],
          weaknesses: [],
        },
        {
          id: 5,
          name: "Comparison",
          progress: 0,
          knowledge: 0,
          strengths: [],
          weaknesses: [],
        },
        {
          id: 6,
          name: "Logical",
          progress: 0,
          knowledge: 0,
          strengths: [],
          weaknesses: [],
        },
      ],
    },
    {
      id: 3,
      title: "Conditional and Loops",
      subtopics: [
        {
          id: 7,
          name: "If-Else",
          progress: 0,
          knowledge: 0,
          strengths: [],
          weaknesses: [],
        },
        {
          id: 8,
          name: "While and Do While Loop",
          progress: 0,
          knowledge: 0,
          strengths: [],
          weaknesses: [],
        },
        {
          id: 9,
          name: "For Loop",
          progress: 0,
          knowledge: 0,
          strengths: [],
          weaknesses: [],
        },
      ],
    },
  ];

  const toggleTopic = (topicId) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

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

  return (
    <main className={styles.progressContent}>
      <TitleAndProfile
        nonColored={"Learning"}
        colored={"Progress"}
        description={"Detailed analysis of your learning performance "}
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

      <section className={styles.topicSection}>
        {topics.map((topic) => {
          const isExpanded = expandedTopics[topic.id] || false;
          // Calculate average progress from subtopics
          const overallProgress =
            topic.subtopics.length > 0
              ? Math.round(
                  topic.subtopics.reduce(
                    (sum, subtopic) => sum + subtopic.progress,
                    0
                  ) / topic.subtopics.length
                )
              : 0;

          return (
            <div key={topic.id} className={styles.topicCard}>
              <div
                className={styles.topicHeader}
                onClick={() => toggleTopic(topic.id)}
              >
                <div className={styles.topicHeaderContent}>
                  <h2 className={styles.topicTitle}>
                    <span>{topic.title}</span>
                  </h2>
                  <div className={styles.topicStats}>
                    <div className={styles.progressWrapper}>
                      <div
                        className={styles.progressCircle}
                        style={{ "--progress": overallProgress }}
                      >
                        <div className={styles.progressText}>
                          {overallProgress}%
                        </div>
                      </div>
                      <span className={styles.progressLabel}>
                        Overall Progress
                      </span>
                    </div>
                    <FontAwesomeIcon
                      icon={isExpanded ? faChevronUp : faChevronDown}
                      className={styles.topicChevron}
                    />
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className={styles.subtopicsContainer}>
                  {topic.subtopics.map((subtopic) => (
                    <SubtopicCard
                      key={subtopic.id}
                      name={subtopic.name}
                      {...subtopic}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>
    </main>
  );
};

export default ProgressPage;
