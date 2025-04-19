//react
import React, { useState, useCallback, useContext } from "react";
//contex
import { MyDeckContext } from "../../../context/ContextPage";
//react router
import { useNavigate } from "react-router-dom";
//bootstrap
import { Container, Row, Col } from "react-bootstrap";
//scss
import styles from "../../../scss modules/pages/main page/mydeck page/TopicPage.module.scss";
//components
import TitleAndProfile from "../../../components/navbar/TitleAndProfile";

// Sample Topics data
const topicsData = [
  {
    id: "topic1",
    name: "Variables and Data Types",
    description: "Learn about Java concepts.",
    locked: false,
  },
  {
    id: "topic2",
    name: "Coming Soon",
    description: "Learn about Java concepts.",
    locked: true,
  },
  {
    id: "topic3",
    name: "Coming Soon",
    description: "Learn about Java concepts.",
    locked: true,
  },
  {
    id: "topic4",
    name: "Coming Soon",
    description: "Learn about Java concepts.",
    locked: true,
  },
  {
    id: "topic5",
    name: "Coming Soon",
    description: "Learn about Java concepts.",
    locked: true,
  },
];

const TopicCard = React.memo(({ topic, onClick }) => (
  <Col
    sm={6}
    md={4}
    lg={3}
    className={`${styles.floatCard} ${
      topic.locked ? styles.lockedCard : ""
    } p-0 mt-3`}
  >
    <div className={styles.holographicEffect}></div>
    <div className={styles.cardContent}>
      <h2 className={styles.cardTitle}>{topic.name}</h2>
      <p className={styles.cardDesc}>{topic.description}</p>
      <div className={styles.cardProgress}>
        <div className={styles.progressFill}></div>
      </div>
      <button
        className={styles.startButton}
        disabled={topic.locked}
        onClick={() => onClick(topic)}
      >
        {topic.locked ? "Locked" : "Continue Learning"}
      </button>
    </div>
    {topic.locked && <div className={styles.lockedIcon}>🔒</div>}
  </Col>
));

export default function MyDeckPage() {
  const navigate = useNavigate();
  const { preAssessmentTaken } = useContext(MyDeckContext);

  // Check if the pre-assessment is taken for the topic
  const handleTopicClick = useCallback(
    (topic) => {
      console.log(preAssessmentTaken); // Check the value of preAssessmentTaken
      console.log("Topic clicked:", topic); // Check the topic details

      if (!preAssessmentTaken[topic.id]) {
        // If pre-assessment has not been taken for the topic, redirect to pre-assessment
        navigate(`/my-deck/${topic.id}/pre-assessment`);
      } else {
        // If pre-assessment has been taken, navigate to the lesson page
        navigate(`/my-deck/${topic.id}`);
      }
    },
    [navigate, preAssessmentTaken]
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
