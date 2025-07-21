/**
 * @file SubtopicNode.jsx
 * @description Renders a clickable subtopic node with theme-aware icon and popover.
 */

import React from "react";
import PropTypes from "prop-types";
import { Image, OverlayTrigger, Popover } from "react-bootstrap";
import styles from "../styles/SubtopicPage.module.scss";

/**
 * SubtopicNode
 * Renders a clickable subtopic node with icon and popover.
 * @param {Object} props
 * @param {Object} props.subtopic - Subtopic data (must include .icon, .title, .description, .time).
 * @param {boolean} props.isLocked - Whether the subtopic is locked.
 * @param {Function} props.onSubtopicClick - Click handler for the node.
 * @param {string} props.theme - Current theme name.
 * @param {string} [props.className] - Optional extra class.
 * @param {boolean} [props.hideTitle] - Hide the title if true.
 */
const SubtopicNode = ({
  subtopic,
  isLocked,
  onSubtopicClick,
  theme,
  className = "",
  hideTitle = false,
}) => {
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
      {!hideTitle && <h5>{subtopic.title}</h5>}
      <OverlayTrigger
        trigger={["hover", "focus"]}
        placement="top"
        overlay={renderPopover()}
      >
        <div
          className={`${styles.subtopicIconWrapper} ${isLocked ? styles.lockedImage : ""}`}
          onClick={() => onSubtopicClick(subtopic)}
        >
          <img
            src={subtopic.icon}
            alt={subtopic.title}
            width={128}
            height={128}
          />
        </div>
      </OverlayTrigger>
    </div>
  );
};

SubtopicNode.propTypes = {
  subtopic: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    time: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    requires: PropTypes.string,
    icon: PropTypes.string.isRequired,
  }).isRequired,
  isLocked: PropTypes.bool,
  onSubtopicClick: PropTypes.func.isRequired,
  theme: PropTypes.string,
  className: PropTypes.string,
  hideTitle: PropTypes.bool,
};

export default SubtopicNode; 