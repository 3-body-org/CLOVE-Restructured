/**
 * @file TopicPage.jsx
 * @description Topic selection page for MyDeck. Shows all topics as cards with progress and theme-aware styles.
 */

import React, { useCallback, useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import TitleAndProfile from "../../../components/layout/Navbar/TitleAndProfile";
import TopicCard from "../components/TopicCard";
import LoadingScreen from "components/layout/StatusScreen/LoadingScreen";
import ErrorScreen from "components/layout/StatusScreen/ErrorScreen";
import { useMyDeckService } from "../hooks/useMydeckService";
import styles from "../styles/TopicPage.module.scss";
import spaceTheme from "../themes/spaceTheme.module.scss";
import wizardTheme from "../themes/wizardTheme.module.scss";
import detectiveTheme from "../themes/detectiveTheme.module.scss";
import { MyDeckContext } from "../../../contexts/MyDeckContext";

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
  const { getTopicsWithProgress, getTopicById } = useMyDeckService();
  const { topics, setTopics } = useContext(MyDeckContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          }
        })
        .catch((error) => {
          if (mounted) {
            console.error("Failed to load topics:", error);
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
  }, [topics, setTopics, getTopicsWithProgress]);

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
      const res = await getTopicById(topic.id);
      if (res.introduction_seen) {
        navigate(`/my-deck/${topic.id}-${topic.slug}`);
      } else {
        navigate(`/my-deck/${topic.id}-${topic.slug}/introduction`);
      }
    },
    [navigate, getTopicById]
  );

  if (loading) return <LoadingScreen message="Loading topics..." />;
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
            ...topics.map(topic => ({ type: "topic", topic, theme: topic.theme })),
            { type: "comingSoon" }
          ].map((card, idx) =>
            card.type === "topic" ? (
              <TopicCard
                key={card.topic.id}
                topic={card.topic}
                onClick={handleTopicClick}
                themeStyles={getThemeStyles(card.theme)}
              />
            ) : (
              <TopicCard
                key="coming-soon"
                comingSoon={true}
                themeStyles={THEMES.default}
              />
            )
          )
        )}
      </div>
    </Container>
  );
};

TopicPage.propTypes = {};

export default TopicPage;
