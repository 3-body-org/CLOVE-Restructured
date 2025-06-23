import React, {
  useEffect,
  useContext,
  useCallback,
  useRef,
  useMemo,
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
import { topicsData } from "features/mydeck/data/topics";
import { getThemeContent, iconMap } from "features/mydeck/content/themeContent";
import styles from "features/mydeck/styles/IntroductionPage.module.scss";

const Introduction = () => {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const { setTopicId } = useContext(MyDeckContext);
  const canvasRef = useRef(null);

  // Initialize theme (defaults to 'space' theme)
  const { currentTheme, setTheme } = useTheme();
  const isSpaceTheme = currentTheme === 'space';
  const isWizardTheme = currentTheme === 'wizard';
  const isDetectiveTheme = currentTheme === 'detective';

  // Get theme from topic or use default
  useEffect(() => {
    if (topicId) {
      const topic = topicsData.find((t) => t.id === topicId);
      const themeForTopic = topic ? topic.theme : "space";
      setTheme(themeForTopic);
    }
  }, [topicId, setTheme]);

  // Add theme class to body
  useEffect(() => {
    document.body.classList.add(`theme-${currentTheme}`);
    return () => {
      document.body.classList.remove(`theme-${currentTheme}`);
    };
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

  const handleStartTraining = useCallback(() => {
    if (topicId) {
      navigate(`/my-deck/${topicId}`);
    }
  }, [navigate, topicId]);

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
