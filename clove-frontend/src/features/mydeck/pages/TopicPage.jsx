// react
import React, { useCallback, useState, useEffect, useContext } from "react";
// react router
import { useNavigate } from "react-router-dom";
// bootstrap
import { Container, Row } from "react-bootstrap";
// components
import TitleAndProfile from "../../../components/layout/Navbar/TitleAndProfile";
import TopicCard from "../components/TopicCard";
import LoadingScreen from "components/layout/StatusScreen/LoadingScreen";
import ErrorScreen from "components/layout/StatusScreen/ErrorScreen";
// services
import { useMyDeckApi } from "../hooks/useMyDeckApi";
// styles
import styles from "../styles/TopicPage.module.scss";
import spaceTheme from "../themes/spaceTheme.module.scss";
import wizardTheme from "../themes/wizardTheme.module.scss";
import detectiveTheme from "../themes/detectiveTheme.module.scss";
import { MyDeckContext } from "../../../contexts/MyDeckContext";

// Theme mapping
const THEMES = {
  space: { ...styles, ...spaceTheme },
  wizard: { ...styles, ...wizardTheme },
  detective: { ...styles, ...detectiveTheme },
  default: styles,
};

export default function TopicPage() {
  const navigate = useNavigate();
  const { getTopicsWithProgress, getTopicById, updateRecentTopic } = useMyDeckApi();
  const { topics, setTopics } = useContext(MyDeckContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add a short guaranteed loading effect
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

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

  // Get theme styles based on topic
  const getThemeStyles = (themeName = "default") => {
    const themeStyles = THEMES[themeName] || THEMES.default;
    return themeStyles;
  };

  const handleTopicClick = useCallback(
    async (topic) => {
      try {
        // Update recent topic and fetch the latest topic state from backend
        await Promise.all([
          updateRecentTopic(topic.id),
          getTopicById(topic.id)
        ]).then(([_, res]) => {
          if (res.introduction_seen) {
            navigate(`/my-deck/${topic.id}-${topic.slug}`);
          } else {
            navigate(`/my-deck/${topic.id}-${topic.slug}/introduction`);
          }
        });
      } catch (error) {
        console.error("Failed to handle topic click:", error);
        // Fallback navigation if update fails
        navigate(`/my-deck/${topic.id}-${topic.slug}/introduction`);
      }
    },
    [navigate, getTopicById, updateRecentTopic]
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
}
