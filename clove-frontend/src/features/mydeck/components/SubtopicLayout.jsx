/**
 * @file SubtopicLayout.jsx
 * @description Lays out subtopic nodes in a grid or custom arrangement, with support for refs and custom node rendering.
 */

import React from "react";
import PropTypes from "prop-types";
import SubtopicNode from "./SubtopicNode";
import styles from "../styles/SubtopicPage.module.scss";

/**
 * SubtopicLayout
 * Lays out subtopic nodes in a grid or custom arrangement.
 * @param {Object} props
 * @param {Array} [props.subtopicKeys=[]] - Keys of subtopics to render.
 * @param {Object} [props.subtopics={}] - Map of subtopic key to subtopic data.
 * @param {Function} props.isSubtopicLocked - Function to determine if a subtopic is locked.
 * @param {Function} props.onSubtopicClick - Click handler for subtopic nodes.
 * @param {string} props.theme - Current theme name.
 * @param {Object} [props.layoutConfig={}] - Optional layout config (nodes, containerStyle, containerClassName).
 * @param {Object} [props.nodeRefs={}] - Optional refs for each node.
 * @param {Function} [props.renderNode] - Optional custom node renderer.
 */
const SubtopicLayout = ({
  subtopicKeys = [],
  subtopics = {},
  isSubtopicLocked,
  onSubtopicClick,
  theme,
  layoutConfig = {},
  nodeRefs = {},
  renderNode,
}) => {
  const nodes = layoutConfig.nodes || subtopicKeys.map((key) => ({ key, style: {}, className: '' }));
  
  return (
    <div
      className={layoutConfig.containerClassName || styles.subtopicRow}
      style={layoutConfig.containerStyle}
    >
      {nodes.map((node) => {
        const subtopic = subtopics[node.key];
        if (!subtopic) {
          console.error(`[SubtopicLayout] Subtopic not found for key: ${node.key}`, {
            availableKeys: Object.keys(subtopics),
            nodeKey: node.key
          });
          return null;
        }
        // Allow for a custom node renderer
        if (typeof renderNode === 'function') {
          return renderNode({
            node,
            subtopic,
            isLocked: isSubtopicLocked(subtopic),
            onSubtopicClick,
            theme,
            ref: nodeRefs[node.key] || null,
            key: node.key + '-wrapper',
          });
        }
        // Default rendering
        return (
          <div
            ref={nodeRefs[node.key] || null}
            style={node.style}
            className={node.className}
            key={node.key + "-wrapper"}
          >
          <SubtopicNode
            subtopic={subtopic}
            isLocked={isSubtopicLocked(subtopic)}
            onSubtopicClick={onSubtopicClick}
            theme={theme}
            hideTitle={true}
          />
          </div>
        );
      })}
    </div>
  );
};

SubtopicLayout.propTypes = {
  subtopicKeys: PropTypes.array,
  subtopics: PropTypes.object,
  isSubtopicLocked: PropTypes.func.isRequired,
  onSubtopicClick: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
  layoutConfig: PropTypes.object,
  nodeRefs: PropTypes.object,
  renderNode: PropTypes.func,
};

export default SubtopicLayout; 