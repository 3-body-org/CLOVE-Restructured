import React from "react";
import { Image, OverlayTrigger, Popover } from "react-bootstrap";
import styles from "../styles/SubtopicPage.module.scss";
import preAssessmentSvg from 'assets/icons/space/icon-pre-ass.svg';
import subtopic1Svg from 'assets/icons/space/icon-subtopic1.svg';
import subtopic2Svg from 'assets/icons/space/icon-subtopic2.svg';
import subtopic3Svg from 'assets/icons/space/icon-subtopic3.svg';
import postAssessmentSvg from 'assets/icons/space/icon-post-ass.svg';
import wizardPreAss from 'assets/icons/wizard/icon-pre-ass.svg';
import wizardSubtopic1 from 'assets/icons/wizard/icon-subtopic1.svg';
import wizardSubtopic2 from 'assets/icons/wizard/icon-subtopic2.svg';
import wizardSubtopic3 from 'assets/icons/wizard/icon-subtopic3.svg';
import wizardPostAss from 'assets/icons/wizard/icon-post-ass.svg';

const SubtopicNode = ({
  subtopic,
  isLocked,
  onSubtopicClick,
  theme,
  className = "",
  hideTitle = false,
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

  const getSpaceThemeIcon = (subtopic) => {
    // Use subtopic.id or key to determine which SVG to use
    switch (subtopic.id) {
      case 'preassessment':
        return preAssessmentSvg;
      case 'declaringvariables':
        return subtopic1Svg;
      case 'primitivedatatypes':
        return subtopic2Svg;
      case 'nonprimitivedatatypes':
        return subtopic3Svg;
      case 'arithmetic':
        return subtopic1Svg;
      case 'comparison':
        return subtopic2Svg;
      case 'logical':
        return subtopic3Svg;
      case 'ifelse':
        return subtopic1Svg;
      case 'whiledowhileloop':
        return subtopic2Svg;
      case 'forloop':
        return subtopic3Svg;
      case 'postassessment':
        return postAssessmentSvg;
      default:
        return subtopic.icon;
    }
  };

  const getWizardThemeIcon = (subtopic) => {
    switch (subtopic.id) {
      case 'preassessment':
        return wizardPreAss;
      case 'declaringvariables':
        return wizardSubtopic1;
      case 'primitivedatatypes':
        return wizardSubtopic2;
      case 'nonprimitivedatatypes':
        return wizardSubtopic3;
      case 'postassessment':
        return wizardPostAss;
      default:
        return subtopic.icon;
    }
  };

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
          // Node visuals (background, border, etc.) should be controlled by theme SCSS or passed props
        >
          <img
            src={theme === 'space' ? getSpaceThemeIcon(subtopic) : theme === 'wizard' ? getWizardThemeIcon(subtopic) : subtopic.icon}
            alt={subtopic.title}
            width={128}
            height={128}
          />
        </div>
      </OverlayTrigger>
    </div>
  );
};

export default SubtopicNode; 