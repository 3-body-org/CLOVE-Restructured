//react
import { useContext, useEffect } from "react";
//react router
import { useNavigate, useParams } from "react-router-dom";
//context
import { MyDeckContext } from "../../../context/ContextPage";
//react bootstrap
import {
  Container,
  Row,
  Col,
  Image,
  OverlayTrigger,
  Popover,
} from "react-bootstrap";
//scss
import styles from "../../../scss modules/pages/main page/mydeck page/SubtopicPage.module.scss";

// import background from "../../assets/images/SubtopicSelectionPage/loops background.svg";

import intro from "../../../assets/images/main page/mydeck page/subtopic page/intro.svg";
import subtopic1 from "../../../assets/images/main page/mydeck page/subtopic page/subtopic1.svg";
import subtopic2 from "../../../assets/images/main page/mydeck page/subtopic page/subtopic2.svg";
import subtopic3 from "../../../assets/images/main page/mydeck page/subtopic page/subtopic3.svg";

import rightPath from "../../../assets/images/main page/mydeck page/subtopic page/rightPath.svg";
import middlePath from "../../../assets/images/main page/mydeck page/subtopic page/middlePath.svg";
import leftPath from "../../../assets/images/main page/mydeck page/subtopic page/leftPath.svg";

import TitleAndProfile from "../../../components/navbar/TitleAndProfile";

const popoverContent = {
  intro: {
    id: "intro",
    title: "Introduction To Loops", // Added title field
    text: "Introduction to loops: why we use them.",
    time: "5 min",
    image: intro, // Reference to imported image
    path: rightPath, // Path decoration image
    requires: null, // No prerequisites
  },
  forloops: {
    id: "forloops",
    title: "For Loops",
    text: "For Loops: iterating with control.",
    time: "10 min",
    image: subtopic1,
    path: middlePath,
    requires: "intro", // Requires intro subtopic
  },
  whileloops: {
    id: "whileloops",
    title: "While Loops",
    text: "While Loops: condition-based repetition.",
    time: "8 min",
    image: subtopic2,
    path: leftPath,
    requires: "forloops",
  },
  nestedloops: {
    id: "nestedloops",
    title: "Nested Loops",
    text: "Nested Loops: loops inside loops.",
    time: "12 min",
    image: subtopic3,
    path: null,
    requires: "whileloops",
  },
};

