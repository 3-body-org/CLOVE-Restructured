// react
import React, { useCallback } from "react";
// react router
import { useNavigate } from "react-router-dom";
// bootstrap
import { Container, Row } from "react-bootstrap";
// components
import TitleAndProfile from "../../../components/layout/Navbar/TitleAndProfile";
import TopicCard from "../components/TopicCard";
// data
import { topicsData } from "../data/topics";
// styles
import styles from "../styles/TopicPage.module.scss";
import spaceTheme from "../themes/spaceTheme.module.scss";
import wizardTheme from "../themes/wizardTheme.module.scss";
import detectiveTheme from "../themes/detectiveTheme.module.scss";

// Theme mapping
const THEMES = {
  space: { ...styles, ...spaceTheme },
  wizard: { ...styles, ...wizardTheme },
  detective: { ...styles, ...detectiveTheme },
  default: styles,
};

export default function TopicPage() {
  const navigate = useNavigate();

  // Get theme styles based on topic
  const getThemeStyles = (themeName = "default") => {
    const themeStyles = THEMES[themeName] || THEMES.default;
    return themeStyles;
  };

  const handleTopicClick = useCallback(
    (topic) => {
      navigate(`/my-deck/${topic.id}/introduction`);
    },
    [navigate]
  );

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
        {topicsData.map((topic) => {
          const themeStyles = getThemeStyles(topic.theme);
          return (
            <TopicCard
              key={topic.id}
              topic={topic}
              onClick={handleTopicClick}
              themeStyles={themeStyles}
            />
          );
        })}
      </div>
    </Container>
  );
}
