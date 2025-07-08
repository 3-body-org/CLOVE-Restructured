import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MyDeckContext } from "../../../contexts/MyDeckContext";
import useTheme from "../hooks/useTheme";
import { Container, Row, Col } from "react-bootstrap";
import styles from "../styles/SubtopicPage.module.scss";
import { getSubtopicContent } from "../content/subtopicContent";
import SubtopicLayout from "../components/SubtopicLayout";
import TitleAndProfile from "../../../components/layout/Navbar/TitleAndProfile";
import RainfallBackground from '../components/RainfallBackground';
import RuneBackground from '../components/RuneBackground';

// Map topic IDs to their corresponding themes
const topicThemeMap = {
  // Data Types and Variables
  'data-types': 'wizard',
  'variables': 'wizard',
  // Operators
  'operators': 'detective',
  // Conditionals and Loops
  'conditionals': 'space',
  'loops': 'space',
  // Add more topicId to theme mappings as needed
};

const effectComponents = {
  stars: () => <div className={styles.stars} id="stars"></div>,
  starfield: () => <div className={styles.stars} id="stars"></div>,
  fog: () => <RainfallBackground />, // fallback for detective
  rainfall: () => <RainfallBackground />,
  runes: () => <RuneBackground />,
  runeGlow: () => <RuneBackground glow />,
};

export default function SubtopicSelectionPage() {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const { setTheme } = useTheme();
  const {
    preAssessmentTaken,
    setPreAssessmentTaken,
    setTopicId,
    setSubtopicId,
    completedSubtopics,
    setCompletedSubtopics,
  } = useContext(MyDeckContext);

  // Add theme switcher for demo
  const [demoTheme, setDemoTheme] = useState("");
  const themeOptions = [
    { label: "Wizard", value: "wizard" },
    { label: "Detective", value: "detective" },
    { label: "Space", value: "space" },
    { label: "Default", value: "default" },
  ];

  // Get theme and content
  const theme = demoTheme || topicThemeMap[topicId] || 'default';
  const { story, subtopics, styling, layout } = getSubtopicContent(theme);
  const EffectComponent = effectComponents[styling?.background] || effectComponents[styling?.effect] || null;

  // Set topic ID and theme when topic changes
  useEffect(() => {
    if (topicId) {
      setTopicId(topicId);
      setTheme(theme);
    }
  }, [topicId, setTopicId, setTheme, theme]);

  // Add localStorage sync for pre-assessment status
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
      // Set pre-assessment as taken when starting it
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

    // Update completed subtopics
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

    // Check for pre-assessment requirement
    if (required === "pre-assessment") {
      return !preAssessmentTaken;
    }

    // Check for other dependencies
    const requiredKey = Object.keys(subtopics).find(
      key => subtopics[key].id === required
    );
    return !completedSubtopics.includes(requiredKey);
  };

  useEffect(() => {
    const createStars = () => {
      const stars = document.getElementById("stars");
      if (!stars) return;

      stars.innerHTML = "";

      for (let i = 0; i < 200; i++) {
        const star = document.createElement("div");
        star.style.position = "absolute";
        star.style.width = `${Math.random() * 3}px`;
        star.style.height = star.style.width;
        star.style.backgroundColor = "white";
        star.style.borderRadius = "50%";
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.opacity = Math.random();
        star.style.animation = `twinkle ${
          2 + Math.random() * 3
        }s infinite alternate`;
        stars.appendChild(star);
      }
    };

    createStars();
  }, []);

  return (
    <Container
      fluid
      className={`${styles.myDeckWrapper} ${styles.lessonWrapper}`}
      style={{
        background: styling?.colors?.bg,
        color: styling?.colors?.text,
        transition: 'background 0.5s cubic-bezier(0.4,0,0.2,1)',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Theme Switcher for Demo */}
      <div style={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
        <select
          value={demoTheme}
          onChange={e => setDemoTheme(e.target.value)}
          style={{ padding: '8px 16px', borderRadius: 8, fontSize: 16 }}
        >
          <option value="">(Theme by Topic)</option>
          {themeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <TitleAndProfile colored={story.title} />
      {EffectComponent && <EffectComponent />}

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

      {/* Render all subtopics using the new layout system */}
      {layout.map((row, rowIndex) => (
        <SubtopicLayout
          key={rowIndex}
          subtopicKeys={row}
          subtopics={subtopics}
          isSubtopicLocked={isSubtopicLocked}
          onSubtopicClick={handleSubtopicClick}
          theme={theme}
        />
      ))}
    </Container>
  );
}