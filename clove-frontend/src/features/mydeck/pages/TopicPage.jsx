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

    // Check retention test availability using the new two-stage system
  const checkRetentionTestAvailability = useCallback(async () => {
    if (!user?.id || !topics || topics.length === 0) {
      return;
    }
    
    try {
      const availableTests = [];
      
      for (const topic of topics) {
        // Load detailed topic overview to get accurate completion status
        let topicOverview = null;
        try {
          topicOverview = await loadTopicOverview(topic.id);
          
          // Check if loadTopicOverview is actually a function
          if (typeof loadTopicOverview !== 'function') {
            continue;
          }
          
        } catch (error) {
          continue; // Skip this topic if we can't load its overview
        }
        
        let isTopicCompleted = false;
        
        if (!topicOverview) {
          // Use progress-based completion check since topic overview failed
          isTopicCompleted = topic.progress === 1 || topic.progress === 100;
        } else {
          // Use detailed topic overview completion status
          const { pre_assessment, subtopics, post_assessment } = topicOverview;
          
          // Topic is completed if ALL components are completed
          const isPreAssessmentCompleted = pre_assessment?.is_completed || false;
          const areAllSubtopicsCompleted = subtopics?.every(subtopic => subtopic.is_completed) || false;
          const isPostAssessmentCompleted = post_assessment?.is_completed || false;
          
          isTopicCompleted = isPreAssessmentCompleted && areAllSubtopicsCompleted && isPostAssessmentCompleted;
        }
        
        if (isTopicCompleted) {
          // Check retention test availability using the new API
          try {
            const response = await get(`/assessment_questions/topic/${topic.id}/retention-test/availability`);
            if (response.ok) {
              const data = await response.json();
              const hasAvailableTests = data.first_stage_available || data.second_stage_available;
              const hasCompletedTests = data.first_stage_completed || data.second_stage_completed;
              
              availableTests.push({
                topicId: topic.id,
                topicName: topic.name,
                isAvailable: hasAvailableTests,
                is_completed: hasCompletedTests && !hasAvailableTests,
                availability: data
              });
            }
          } catch (error) {
            // If error, assume no retention test is available
            availableTests.push({
              topicId: topic.id,
              topicName: topic.name,
              isAvailable: false,
              is_completed: false,
              availability: null
            });
          }
        }
      }
      
      setRetentionTestStatus(availableTests);
    } catch (error) {
      // Silent error handling for production
    }
  }, [user, topics, loadTopicOverview, get]);

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
  }, []);

  // Trigger retention test check when topics are loaded (ONCE only)
  useEffect(() => {
    if (user?.id && topics && topics.length > 0 && retentionTestStatus.length === 0 && !isProcessingRetentionTests) {
      // Call checkRetentionTestAvailability directly to avoid dependency issues
      checkRetentionTestAvailability();
    }
  }, [user?.id, topics, retentionTestStatus.length, isProcessingRetentionTests]);

  // Load topics with user progress only if not already in context
  useEffect(() => {
    let mounted = true;
    
    if (!topics || topics.length === 0) {
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
    } else {
      setLoading(false);
    }
    
    return () => {
      mounted = false;
    };
  }, [setTopics, getTopicsWithProgress, user?.id]); // Removed checkRetentionTestAvailability to prevent infinite loop



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

  // Simple loading state management - AFTER all hooks
  if (loading || !minTimePassed) return <LoadingScreen message="Loading topics..." />;
  if (error) return <ErrorScreen message={error} />;

  return (
    <Container
      fluid
      className={`${styles.myDeckWrapper} text-white d-flex flex-column`}
    >
      <TitleAndProfile
        nonColored={"Lesson "}
        colored={"Cards"}
        description={
          "Master concepts one card at a time with built-in practice ✨"
        }
      />
      
      {/* Retention Test Status Section - Only show available tests (not completed ones) */}
      {retentionTestStatus.filter(test => test.isAvailable).length > 0 && (
        <div className={`${styles.retentionTestSection} mt-3 mb-4`}>
          <div className={styles.retentionTestHeader}>
            <h3>RETENTION TESTS AVAILABLE!</h3>
            <p>You have retention tests ready to take</p>
          </div>
          
          <div className={styles.retentionTestList}>
            {retentionTestStatus
              .filter(test => test.isAvailable) // Only show available tests
              .map((test) => (
                <div key={test.topicId} className={styles.retentionTestItem}>
                  <div className={styles.retentionTestInfo}>
                    <span className={styles.topicName}>{test.topicName}</span>
                    <span className={styles.availability}>
                      Available
                    </span>
                  </div>
                  <button
                    className={styles.startRetentionTestBtn}
                    onClick={() => {
                      const topic = topics.find(t => t.id === test.topicId);
                      if (topic) {
                        handleStartRetentionTest(topic);
                      }
                    }}
                  >
                    Start Retention Test
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
      
      <div
        className={`${styles.floatContainer} mt-3 p-0 d-flex flex-wrap justify-content-center`}
      >
        {topics.length === 0 ? (
          <div className="text-center" style={{ minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div>
              <div className="mb-3">No topics available.</div>
              <div className="text-muted">Topics will appear here once they are added to the system.</div>
            </div>
          </div>
        ) : (
          [
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
              />
            ) : (
              <TopicCard
                key="coming-soon"
                comingSoon={true}
                themeStyles={THEMES.default}
              />
            );
          })
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
