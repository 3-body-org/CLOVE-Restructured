import React, { useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MyDeckContext } from "contexts/MyDeckContext";
import {
  Container,
  Row,
  Col,
  Image,
  OverlayTrigger,
  Popover,
} from "react-bootstrap";
import styles from "features/mydeck/styles/SubtopicPage.module.scss";

//these assests should probably be provided by data base? through path, based on anong topic napili
import assessment from "assets/icons/loops/icon-subtopic-assessment.svg";
import subtopic1 from "assets/icons/loops/icon-subtopic-1.svg";
import subtopic2 from "assets/icons/loops/icon-subtopic-2.svg";
import subtopic3 from "assets/icons/loops/icon-subtopic-3.svg";

import rightPath from "assets/icons/loops/icon-subtopic-right-path.svg";
import middlePath from "assets/icons/loops/icon-subtopic-middle-path.svg";
import leftPath from "assets/icons/loops/icon-subtopic-left-path.svg";

import TitleAndProfile from "components/layout/Navbar/TitleAndProfile";

const popoverContent = {
  "Pre-Assessment Test": {
    id: "preassessment",
    title: "Pre-assessment Test",
    text: "Test your knowledge before starting the course.",
    time: "5 min",
    image: assessment,
    path: rightPath,
    requires: null,
  },
  "Declaring Variables": {
    id: "declaringvariables",
    title: "Declaring Variables",
    text: "Declaring Variables: assigning values to variables.",
    time: "10 min",
    image: subtopic1,
    path: middlePath,
    requires: "Pre-Assessment Test",
  },
  "Primitive Data Types": {
    id: "primitivedatatypes",
    title: "Primitive Data Types",
    text: "Primitive Data Types: numbers, strings, booleans.",
    time: "8 min",
    image: subtopic2,
    path: leftPath,
    requires: "Declaring Variables",
  },
  "Non-Primitive Data Types": {
    id: "nonprimitivedatatypes",
    title: "Non-Primitive Data Types",
    text: "Non-Primitive Data Types: arrays, objects, functions.",
    time: "12 min",
    image: subtopic3,
    path: rightPath,
    requires: "Primitive Data Types",
  },
  "Post-Assessment Test": {
    id: "postassessment",
    title: "Post-assessment Test",
    text: "Test your knowledge after completing the course.",
    time: "5 min",
    image: assessment,
    path: null,
    requires: null,
  },
};

