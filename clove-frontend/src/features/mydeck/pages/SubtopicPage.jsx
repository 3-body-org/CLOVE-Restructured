import React, { useContext, useEffect, useState, useRef, useCallback, useLayoutEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MyDeckContext } from "../../../contexts/MyDeckContext";
import useTheme from "../hooks/useTheme";
import { Container, Row, Col } from "react-bootstrap";
import styles from "../styles/SubtopicPage.module.scss";
import { getSubtopicContent, getSubtopicDescription } from "../content/subtopicContent";
import { mergeBackendAndFrontendContent, isSubtopicLocked, getSubtopicProgress } from "../services/contentMerger";
import SubtopicLayout from "../components/SubtopicLayout";
import TitleAndProfile from "../../../components/layout/Navbar/TitleAndProfile";
import LoadingScreen from '../../../components/layout/StatusScreen/LoadingScreen';
import RainfallBackground from '../components/RainfallBackground';
import SpaceBackground from '../components/SpaceBackground';
import WizardBackground from '../components/WizardBackground';
import SubtopicNode from "../components/SubtopicNode";
import FloatingRocks from '../components/FloatingRocks';
import DetectiveThreadPath from '../components/DetectiveThreadPath';
import DetectiveBackground from '../components/DetectiveBackground';
import FlashlightOverlay from '../components/FlashlightOverlay';
import LightningEffect from '../components/LightningEffect';
import WizardThreadPath from '../components/WizardThreadPath';
import RuneBackground from '../components/RuneBackground';
import ErrorScreen from '../../../components/layout/StatusScreen/ErrorScreen';
import { useSidebar } from '../../../components/layout/Sidebar/Layout';
import { useMyDeckService } from "../hooks/useMydeckService";
import { showLockedNotification } from "../../../utils/notifications";
import AssessmentInstructions from "../../../components/assessments/AssessmentInstructions";