export default function SubtopicSelectionPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { preAssessmentTaken, setTopicId, setSubtopicId, completedSubtopics } =
    useContext(MyDeckContext);

  // Update context with URL parameter
  useEffect(() => {
    setTopicId(topicId);
  }, [topicId, setTopicId]);

  const handleSubtopicClick = (subtopicKey) => {
    if (!preAssessmentTaken) {
      alert("Complete pre-assessment first!");
      return;
    }

    if (isSubtopicLocked(subtopicKey)) {
      alert(`Complete ${popoverContent[subtopicKey].requires} first!`);
      return;
    }

    const subtopic = popoverContent[subtopicKey];
    setSubtopicId(subtopic.id);
    navigate(`/lesson/${topicId}/${subtopic.id}`);
  };

  const getPreviousSubtopic = (currentKey) => {
    const keys = ["intro", "forloops", "whileloops", "nestedloops"];
    const index = keys.indexOf(currentKey);
    return index > 0 ? popoverContent[keys[index - 1]] : null;
  };

  const getSubtopicContent = (subtopicKey) => {
    return (
      popoverContent[subtopicKey] || {
        id: "unknown",
        text: "Content not available",
        time: "N/A",
      }
    );
  };

  const isSubtopicLocked = (subtopicKey) => {
    const required = popoverContent[subtopicKey]?.requires;
    return required && !completedSubtopics.includes(required);
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

  // Stars animation effect
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
      className={`${styles.topicDetailContent} ${styles.lessonWrapper} pt-2 m-0`}
    >
      <TitleAndProfile colored={"Loops"} />

      <div className={styles.stars} id="stars"></div>
      {/* <div className={`${styles.scrollableContainer}`}> */}
      <Row>
        <Col
          xs={12}
          className="text-center text-white p-3"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.1)", // Slight white overlay
            backdropFilter: "blur(3px)", // Blur effect
            borderRadius: "40px", // Rounded corners for a nice effect
          }}
        >
          <p
            className="ps-5 pe-5 pb-2 pt-2 p-0 m-0"
            style={{
              whiteSpace: "pre-wrap",
              textAlign: "justify",
              borderBottom: "2px dashed white",
              borderTop: "2px dashed white",
            }}
          >
            Welcome to CyberSpace Outpost Omega, a futuristic hub on the edge of
            space. Your mission is to restore power to the outpost’s failing
            energy grid and protect its data vaults. As a skilled
            cyber-engineer, your ability with loops is key to automating tasks
            and managing resources. The outpost’s smart systems are breaking
            down. With lights flickering and security failing, you must dive
            into the code, set up loops, and restore order before the colony’s
            important data is lost.
          </p>
        </Col>
      </Row>
      <Row>
        <Col
          xs={4}
          className="p-0 m-0  d-flex align-items-end justify-content-end "
        >
          <Image
            fluid
            src={rightPath}
            style={{ width: "200px", objectFit: "cover" }}
          />
        </Col>
        <Col xs={4} className="p-5 text-white text-center">
          <h5>Introduction To Loops</h5>
          <OverlayTrigger
            trigger={["hover", "focus"]}
            placement="top"
            overlay={renderPopover("intro")}
          >
            {/* <Image
                src={intro}
                fluid
                style={{
                  cursor: isSubtopicLocked(key) ? "not-allowed" : "pointer",
                  opacity: isSubtopicLocked(key) ? 0.5 : 1,
                }}
                onClick={() => handleSubtopicClick("intro")}
              /> */}
            <Image
              src={intro}
              fluid
              style={{
                cursor: isSubtopicLocked("intro") ? "not-allowed" : "pointer",
                opacity: isSubtopicLocked("intro") ? 0.5 : 1,
                filter: isSubtopicLocked("intro") ? "grayscale(1)" : "none",
              }}
              onClick={() =>
                !isSubtopicLocked("intro") && handleSubtopicClick("intro")
              }
            />
          </OverlayTrigger>
        </Col>
        <Col xs={4}></Col>
      </Row>
      <Row>
        <Col xs={4} className="p-5  text-white text-center">
          <h5>For Loops</h5>
          <OverlayTrigger
            trigger={["hover", "focus"]}
            placement="top"
            overlay={renderPopover("forloops")}
          >
            <Image
              src={subtopic1}
              fluid
              style={{
                cursor: isSubtopicLocked("forloops")
                  ? "not-allowed"
                  : "pointer",
                opacity: isSubtopicLocked("forloops") ? 0.5 : 1,
                filter: isSubtopicLocked("forloops") ? "grayscale(1)" : "none",
              }}
              onClick={() =>
                !isSubtopicLocked("forloops") && handleSubtopicClick("forloops")
              }
            />
          </OverlayTrigger>
        </Col>
        <Col
          xs={4}
          className="pt-5 p-0 m-0  d-flex align-items-end justify-content-start"
        >
          <Image
            fluid
            src={middlePath}
            style={{ width: "300px", objectFit: "cover" }}
          />
        </Col>
        <Col xs={4}></Col>
      </Row>
      <Row>
        <Col xs={4}></Col>
        <Col xs={4} className="p-5  text-white text-center">
          <h5>While Loops</h5>
          <OverlayTrigger
            trigger={["hover", "focus"]}
            placement="top"
            overlay={renderPopover("whileloops")}
          >
            <Image
              src={subtopic2}
              fluid
              style={{
                cursor: isSubtopicLocked("whileloops")
                  ? "not-allowed"
                  : "pointer",
                opacity: isSubtopicLocked("whileloops") ? 0.5 : 1,
                filter: isSubtopicLocked("whileloops")
                  ? "grayscale(1)"
                  : "none",
              }}
              onClick={() =>
                !isSubtopicLocked("whileloops") &&
                handleSubtopicClick("whileloops")
              }
            />
          </OverlayTrigger>
        </Col>
        <Col xs={4} className="pt-5 p-0 m-0  d-flex align-items-end">
          <Image
            fluid
            src={leftPath}
            style={{ width: "120px", objectFit: "cover" }}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={4}></Col>
        <Col xs={4}></Col>
        <Col xs={4} className="p-5 text-white text-center">
          <h5>Nested Loops</h5>
          <OverlayTrigger
            trigger={["hover", "focus"]}
            placement="top"
            overlay={renderPopover("nestedloops")}
          >
            <Image
              src={subtopic3}
              fluid
              style={{
                cursor: isSubtopicLocked("nestedloops")
                  ? "not-allowed"
                  : "pointer",
                opacity: isSubtopicLocked("nestedloops") ? 0.5 : 1,
                filter: isSubtopicLocked("nestedloops")
                  ? "grayscale(1)"
                  : "none",
              }}
              onClick={() =>
                !isSubtopicLocked("nestedloops") &&
                handleSubtopicClick("nestedloops")
              }
            />
          </OverlayTrigger>
        </Col>
      </Row>
    </Container>
  );
}