export default function SubtopicSelectionPage() {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const {
    preAssessmentTaken,
    setPreAssessmentTaken,
    setTopicId,
    setSubtopicId,
    completedSubtopics,
    setCompletedSubtopics,
  } = useContext(MyDeckContext);

  useEffect(() => {
    setTopicId(topicId);
  }, [topicId, setTopicId]);

  // Add localStorage sync for pre-assessment status
  useEffect(() => {
    const savedPreAssessment = localStorage.getItem("preAssessmentTaken");
    if (savedPreAssessment) {
      setPreAssessmentTaken(JSON.parse(savedPreAssessment));
    }
  }, [setPreAssessmentTaken]);

  const handleSubtopicClick = (subtopicKey) => {
    const subtopic = popoverContent[subtopicKey];

    if (subtopicKey === "Pre-Assessment Test") {
      // Set pre-assessment as taken when starting it
      setPreAssessmentTaken(true);
      localStorage.setItem("preAssessmentTaken", JSON.stringify(true));
      navigate(`/my-deck/${topicId}/assessment`);
      return;
    }

    if (subtopicKey === "Post-Assessment Test") {
      navigate(`/my-deck/${topicId}/assessment`);
      return;
    }

    if (isSubtopicLocked(subtopicKey)) {
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

  const isSubtopicLocked = (subtopicKey) => {
    const required = popoverContent[subtopicKey]?.requires;
    if (!required) return false;

    // Check for pre-assessment requirement
    if (required === "Pre-Assessment Test") {
      return !preAssessmentTaken;
    }

    // Check for other dependencies
    return !completedSubtopics.includes(required);
  };

  const renderPopover = (subtopicKey) => {
    const content = popoverContent[subtopicKey] || {};
    return (
      <Popover id={`popover-${subtopicKey}`}>
        <Popover.Body>
          <strong>{content.text}</strong>
          <br />⏳ Estimated Time: {content.time}
          {isSubtopicLocked(subtopicKey) && (
            <div className={styles.lockedHint}>
              🔒 Requires {content.requires}
            </div>
          )}
        </Popover.Body>
      </Popover>
    );
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
    >
      <TitleAndProfile colored={"Variables and Data Types"} />

      <div className={styles.stars} id="stars"></div>

      <Row>
        <Col
          xs={12}
          className={`text-center text-white p-3 ${styles.briefContainer}`}
        >
          <p className={`ps-5 pe-5 pb-2 pt-2 p-0 m-0 ${styles.briefText}`}>
            Welcome to CyberSpace Outpost Omega, a futuristic hub on the edge of
            space. Your mission is to restore power to the outpost's failing
            energy grid and protect its data vaults...
          </p>
        </Col>
      </Row>

      {/* Pre-Assessment Test */}
      <Row className={styles.subtopicRow}>
        <Col
          xs={4}
          className="p-0 m-0 d-flex align-items-end justify-content-end"
        >
          <Image
            fluid
            src={popoverContent["Pre-Assessment Test"].path}
            className={styles.pathImage}
          />
        </Col>
        <Col xs={4} className="p-5 text-white text-center">
          <h5>{popoverContent["Pre-Assessment Test"].title}</h5>
          <OverlayTrigger
            trigger={["hover", "focus"]}
            placement="top"
            overlay={renderPopover("Pre-Assessment Test")}
          >
            <Image
              src={popoverContent["Pre-Assessment Test"].image}
              fluid
              className={styles.subtopicImage}
              onClick={() => handleSubtopicClick("Pre-Assessment Test")}
            />
          </OverlayTrigger>
        </Col>
        <Col xs={4}></Col>
      </Row>

      {/* Declaring Variables */}
      <Row className={styles.subtopicRow}>
        <Col xs={4} className="p-5 text-white text-center">
          <h5>{popoverContent["Declaring Variables"].title}</h5>
          <OverlayTrigger
            trigger={["hover", "focus"]}
            placement="top"
            overlay={renderPopover("Declaring Variables")}
          >
            <Image
              src={popoverContent["Declaring Variables"].image}
              fluid
              className={`${styles.subtopicImage} ${
                isSubtopicLocked("Declaring Variables")
                  ? styles.lockedImage
                  : ""
              }`}
              onClick={() => handleSubtopicClick("Declaring Variables")}
            />
          </OverlayTrigger>
        </Col>
        <Col
          xs={4}
          className="pt-5 p-0 m-0 d-flex align-items-end justify-content-start"
        >
          <Image
            fluid
            src={popoverContent["Declaring Variables"].path}
            className={styles.pathImage}
          />
        </Col>
        <Col xs={4}></Col>
      </Row>

      {/* Primitive Data Types */}
      <Row className={styles.subtopicRow}>
        <Col xs={4}></Col>
        <Col xs={4} className="p-5 text-white text-center">
          <h5>{popoverContent["Primitive Data Types"].title}</h5>
          <OverlayTrigger
            trigger={["hover", "focus"]}
            placement="top"
            overlay={renderPopover("Primitive Data Types")}
          >
            <Image
              src={popoverContent["Primitive Data Types"].image}
              fluid
              className={`${styles.subtopicImage} ${
                isSubtopicLocked("Primitive Data Types")
                  ? styles.lockedImage
                  : ""
              }`}
              onClick={() => handleSubtopicClick("Primitive Data Types")}
            />
          </OverlayTrigger>
        </Col>
        <Col xs={4} className="pt-5 p-0 m-0 d-flex align-items-end">
          <Image
            fluid
            src={popoverContent["Primitive Data Types"].path}
            className={styles.pathImage}
          />
        </Col>
      </Row>

      {/* Non-Primitive Data Types */}
      <Row className={styles.subtopicRow}>
        <Col xs={4}></Col>
        <Col
          xs={4}
          className="p-0 m-0 d-flex align-items-end justify-content-end"
        >
          <Image
            fluid
            src={popoverContent["Pre-Assessment Test"].path}
            className={styles.pathImage}
          />
        </Col>
        <Col xs={4} className="p-5 text-white text-center">
          <h5>{popoverContent["Non-Primitive Data Types"].title}</h5>
          <OverlayTrigger
            trigger={["hover", "focus"]}
            placement="top"
            overlay={renderPopover("Non-Primitive Data Types")}
          >
            <Image
              src={popoverContent["Non-Primitive Data Types"].image}
              fluid
              className={`${styles.subtopicImage} ${
                isSubtopicLocked("Non-Primitive Data Types")
                  ? styles.lockedImage
                  : ""
              }`}
              onClick={() => handleSubtopicClick("Non-Primitive Data Types")}
            />
          </OverlayTrigger>
        </Col>
      </Row>

      {/* Post-Assessment Test */}
      <Row className={styles.subtopicRow}>
        <Col xs={4}></Col>
        <Col xs={4} className="p-5 text-white text-center">
          <h5>{popoverContent["Post-Assessment Test"].title}</h5>
          <OverlayTrigger
            trigger={["hover", "focus"]}
            placement="top"
            overlay={renderPopover("Post-Assessment Test")}
          >
            <Image
              src={popoverContent["Post-Assessment Test"].image}
              fluid
              className={styles.subtopicImage}
              onClick={() => handleSubtopicClick("Post-Assessment Test")}
            />
          </OverlayTrigger>
        </Col>
        <Col xs={4}></Col>
      </Row>
    </Container>
  );
}