export default function SubtopicSelectionPage() {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const { currentTheme, setTheme } = useTheme();
  const { closeSidebar } = useSidebar();
  const { updateRecentTopic } = useMyDeckService();
  const {
    topicOverview,
    unlockStatus,
    overviewLoading,
    loadTopicOverview,
    setTopicId,
    setSubtopicId,
    setTopicOverview,
    setUnlockStatus,
    topicCache,
    setTopicCache
  } = useContext(MyDeckContext);

  // Add svgContainerRef for measuring overlay positions
  const svgContainerRef = useRef();
  // Add ref to track if data has been loaded for this topic
  const loadedTopicRef = useRef(new Set());
  // Add ref to track loading state to prevent infinite loops
  const isLoadingRef = useRef(false);
  // Add loading states
  const [loading, setLoading] = useState(true);
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [error, setError] = useState("");
  const [contentReady, setContentReady] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  
  // Get the numeric topic ID for content lookup
  const numericTopicId = topicId ? parseInt(topicId.split('-')[0]) : 1;
  
  // Get topic-specific content and theme
  const frontendContent = getSubtopicContent(numericTopicId);
  const theme = frontendContent?.theme || 'space';
  
  // Merge backend and frontend content
  const mergedContent = topicOverview && 
    topicOverview.topicId === parseInt(topicId) && 
    frontendContent
    ? mergeBackendAndFrontendContent(topicOverview, frontendContent)
    : null;
  
  // Safety check - if mergedContent is undefined, use fallback
  const safeContent = mergedContent || {
    story: { title: 'Loading...', description: 'Loading content...' },
    subtopics: [],
    styling: { background: 'stars', effect: 'starfield' },
    layout: {},
    nodeOrder: frontendContent?.nodeOrder || [] // Use frontend nodeOrder as fallback
  };
  
  // Minimum loading time to prevent flickering
  useEffect(() => {
    setMinTimePassed(false);
    setContentReady(false);
    const timer = setTimeout(() => {
      // Only set minTimePassed to true if we have the necessary content
      if (frontendContent && safeContent.nodeOrder && safeContent.nodeOrder.length > 0) {
        setMinTimePassed(true);
        setContentReady(true);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [topicId, frontendContent, safeContent.nodeOrder]);

  // Set loading to false when we have data
  useEffect(() => {
    if (frontendContent && safeContent.nodeOrder && safeContent.nodeOrder.length > 0) {
      setLoading(false);
    }
  }, [frontendContent, safeContent.nodeOrder]);
  
  // Combined effect for theme and topic loading
  useEffect(() => {
    if (!topicId) return;
    
    const numericTopicId = parseInt(topicId);
    if (isNaN(numericTopicId)) return;
    
    setTopicId(numericTopicId);
    setLoading(true);
    setError("");
    
    // Only load topic overview if we don't have data for this topic or if it's stale
    const hasDataForThisTopic = topicOverview && topicOverview.topicId === numericTopicId;
    if (!hasDataForThisTopic) {
      loadTopicOverview(numericTopicId);
    } else {
      setLoading(false);
    }
  }, [topicId, topicOverview]);

  // Reset loaded topic ref when topic changes
  useEffect(() => {
    // Clear the loaded topics when topic changes to force reload
    if (loadedTopicRef.current) {
      loadedTopicRef.current.clear();
    }
    
    // Clear topic overview when switching topics to prevent stale data
    if (topicOverview && topicOverview.topicId !== parseInt(topicId)) {
      setTopicOverview(null);
      setUnlockStatus(null);
    }
  }, [topicId, topicOverview]);
  
  // Cleanup effect when component unmounts or topic changes
  useEffect(() => {
    return () => {
      // Clear loaded topics when component unmounts
      if (loadedTopicRef.current) {
        loadedTopicRef.current.clear();
      }
    };
  }, [topicId]);
  
  // Add theme helpers
  const isSpaceTheme = theme === 'space';
  const isWizardTheme = theme === 'wizard';
  const isDetectiveTheme = theme === 'detective';

  // Always scroll to top when topic changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [topicId]);

  const { story, subtopics, styling, layout, nodeOrder } = safeContent;

  const [titlePositions, setTitlePositions] = useState([]);

  // Create refs for all possible subtopic keys (fixed number of hooks)
  const preAssessmentRef = useRef();
  const subtopic1Ref = useRef();
  const subtopic2Ref = useRef();
  const subtopic3Ref = useRef();
  const postAssessmentRef = useRef();

  // Map nodeOrder to refs dynamically based on current topic
  const nodeRefs = useMemo(() => {
    const refs = {};
    if (nodeOrder) {
      nodeOrder.forEach((key, index) => {
        if (key === 'pre-assessment') {
          refs[key] = preAssessmentRef;
        } else if (key === 'post-assessment') {
          refs[key] = postAssessmentRef;
        } else {
          // Map subtopics to refs based on their position
          switch (index) {
            case 1: // First subtopic
              refs[key] = subtopic1Ref;
              break;
            case 2: // Second subtopic
              refs[key] = subtopic2Ref;
              break;
            case 3: // Third subtopic
              refs[key] = subtopic3Ref;
              break;
            default:
              refs[key] = subtopic1Ref; // Fallback
          }
        }
      });
    }
    return refs;
  }, [nodeOrder]);

  const updateTitlePositions = useCallback(() => {
    if (!svgContainerRef.current) return;
    
    const containerRect = svgContainerRef.current.getBoundingClientRect();
    const positions = (nodeOrder || []).map((key) => {
      const ref = nodeRefs[key];
      const subtopic = subtopics?.find(s => s.key === key);
      
      // Skip if ref or subtopic doesn't exist
      if (!ref || !ref.current || !subtopic) return null;
      
      try {
      const nodeRect = ref.current.getBoundingClientRect();
      const left = nodeRect.left - containerRect.left + nodeRect.width / 2;
      const top = nodeRect.top - containerRect.top;
    return {
        key,
        left,
        top,
        title: subtopic.title,
      };
      } catch (error) {
        return null;
      }
    }).filter(Boolean); // Remove null values
    
    setTitlePositions(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(positions)) {
        return positions;
      }
      return prev;
    });
  }, [svgContainerRef, subtopics, nodeRefs, nodeOrder]);

  useLayoutEffect(() => {
    updateTitlePositions();
    window.addEventListener('resize', updateTitlePositions);
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

  useEffect(() => {
    const timeout = setTimeout(updateTitlePositions, 200);
    return () => clearTimeout(timeout);
  }, [updateTitlePositions]);

  const handleSubtopicClick = async (subtopic) => {
    if (isSubtopicLocked(subtopic)) { // Uses imported helper
      // Determine if it's an assessment or regular subtopic
      const isAssessment = subtopic.key === 'pre-assessment' || 
                          subtopic.key === 'post-assessment' || 
                          subtopic.type === 'assessment' ||
                          (subtopic.title && subtopic.title.toLowerCase().includes('assessment'));
      
      showLockedNotification(isAssessment ? 'assessment' : 'subtopic');
      return;
    }
    
    try {
      // Update recent topic in statistics
      await updateRecentTopic(numericTopicId);
    } catch (error) {
      // Continue with navigation even if recent topic update fails
    }
    
    // Check for assessment types and their completion status
    if (subtopic.key === 'pre-assessment' || subtopic.type === 'assessment' && subtopic.title === 'Pre-Assessment') {
      // Check if pre-assessment is completed
      if (unlockStatus?.preAssessment?.isCompleted) {
        navigate(`/my-deck/${topicId}/assessment/pre/result`);
      } else {
        setSelectedAssessment({ type: 'pre', subtopic });
        setShowInstructions(true);
      }
      closeSidebar(); // Close sidebar after navigation
      return;
    }
    if (subtopic.key === 'post-assessment' || subtopic.type === 'assessment' && subtopic.title === 'Post-Assessment') {
      // Check if post-assessment is completed
      if (unlockStatus?.postAssessment?.isCompleted) {
        navigate(`/my-deck/${topicId}/assessment/post/result`);
      } else {
        setSelectedAssessment({ type: 'post', subtopic });
        setShowInstructions(true);
      }
      closeSidebar(); // Close sidebar after navigation
      return;
    }
    
    // Fallback: check if it's an assessment by title
    if (subtopic.title && subtopic.title.toLowerCase().includes('pre-assessment')) {
      if (unlockStatus?.preAssessment?.isCompleted) {
        navigate(`/my-deck/${topicId}/assessment/pre/result`);
      } else {
        setSelectedAssessment({ type: 'pre', subtopic });
        setShowInstructions(true);
      }
      closeSidebar();
      return;
    }
    if (subtopic.title && subtopic.title.toLowerCase().includes('post-assessment')) {
      if (unlockStatus?.postAssessment?.isCompleted) {
        navigate(`/my-deck/${topicId}/assessment/post/result`);
      } else {
        setSelectedAssessment({ type: 'post', subtopic });
        setShowInstructions(true);
      }
      closeSidebar();
      return;
    }
    setSubtopicId(subtopic.backendId); // Use backendId for lesson navigation
    navigate(`/lesson/${topicId}/${subtopic.backendId}`); // Use backendId for lesson navigation
    closeSidebar(); // Close sidebar after navigation
  };

  const getProgress = (subtopic) => { // Uses imported helper
    return getSubtopicProgress(subtopic);
  };

  // Show loading screen only when absolutely necessary (no frontend content available)
  if (!frontendContent || !safeContent.nodeOrder || safeContent.nodeOrder.length === 0) {
    return <LoadingScreen message="Loading topic content..." />;
  }

  // Show error screen if there's an error
  if (error) return <ErrorScreen message={error} />;

  // Show loading screen until minimum time passes AND content is ready
  if (!minTimePassed || !contentReady) return <LoadingScreen message="Loading subtopics..." />;

  // Show loading overlay when backend data is loading, but keep UI visible
  const showLoadingOverlay = overviewLoading && (!safeContent.subtopics || safeContent.subtopics.length === 0);
  
  // Check if we have stale data (topic overview doesn't match current topic)
  const hasStaleData = topicOverview && topicOverview.topicId !== parseInt(topicId);

  // Get layoutConfig from theme/content
  const layoutConfig = layout?.blueprint || {
    nodes: (nodeOrder || []).map((key, index) => {
      // Create organic, flowing layout based on nodeOrder
      if (key === 'pre-assessment') {
        return { key, style: { gridColumn: '1 / span 2', gridRow: 1, justifySelf: 'center' } };
      } else if (key === 'post-assessment') {
        return { key, style: { gridColumn: '1 / span 2', gridRow: 4, justifySelf: 'center' } };
      } else {
        // For regular subtopics: top-left, top-right, bottom-center
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
      
      {/* Loading overlay - only show when backend data is loading or stale */}
      {(showLoadingOverlay || hasStaleData) && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingSpinner}></div>
            {hasStaleData ? 'Loading fresh data...' : 'Loading topic data...'}
          </div>
        </div>
      )}
      {/* Render theme backgrounds */}
      <TitleAndProfile colored={story.title} theme={theme} />
      

      
      {isDetectiveTheme && <DetectiveBackground />}
      {isWizardTheme && <WizardBackground />}
      {isWizardTheme && <RuneBackground />}
      
      {isSpaceTheme && <SpaceBackground />}
      {isDetectiveTheme && <RainfallBackground />}
      {isDetectiveTheme && <LightningEffect />}

      <Row>
        <Col
          xs={12}
          className={`d-flex justify-content-center align-items-center flex-column`}
        >
          {/* Back to Introduction Icon Button */}
          <div className={styles.introductionButtonContainer}>
            <button
              onClick={() => {
                // Navigate to introduction with source parameter to prevent redirect
                navigate(`/my-deck/${topicId}/introduction?from=subtopic`);
              }}
              className={`${styles.introductionButton} ${
                isWizardTheme ? styles.wizardTheme : 
                isDetectiveTheme ? styles.detectiveTheme : 
                styles.spaceTheme
              }`}
              title="Introduction"
            >
              Introduction
            </button>
          </div>
          
          <div className={styles.storyContainer}>
            <p className={styles.storyText}>
              {story.description}
            </p>
          </div>
        </Col>
      </Row>

      {/* Flashlight effect overlay for detective theme */}
      {isDetectiveTheme && <FlashlightOverlay />}

      <div ref={svgContainerRef} style={{ position: 'relative', width: '100%', minHeight: '600px' }}>
        {/* Render detective thread path for topic 2 and detective theme */}
        {isDetectiveTheme && numericTopicId === 2 && (
          <DetectiveThreadPath
            nodeRefs={nodeRefs}
            svgContainerRef={svgContainerRef}
             nodeOrder={nodeOrder || []}
          />
        )}
        {/* Render wizard thread path for wizard theme */}
        {isWizardTheme && (
          <WizardThreadPath
             centers={(nodeOrder || []).map(key => {
              const ref = nodeRefs[key];
              if (!ref?.current || !svgContainerRef?.current) return { x: 0, y: 0 };
               
               try {
              const nodeRect = ref.current.getBoundingClientRect();
              const containerRect = svgContainerRef.current.getBoundingClientRect();
              return {
                x: nodeRect.left - containerRect.left + nodeRect.width / 2,
                y: nodeRect.top - containerRect.top + nodeRect.height / 2,
              };
               } catch (error) {
                 return { x: 0, y: 0 };
               }
             })}
             lockedStates={(nodeOrder || []).map(key => {
               const subtopic = subtopics?.find(s => s.key === key);
               return subtopic ? isSubtopicLocked(subtopic) : true;
             })}
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
           subtopicKeys={nodeOrder || []}
           subtopics={(() => {
             const subtopicsObj = Object.fromEntries((subtopics || []).map(subtopic => {
               // Add description from subtopicContent.js if not already present
               const description = subtopic.description || getSubtopicDescription(numericTopicId, subtopic.key);
               return [subtopic.key, { ...subtopic, description }];
             }));
             // If no backend data yet, create placeholder subtopics with descriptions
             if (!subtopics || subtopics.length === 0) {
               return Object.fromEntries((nodeOrder || []).map(key => {
                 const description = getSubtopicDescription(numericTopicId, key);
                 return [key, {
                   key,
                   title: key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                   description: description || 'Loading...',
                   isLocked: key !== 'pre-assessment', // Only pre-assessment is unlocked by default
                   progress: 0,
                   type: key.includes('assessment') ? 'assessment' : 'subtopic'
                 }];
               }));
             }
             return subtopicsObj;
           })()}
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
             {(nodeOrder || []).slice(0, -1).map((fromKey, idx, arr) => {
               const toKey = (nodeOrder || [])[idx + 1];
              if (!toKey) return null;
               
               const fromSubtopic = subtopics?.find(s => s.key === fromKey);
               const toSubtopic = subtopics?.find(s => s.key === toKey);
               const fromRef = nodeRefs[fromKey];
               const toRef = nodeRefs[toKey];
               
               // Skip if refs are not available or if refs don't have current
               if (!fromRef?.current || !toRef?.current) return null;
               
              return (
                <FloatingRocks
                  key={fromKey + '-' + toKey}
                   fromRef={fromRef}
                   toRef={toRef}
                   filled={toSubtopic ? !isSubtopicLocked(toSubtopic) : false}
                   progress={toSubtopic ? getProgress(toSubtopic) : 0}
                  theme={theme}
                  svgContainerRef={svgContainerRef}
                />
              );
            })}
          </svg>
        )}
        
        {/* Assessment Instructions Modal */}
        <AssessmentInstructions
          isVisible={showInstructions}
          onClose={() => setShowInstructions(false)}
          onStart={() => setShowInstructions(false)}
          assessmentType={selectedAssessment?.type}
          topicId={topicId}
          theme={theme}
        />
      </div>
    </div>
  );
}