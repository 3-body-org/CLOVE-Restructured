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

import assessment from "../../../assets/images/main page/mydeck page/subtopic page/assessment.svg";
import subtopic1 from "../../../assets/images/main page/mydeck page/subtopic page/subtopic1.svg";
import subtopic2 from "../../../assets/images/main page/mydeck page/subtopic page/subtopic2.svg";
import subtopic3 from "../../../assets/images/main page/mydeck page/subtopic page/subtopic3.svg";

import rightPath from "../../../assets/images/main page/mydeck page/subtopic page/rightPath.svg";
import middlePath from "../../../assets/images/main page/mydeck page/subtopic page/middlePath.svg";
import leftPath from "../../../assets/images/main page/mydeck page/subtopic page/leftPath.svg";

import TitleAndProfile from "../../../components/navbar/TitleAndProfile";

const popoverContent = {
  "Pre-Assessment Test": {
    id: "preassessment",
    title: "Pre-assessment Test", // Added title field
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
    requires: "Pre-Assessment Test", // Requires intro subtopic
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
    path: null,
    requires: "Primitive Data Types",
  },
};

export default function SubtopicSelectionPage() {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const { preAssessmentTaken, setTopicId, setSubtopicId, completedSubtopics } =
    useContext(MyDeckContext);

  // Update context with URL parameter
  useEffect(() => {
    setTopicId(topicId);
  }, [topicId, setTopicId]);

  const handleSubtopicClick = (subtopicKey) => {
    const subtopic = popoverContent[subtopicKey];
    
    if (subtopicKey === "Pre-Assessment Test") {
      navigate(`/my-deck/${topicId}/assessment`);
      return;
    }
  
    if (isSubtopicLocked(subtopicKey)) {
      alert(`Complete "${subtopic.requires}" first!`);
      return;
    }
  
    if (!completedSubtopics.includes(subtopicKey)) {
      const updatedCompleted = [...completedSubtopics, subtopicKey];
      setCompletedSubtopics(updatedCompleted);
      localStorage.setItem("completedSubtopics", JSON.stringify(updatedCompleted));
    }
    
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
    if (!required) return false;
    
    if (required === "Pre-Assessment Test") {
      return !preAssessmentTaken;
    }
    
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
      className={`${styles.myDeckWrapper} ${styles.topicDetailContent} ${styles.lessonWrapper} pt-2 m-0`}
    >
      <TitleAndProfile colored={"Variables and Data Types"} />
  
      <div className={styles.stars} id="stars"></div>
  
      <Row>
        <Col
          xs={12}
          className="text-center text-white p-3"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(3px)",
            borderRadius: "40px",
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
            energy grid and protect its data vaults...
          </p>
        </Col>
      </Row>
  
      {/* Pre-Assessment Test */}
      <Row>
        <Col xs={4} className="p-0 m-0 d-flex align-items-end justify-content-end">
          <Image fluid src={popoverContent["Pre-Assessment Test"].path} style={{ width: "200px" }} />
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
              style={{
                cursor: "pointer",
                opacity: 1,
              }}
              onClick={() => handleSubtopicClick("Pre-Assessment Test")}
            />
          </OverlayTrigger>
        </Col>
        <Col xs={4}></Col>
      </Row>
  
      {/* Declaring Variables */}
      <Row>
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
              style={{
                cursor: isSubtopicLocked("Declaring Variables") ? "not-allowed" : "pointer",
                opacity: isSubtopicLocked("Declaring Variables") ? 0.5 : 1,
                filter: isSubtopicLocked("Declaring Variables") ? "grayscale(1)" : "none",
              }}
              onClick={() =>
                !isSubtopicLocked("Declaring Variables") &&
                handleSubtopicClick("Declaring Variables")
              }
            />
          </OverlayTrigger>
        </Col>
        <Col xs={4} className="pt-5 p-0 m-0 d-flex align-items-end justify-content-start">
          <Image
            fluid
            src={popoverContent["Declaring Variables"].path}
            style={{ width: "300px", objectFit: "cover" }}
          />
        </Col>
        <Col xs={4}></Col>
      </Row>
  
      {/* Primitive Data Types */}
      <Row>
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
              style={{
                cursor: isSubtopicLocked("Primitive Data Types") ? "not-allowed" : "pointer",
                opacity: isSubtopicLocked("Primitive Data Types") ? 0.5 : 1,
                filter: isSubtopicLocked("Primitive Data Types") ? "grayscale(1)" : "none",
              }}
              onClick={() =>
                !isSubtopicLocked("Primitive Data Types") &&
                handleSubtopicClick("Primitive Data Types")
              }
            />
          </OverlayTrigger>
        </Col>
        <Col xs={4} className="pt-5 p-0 m-0 d-flex align-items-end">
          <Image
            fluid
            src={popoverContent["Primitive Data Types"].path}
            style={{ width: "120px", objectFit: "cover" }}
          />
        </Col>
      </Row>
  
      {/* Non-Primitive Data Types */}
      <Row>
        <Col xs={4}></Col>
        <Col xs={4}></Col>
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
              style={{
                cursor: isSubtopicLocked("Non-Primitive Data Types") ? "not-allowed" : "pointer",
                opacity: isSubtopicLocked("Non-Primitive Data Types") ? 0.5 : 1,
                filter: isSubtopicLocked("Non-Primitive Data Types") ? "grayscale(1)" : "none",
              }}
              onClick={() =>
                !isSubtopicLocked("Non-Primitive Data Types") &&
                handleSubtopicClick("Non-Primitive Data Types")
              }
            />
          </OverlayTrigger>
        </Col>
      </Row>
    </Container>
  );
  
}
