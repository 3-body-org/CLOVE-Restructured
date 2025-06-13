//react
import React, { useCallback } from "react";
//react router
import { useNavigate } from "react-router-dom";
//bootstrap
import { Container, Row, Col } from "react-bootstrap";
//scss
import styles from "features/mydeck/styles/TopicPage.module.scss";
//components
import TitleAndProfile from "components/layout/Navbar/TitleAndProfile";

// Sample Topics data
const topicsData = [
  {
    id: "topic1",
    name: "Variables and Data Types",
    description:
      "Java’s foundational elements: declaring variables, primitive types, and non-primitive.",
    progress: 0,
    locked: false,
  },
  {
    id: "topic2",
    name: "Coming Soon",
    description: "Learn about Java concepts.",
    progress: 0,
    locked: true,
  },
  {
    id: "topic3",
    name: "Coming Soon",
    description: "Learn about Java concepts.",
    progress: 0,
    locked: true,
  },
  {
    id: "topic4",
    name: "Coming Soon",
    description: "Learn about Java concepts.",
    progress: 0,
    locked: true,
  },
  {
    id: "topic5",
    name: "Coming Soon",
    description: "Learn about Java concepts.",
    progress: 0,
    locked: true,
  },
];

const TopicCard = React.memo(({ topic, onClick }) => (
  <Col
    xs={12}
    sm={6}
    md={4}
    lg={3}
    className={`${styles.floatCard} ${topic.locked ? styles.lockedCard : ""}`}
  >
    <div
      className={`${styles.holographicEffect} ${
        topic.locked ? styles.lockedEffect : ""
      }`}
    ></div>
    <div className={styles.cardContent}>
      <h2 className={styles.cardTitle}>{topic.name}</h2>
      <p className={styles.cardDesc}>{topic.description}</p>

      {/* Progress Bar Section */}
      <div className={styles.cardProgress}>
        <div
          className={styles.progressFill}
          style={{ width: `${topic.progress}%` }}
        ></div>
      </div>

      <button
        className={`${styles.startButton} ${
          topic.locked ? styles.lockedButton : ""
        }`}
        disabled={topic.locked}
        onClick={() => onClick(topic)}
      >
        {topic.locked ? "Coming Soon" : "Continue Learning"}
      </button>
    </div>
    {topic.locked && <div className={styles.lockedIcon}>🔒</div>}
  </Col>
));

export default function TopicPage() {
  const navigate = useNavigate();

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
        {topicsData.map((topic) => (
          <TopicCard key={topic.id} topic={topic} onClick={handleTopicClick} />
        ))}
      </div>
    </Container>
  );
}
