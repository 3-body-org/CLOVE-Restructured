import React from "react";
import { Image, OverlayTrigger, Popover } from "react-bootstrap";
import styles from "../styles/SubtopicPage.module.scss";

const SubtopicNode = ({
  subtopic,
  isLocked,
  onSubtopicClick,
  theme,
  className = "",
}) => {
  const renderPopover = () => {
    return (
      <Popover id={`popover-${subtopic.id}`}>
        <Popover.Body>
          <strong>{subtopic.description}</strong>
          <br />⏳ Estimated Time: {subtopic.time}
          {isLocked && (
            <div className={styles.lockedHint}>
              🔒 Requires {subtopic.requires}
            </div>
          )}
        </Popover.Body>
      </Popover>
    );
  };

  return (
    <div className={`text-center text-white ${className}`}>
      <h5>{subtopic.title}</h5>
      <OverlayTrigger
        trigger={["hover", "focus"]}
        placement="top"
        overlay={renderPopover()}
      >
        <div
          className={`${styles.subtopicIconWrapper} ${isLocked ? styles.lockedImage : ""}`}
          onClick={() => onSubtopicClick(subtopic)}
        >
          <img src={subtopic.icon} alt={subtopic.title} width={64} height={64} />
        </div>
      </OverlayTrigger>
    </div>
  );
};

export default SubtopicNode; 