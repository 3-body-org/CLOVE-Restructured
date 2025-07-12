import React from "react";
import { Row, Col } from "react-bootstrap";
import SubtopicNode from "./SubtopicNode";
import styles from "../styles/SubtopicPage.module.scss";

const SubtopicLayout = ({
  subtopicKeys = [],
  subtopics = {},
  isSubtopicLocked,
  onSubtopicClick,
  theme
}) => {
  return (
    <div className={styles.subtopicRow}>
      {subtopicKeys.map((key) => {
        const subtopic = subtopics[key];
        return (
          <SubtopicNode
            key={key}
            subtopic={subtopic}
            isLocked={isSubtopicLocked(subtopic)}
            onSubtopicClick={onSubtopicClick}
            theme={theme}
          />
        );
      })}
    </div>
  );
};

export default SubtopicLayout; 