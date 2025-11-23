/**
 * @file TopicPage.jsx
 * @description Topic selection page for MyDeck. Shows all topics as cards with progress and theme-aware styles.
 */

import React, { useCallback, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import TitleAndProfile from "../../../components/layout/Navbar/TitleAndProfile";
import TopicCard from "../components/TopicCard";
import LoadingScreen from "components/layout/StatusScreen/LoadingScreen";
import ErrorScreen from "components/layout/StatusScreen/ErrorScreen";
import AssessmentInstructions from "components/assessments/AssessmentInstructions";
import RetentionTestPopup from "components/assessments/RetentionTestPopup";
import { useMyDeckService } from "../hooks/useMydeckService";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "../../../contexts/AuthContext";
import styles from "../styles/TopicPage.module.scss";
import spaceTheme from "../themes/spaceTheme.module.scss";
import wizardTheme from "../themes/wizardTheme.module.scss";
import detectiveTheme from "../themes/detectiveTheme.module.scss";
import { MyDeckContext } from "../../../contexts/MyDeckContext";
import { useSidebar } from "../../../components/layout/Sidebar/Layout";

/**
 * Theme mapping for topic cards.
 */
const THEMES = {
  space: { ...styles, ...spaceTheme },
  wizard: { ...styles, ...wizardTheme },
  detective: { ...styles, ...detectiveTheme },
  default: styles,
};

/**
 * TopicPage
 * Shows all topics as cards with progress and theme-aware styles.
 * @component
 */
const TopicPage = () => {
  const navigate = useNavigate();
  const { getTopicsWithProgress, getTopicById, updateRecentTopic } = useMyDeckService();
  const { topics, setTopics, loadTopicOverview, topicCache } = useContext(MyDeckContext);
  const { closeSidebar } = useSidebar();
  const { get } = useApi();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [retentionTestStatus, setRetentionTestStatus] = useState([]);
  
  // Simple retention test state
  const [isProcessingRetentionTests, setIsProcessingRetentionTests] = useState(false);
  
  // Retention test popup state
  const [showRetentionTestPopup, setShowRetentionTestPopup] = useState(false);
  const [selectedTopicForRetentionTest, setSelectedTopicForRetentionTest] = useState(null);
  const [showRetentionTestResults, setShowRetentionTestResults] = useState(false);

  // Minimum loading time effect for consistent UX
  useEffect(() => {
    setMinTimePassed(false);
    const timer = setTimeout(() => setMinTimePassed(true), 200);
    return () => clearTimeout(timer);
  }, []); // Only on mount

    // Check retention test status for ALL topics
    // Icon appears if user has completed at least the first retention test
  const checkRetentionTestAvailability = useCallback(async () => {
    if (!user?.id || !topics || topics.length === 0) {
      return;
    }
    
    try {
      const availableTests = [];
      
      // Check ALL topics for retention test completion status
      // This ensures the icon appears after completing a retention test
      for (const topic of topics) {
        try {
          // Always check retention test availability API for each topic
          // This will return completion status even if assessments aren't done
          const response = await get(`/assessment_questions/topic/${topic.id}/retention-test/availability`);
          if (response.ok) {
            const data = await response.json();
            const hasCompletedTests = data.first_stage_completed || data.second_stage_completed;
            
            // Only add to list if at least one stage is completed (to show the icon)
            if (hasCompletedTests) {
              availableTests.push({
                topicId: topic.id,
                topicName: topic.name,
                isAvailable: data.first_stage_available || data.second_stage_available,
                is_completed: hasCompletedTests,
                availability: data
              });
            }
          }
        } catch (error) {
          // Silently skip topics with errors
          continue;
        }
      }
      
      setRetentionTestStatus(availableTests);
    } catch (error) {
      // Silent error handling for production
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, get]); // Only depend on user.id and get, not the whole topics array

  // Function to handle starting retention test popup
  const handleStartRetentionTest = useCallback((topic, showResults = false) => {
    setSelectedTopicForRetentionTest(topic);
    setShowRetentionTestPopup(true);
    setShowRetentionTestResults(showResults);
  }, []);
  
  // Function to close retention test popup
  const handleCloseRetentionTestPopup = useCallback(() => {
    setShowRetentionTestPopup(false);
    setSelectedTopicForRetentionTest(null);
    setShowRetentionTestResults(false);
    // Refresh retention test status after closing popup (in case test was completed)
    if (user?.id && topics && topics.length > 0) {
      setTimeout(() => {
        checkRetentionTestAvailability();
      }, 500); // Small delay to ensure backend has updated
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Don't depend on topics or callback to avoid re-renders

  // Trigger retention test check when topics are loaded (only once)
  useEffect(() => {
    if (user?.id && topics && topics.length > 0) {
      checkRetentionTestAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, topics?.length]); // Only depend on topics length, not the whole array

  // Load topics with user progress only if not already in context
  useEffect(() => {
    let mounted = true;
    
    // Only load if topics are empty and user is available
    if ((!topics || topics.length === 0) && user?.id) {
      setLoading(true);
      setError("");
      getTopicsWithProgress()
        .then((topicsData) => {
          if (mounted) {
            setTopics(topicsData);
            // Topics are now loaded, retention test check will happen via useEffect dependency
          }
        })
        .catch((error) => {
          if (mounted) {
            setError("Failed to load topics. Please try again.");
          }
        })
        .finally(() => {
          if (mounted) {
            setLoading(false);
          }
        });
    } else if (topics && topics.length > 0) {
      setLoading(false);
    }
    
    return () => {
      mounted = false;
    };
    // Only depend on user?.id and topics length to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, topics?.length]);



  /**
   * Get theme styles based on topic theme name.
   * @param {string} themeName
   * @returns {Object}
   */
  const getThemeStyles = (themeName = "default") => {
    return THEMES[themeName] || THEMES.default;
  };

  /**
   * Handle topic card click: fetch latest topic state and navigate accordingly.
   * @param {Object} topic
   */
  const handleTopicClick = useCallback(
    async (topic) => {
      try {
        // Update recent topic in statistics
        await updateRecentTopic(topic.id);
        
        // Fetch latest topic state and navigate
        const res = await getTopicById(topic.id);
        if (res.introduction_seen) {
          navigate(`/my-deck/${topic.id}-${topic.slug}`);
        } else {
          navigate(`/my-deck/${topic.id}-${topic.slug}/introduction`);
        }
        closeSidebar(); // Close sidebar after navigation
      } catch (error) {
        // Continue with navigation even if recent topic update fails
        const res = await getTopicById(topic.id);
        if (res.introduction_seen) {
          navigate(`/my-deck/${topic.id}-${topic.slug}`);
        } else {
          navigate(`/my-deck/${topic.id}-${topic.slug}/introduction`);
        }
        closeSidebar();
      }
    },
    [navigate, getTopicById, updateRecentTopic, closeSidebar]
  );

  // Get the first topic's theme for background styling
  const getFeaturedTheme = () => {
    if (!topics || topics.length === 0) return 'default';
    return topics[0].theme || 'default';
  };

  const featuredTheme = getFeaturedTheme();

  // Simple loading state management - AFTER all hooks
  if (loading || !minTimePassed) return <LoadingScreen message="Loading topics..." />;
  if (error) return <ErrorScreen message={error} />;

  return (
    <Container
      fluid
      className={`${styles.myDeckWrapper} text-white d-flex flex-column`}
      data-featured-theme={featuredTheme}
    >
      {/* Static background is handled by CSS ::before and ::after pseudo-elements */}
      
      <TitleAndProfile
        nonColored={"Lesson "}
        colored={"Cards"}
        description={
          "Master concepts one card at a time with built-in practice ✨"
        }
      />
      
      <div className={styles.topicsGridContainer}>
        {topics.length === 0 ? (
          <div className="text-center" style={{ minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div>
              <div className="mb-3">No topics available.</div>
              <div className="text-muted">Topics will appear here once they are added to the system.</div>
            </div>
          </div>
        ) : (
          <div className={styles.topicsGrid}>
            {[
              ...topics.map(topic => ({ 
                type: "topic", 
                topic, 
                theme: topic.theme,
                retentionTestStatus: retentionTestStatus.find(rt => rt.topicId === topic.id) || null
              })),
              { type: "comingSoon" }
            ].map((card, idx) => {
              return card.type === "topic" ? (
                <TopicCard
                  key={card.topic.id}
                  topic={card.topic}
                  onClick={handleTopicClick}
                  themeStyles={getThemeStyles(card.theme)}
                  retentionTestStatus={card.retentionTestStatus}
                  onRetentionTestClick={handleStartRetentionTest}
                  isFeatured={false}
                />
              ) : (
                <TopicCard
                  key="coming-soon"
                  comingSoon={true}
                  themeStyles={THEMES.default}
                  isFeatured={false}
                />
              );
            })}
          </div>
        )}
      </div>
      
      {/* Retention Test Popup */}
      {showRetentionTestPopup && selectedTopicForRetentionTest && (
        <RetentionTestPopup
          topicId={selectedTopicForRetentionTest.id}
          isOpen={showRetentionTestPopup}
          onClose={handleCloseRetentionTestPopup}
          showResults={showRetentionTestResults}
        />
      )}
    </Container>
  );
};

export default TopicPage;
