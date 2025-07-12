import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faQuestionCircle,
  faLayerGroup,
  faTrophy,
  faChevronDown,
  faChevronUp,
  faChartPie,
} from "@fortawesome/free-solid-svg-icons";
import styles from "features/progress/styles/ProgressPage.module.scss";
import TitleAndProfile from "components/layout/Navbar/TitleAndProfile";
import ProgressAnalytics from "features/progress/components/ProgressAnalytics";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "contexts/AuthContext";
import LoadingScreen from "components/layout/StatusScreen/LoadingScreen";
import ErrorScreen from "components/layout/StatusScreen/ErrorScreen";

// Config for learning modes
const MODE_CONFIG = [
  {
    key: "code_completion",
    icon: faCheckCircle,
    name: "Code Completion Mode",
  },
  {
    key: "code_fixer",
    icon: faQuestionCircle,
    name: "Code Fixer Mode",
  },
  {
    key: "output_tracing",
    icon: faLayerGroup,
    name: "Output Tracing Mode",
  },
];

// Category label based on accuracy
const getCategory = (accuracy) => {
  if (accuracy >= 90) return "Excellent";
  if (accuracy >= 75) return "Good";
  if (accuracy >= 50) return "Fair";
  if (accuracy > 0) return "Needs Improvement";
  return "Needs Improvement";
};

// Color class for accuracy
const getAccuracyClass = (accuracy) => {
  if (accuracy >= 75) return styles.accuracyHigh;
  if (accuracy >= 50) return styles.accuracyMedium;
  return styles.accuracyLow;
};

// Card for each learning mode
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

