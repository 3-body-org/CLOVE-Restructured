import React, {
  useEffect,
  useContext,
  useCallback,
  useRef,
  useMemo,
  useState,
} from "react";
import PropTypes from "prop-types";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import { MyDeckContext } from "contexts/MyDeckContext";
import { useParticles } from "features/mydeck/hooks/useParticles";
import useTheme from "features/mydeck/hooks/useTheme";
import TypeCard from "features/mydeck/components/TypeCard";
import RuneBackground from "features/mydeck/components/RuneBackground";
import RainfallBackground from "features/mydeck/components/RainfallBackground";
import { useMyDeckService } from "features/mydeck/hooks/useMydeckService";
import { getThemeContent, iconMap } from "features/mydeck/content/themeContent";
import styles from "features/mydeck/styles/IntroductionPage.module.scss";
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "contexts/AuthContext";
import LoadingScreen from "components/layout/StatusScreen/LoadingScreen";
import ErrorScreen from "components/layout/StatusScreen/ErrorScreen";

const Introduction = () => {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const { setTopicId, topicCache, setTopicCache } = useContext(MyDeckContext);
  const canvasRef = useRef(null);
  const { getTopicById, updateRecentTopic } = useMyDeckService();
  const { patch } = useApi();
  const { user } = useAuth();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Initialize theme (defaults to 'space' theme)
  const { currentTheme, setTheme } = useTheme();
  const isSpaceTheme = currentTheme === 'space';
  const isWizardTheme = currentTheme === 'wizard';
  const isDetectiveTheme = currentTheme === 'detective';

  // Load topic data and update recent topic
  useEffect(() => {
    if (!topicId || !user) {
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError("");

    // Extract numeric topic ID from the URL parameter (format: id-slug)
    const numericTopicId = topicId ? topicId.split('-')[0] : null;

    // Check context first
    const cachedTopic = topicCache[numericTopicId];
    if (cachedTopic) {
      setTopic(cachedTopic);
      setTheme(cachedTopic.theme);
      setLoading(false);
      if (cachedTopic.introduction_seen) {
        navigate(`/my-deck/${topicId}`);
        return;
      }
      return;
    }
    
    Promise.all([
      getTopicById(numericTopicId),
      updateRecentTopic(numericTopicId)
    ])
      .then(async ([topicData]) => {
        if (mounted) {
          setTopic(topicData);
          setTheme(topicData.theme);
          setTopicCache(prev => ({ ...prev, [numericTopicId]: topicData }));
          // Check if introduction has been seen from backend data
          if (topicData.introduction_seen) {
            navigate(`/my-deck/${topicId}`);
          }
        }
      })
      .catch((error) => {
        if (mounted) {
          console.error("Failed to load topic:", error);
          setError("Failed to load topic. Please try again.");
    }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [topicId, setTheme, navigate, user, topicCache, setTopicCache]); // Added user to dependencies

  // Add theme class to body
  useEffect(() => {
    if (currentTheme) {
    document.body.classList.add(`theme-${currentTheme}`);
    return () => {
      document.body.classList.remove(`theme-${currentTheme}`);
    };
    }
  }, [currentTheme]);

  // Get theme-specific content
  const themeContent = useMemo(
    () => getThemeContent(currentTheme),
    [currentTheme]
  );

  // Map icon names to actual icon components
  const getIcon = (iconName) => {
    const iconKey = iconMap[iconName] || "code";
    return Icons[iconKey] || Icons.faCode;
  };

  // Initialize particles only for space theme
  useParticles(canvasRef, currentTheme);

  // Set topic ID on mount and when it changes
  useEffect(() => {
    if (topicId) {
      setTopicId(topicId);
    }
    return () => setTopicId(null);
  }, [topicId, setTopicId]);

  const handleStartTraining = useCallback(async () => {
    if (topicId && user) {
      // Extract numeric topic ID
      const numericTopicId = topicId.split('-')[0];
      
      try {
        // Update backend to mark introduction as seen
        await patch(`/user_topics/user/${user.id}/topic/${numericTopicId}`, {
          introduction_seen: true
        });
        // Update cache
        setTopicCache(prev => ({
          ...prev,
          [numericTopicId]: {
            ...prev[numericTopicId],
            introduction_seen: true
          }
        }));
        // Navigate to subtopics page
        navigate(`/my-deck/${topicId}`);
      } catch (error) {
        console.error("Failed to update introduction status:", error);
        // Still navigate even if update fails
        navigate(`/my-deck/${topicId}`);
      }
    }
  }, [navigate, topicId, user, patch, setTopicCache]);

  if (loading) {
    return <LoadingScreen message="Loading topic..." />;
  }

  if (error) {
    return <ErrorScreen message={error} />;
  }

  if (!topic) {
    return (
      <div className={`${styles.container} ${isSpaceTheme ? styles.spaceTheme : ""} ${isWizardTheme ? styles.wizardTheme : ""} ${isDetectiveTheme ? styles.detectiveTheme : ""}`}>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
          <div className="text-center">
            <div className="mb-3">Topic not found.</div>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/my-deck')}
            >
              Back to Topics
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.container} ${isSpaceTheme ? styles.spaceTheme : ""} ${isWizardTheme ? styles.wizardTheme : ""} ${isDetectiveTheme ? styles.detectiveTheme : ""}`}
    >
      {isSpaceTheme && (
        <canvas
          ref={canvasRef}
          className={styles.particleCanvas}
          aria-hidden="true"
        />
      )}
      {isWizardTheme && <RuneBackground />}
      {isDetectiveTheme && <RainfallBackground />}

      <div className={styles.content}>
        {/* Header Section */}
        <header className={styles.header}>
          <div className={styles.hologramTitle}>
            <FontAwesomeIcon
              icon={getIcon(themeContent.mainIcon)}
              className={styles.titleIcon}
              aria-hidden="true"
            />
            <h1 className={styles.mainTitle}>{themeContent.heading}</h1>
            <p className={styles.subtitle}>{themeContent.subtitle}</p>
          </div>
        </header>

        {/* Story Section */}
        <section className={styles.storySection}>
          <div className={styles.storyGlow} aria-hidden="true" />
          <div className={styles.storyContent}>
            <h2>
              <FontAwesomeIcon
                icon={getIcon(themeContent.storyIcon)}
                className={styles.storyIcon}
                aria-hidden="true"
              />
              <span>{themeContent.story.title}</span>
            </h2>
            <div className={styles.storyText}>
              {themeContent.story.paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  dangerouslySetInnerHTML={{ __html: paragraph }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Visualized Content Section */}
        <section className={styles.visualizationGrid}>
          {themeContent.cards.map((card, index) => (
            <TypeCard
              key={index}
              icon={getIcon(card.icon)}
              title={card.title}
              description={card.description}
              badges={card.badges}
              codeLines={card.codeLines}
            />
          ))}
        </section>

        {/* CTA Section */}
        <div className={styles.ctaContainer}>
          <button
            className={styles.ctaButton}
            onClick={handleStartTraining}
            aria-label={themeContent.cta.ariaLabel}
          >
            <FontAwesomeIcon
              icon={getIcon(themeContent.cta.icon)}
              className={styles.ctaIcon}
              aria-hidden="true"
            />
            <span>{themeContent.cta.label}</span>
            <div className={styles.buttonGlow} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

Introduction.propTypes = {
  topicId: PropTypes.string,
};

export default Introduction;
