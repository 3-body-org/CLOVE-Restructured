import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faFire,
  faCheckCircle,
  faCheck,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import styles from "features/dashboard/styles/DashboardPage.module.scss";
import { DashboardAnalytics } from "features/dashboard/components/DashboardAnalytics";
import TitleAndProfile from "components/layout/Navbar/TitleAndProfile";
import { useAuth } from "contexts/AuthContext";
import { useApi } from "../../../hooks/useApi";
import { Link, useNavigate } from "react-router-dom";
import LoadingScreen from "components/layout/StatusScreen/LoadingScreen";
import ErrorScreen from "components/layout/StatusScreen/ErrorScreen";
import { useSidebar } from "../../../components/layout/Sidebar/Layout";

// Reusable components
const CompletedTopicItem = ({ topicNumber, date, badgeText }) => {
  const getBadgeClass = (badgeText) => {
    switch (badgeText) {
      case 'Mastered': return styles.badgeMastered;
      case 'Proficient': return styles.badgeProficient;
      case 'Learned': return styles.badgeLearned;
      case 'Completed': return styles.badgeCompleted;
      default: return styles.badgeCompleted;
    }
  };

  return (
    <div className={styles.completedTopic}>
      <div className={styles.topicInfo}>
        <h5>
          <FontAwesomeIcon icon={faCheck} /> Topic {topicNumber}: ...
        </h5>
        <small>Completed on {date}</small>
      </div>
      <div className={`${styles.topicBadge} ${getBadgeClass(badgeText)}`}>{badgeText}</div>
    </div>
  );
};

const StreakDay = ({ day, filled }) => (
  <div className={`${styles.day} ${filled ? styles.streakFilled : ""}`}>
    {day}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { get, post } = useApi();
  const [stats, setStats] = React.useState(null);
  const [topicProgress, setTopicProgress] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const navigate = useNavigate();
  const { closeSidebar } = useSidebar();

  // Update streak on dashboard load, then fetch stats
  React.useEffect(() => {
    let mounted = true;
    if (!user) return;
    setLoading(true);
    // Now fetch stats and topic progress
    Promise.all([
      get('/statistics/me'),
      get(`/user_topics/user/${user.id}`)
    ])
      .then(async ([statsRes, topicsRes]) => {
        if (!mounted) return;
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        } else {
          setError("Failed to load dashboard stats");
        }
        if (topicsRes.ok) {
          const topics = await topicsRes.json();
          setTopicProgress(topics);
        } else {
          setTopicProgress([]);
        }
        setLoading(false);
      })
      .catch(() => {
        if (mounted) {
          setError("Failed to load dashboard stats");
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, [user]);

  // Progress Overview Data
  const progressData = topicProgress.length > 0
    ? topicProgress.map(tp => ({
        topic: tp.topic?.title || `Topic ${tp.topic_id}`,
        percentage: Math.round((tp.progress_percent || 0) * 100),
      }))
    : [
        { topic: "Topic 1 – Data Types and Variables", percentage: 0 },
        { topic: "Topic 2 – Operators", percentage: 0 },
        { topic: "Topic 3 – Conditional and Loops", percentage: 0 },
      ];

  // Challenges Solved Data
  const challengesSolved = stats?.total_challenges_solved || 0;
  const totalChallenges = 405; // Total available challenges in database
  const challengePercent = totalChallenges ? ((challengesSolved / totalChallenges) * 100).toFixed(1) : 0;
  const challengesData = {
    percentage: challengePercent, 
    label: "Solved",
    description:
      totalChallenges > 0
        ? `You've solved ${challengesSolved} out of ${totalChallenges} challenges. Keep up answering the challenges!`
        : "You have not yet taken any challenges.",
  };

  // Streak Data
  const streakDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  // Use login_days_this_week from stats to color the streak
  const filledDays = stats?.login_days_this_week || [];

  // Completed Topics with Badge
  const completedTopics = topicProgress
    .filter(tp => tp.is_completed)
    .map(tp => {
      let badgeText = "";
      const kl = tp.knowledge_level || 0;
      if (kl === 1.0) badgeText = "Mastered";
      else if (kl >= 0.9) badgeText = "Proficient";
      else if (kl >= 0.8) badgeText = "Learned";
      else badgeText = "Completed";
      return {
        topicNumber: tp.topic?.title || `Topic ${tp.topic_id}`,
        date: tp.completed_at ? new Date(tp.completed_at).toLocaleDateString() : "Unknown",
        badgeText,
      };
    });

  if (loading || !stats) return <LoadingScreen message="Loading dashboard..." />;
  if (error) return <ErrorScreen message={error} />;

  return (
    <div className={styles.container}>
      <main className={styles.dashboard}>
        <TitleAndProfile
          nonColored={"Hello,"}
          colored={`${user ? (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name || user.username || "User") : "User"}!`}
          description={"Here's your learning journey progress 🌱"}
        />

        <div className={styles.mainContent}>
          <div className={styles.topRow}>
            <div className={`${styles.card} ${styles.highlight}`}>
              <h3>
                <FontAwesomeIcon icon={faBookOpen} /> Most Recent Topic
              </h3>
              <p>
                {stats?.recent_topic ? (
                  <>You were last seen studying <strong>{stats.recent_topic.title}</strong>. Let's keep going!</>
                ) : (
                  <>No recent topic found. Start learning now!</>
                )}
              </p>
              {stats?.recent_topic && (
                <button
                  className={styles.resumeButton}
                  onClick={() => {
                    const recentTopicId = stats.recent_topic.topic_id;
                    const recentTopicSlug = stats.recent_topic.title
                      ? stats.recent_topic.title.toLowerCase().replace(/\s+/g, '-')
                      : `topic-${recentTopicId}`;
                    const topicObj = topicProgress.find(
                      tp => tp.topic?.topic_id === recentTopicId
                    );
                    if (topicObj && topicObj.introduction_seen) {
                      navigate(`/my-deck/${recentTopicId}-${recentTopicSlug}`);
                    } else {
                      navigate(`/my-deck/${recentTopicId}-${recentTopicSlug}/introduction`);
                    }
                    closeSidebar(); // Close sidebar after navigation
                  }}
                >
                  Resume Topic <FontAwesomeIcon icon={faArrowRight} />
                </button>
              )}
            </div>

            <div className={styles.card}>
              <h3>
                <FontAwesomeIcon icon={faFire} /> Your Streak
              </h3>
              <div className={styles.streak}>
                <div className={styles.days}>
                  {streakDays.map((day, index) => (
                    <StreakDay key={day} day={day} filled={filledDays.includes(index)} />
                  ))}
                </div>
                <p className={styles.streakText}>
                  You're on a <strong>{stats?.current_streak || 0}-day streak</strong>. Consistency is key.
                </p>
              </div>
            </div>
          </div>

          <DashboardAnalytics
            progressData={progressData}
            challengesData={challengesData}
          />

          <div className={styles.card}>
            <h3>
              <FontAwesomeIcon icon={faCheckCircle} /> Completed Topics
            </h3>
            <div className={styles.completedTopics}>
              {completedTopics.length === 0 ? (
                <div className={styles.noCompletedTopics}>
                  You haven't completed any topics yet. Keep learning and your completed topics will appear here!
                </div>
              ) : (
                completedTopics.map((topic, index) => (
                  <CompletedTopicItem
                    key={index}
                    topicNumber={topic.topicNumber}
                    date={topic.date}
                    badgeText={topic.badgeText}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
