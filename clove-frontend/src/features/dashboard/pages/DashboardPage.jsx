import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faFire,
  faCheckCircle,
  faCheck,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import styles from "features/dashboard/styles/DashboardPage.module.scss";
import { DashboardAnalytics } from "features/dashboard/components/DashboardAnalytics";
import TitleAndProfile from "components/layout/Navbar/TitleAndProfile";
import { useAuth } from "contexts/AuthContext";
import { useApi } from "../../../hooks/useApi";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "components/layout/StatusScreen/LoadingScreen";
import ErrorScreen from "components/layout/StatusScreen/ErrorScreen";
import { useSidebar } from "../../../components/layout/Sidebar/Layout";
import { useMyDeckService } from "../../mydeck/hooks/useMydeckService";
import LevelXPBar from "../components/LevelXPBar";
import EnhancedStreak from "../components/EnhancedStreak";
import AchievementBadges from "../components/AchievementBadges";

// Reusable components
const CompletedTopicItem = ({ topicNumber, date, badgeText, index }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
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
    <motion.div 
      className={styles.completedTopic}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className={styles.topicInfo}>
        <h5>
          <FontAwesomeIcon icon={faCheck} /> {topicNumber}
        </h5>
        <small>Completed on {date}</small>
      </div>
      <div 
        className={`${styles.topicBadge} ${getBadgeClass(badgeText)}`}
      >
        {badgeText}
      </div>
      {isHovered && badgeText === 'Mastered' && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className={styles.sparkle}
              style={{
                left: `${30 + i * 30}%`,
                top: '50%'
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
                y: [-20, -40]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.3
              }}
            >
              ✨
            </motion.div>
          ))}
        </>
      )}
    </motion.div>
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
  const [totalPoints, setTotalPoints] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const navigate = useNavigate();
  const { closeSidebar } = useSidebar();
  
  // Get MyDeckService for consistent topic data
  const { getTopicsWithProgress } = useMyDeckService();
  
  // Function to calculate knowledge level from subtopic knowledge level scores
  const calculateTopicKnowledgeLevel = (subtopics) => {
    if (!subtopics || subtopics.length === 0) return 0;
    
    // Filter subtopics that have knowledge level scores
    const subtopicsWithScores = subtopics.filter(st => 
      st.knowledge_level !== undefined && st.knowledge_level > 0
    );
    
    if (subtopicsWithScores.length === 0) {
      return 0;
    }
    
    // Calculate average knowledge level from individual subtopic scores
    const totalScore = subtopicsWithScores.reduce((sum, st) => sum + st.knowledge_level, 0);
    const averageKnowledgeLevel = totalScore / subtopicsWithScores.length;
    
    return averageKnowledgeLevel;
  };

  // Update streak on dashboard load, then fetch stats
  React.useEffect(() => {
    let mounted = true;
    if (!user) return;
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch stats and topic progress
        const [statsRes, topicsData] = await Promise.all([
          get('/statistics/me'),
          getTopicsWithProgress()
        ]);
        
        if (!mounted) return;
        
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
          // Get total points directly from statistics
          setTotalPoints(statsData.total_points || 0);
        } else {
          setError("Failed to load dashboard stats");
        }
        
        // Use the properly mapped topic data from service
        setTopicProgress(topicsData);
      } catch (error) {
        if (mounted) {
          setError("Failed to load dashboard stats");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    fetchDashboardData();
    return () => { mounted = false; };
  }, [user]);

  // Progress Overview Data
  const progressData = topicProgress.length > 0
    ? topicProgress.map(tp => ({
        topic: tp.name || `Topic ${tp.id}`,
        percentage: Math.round((tp.progress || 0) * 100),
      }))
    : [
        { topic: "Topic 1 – Data Types and Variables", percentage: 0 },
        { topic: "Topic 2 – Operators", percentage: 0 },
        { topic: "Topic 3 – Conditional and Loops", percentage: 0 },
      ];

  // Challenges Solved Data
  const challengesSolved = stats?.total_challenges_solved || 0;
  const totalChallenges = 405; // Total available challenges in database
  const challengePercent = totalChallenges ? parseFloat(((challengesSolved / totalChallenges) * 100).toFixed(1)) : 0;
  
  // Determine challenge description based on completion status
  let challengeDescription;
  if (totalChallenges === 0) {
    challengeDescription = "You have not yet taken any challenges.";
  } else if (challengesSolved === totalChallenges) {
    challengeDescription = "🎉 Congratulations! You've solved ALL challenges! You're a coding master! 🏆";
  } else {
    challengeDescription = `You've solved ${challengesSolved} out of ${totalChallenges} challenges. Keep up answering the challenges!`;
  }
  
  const challengesData = {
    percentage: challengePercent, 
    label: "Solved",
    description: challengeDescription,
  };

  // Streak Data
  const streakDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  // Use login_days_this_week from stats to color the streak
  const filledDays = stats?.login_days_this_week || [];

  // Completed Topics with Badge
  const completedTopics = topicProgress
    .filter(tp => tp.progress === 1) // Only show completed topics
    .map(tp => {
      // Calculate knowledge level from subtopic completion data
      const averageKnowledgeLevel = calculateTopicKnowledgeLevel(tp.subtopics);
      
      // Determine badge based on knowledge level
      let badgeText = "";
      if (averageKnowledgeLevel >= 0.95) badgeText = "Mastered";
      else if (averageKnowledgeLevel >= 0.85) badgeText = "Proficient";
      else if (averageKnowledgeLevel >= 0.75) badgeText = "Learned";
      else badgeText = "Completed";
      
      // Handle completion date
      let completionDate = "Unknown";
      if (tp.completed_at) {
        completionDate = new Date(tp.completed_at).toLocaleDateString();
      } else if (tp.progress === 1) {
        completionDate = "Recently completed";
      }
      
      return {
        topicNumber: tp.name || `Topic ${tp.id}`,
        date: completionDate,
        badgeText,
        averageKnowledgeLevel: averageKnowledgeLevel.toFixed(2)
      };
    });

  if (loading || !stats) return <LoadingScreen message="Loading dashboard..." />;
  if (error) return <ErrorScreen message={error} />;

  return (
    <div className={styles.container}>
      <main className={styles.dashboard}>
        <TitleAndProfile
          nonColored={"Hello,"}
          colored={`${user ? (user.username || (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name || "User")) : "User"}!`}
          description={"Here's your learning journey progress 🌱"}
        />

        <div className={styles.mainContent}>
          {/* Level and XP Bar */}
          <LevelXPBar totalPoints={totalPoints} />

          <div className={styles.topRow}>
            <motion.div 
              className={`${styles.card} ${styles.recentTopicCard}`}
              data-joyride="continue-learning"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3>
                <FontAwesomeIcon icon={faBookOpen} /> Continue Learning
              </h3>
              <span className={styles.recentTopicSubtitle}>Pick up where you left off</span>

              {/* Topic Content Section */}
              <div className={styles.recentTopicContent}>
                {stats?.recent_topic ? (
                  <div className={styles.topicContentWrapper}>
                    <div className={styles.topicBadge}>
                      <FontAwesomeIcon icon={faBookOpen} className={styles.topicBadgeIcon} />
                      <span className={styles.topicBadgeText}>Last Studied</span>
                    </div>
                    <h4 className={styles.topicName}>{stats.recent_topic.title}</h4>
                    <p className={styles.topicMessage}>
                      Keep the momentum going! 🚀
                    </p>
                  </div>
                ) : (
                  <div className={styles.noTopicWrapper}>
                    <div className={styles.noTopicIcon}>🎯</div>
                    <p className={styles.noTopicMessage}>
                      No recent topic found. Start your learning journey now!
                    </p>
                  </div>
                )}
              </div>

              {/* Resume Button Section */}
              {stats?.recent_topic && (
                <div className={styles.resumeButtonWrapper}>
                  <motion.button
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
                      closeSidebar();
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Resume Topic</span>
                    <FontAwesomeIcon icon={faArrowRight} className={styles.buttonIcon} />
                  </motion.button>
                </div>
              )}

              {/* Decorative Elements */}
              <div className={styles.cardDecoration}></div>
            </motion.div>

            <motion.div 
              className={styles.card}
              data-joyride="streak-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3>
                <FontAwesomeIcon icon={faFire} /> Your Streak
              </h3>
              <EnhancedStreak 
                currentStreak={stats?.current_streak || 0}
                loginDaysThisWeek={filledDays}
                stats={stats}
              />
            </motion.div>
          </div>

          <DashboardAnalytics
            progressData={progressData}
            challengesData={challengesData}
          />

          {/* Achievement Badges - Phase 3 */}
          <div data-joyride="achievements">
            <AchievementBadges stats={stats} topicProgress={topicProgress} />
          </div>

          <motion.div 
            className={`${styles.card} ${styles.bottomHighlight}`}
            data-joyride="completed-topics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <h3>
              <FontAwesomeIcon icon={faCheckCircle} /> Completed Topics
            </h3>
            <div className={styles.completedTopics}>
              {completedTopics.length === 0 ? (
                <motion.div 
                  className={styles.noCompletedTopics}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  You haven't completed any topics yet. Keep learning and your completed topics will appear here!
                </motion.div>
              ) : (
                completedTopics.map((topic, index) => (
                  <CompletedTopicItem
                    key={index}
                    index={index}
                    topicNumber={topic.topicNumber}
                    date={topic.date}
                    badgeText={topic.badgeText}
                  />
                ))
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
