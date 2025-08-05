//react
import React, { useState, useEffect, useRef, useContext } from "react";
//react router
import { useNavigate, useParams } from "react-router-dom";
//context
import { MyDeckContext } from "contexts/MyDeckContext";
import { useAuth } from "contexts/AuthContext";
//react bootstrap
import Button from "react-bootstrap/Button";
//component
import LessonMonacoEditor from "../components/LessonMonacoEditor";
import LessonThemeProvider from "features/lessons/components/LessonThemeProvider";
//hooks
import { useLessonData } from "../hooks/useLessonData";
import { useLessonService } from '../services/lessonService';
import { useChallengeService } from '../services/challengeService';
//loading and error components
import LoadingScreen from "components/layout/StatusScreen/LoadingScreen";
import ErrorScreen from "components/layout/StatusScreen/ErrorScreen";

//scss
import styles from "features/lessons/styles/LessonsPage.module.scss";

// Content Block Components
const HeadingBlock = ({ heading }) => (
  <h2 className={styles.sectionTitle}>{heading}</h2>
);

const IntroTextBlock = ({ introText }) => (
  <div className={styles.conceptText}>
    <p className={styles.introText}>{introText}</p>
  </div>
);

const ContentBlock = ({ content }) => (
  <div className={styles.conceptText}>
    {content.split('\n').map((paragraph, pIndex) => (
      <p key={pIndex} dangerouslySetInnerHTML={{
        __html: paragraph.trim().replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      }} />
    ))}
  </div>
);

const BulletPointsBlock = ({ bulletPoints }) => (
  <div className={styles.bulletContainer}>
    <ul className={styles.bulletList}>
      {bulletPoints.map((point, index) => (
        <li key={index} className={styles.bulletItem}>
          <span className={styles.bulletIcon}></span>
          <span dangerouslySetInnerHTML={{
            __html: point.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          }} />
        </li>
      ))}
    </ul>
  </div>
);

const CodeSnippetBlock = ({ codeSnippet, extractCodeFromBulletPoints, extractOutputFromBulletPoints, calculateMonacoHeight }) => (
  <div className={styles.codeExampleContainer}>
    <div className={styles.codeEditorWrapper}>
      <LessonMonacoEditor
        value={extractCodeFromBulletPoints(codeSnippet)}
        language="java"
        height={calculateMonacoHeight(extractCodeFromBulletPoints(codeSnippet))}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          lineNumbers: 'on',
          folding: true,
          scrollBeyondLastLine: false,
        }}
      />
    </div>
    
    {extractOutputFromBulletPoints(codeSnippet) && (
      <div className={styles.outputContainer}>
        <div className={styles.outputHeader}>
          <span className={styles.outputLabel}>Output</span>
        </div>
        <pre className={styles.outputContent}>
          <code>
            {extractOutputFromBulletPoints(codeSnippet)}
          </code>
        </pre>
      </div>
    )}
  </div>
);

const RealWorldBulletPointsBlock = ({ bulletPoints }) => (
  <div className={styles.bulletContainer}>
    <ul className={styles.bulletList}>
      {bulletPoints.map((point, index) => (
        <li key={index} className={styles.bulletItem}>
          <span className={styles.bulletIcon}></span>
          <span dangerouslySetInnerHTML={{
            __html: point.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          }} />
        </li>
      ))}
    </ul>
  </div>
);

const HowItWorksBlock = ({ bulletPoints }) => (
  <div className={styles.bulletContainer}>
    <ul className={styles.bulletList}>
      {bulletPoints.map((point, index) => (
        <li key={index} className={styles.bulletItem}>
          <span className={styles.bulletIcon}></span>
          <span dangerouslySetInnerHTML={{
            __html: point.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          }} />
        </li>
      ))}
    </ul>
  </div>
);

const SummaryBlock = ({ summary }) => (
  <div className={styles.summaryBox}>
    <h3 className={styles.summaryTitle}>Key Takeaways</h3>
    <ul className={styles.summaryList}>
      {summary.map((point, index) => (
        <li key={index}>{point}</li>
      ))}
    </ul>
  </div>
);

