import React from "react";
import PropTypes from "prop-types";
import { Image, OverlayTrigger, Popover } from "react-bootstrap";
import styles from "../styles/SubtopicPage.module.scss";

const SubtopicNode = React.memo(function SubtopicNode({ subtopic, isLocked, onSubtopicClick, className = "" }) {
  const renderPopover = () => (
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

  return (
    <div className={`text-center text-white ${className}`}>
      <h5>{subtopic.title}</h5>
      <OverlayTrigger
        trigger={["hover", "focus"]}
        placement="top"
        overlay={renderPopover()}
      >
        <Image
          src={subtopic.image}
          fluid
          className={[
            styles.subtopicImage,
            isLocked ? styles.lockedImage : ""
          ].join(" ")}
          onClick={() => onSubtopicClick(subtopic)}
        />
      </OverlayTrigger>
    </div>
  );
});

SubtopicNode.propTypes = {
  subtopic: PropTypes.object.isRequired,
  isLocked: PropTypes.bool,
  onSubtopicClick: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default SubtopicNode; 