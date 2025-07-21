import React, { useContext, useEffect, useState, useRef, useCallback, useLayoutEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MyDeckContext } from "../../../contexts/MyDeckContext";
import useTheme from "../hooks/useTheme";
import { Container, Row, Col } from "react-bootstrap";
import styles from "../styles/SubtopicPage.module.scss";
import { getSubtopicContent, subtopicContent } from "../content/subtopicContent";
import SubtopicLayout from "../components/SubtopicLayout";
import TitleAndProfile from "../../../components/layout/Navbar/TitleAndProfile";
import RainfallBackground from '../components/RainfallBackground';
import RuneBackground from '../components/RuneBackground';
import SpaceBackground from '../components/SpaceBackground';
import WizardBackground from '../components/WizardBackground';
import LoadingScreen from "components/layout/StatusScreen/LoadingScreen";
import SubtopicNode from "../components/SubtopicNode";
import FloatingRocks from '../components/FloatingRocks';
import { topicsData } from "../data/topics";
import DetectiveThreadPath from '../components/DetectiveThreadPath';
import DetectiveBackground from '../components/DetectiveBackground';
import FlashlightOverlay from '../components/FlashlightOverlay';
import LightningEffect from '../components/LightningEffect';
import WizardThreadPath from '../components/WizardThreadPath';