const ObjectivesBlock = ({ objectives }) => (
  <div className={styles.objectivesBox}>
    <h3 className={styles.objectivesTitle}>Learning Objectives</h3>
    <div className={styles.bulletContainer}>
      <ul className={styles.bulletList}>
        {objectives.map((objective, index) => (
          <li key={index} className={styles.bulletItem}>
            <span className={styles.bulletIcon}></span>
            {objective}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const LessonTitleBlock = ({ lessonTitle }) => (
  <h1 className={styles.lessonTitle}>{lessonTitle}</h1>
);

const LessonIntroBlock = ({ lessonIntro }) => (
  <div className={styles.conceptText}>
    <p className={styles.introText}>{lessonIntro}</p>
  </div>
);

// Content Renderer Component
const ContentRenderer = ({ section, extractCodeFromBulletPoints, extractOutputFromBulletPoints, calculateMonacoHeight }) => {
  const blocks = [];

  // Get all properties from the section object in their original order
  const sectionKeys = Object.keys(section);

  // Render blocks based on the actual order of properties in the JSON
  sectionKeys.forEach(key => {
    switch (key) {
      case 'lessonTitle':
        // Skip rendering lessonTitle as it's displayed in the header
        break;
      
      case 'lessonIntro':
        blocks.push(<LessonIntroBlock key="lessonIntro" lessonIntro={section.lessonIntro} />);
        break;
      
      case 'heading':
        blocks.push(<HeadingBlock key="heading" heading={section.heading} />);
        break;
      
      case 'content1':
        blocks.push(<ContentBlock key="content1" content={section.content1} />);
        break;
      
      case 'content2':
        blocks.push(<ContentBlock key="content2" content={section.content2} />);
        break;
      
      case 'codeSnippet':
        blocks.push(
          <CodeSnippetBlock 
            key="codeSnippet" 
            codeSnippet={section.codeSnippet}
            extractCodeFromBulletPoints={extractCodeFromBulletPoints}
            extractOutputFromBulletPoints={extractOutputFromBulletPoints}
            calculateMonacoHeight={calculateMonacoHeight}
          />
        );
        break;
      
      case 'bulletPoints':
        // Choose the appropriate bullet point style based on section type
        if (section.heading === "Real-world Application") {
          blocks.push(<RealWorldBulletPointsBlock key="bulletPoints" bulletPoints={section.bulletPoints} />);
        } else if (section.heading === "How it Works") {
          blocks.push(<HowItWorksBlock key="bulletPoints" bulletPoints={section.bulletPoints} />);
        } else {
          blocks.push(<BulletPointsBlock key="bulletPoints" bulletPoints={section.bulletPoints} />);
        }
        break;
      
      case 'objectives':
        blocks.push(<ObjectivesBlock key="objectives" objectives={section.objectives} />);
        break;
      
      case 'summary':
        blocks.push(<SummaryBlock key="summary" summary={section.summary} />);
        break;
      
      // Ignore other properties that don't have corresponding blocks
      default:
        break;
    }
  });

  return <div className={styles.sectionContent}>{blocks}</div>;
};

// Contents Sidebar Component
const ContentsSidebar = ({ sections, currentSection, onSectionClick }) => {
  const getSectionTitle = (section) => {
    if (section.heading) return section.heading;
    if (section.lessonIntro) return "Introduction";
    if (section.objectives) return "Learning Objectives";
    if (section.summary) return "Summary";
    return "Section";
  };

  return (
    <div className={styles.contentsSidebar}>
      <h3 className={styles.contentsTitle}>Contents</h3>
      <div className={styles.contentsList}>
        {sections.map((section, index) => {
          const title = getSectionTitle(section);
          const isActive = currentSection === index;
          
          return (
            <div 
              key={index} 
              className={`${styles.contentsItem} ${isActive ? styles.activeItem : ''}`}
              onClick={() => onSectionClick(index)}
            >
              <div className={styles.contentsNumber}>{index + 1}</div>
              <div className={styles.contentsText}>{title}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const LessonsPage = () => {
  const { topicId, subtopicId } = useParams();
  const navigate = useNavigate();
  const { setLessonCompleted } = useContext(MyDeckContext);
  const { user, loading: authLoading } = useAuth();
  const titleRef = useRef(null);
  const accentRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [isProgrammaticScroll, setIsProgrammaticScroll] = useState(false);
  const [showSkipSnackbar, setShowSkipSnackbar] = useState(false);
  const [userSubtopicData, setUserSubtopicData] = useState(null);
  const [minTimePassed, setMinTimePassed] = useState(false);
  
  // Minimum loading time effect (like ProfilePage)
  useEffect(() => {
    setMinTimePassed(false);
    const timer = setTimeout(() => setMinTimePassed(true), 200);
    return () => clearTimeout(timer);
  }, []); // Only on mount
  
  // Use the lesson data hook
  const { lessonData, loading, error } = useLessonData(subtopicId);
  
  // Use the lesson service
  const { completeLesson } = useLessonService();
  
  // Use the challenge service to get user subtopic data
  const { getUserSubtopic } = useChallengeService();
  
  // Get lesson title from first section if available
  const lessonTitle = lessonData?.[0]?.lessonTitle || "Loading...";

  // Complete lesson when lesson data loads successfully
  useEffect(() => {
    if (lessonData && lessonData.length > 0 && user && subtopicId) {
      // Check if lesson has already been marked as completed
      const lessonCompletionKey = `lesson_completed_${subtopicId}_${user.id}`;
      const isLessonCompleted = localStorage.getItem(lessonCompletionKey);
      
      if (!isLessonCompleted) {
        const markLessonAsCompleted = async () => {
          try {
            console.log('🔍 [LessonsPage] Marking lesson as completed for user:', user.id, 'subtopic:', subtopicId);
            await completeLesson(user.id, parseInt(subtopicId));
            console.log('✅ [LessonsPage] Lesson marked as completed successfully');
            
            // Mark as completed in localStorage to prevent repeated calls
            localStorage.setItem(lessonCompletionKey, 'true');
          } catch (error) {
            console.error('❌ [LessonsPage] Failed to mark lesson as completed:', error);
          }
        };
        markLessonAsCompleted();
      }
    }
      }, [lessonData, user, subtopicId]); // Removed completeLesson from dependencies

  // Fetch user subtopic data to check progress
  useEffect(() => {
    const fetchUserSubtopicData = async () => {
      if (user && subtopicId) {
        try {
          const data = await getUserSubtopic(user.id, subtopicId);
          setUserSubtopicData(data);
        } catch (error) {
          console.error('❌ [LessonsPage] Failed to fetch user subtopic data:', error);
          // Set default data if fetch fails
          setUserSubtopicData({ progress: 0 });
        }
      }
    };

    fetchUserSubtopicData();
  }, [user, subtopicId]); // Removed getUserSubtopic from dependencies

  // Show skip snackbar after lesson loads (only if progress >= 0.66)
  useEffect(() => {
    if (lessonData && lessonData.length > 0 && userSubtopicData) {
      // Calculate progress based on completion status
      let progress = 0;
      if (userSubtopicData.lessons_completed) progress += 0.5; // 50% for lessons
      if (userSubtopicData.practice_completed) progress += 0.5; // 50% for practice
      
      // Only log once when progress is calculated
      if (progress >= 0.66) {
        console.log('✅ [LessonsPage] Progress sufficient (', progress, '>= 0.66), setting up snackbar');
      }
      
      // Only show snackbar if progress is 0.66 (66%) or higher
      if (progress >= 0.66) {
        // Show snackbar after 2 seconds
        const timer = setTimeout(() => {
          setShowSkipSnackbar(true);
        }, 2000);

        // Auto-hide after 7 seconds total (5 seconds visible)
        const hideTimer = setTimeout(() => {
          setShowSkipSnackbar(false);
        }, 7000);

        return () => {
          clearTimeout(timer);
          clearTimeout(hideTimer);
        };
      }
    }
  }, [lessonData, userSubtopicData?.lessons_completed, userSubtopicData?.practice_completed]);

  // Dynamically set accent line width to match title width
  useEffect(() => {
    if (titleRef.current && accentRef.current) {
      const titleWidth = titleRef.current.offsetWidth;
      const defaultWidth = titleWidth * 0.25; 
      accentRef.current.style.width = isHovered ? `${titleWidth}px` : `${defaultWidth}px`;
    }
  }, [lessonData?.title, isHovered]);

  const handleStartChallenges = () => {
    // setLessonCompleted(subtopicId);
    navigate(`/lesson/${topicId}/${subtopicId}/practice`);
  };

  const handleSkipToChallenges = () => {
    setShowSkipSnackbar(false);
    navigate(`/lesson/${topicId}/${subtopicId}/challenges`);
  };

  const handleCloseSkipSnackbar = () => {
    setShowSkipSnackbar(false);
  };

  const handleSectionClick = (sectionIndex) => {
    setCurrentSection(sectionIndex);
    setIsProgrammaticScroll(true);
    
    // Scroll to the section with better positioning
    const sectionElement = document.querySelector(`[data-section="${sectionIndex}"]`);
    if (sectionElement) {
      // Get the document container for proper scrolling context
      const documentContainer = document.querySelector(`.${styles.documentContent}`);
      
      if (documentContainer) {
        // Calculate the scroll position to center the section
        const containerRect = documentContainer.getBoundingClientRect();
        const sectionRect = sectionElement.getBoundingClientRect();
        const scrollTop = documentContainer.scrollTop + (sectionRect.top - containerRect.top) - 100; // 100px offset from top
        
        // Smooth scroll to the calculated position
        documentContainer.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
      } else {
        // Fallback to scrollIntoView if document container not found
        sectionElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
      
      // Re-enable intersection observer after scroll completes
      setTimeout(() => {
        setIsProgrammaticScroll(false);
      }, 1500);
    }
  };

  // Intersection Observer for section detection
  useEffect(() => {
    // Wait for lesson data to be available and sections to be rendered
    if (!lessonData || lessonData.length === 0) return;

    // Function to initialize the intersection observer
    const initializeObserver = () => {
      const sections = document.querySelectorAll('[data-section]');
      
      if (sections.length === 0) {
        console.log('No sections found with data-section attribute, retrying...');
        return false; // Return false to indicate retry needed
      }

      console.log(`Found ${sections.length} sections to observe`);

      const observer = new IntersectionObserver(
        (entries) => {
          // Skip intersection detection during programmatic scrolling
          if (isProgrammaticScroll) {
            return;
          }
          
          // Find the section that is most visible in the viewport
          let bestSection = null;
          let bestScore = -1;

          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const sectionIndex = parseInt(entry.target.getAttribute('data-section'));
              const rect = entry.boundingClientRect;
              const viewportHeight = window.innerHeight;
              
              // Calculate a score based on how much of the section is visible and its position
              const visibleRatio = entry.intersectionRatio;
              const distanceFromTop = Math.abs(rect.top);
              const distanceFromCenter = Math.abs(rect.top + rect.height / 2 - viewportHeight / 2);
              
              // Prioritize sections that are more visible and closer to the center
              const score = visibleRatio * 2 - (distanceFromCenter / viewportHeight);
              
              if (score > bestScore) {
                bestScore = score;
                bestSection = entry.target;
              }
            }
          });

          if (bestSection) {
            const sectionIndex = parseInt(bestSection.getAttribute('data-section'));
            console.log(`Setting current section to: ${sectionIndex}`);
            setCurrentSection(sectionIndex);
          }
        },
        {
          rootMargin: '-20% 0px -20% 0px', // Larger margins for better detection
          threshold: [0.1, 0.3, 0.5, 0.7, 0.9] // Multiple thresholds for smoother detection
        }
      );

      sections.forEach((section) => {
        observer.observe(section);
      });

      // Add scroll event listener as backup for better synchronization
      const documentContainer = document.querySelector(`.${styles.documentContent}`);
      const handleScroll = () => {
        if (isProgrammaticScroll) return;
        
        // Find the section closest to the top of the viewport
        let closestSection = null;
        let closestDistance = Infinity;
        
        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          const distance = Math.abs(rect.top);
          
          if (distance < closestDistance && rect.top <= 200) { // Within 200px of top
            closestDistance = distance;
            closestSection = section;
          }
        });
        
        if (closestSection) {
          const sectionIndex = parseInt(closestSection.getAttribute('data-section'));
          setCurrentSection(sectionIndex);
        }
      };

      if (documentContainer) {
        documentContainer.addEventListener('scroll', handleScroll, { passive: true });
      }

      // Set initial section immediately
      if (sections.length > 0) {
        const firstSection = sections[0];
        const sectionIndex = parseInt(firstSection.getAttribute('data-section'));
        console.log(`Setting initial section to: ${sectionIndex}`);
        setCurrentSection(sectionIndex);
      }

      return () => {
        observer.disconnect();
        if (documentContainer) {
          documentContainer.removeEventListener('scroll', handleScroll);
        }
      };
    };

    // Try to initialize immediately
    let cleanup = initializeObserver();
    
    // If initialization failed, retry with increasing delays
    if (!cleanup) {
      const retryDelays = [50, 100, 200, 500];
      let retryCount = 0;
      
      const retryTimer = setInterval(() => {
        cleanup = initializeObserver();
        retryCount++;
        
        if (cleanup || retryCount >= retryDelays.length) {
          clearInterval(retryTimer);
        }
      }, retryDelays[retryCount] || 100);
      
      return () => {
        clearInterval(retryTimer);
        if (cleanup) cleanup();
      };
    }

    return cleanup;
  }, [lessonData, isProgrammaticScroll]);

  // Helper function to extract code from bullet points
  const extractCodeFromBulletPoints = (bulletPoints) => {
    if (!bulletPoints) return "";
    const codeLines = [];
    let foundOutput = false;
    
    for (const point of bulletPoints) {
      if (point === "Output:") {
        foundOutput = true;
        break;
      }
      if (!foundOutput) {
        codeLines.push(point);
      }
    }
    
    return codeLines.join("\n");
  };

  // Helper function to extract output from bullet points
  const extractOutputFromBulletPoints = (bulletPoints) => {
    if (!bulletPoints) return "";
    const outputLines = [];
    let foundOutput = false;
    
    for (const point of bulletPoints) {
      if (point === "Output:") {
        foundOutput = true;
        continue;
      }
      if (foundOutput) {
        outputLines.push(point);
      }
    }
    
    return outputLines.join("\n");
  };

  // Helper function to calculate Monaco Editor height based on content
  const calculateMonacoHeight = (codeContent) => {
    if (!codeContent) return "200px";
    
    const lines = codeContent.split('\n').length;
    const lineHeight = 24; // Monaco Editor line height
    const padding = 60; // Top and bottom padding
    const calculatedHeight = Math.min(lines * lineHeight + padding, 1000);
    
    return `${calculatedHeight}px`;
  };

  // Loading state (comprehensive like ProfilePage)
  if (authLoading || !user || !minTimePassed || loading) {
    return <LoadingScreen message="Loading lesson content..." />;
  }

  // Error state
  if (error) {
    return <ErrorScreen message={error} />;
  }

  // No lesson data
  if (!lessonData || lessonData.length === 0) {
    return <ErrorScreen message="No lesson content available for this subtopic." />;
  }

  return (
    <LessonThemeProvider>
    <div className={styles.lessonLayout}>
      
      <div 
        className={styles.lessonCard}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={styles.documentContainer}>
          {/* Document Header */}
          <div className={styles.documentHeader}>
            <div className={styles.documentTitle}>
              <div className={styles.titleWrapper}>
                <h1 ref={titleRef}>{lessonTitle}</h1>
                <div className={styles.titleAccent} ref={accentRef}></div>
              </div>
            </div>
          </div>

          {/* Document Content */}
          <div className={styles.documentContent}>
            {/* Dynamic Sections using Content Renderer */}
            {Array.isArray(lessonData) && lessonData.map((section, index) => (
              <section 
                key={index} 
                className={styles.contentSection}
                data-section={index}
              >
                <div className={styles.conceptBlock}>
                  <div className={styles.conceptContent}>
                    <ContentRenderer 
                      section={section}
                      extractCodeFromBulletPoints={extractCodeFromBulletPoints}
                      extractOutputFromBulletPoints={extractOutputFromBulletPoints}
                      calculateMonacoHeight={calculateMonacoHeight}
                    />
                  </div>
                </div>
              </section>
            ))}
          </div>

          {/* Document Footer */}
          <div className={styles.documentFooter}>
            <div className={styles.navigationButtons}>
              <Button 
                className={`${styles.navButton} ${styles.backButton}`}
                onClick={() => navigate(`/my-deck/${topicId}`)}
              >
                ← Back to Topics
              </Button>
              
              <Button
                className={`${styles.navButton} ${styles.startButton}`}
                onClick={handleStartChallenges}
              >
                Start Practice →
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contents Sidebar */}
      {Array.isArray(lessonData) && lessonData.length > 0 && (
        <ContentsSidebar 
          sections={lessonData}
          currentSection={currentSection}
          onSectionClick={handleSectionClick}
        />
      )}
    </div>

          {/* Skip to Challenges Snackbar - Outside main layout for fixed positioning */}
      {showSkipSnackbar && (
        <div className={styles.skipSnackbar}>
          <button 
            className={styles.snackbarCloseButton}
            onClick={handleCloseSkipSnackbar}
            aria-label="Close notification"
          >
            ×
          </button>
          <div className={styles.snackbarContent}>
            <span>Want to skip practice and go straight to challenges?</span>
            <button 
              className={styles.snackbarButton}
              onClick={handleSkipToChallenges}
            >
              Skip to Challenges
            </button>
          </div>
        </div>
      )}
    </LessonThemeProvider>
  );
};

export default LessonsPage;
