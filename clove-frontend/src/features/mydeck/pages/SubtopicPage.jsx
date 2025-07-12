import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MyDeckContext } from "../../../contexts/MyDeckContext";
import useTheme from "../hooks/useTheme";
import { Container, Row, Col } from "react-bootstrap";
import styles from "../styles/SubtopicPage.module.scss";
import { getSubtopicContent } from "../content/subtopicContent";
import SubtopicLayout from "../components/SubtopicLayout";
import TitleAndProfile from "../../../components/layout/Navbar/TitleAndProfile";
import ThemeBackground from "../components/ThemeBackground";
import LoadingScreen from "components/layout/StatusScreen/LoadingScreen";
import ErrorScreen from "components/layout/StatusScreen/ErrorScreen";

const topicThemeMap = {
  'data-types-and-variables': 'wizard',
  'operators': 'detective',
  'conditional-and-loops': 'space',
};

export default function SubtopicSelectionPage() {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const { setTheme, currentTheme } = useTheme();
  const {
    preAssessmentTaken,
    setPreAssessmentTaken,
    setTopicId,
    setSubtopicId,
    completedSubtopics,
    setCompletedSubtopics,
  } = useContext(MyDeckContext);
  const [loading, setLoading] = useState(true);
  const [error] = useState("");

  const topicSlug = topicId ? topicId.split('-').slice(1).join('-') : '';
  const theme = topicThemeMap[topicSlug] || 'space';
  const { story, subtopics } = getSubtopicContent(theme);

  useEffect(() => {
    if (topicId) {
      setTopicId(topicId);
      setTheme(theme);
    }
  }, [topicId, setTopicId, setTheme, theme]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [topicId]);

  useEffect(() => {
    const savedPreAssessment = localStorage.getItem("preAssessmentTaken");
    if (savedPreAssessment) {
      setPreAssessmentTaken(JSON.parse(savedPreAssessment));
    }
  }, [setPreAssessmentTaken]);

  const handleSubtopicClick = (subtopic) => {
    const subtopicKey = Object.keys(subtopics).find(
      key => subtopics[key].id === subtopic.id
    );
    if (subtopic.id === "preassessment") {
      setPreAssessmentTaken(true);
      localStorage.setItem("preAssessmentTaken", JSON.stringify(true));
      navigate(`/my-deck/${topicId}/assessment/pre`);
      return;
    }
    if (subtopic.id === "postassessment") {
      navigate(`/my-deck/${topicId}/assessment/post`);
      return;
    }
    if (isSubtopicLocked(subtopic)) {
      alert(`Complete "${subtopic.requires}" first!`);
      return;
    }
    setSubtopicId(subtopic.id);
    if (!completedSubtopics.includes(subtopicKey)) {
      const updatedCompleted = [...completedSubtopics, subtopicKey];
      setCompletedSubtopics(updatedCompleted);
      localStorage.setItem(
        "completedSubtopics",
        JSON.stringify(updatedCompleted)
      );
    }
    navigate(`/lesson/${topicId}/${subtopic.id}`);
  };

  const isSubtopicLocked = (subtopic) => {
    const required = subtopic.requires;
    if (!required) return false;
    if (required === "pre-assessment") {
      return !preAssessmentTaken;
    }
    const requiredKey = Object.keys(subtopics).find(
      key => subtopics[key].id === required
    );
    return !completedSubtopics.includes(requiredKey);
  };

  const getThemeClass = () => {
    switch (currentTheme) {
      case 'space':
        return styles.spaceTheme;
      case 'wizard':
        return styles.wizardTheme;
      case 'detective':
        return styles.detectiveTheme;
      default:
        return '';
    }
  };

  if (loading) return <LoadingScreen message="Loading subtopic..." />;
  if (error) return <ErrorScreen message={error} />;

  return (
    <Container
      fluid
      className={`${styles.myDeckWrapper} ${styles.lessonWrapper} ${getThemeClass()}`}
    >
      <ThemeBackground theme={theme} />
      <TitleAndProfile colored={story.title} />
      <Row>
        <Col
          xs={12}
          className={`text-center text-white p-3 ${styles.briefContainer}`}
        >
          <p className={`ps-5 pe-5 pb-2 pt-2 p-0 m-0 ${styles.briefText}`}>
            {story.description}
          </p>
        </Col>
      </Row>
      {Object.entries(subtopics).map(([key, subtopic]) => (
        <SubtopicLayout
          key={key}
          subtopic={subtopic}
          isLocked={isSubtopicLocked(subtopic)}
          onSubtopicClick={handleSubtopicClick}
          position={subtopic.position}
        />
      ))}
    </Container>
  );
}