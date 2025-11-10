import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faQuestionCircle,
  faLayerGroup,
  faTrophy,
  faChevronDown,
  faChevronUp,
  faChartPie,
  faRoute,
  faMap,
  faMountain,
  faFire,
  faStar,
  faLightbulb,
  faExclamationTriangle,
  faCrown,
  faGem,
  faHistory,
  faFlagCheckered,
  faCompass,
  faBookOpen,
} from "@fortawesome/free-solid-svg-icons";
import styles from "features/progress/styles/ProgressPage.module.scss";
import TitleAndProfile from "components/layout/Navbar/TitleAndProfile";
import {
  ProgressAnalytics,
  SubtopicCard,
  ModeCard,
  TopicProficiencyBadge,
  getMasteryLevel,
  getStrengthsWeaknesses,
  getCategory,
  getAccuracyClass,
  calculateTopicProficiency
} from "features/progress/components/ProgressAnalytics";
import RealmCard from "features/progress/components/RealmCard";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "contexts/AuthContext";
import { useJoyrideSafe } from "contexts/JoyrideContext";
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


const ProgressPage = () => {
  const [expandedTopics, setExpandedTopics] = useState({});
  const [expandedStrengths, setExpandedStrengths] = useState({});
  const [loading, setLoading] = useState(true);
  const [statData, setStatData] = useState(null);
  const [topicProgress, setTopicProgress] = useState([]);
  const [error, setError] = useState("");
  const { get } = useApi();
  const { user } = useAuth();
  
  // Get joyride context safely (returns null if not available)
  const joyrideContext = useJoyrideSafe();

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
          
          // Auto-expand first realm if joyride is running (for tour step)
          if (joyrideContext?.run && topics.length > 0) {
            setExpandedTopics({ [topics[0].topic_id]: true });
          }
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

  // Toggle topic accordion - memoized with useCallback
  const toggleTopic = useCallback((topicId) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  }, []);

  // Toggle strengths/weaknesses - memoized with useCallback
  const toggleStrengths = useCallback((topicId) => {
    setExpandedStrengths((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  }, []);

  // Helper function to format time ago
  const formatTimeAgo = useCallback((dateString) => {
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - activityDate) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    return activityDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: activityDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }, []);

  // Memoized activity feed calculation
  const activities = useMemo(() => {
    const activitiesList = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    topicProgress.forEach((topic) => {
      const topicName = topic.topic?.title || topic.title || topic.topic?.topic_name || topic.topic_name || "Unknown Topic";
      
      if (topic.completed_at) {
        const completedDate = new Date(topic.completed_at);
        if (completedDate >= thirtyDaysAgo) {
          activitiesList.push({
            id: `topic-completed-${topic.topic_id}`,
            date: topic.completed_at,
            type: "topic_completed",
            icon: faFlagCheckered,
            iconColor: "#10b981",
            title: topicName,
            label: "Completed Realm",
            badge: "🏆 Realm",
          });
        }
      }
      
      if (!topic.completed_at && topic.last_accessed_at) {
        const accessedDate = new Date(topic.last_accessed_at);
        if (accessedDate >= thirtyDaysAgo) {
          activitiesList.push({
            id: `topic-visited-${topic.topic_id}`,
            date: topic.last_accessed_at,
            type: "topic_visited",
            icon: faCompass,
            iconColor: "#8b5cf6",
            title: topicName,
            label: "Recently Visited",
            badge: "🗺️ Realm",
          });
        }
      }

      if (topic.subtopics) {
        topic.subtopics.forEach((subtopic) => {
          const subtopicName = subtopic.name || subtopic.title || subtopic.subtopic?.title || "Unknown Subtopic";
          
          if (subtopic.completed_at) {
            const completedDate = new Date(subtopic.completed_at);
            if (completedDate >= thirtyDaysAgo) {
              activitiesList.push({
                id: `subtopic-completed-${subtopic.subtopic_id}`,
                date: subtopic.completed_at,
                type: "subtopic_completed",
                icon: faCheckCircle,
                iconColor: "#6EE7B7",
                title: subtopicName,
                label: "Completed Subtopic",
                badge: "✅ Subtopic",
              });
            }
          }
          if (subtopic.unlocked_at && subtopic.unlocked_at !== subtopic.completed_at && !subtopic.completed_at) {
            const unlockedDate = new Date(subtopic.unlocked_at);
            if (unlockedDate >= thirtyDaysAgo) {
              activitiesList.push({
                id: `subtopic-unlocked-${subtopic.subtopic_id}`,
                date: subtopic.unlocked_at,
                type: "subtopic_unlocked",
                icon: faBookOpen,
                iconColor: "#fbbf24",
                title: subtopicName,
                label: "Unlocked Subtopic",
                badge: "📖 Subtopic",
              });
            }
          }
        });
      }
    });

    return activitiesList
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 15);
  }, [topicProgress]);

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

  if (loading) return <LoadingScreen message="Loading progress..." />;
  if (error) return <ErrorScreen message={error} />;

  return (
    <main className={styles.progressContent}>
      {/* Animated Background - Reduced to 8 orbs for better performance */}
      <div className={styles.backgroundPatterns}>
        {[...Array(8)].map((_, i) => (
          <div
            key={`bg-orb-${i}`}
            className={styles.bgOrb}
            style={{
              left: `${(i * 12.5) % 100}%`,
              top: `${(i * 15) % 100}%`,
              width: `${150 + (i * 20)}px`,
              height: `${150 + (i * 20)}px`,
              animationDelay: `${i * 1.2}s`,
            }}
          />
        ))}
      </div>

      <TitleAndProfile
        nonColored={"Learning"}
        colored={"Journey"}
        description={"Track your path to mastery"}
      />

      {/* Recent Activity Feed */}
      <motion.section
        className={styles.activitySection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}>
            <FontAwesomeIcon icon={faHistory} />
          </div>
          <div>
            <h2 className={styles.sectionTitle}>Recent Activity</h2>
            <p className={styles.sectionSubtitle}>
              Your learning milestones from the last 30 days
            </p>
          </div>
        </div>

        <div className={styles.activityFeed} data-joyride="activity-feed">
          {activities.length === 0 ? (
            <div className={styles.emptyState}>
              <FontAwesomeIcon icon={faMap} className={styles.emptyIcon} />
              <h3>No Activity Yet</h3>
              <p>Start exploring realms to see your progress here!</p>
            </div>
          ) : (
            activities.map((activity, index) => (
              <div
                key={activity.id}
                className={styles.activityItem}
                style={{
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                <div
                  className={styles.activityIcon}
                  style={{ borderColor: activity.iconColor }}
                >
                  <FontAwesomeIcon
                    icon={activity.icon}
                    style={{ color: activity.iconColor }}
                  />
                </div>

                <div className={styles.activityContent}>
                  <div className={styles.activityHeader}>
                    <div className={styles.activityTitleGroup}>
                      <span className={styles.activityLabel}>{activity.label}</span>
                      <h4 className={styles.activityTitle}>{activity.title}</h4>
                    </div>
                    <span className={styles.activityTime}>{formatTimeAgo(activity.date)}</span>
                  </div>
                  <span className={styles.activityBadge}>{activity.badge}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.section>

      {/* Learning Mode Performance */}
      <motion.section 
        className={styles.modesSection}
        data-joyride="learning-modes"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}>
            <FontAwesomeIcon icon={faTrophy} />
          </div>
          <div>
            <h2 className={styles.sectionTitle}>Learning Mode Performance</h2>
            <p className={styles.sectionSubtitle}>Your mastery across different challenge types</p>
          </div>
        </div>
        <div className={styles.modesGrid}>
          {learningModes.map((mode, index) => (
            <ModeCard key={index} {...mode} index={index} />
          ))}
        </div>
      </motion.section>

      {/* Learning Realms - Horizontal Card Design */}
      <motion.section 
        className={styles.realmsSection}
        data-joyride="learning-realms"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}>
            <FontAwesomeIcon icon={faGem} />
          </div>
          <div>
            <h2 className={styles.sectionTitle}>Learning Realms</h2>
            <p className={styles.sectionSubtitle}>Choose your path - master each realm independently</p>
          </div>
        </div>

        {topicProgress.length === 0 ? (
          <div className={styles.emptyState}>
            <FontAwesomeIcon icon={faMap} className={styles.emptyIcon} />
            <p>No realms found. Start your adventure!</p>
          </div>
        ) : (
          <div className={styles.realmsContainer}>
            {topicProgress.map((topic, index) => (
              <RealmCard
                key={topic.topic_id}
                topic={topic}
                index={index}
                isExpanded={expandedTopics[topic.topic_id] || false}
                strengthsExpanded={expandedStrengths[topic.topic_id] || false}
                toggleTopic={toggleTopic}
                toggleStrengths={toggleStrengths}
                getStrengthsWeaknesses={getStrengthsWeaknesses}
                calculateTopicProficiency={calculateTopicProficiency}
              />
            ))}
          </div>
        )}
      </motion.section>
    </main>
  );
};

export default ProgressPage;