// Card for each subtopic
const SubtopicCard = ({
  name = "Untitled Subtopic",
  masteryLevel = "Beginner",
  progress = 0,
  knowledge = 0,
}) => {
  const [expanded, setExpanded] = useState(false);
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

const getMasteryLevel = (knowledge) => {
  if (knowledge > 0.66) return "Advanced";
  if (knowledge > 0.33) return "Intermediate";
  return "Beginner";
};

const ProgressPage = () => {
  const [expandedTopics, setExpandedTopics] = useState({});
  const [expandedStrengths, setExpandedStrengths] = useState({});
  const [loading, setLoading] = useState(true);
  const [statData, setStatData] = useState(null);
  const [topicProgress, setTopicProgress] = useState([]);
  const [error, setError] = useState("");
  const { get } = useApi();
  const { user } = useAuth();

  // Fetch stats and topic progress on mount/user change
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    if (!user) {
      setLoading(false);
      return;
    }
    Promise.all([
      get("/statistics/me"),
      get(`/user_topics/user/${user.id}`),
    ])
      .then(async ([statsRes, topicsRes]) => {
        if (!mounted) return;
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStatData(data);
        } else {
          setError("Failed to load statistics.");
        }
        if (topicsRes.ok) {
          const topics = await topicsRes.json();
          setTopicProgress(topics);
          // Open all performance analysis sections by default
          const initial = {};
          topics.forEach((topic) => {
            initial[topic.topic_id] = true;
          });
          setExpandedStrengths(initial);
        } else {
          setTopicProgress([]);
          setError("Failed to load topic progress.");
        }
        setLoading(false);
      })
      .catch(() => {
        if (mounted) {
          setError("Failed to load progress data.");
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [user]);

  // Toggle topic accordion
  const toggleTopic = (topicId) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  // Memoized learning mode cards
  const learningModes = useMemo(
    () =>
      MODE_CONFIG.map((mode) => {
        const accuracy = statData?.accuracy?.[mode.key] ?? 0;
        const attempts = statData?.mode_stats?.[mode.key]?.attempts ?? 0;
        const timeSpent = statData?.hours_spent?.[mode.key] ?? 0;
        const completionRate = statData?.completion_rate?.[mode.key] ?? 0;
        return {
          icon: mode.icon,
          name: mode.name,
          category: getCategory(accuracy),
          stats: [
            {
              value: `${accuracy}%`,
              label: "Accuracy Rate",
              className: getAccuracyClass(accuracy),
            },
            { value: attempts, label: "Attempts" },
            { value: `${timeSpent}h`, label: "Time Spent" },
            { value: `${completionRate}%`, label: "Completion Rate" },
          ],
        };
      }),
    [statData]
  );

  // Helper to get strengths/weaknesses for a topic
  const getStrengthsWeaknesses = (subtopics = []) => {
    const isDefault = (k) => k === 0 || k === 0.1;
    const strengths = subtopics.filter(
      (st) => st.knowledge_level >= 0.7 && !isDefault(st.knowledge_level)
    );
    const weaknesses = subtopics.filter(
      (st) => st.knowledge_level < 0.5 && !isDefault(st.knowledge_level)
    );
    strengths.sort((a, b) => b.knowledge_level - a.knowledge_level);
    weaknesses.sort((a, b) => a.knowledge_level - b.knowledge_level);
    return { strengths, weaknesses };
  };

  if (loading) return <LoadingScreen message="Loading progress..." />;
  if (error) return <ErrorScreen message={error} />;

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
            <FontAwesomeIcon icon={faTrophy} /> Learning Mode Performance
          </h2>
          <div className={styles.modePerformanceGrid}>
            {learningModes.map((mode, index) => <ModeCard key={index} {...mode} />)}
          </div>
        </div>
      </section>

      <section className={styles.topicSection}>
        {topicProgress.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>No topics found.</div>
        ) : (
          topicProgress.map((topic) => {
            const isExpanded = expandedTopics[topic.topic_id] || false;
            const strengthsExpanded = expandedStrengths[topic.topic_id] || false;
            // Use topic.progress_percent for donut
            const overallProgress = Math.round((topic.progress_percent || 0) * 100);
            // Get strengths/weaknesses for this topic
            const { strengths, weaknesses } = getStrengthsWeaknesses(topic.subtopics || []);

            return (
              <div key={topic.topic_id} className={styles.topicCard}>
                <div
                  className={styles.topicHeader}
                  onClick={() => toggleTopic(topic.topic_id)}
                  tabIndex={0}
                  role="button"
                  aria-expanded={isExpanded}
                  aria-label={`Toggle details for ${topic.topic?.title || topic.title}`}
                >
                  <div className={styles.topicHeaderContent}>
                    <h2 className={styles.topicTitle}>
                      <span>{topic.topic?.title || topic.title || "Untitled Topic"}</span>
                    </h2>
                    <div className={styles.topicStats}>
                      <div className={styles.progressWrapper}>
                        <div
                          className={styles.progressCircle}
                          style={{ "--progress": overallProgress }}
                        >
                          <div className={styles.progressText}>{overallProgress}%</div>
                        </div>
                        <span className={styles.progressLabel}>Overall Progress</span>
                      </div>
                      <FontAwesomeIcon
                        icon={isExpanded ? faChevronUp : faChevronDown}
                        className={styles.topicChevron}
                      />
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div>
                    {/* Performance Analysis Collapsible Section */}
                    <div
                      className={
                        styles.performanceAnalysisCard +
                        (!strengthsExpanded ? " " + styles.minimized : "")
                      }
                    >
                      <div
                        className={
                          styles.performanceHeader +
                          (!strengthsExpanded ? " " + styles.minimizedHeader : "")
                        }
                        onClick={() =>
                          setExpandedStrengths((prev) => ({
                            ...prev,
                            [topic.topic_id]: !strengthsExpanded,
                          }))
                        }
                        style={{
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: strengthsExpanded ? "0 1rem" : "0 1.5rem",
                        }}
                        tabIndex={0}
                        role="button"
                        aria-expanded={strengthsExpanded}
                        aria-label={`Toggle performance analysis for ${topic.topic?.title || topic.title}`}
                      >
                        <span className={styles.performanceTitle}>
                          <FontAwesomeIcon
                            icon={faChartPie}
                            className={styles.performanceIcon}
                          /> Performance Analysis
                        </span>
                        {!strengthsExpanded && (
                          <span
                            style={{ display: "flex", alignItems: "center", gap: "0.5em" }}
                          >
                            {strengths.length > 0 && (
                              <span
                                className={styles.swChip}
                                style={{ padding: "0.2em 0.8em", fontSize: "13px" }}
                              >
                                <span className={styles.dotGreen}></span> {strengths.length} strength
                                {strengths.length > 1 ? "s" : ""}
                              </span>
                            )}
                            {weaknesses.length > 0 && (
                              <span
                                className={styles.swChip}
                                style={{ padding: "0.2em 0.8em", fontSize: "13px" }}
                              >
                                <span className={styles.dotRed}></span> {weaknesses.length} weakness
                                {weaknesses.length > 1 ? "es" : ""}
                              </span>
                            )}
                          </span>
                        )}
                        <FontAwesomeIcon icon={strengthsExpanded ? faChevronUp : faChevronDown} />
                      </div>
                      {strengthsExpanded && (
                        <div className={styles.strengthsWeaknessesRow}>
                          <div className={styles.swCard + " " + styles.strengthCard}>
                            <div className={styles.swHeader}>
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                className={styles.swIcon}
                              />
                              <h5 className={styles.swTitle}>Strengths</h5>
                            </div>
                            <div className={styles.swList}>
                              {strengths.length > 0 ? (
                                strengths.map((st, idx) => (
                                  <span key={idx} className={styles.swChip}>
                                    <span className={styles.dotGreen}></span> {st.name}
                                  </span>
                                ))
                              ) : (
                                <div className={styles.swItem}>No strengths identified yet</div>
                              )}
                            </div>
                          </div>
                          <div className={styles.swCard + " " + styles.weaknessCard}>
                            <div className={styles.swHeader}>
                              <FontAwesomeIcon
                                icon={faQuestionCircle}
                                className={styles.swIcon}
                              />
                              <h5 className={styles.swTitle}>Weaknesses</h5>
                            </div>
                            <div className={styles.swList}>
                              {weaknesses.length > 0 ? (
                                weaknesses.map((st, idx) => (
                                  <span key={idx} className={styles.swChip}>
                                    <span className={styles.dotRed}></span> {st.name}
                                  </span>
                                ))
                              ) : (
                                <div className={styles.swItem}>No weaknesses identified yet</div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Subtopics Accordion */}
                    <div className={styles.subtopicsContainer}>
                      {(topic.subtopics || []).map((subtopic) => (
                        <SubtopicCard
                          key={subtopic.id}
                          name={subtopic.name || subtopic.title || subtopic.subtopic?.title || "Untitled Subtopic"}
                          masteryLevel={getMasteryLevel((subtopic.knowledge_level || 0) / 100)}
                          progress={Math.round((subtopic.progress_percent || 0) * 100)}
                          knowledge={Math.round((subtopic.knowledge_level || 0) * 100)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </main>
  );
};

export default ProgressPage;


