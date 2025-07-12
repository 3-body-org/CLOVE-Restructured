import React from "react";
import PropTypes from "prop-types";
import { Row, Col } from "react-bootstrap";
import SubtopicNode from "./SubtopicNode";
import SubtopicPath from "./SubtopicPath";
import styles from "../styles/SubtopicPage.module.scss";

const SubtopicLayout = React.memo(function SubtopicLayout({
  subtopic,
  isLocked,
  onSubtopicClick,
  position = "center",
}) {
  switch (position) {
    case "left":
      return (
        <Row className={styles.subtopicRow}>
          <Col xs={4} className="p-5 text-white text-center">
            <SubtopicNode
              subtopic={subtopic}
              isLocked={isLocked}
              onSubtopicClick={onSubtopicClick}
            />
          </Col>
          <Col
            xs={4}
            className="pt-5 p-0 m-0 d-flex align-items-end justify-content-start"
          >
            <SubtopicPath pathImage={subtopic.path} />
          </Col>
          <Col xs={4}></Col>
        </Row>
      );
    case "right":
      return (
        <Row className={styles.subtopicRow}>
          <Col xs={4}></Col>
          <Col xs={4} className="p-5 text-white text-center">
            <SubtopicNode
              subtopic={subtopic}
              isLocked={isLocked}
              onSubtopicClick={onSubtopicClick}
            />
          </Col>
          <Col xs={4} className="pt-5 p-0 m-0 d-flex align-items-end">
            <SubtopicPath pathImage={subtopic.path} />
          </Col>
        </Row>
      );
    case "center":
    default:
      return (
        <Row className={styles.subtopicRow}>
          <Col
            xs={4}
            className="p-0 m-0 d-flex align-items-end justify-content-end"
          >
            <SubtopicPath pathImage={subtopic.path} />
          </Col>
          <Col xs={4} className="p-5 text-white text-center">
            <SubtopicNode
              subtopic={subtopic}
              isLocked={isLocked}
              onSubtopicClick={onSubtopicClick}
            />
          </Col>
          <Col xs={4}></Col>
        </Row>
      );
  }
});

SubtopicLayout.propTypes = {
  subtopic: PropTypes.object.isRequired,
  isLocked: PropTypes.bool,
  onSubtopicClick: PropTypes.func.isRequired,
  position: PropTypes.oneOf(["left", "right", "center"])
};

export default SubtopicLayout; 