export default function SubtopicSelectionPage() {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const { currentTheme, setTheme } = useTheme();
  const {
    preAssessmentTaken,
    setPreAssessmentTaken,
    setTopicId,
    setSubtopicId,
    completedSubtopics,
    setCompletedSubtopics,
    topics
  } = useContext(MyDeckContext);

  // Add svgContainerRef for measuring overlay positions
  const svgContainerRef = useRef();

  // Find topic object by id or slug
  let topic = null;
  if (topics && topics.length > 0 && topicId) {
    topic = topics.find(t => t.id === topicId || t.slug === topicId);
    if (!topic && topicId.includes('-')) {
      const numericId = topicId.split('-')[0];
      topic = topics.find(t => String(t.id) === numericId);
    }
  }
  // Fallback to static topicsData if not found in context
  if (!topic && topicId) {
    const numericId = topicId.split('-')[0];
    topic = topicsData.find(t => String(t.id) === numericId);
  }
  
  // Get the numeric topic ID for content lookup
  const numericTopicId = topic?.id || (topicId ? parseInt(topicId.split('-')[0]) : 1);
  
  // Get topic-specific content and theme
  const topicContent = getSubtopicContent(numericTopicId);
  const theme = topicContent?.theme || topic?.theme || 'space';
  
  // Debug logging for topic content lookup
  useEffect(() => {
    console.log('Topic Content Lookup Debug:', {
      topicId,
      topic: topic?.id,
      numericTopicId,
      topicContent: topicContent ? 'found' : 'not found',
      availableTopics: Object.keys(subtopicContent || {})
    });
  }, [topicId, topic, numericTopicId, topicContent]);
  
  // Safety check - if topicContent is undefined, use fallback
  const safeTopicContent = topicContent || {
    story: { title: 'Loading...', description: 'Loading content...' },
    subtopics: {},
    styling: { background: 'stars', effect: 'starfield' },
    layout: {},
    nodeOrder: []
  };
  
  // Set theme only after topic is loaded (context or static)
  useEffect(() => {
    if (topicId && topic && theme) {
      setTopicId(topicId);
      setTheme(theme);
    }
  }, [topicId, setTopicId, setTheme, theme, topic]);
  
  // Set theme immediately on mount using static topicsData (for instant theming on reload)
  useEffect(() => {
    if (topicId) {
      // Extract numeric topic ID if needed
      const numericId = topicId.split('-')[0];
      const staticTopic = topicsData.find(t => String(t.id) === numericId);
      const staticTheme = staticTopic?.theme || 'space';
      console.log('Setting theme from static data:', { topicId, numericId, staticTopic, staticTheme });
      setTheme(staticTheme);
      
      // Immediately apply theme class to body to fix navigation timing issue
      document.body.classList.forEach((className) => {
        if (className.startsWith('theme-')) {
          document.body.classList.remove(className);
        }
      });
      document.body.classList.add(`theme-${staticTheme}`);
      console.log('Applied theme class to body:', `theme-${staticTheme}`, 'Current body classes:', Array.from(document.body.classList));
    }
  }, [topicId, setTheme]);
  
  // Add theme helpers (use theme, not currentTheme)
  const isSpaceTheme = theme === 'space';
  const isWizardTheme = theme === 'wizard';
  const isDetectiveTheme = theme === 'detective';

  // Debug logging to help identify theme issues
  useEffect(() => {
    console.log('SubtopicPage Debug:', {
      topicId,
      topic: topic?.id,
      numericTopicId,
      theme,
      isSpaceTheme,
      isWizardTheme,
      isDetectiveTheme,
      currentTheme,
      bodyClasses: Array.from(document.body.classList),
      hasSpaceBackground: document.querySelector('canvas[aria-hidden="true"]') !== null
    });
  }, [topicId, topic, numericTopicId, theme, isSpaceTheme, isWizardTheme, isDetectiveTheme, currentTheme]);

  // Always scroll to top when topic changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [topicId]);

  // Get topic-specific content and node order
  const { story, subtopics, styling, layout, nodeOrder } = safeTopicContent;

  // Debug logging for subtopic content
  useEffect(() => {
    console.log('SubtopicPage Content Debug:', {
      topicId,
      numericTopicId,
      nodeOrder,
      subtopicsKeys: Object.keys(subtopics || {}),
      subtopics: subtopics
    });
  }, [topicId, numericTopicId, nodeOrder, subtopics]);

  // Add localStorage sync for pre-assessment status
  useEffect(() => {
    const savedPreAssessment = localStorage.getItem("preAssessmentTaken");
    if (savedPreAssessment) {
      setPreAssessmentTaken(JSON.parse(savedPreAssessment));
    }
  }, [setPreAssessmentTaken]);

  const handleSubtopicClick = (subtopic) => {
    const subtopicKey = Object.keys(subtopics).find(
      key => subtopics[key].id === subtopic.id
    );

    if (subtopic.id === "preassessment") {
      // Set pre-assessment as taken when starting it
      setPreAssessmentTaken(true);
      localStorage.setItem("preAssessmentTaken", JSON.stringify(true));
      navigate(`/my-deck/${topicId}/assessment/pre`);
      return;
    }

    if (subtopic.id === "postassessment") {
      navigate(`/my-deck/${topicId}/assessment/post`);
      return;
    }

    if (isSubtopicLocked(subtopic)) {
      alert(`Complete "${subtopic.requires}" first!`);
      return;
    }

    setSubtopicId(subtopic.id);

    // Update completed subtopics
    if (!completedSubtopics.includes(subtopicKey)) {
      const updatedCompleted = [...completedSubtopics, subtopicKey];
      setCompletedSubtopics(updatedCompleted);
      localStorage.setItem(
        "completedSubtopics",
        JSON.stringify(updatedCompleted)
      );
    }

    navigate(`/lesson/${topicId}/${subtopic.id}`);
  };

  const isSubtopicLocked = (subtopic) => {
    const required = subtopic.requires;
    if (!required) return false;

    // Check for pre-assessment requirement
    if (required === "pre-assessment") {
      return !preAssessmentTaken;
    }

    // Check for other dependencies
    const requiredKey = Object.keys(subtopics).find(
      key => subtopics[key].id === required
    );
    return !completedSubtopics.includes(requiredKey);
  };

  // Refs for each node (dynamically from nodeOrder)
  const nodeRefs = Object.fromEntries((nodeOrder || Object.keys(subtopics)).map(key => [key, useRef()]));

  // Add state for dynamic title positions
  const [titlePositions, setTitlePositions] = useState([]);

  // Helper to update title positions (uses nodeOrder and subtopics)
  const updateTitlePositions = useCallback(() => {
    if (!svgContainerRef.current) return;
    const containerRect = svgContainerRef.current.getBoundingClientRect();
    const positions = (nodeOrder || Object.keys(subtopics)).map((key) => {
      const ref = nodeRefs[key];
      const subtopic = subtopics[key];
      if (!subtopic || !ref.current) return null;
      const nodeRect = ref.current.getBoundingClientRect();
      const left = nodeRect.left - containerRect.left + nodeRect.width / 2;
      const top = nodeRect.top - containerRect.top;
    return {
        key,
        left,
        top,
        title: subtopic.title,
      };
    });
    setTitlePositions(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(positions)) {
        return positions;
      }
      return prev;
    });
  }, [svgContainerRef, subtopics, nodeRefs, nodeOrder]);

  // Use useLayoutEffect for DOM measurements
  useLayoutEffect(() => {
    updateTitlePositions();
    window.addEventListener('resize', updateTitlePositions);
    // Add ResizeObserver for container
    let observer;
    if (svgContainerRef.current && window.ResizeObserver) {
      observer = new window.ResizeObserver(() => {
        updateTitlePositions();
      });
      observer.observe(svgContainerRef.current);
    }
    return () => {
      window.removeEventListener('resize', updateTitlePositions);
      if (observer && svgContainerRef.current) observer.disconnect();
    };
  }, [updateTitlePositions]);

  // Optionally, trigger after a short delay for late layout changes
  useEffect(() => {
    const timeout = setTimeout(updateTitlePositions, 200);
    return () => clearTimeout(timeout);
  }, [updateTitlePositions]);

  // FloatingRocks component is now imported from '../components/FloatingRocks'

  // Get layoutConfig from theme/content (preserve current layout for default theme)
  const layoutConfig = layout?.blueprint || {
    nodes: (nodeOrder || Object.keys(subtopics)).map((key, index) => {
      // Create organic, flowing layout based on nodeOrder
      if (key === 'pre-assessment') {
        return { key, style: { gridColumn: '1 / span 2', gridRow: 1, justifySelf: 'center' } };
      } else if (key === 'post-assessment') {
        return { key, style: { gridColumn: '1 / span 2', gridRow: 4, justifySelf: 'center' } }; // moved from row 5 to row 4
      } else {
        // For regular subtopics (always 3): top-left, top-right, bottom-center
        const subtopicIndex = index - 1; // Adjust for pre-assessment
        
        if (subtopicIndex === 0) {
          return { key, style: { gridColumn: 1, gridRow: 2, justifySelf: 'start' } };
        } else if (subtopicIndex === 1) {
          return { key, style: { gridColumn: 2, gridRow: 2, justifySelf: 'end' } };
        } else if (subtopicIndex === 2) {
          return { key, style: { gridColumn: '1 / span 2', gridRow: 3, justifySelf: 'center' } };
        }
      }
    }),
    containerClassName: styles.gridLayout
  };
  // Map subtopic keys to refs for path rendering
  // const nodeRefs = {
  //   'pre-assessment': preRef,
  //   'declaring-variables': declRef,
  //   'primitive-data-types': primRef,
  //   'non-primitive-data-types': nonprimRef,
  //   'post-assessment': postRef,
  // };

  // Helper to get center of a node relative to the SVG container
  const getCenter = (ref) => {
    if (!ref.current || !svgContainerRef.current) return { x: 0, y: 0 };
    const nodeRect = ref.current.getBoundingClientRect();
    const containerRect = svgContainerRef.current.getBoundingClientRect();
    return {
      x: nodeRect.left - containerRect.left + nodeRect.width / 2,
      y: nodeRect.top - containerRect.top + nodeRect.height / 2,
    };
  };

  // Helper to get progress for a subtopic (0-1)
  const getSubtopicProgress = (subtopicKey) => {
    // Try to get progress_percent from subtopic if available, fallback to completedSubtopics
    const sub = subtopics[subtopicKey];
    if (sub && typeof sub.progress_percent === 'number') {
      return sub.progress_percent;
    }
    // Fallback: if completed, return 1, else 0
    return completedSubtopics.includes(subtopicKey) ? 1 : 0;
  };

  return (
    <div
      className={
        `${styles.myDeckWrapper} ${styles.lessonWrapper} ` +
        `${isSpaceTheme ? styles.spaceTheme : ''} ` +
        `${isWizardTheme ? '' : ''} ` + // removed styles.wizardThemeBg
        `${isWizardTheme ? styles.wizardTheme : ''} ` +
        `${isDetectiveTheme ? styles.detectiveTheme : ''}`
      }
      // For wizard theme, ensure background is always transparent except for SVG
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.5s cubic-bezier(0.4,0,0.2,1)',
        ...(isWizardTheme || isDetectiveTheme ? { backgroundColor: 'transparent' } : {})
      }}
    >
      {/* Render detective SVG background as an absolutely positioned image for detective theme */}
      {isDetectiveTheme && <DetectiveBackground />}
      {/* Render wizard SVG background as an absolutely positioned image for wizard theme */}
      {isWizardTheme && <WizardBackground />}
      {/* Stacking order: .wizardThemeBg (SVG) below, .wizardTheme (colors/text) above, content on top */}
      <TitleAndProfile colored={story.title} theme={theme} />
      {isSpaceTheme && <SpaceBackground />}
      {isWizardTheme && <RuneBackground />}
      {isDetectiveTheme && <RainfallBackground />}
      {/* Lightning effect for detective theme */}
      {isDetectiveTheme && <LightningEffect />}
      
      {/* Debug: Log which background is being rendered */}
      {console.log('Rendering backgrounds:', { isSpaceTheme, isWizardTheme, isDetectiveTheme })}

      <Row>
        <Col
          xs={12}
          className={`d-flex justify-content-center align-items-center`}
        >
          <div className={styles.storyContainer}>
            <p className={styles.storyText}>
              {story.description}
            </p>
          </div>
        </Col>
      </Row>

      {/* Flashlight effect overlay for detective theme, now scoped to subtopic content only */}
      {isDetectiveTheme && <FlashlightOverlay />}

      <div ref={svgContainerRef} style={{ position: 'relative', width: '100%', minHeight: '600px' }}>
        {/* Render detective thread path for topic 2 and detective theme */}
        {isDetectiveTheme && numericTopicId === 2 && (
          <DetectiveThreadPath
            nodeRefs={nodeRefs}
            svgContainerRef={svgContainerRef}
            nodeOrder={nodeOrder || Object.keys(subtopics)}
          />
        )}
        {/* Render wizard thread path for wizard theme */}
        {isWizardTheme && (
          <WizardThreadPath
            centers={(nodeOrder || Object.keys(subtopics)).map(key => {
              const ref = nodeRefs[key];
              if (!ref?.current || !svgContainerRef?.current) return { x: 0, y: 0 };
              const nodeRect = ref.current.getBoundingClientRect();
              const containerRect = svgContainerRef.current.getBoundingClientRect();
              return {
                x: nodeRect.left - containerRect.left + nodeRect.width / 2,
                y: nodeRect.top - containerRect.top + nodeRect.height / 2,
              };
            })}
            lockedStates={(nodeOrder || Object.keys(subtopics)).map(key => isSubtopicLocked(subtopics[key]))}
          />
        )}
        {/* Render node titles absolutely above everything */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
          {titlePositions.map(pos =>
            pos && (
              <div
                key={pos.key + '-title'}
                style={{
                  position: 'absolute',
                  left: pos.left,
                  top: pos.top + 8,
                  transform: 'translateX(-50%)',
                  color: 'white',
                  fontSize: '1.4rem',
                  fontWeight: 600,
                  textShadow: '0 2px 8px #000',
                  pointerEvents: 'none',
                  zIndex: 10,
                  whiteSpace: 'nowrap',
                }}
              >
                {pos.title}
              </div>
            )
          )}
        </div>
        <SubtopicLayout
          subtopicKeys={nodeOrder || Object.keys(subtopics)}
          subtopics={subtopics}
          isSubtopicLocked={isSubtopicLocked}
          onSubtopicClick={handleSubtopicClick}
          theme={theme}
          layoutConfig={layoutConfig}
          nodeRefs={nodeRefs}
        />
        {/* SVG overlay for floating rocks - only for space theme */}
        {isSpaceTheme && (
          <svg
            width="100%"
            height="100%"
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 2, pointerEvents: 'none' }}
          >
            {/* Render paths between nodes using refs and nodeOrder */}
            {(nodeOrder || Object.keys(subtopics)).slice(0, -1).map((fromKey, idx, arr) => {
              const toKey = (nodeOrder || Object.keys(subtopics))[idx + 1];
              if (!toKey) return null;
              return (
                <FloatingRocks
                  key={fromKey + '-' + toKey}
                  fromRef={nodeRefs[fromKey]}
                  toRef={nodeRefs[toKey]}
                  filled={!isSubtopicLocked(subtopics[toKey])}
                  progress={getSubtopicProgress(toKey)}
                  theme={theme}
                  svgContainerRef={svgContainerRef}
                />
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
}