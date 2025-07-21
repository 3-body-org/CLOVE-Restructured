import React from "react";
import { Row, Col } from "react-bootstrap";
import SubtopicNode from "./SubtopicNode";
import styles from "../styles/SubtopicPage.module.scss";

// layoutConfig: { nodes: [{ key, style, className }], containerStyle, containerClassName }
const SubtopicLayout = ({
  subtopicKeys = [],
  subtopics = {},
  isSubtopicLocked,
  onSubtopicClick,
  theme,
  layoutConfig = {},
  nodeRefs = {}, // <-- new prop
}) => {
  const nodes = layoutConfig.nodes || subtopicKeys.map((key, idx) => ({ key, style: {}, className: '' }));
  
  // Debug logging to help identify the issue
  console.log('SubtopicLayout Debug:', {
    subtopicKeys,
    subtopicsKeys: Object.keys(subtopics),
    nodes: nodes.map(n => n.key),
    layoutConfig: layoutConfig.nodes?.map(n => n.key)
  });
  
  return (
    <div
      className={layoutConfig.containerClassName || styles.subtopicRow}
      style={layoutConfig.containerStyle}
    >
      {nodes.map((node, idx) => {
        const subtopic = subtopics[node.key];
        
        // Safety check - if subtopic is undefined, skip rendering or show error
        if (!subtopic) {
          console.error(`Subtopic not found for key: ${node.key}`, {
            availableKeys: Object.keys(subtopics),
            nodeKey: node.key
          });
          return null; // Skip rendering this node
        }
        
        return (
          <div
            ref={nodeRefs[node.key] || null} // Attach the correct ref for SVG path overlay
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

export default SubtopicLayout; 