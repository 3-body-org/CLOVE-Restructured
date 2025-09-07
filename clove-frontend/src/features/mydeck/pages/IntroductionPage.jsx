/**
 * @file IntroductionPage.jsx
 * @description Introduction page for a topic in MyDeck. Shows theme intro, story, and CTA to start training.
 */

import React, {
  useEffect,
  useContext,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHatWizard,
  faScroll,
  faCircleNodes,
  faWandSparkles,
  faGem,
  faBookTanakh,
  faFingerprint,
  faMagnifyingGlass,
  faFolderOpen,
  faRocket,
  faCode,
  faDatabase,
  faDna,
  faSatellite,
  faPlay
} from "@fortawesome/free-solid-svg-icons";
import { MyDeckContext } from "contexts/MyDeckContext";
import useTheme from "features/mydeck/hooks/useTheme";
import TypeCard from "features/mydeck/components/TypeCard";
import RuneBackground from "features/mydeck/components/RuneBackground";
import RainfallBackground from "features/mydeck/components/RainfallBackground";
import SpaceBackground from "features/mydeck/components/SpaceBackground";
import { useMyDeckService } from "features/mydeck/hooks/useMydeckService";
import { getIntroductionContent, iconMap } from "features/mydeck/content/introductionContent";
import styles from "features/mydeck/styles/IntroductionPage.module.scss";

// Icon mapping object for FontAwesome icons
const iconMapping = {
  faHatWizard,
  faScroll,
  faCircleNodes,
  faWandSparkles,
  faGem,
  faBookTanakh,
  faFingerprint,
  faMagnifyingGlass,
  faFolderOpen,
  faRocket,
  faCode,
  faDatabase,
  faDna,
  faSatellite,
  faPlay
};
import { useApi } from "../../../hooks/useApi";
import { useAuth } from "contexts/AuthContext";
import LoadingScreen from "components/layout/StatusScreen/LoadingScreen";
import ErrorScreen from "components/layout/StatusScreen/ErrorScreen";
import DOMPurify from 'dompurify';

/**
 * IntroductionPage
 * Shows the introduction for a topic, including theme, story, and CTA.
 * @component
 */
const IntroductionPage = () => {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const location = useLocation();
  const { setTopicId, topicCache, setTopicCache } = useContext(MyDeckContext);
  const { getTopicById, updateRecentTopic } = useMyDeckService();
  const { patch } = useApi();
  const { user } = useAuth();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currentTheme, setTheme } = useTheme();

  // Theme booleans
  const isSpaceTheme = currentTheme === 'space';
  const isWizardTheme = currentTheme === 'wizard';
  const isDetectiveTheme = currentTheme === 'detective';

  // Check if user is coming from subtopic page
  const isFromSubtopic = new URLSearchParams(location.search).get('from') === 'subtopic';

  // Load topic data and update recent topic
  useEffect(() => {
    if (!topicId || !user) {
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    setError("");
    const numericTopicId = topicId ? parseInt(topicId.split('-')[0]) : 1;
    const cachedTopic = topicCache && topicCache[numericTopicId];
    if (cachedTopic) {
      setTopic(cachedTopic);
      setTheme(cachedTopic.theme);
      setLoading(false);
      // Only redirect if user hasn't seen introduction AND is not coming from subtopic page
      if (cachedTopic.introduction_seen && !isFromSubtopic) {
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
          setTopicCache(prev => ({ ...(prev || {}), [numericTopicId]: topicData }));
          // Only redirect if user hasn't seen introduction AND is not coming from subtopic page
          if (topicData.introduction_seen && !isFromSubtopic) {
            navigate(`/my-deck/${topicId}`);
          }
        }
      })
      .catch((error) => {
        if (mounted) {
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
  }, [topicId, setTheme, navigate, user, topicCache, setTopicCache, getTopicById, updateRecentTopic]);

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
  const introductionContent = useMemo(
    () => getIntroductionContent(currentTheme),
    [currentTheme]
  );

  // Map icon names to actual icon components
  const getIcon = useCallback((iconName) => {
    const iconKey = iconMap[iconName] || "faCode";
    return iconMapping[iconKey] || iconMapping.faCode;
  }, []);

  // Set topic ID on mount and when it changes
  useEffect(() => {
    if (topicId) {
      setTopicId(topicId);
    }
    return () => setTopicId(null);
  }, [topicId, setTopicId]);

  const handleStartTraining = useCallback(async () => {
    if (topicId && user) {
      const numericTopicId = topicId.split('-')[0];
      try {
        await patch(`/user_topics/user/${user.id}/topic/${numericTopicId}`, {
          introduction_seen: true
        });
        setTopicCache(prev => ({
          ...prev,
          [numericTopicId]: {
            ...(prev[numericTopicId] || {}),
            introduction_seen: true
          }
        }));
        navigate(`/my-deck/${topicId}`);
      } catch (error) {
        navigate(`/my-deck/${topicId}`);
      }
    }
  }, [navigate, topicId, user, patch, setTopicCache]);

  const handleBack = useCallback(() => {
    navigate('/my-deck');
  }, [navigate]);

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
      {isSpaceTheme && <SpaceBackground />}
      {isWizardTheme && <RuneBackground />}
      {isDetectiveTheme && <RainfallBackground />}

      <div className={styles.content}>
        {/* Header Section */}
        <header className={styles.header}>
          <div className={styles.hologramTitle}>
            <FontAwesomeIcon
              icon={getIcon(introductionContent.mainIcon)}
              className={styles.titleIcon}
              aria-hidden="true"
            />
            <h1 className={styles.mainTitle}>{introductionContent.heading}</h1>
            <p className={styles.subtitle}>{introductionContent.subtitle}</p>
          </div>
        </header>

        {/* Story Section */}
        <section className={styles.storySection}>
          <div className={styles.storyGlow} aria-hidden="true" />
          <div className={styles.storyContent}>
            <h2>
              <FontAwesomeIcon
                icon={getIcon(introductionContent.storyIcon)}
                className={styles.storyIcon}
                aria-hidden="true"
              />
              <span>{introductionContent.story.title}</span>
            </h2>
            <div className={styles.storyText}>
              {introductionContent.story.paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(paragraph) }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Visualized Content Section */}
        <section className={styles.visualizationGrid}>
          {introductionContent.cards.map((card, index) => (
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
            aria-label={introductionContent.cta.ariaLabel}
          >
            <FontAwesomeIcon
              icon={getIcon(introductionContent.cta.icon)}
              className={styles.ctaIcon}
              aria-hidden="true"
            />
            <span>{introductionContent.cta.label}</span>
            <div className={styles.buttonGlow} aria-hidden="true" />
          </button>
          <button className={styles.backButton} onClick={handleBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntroductionPage;
