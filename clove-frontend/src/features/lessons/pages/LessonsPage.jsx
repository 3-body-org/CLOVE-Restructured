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
import { useChallengeService } from '../services/challengeService';
//loading and error components
import LoadingScreen from "components/layout/StatusScreen/LoadingScreen";
import ErrorScreen from "components/layout/StatusScreen/ErrorScreen";
//security
import DOMPurify from 'dompurify';

//scss
import "../../../styles/components/lesson.scss";

// Content Block Components
const HeadingBlock = ({ heading }) => (
  <h2 className="sectionTitle">{heading}</h2>
);

const IntroTextBlock = ({ introText }) => (
  <div className="conceptText">
    <p className="introText">{introText}</p>
  </div>
);

const ContentBlock = ({ content }) => (
  <div className="conceptText">
    {content.split('\n').map((paragraph, pIndex) => (
      <p key={pIndex} dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(paragraph.trim().replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'))
      }} />
    ))}
  </div>
);

const BulletPointsBlock = ({ bulletPoints }) => (
  <div className="bulletContainer">
    <ul className="bulletList">
      {bulletPoints.map((point, index) => (
        <li key={index} className="bulletItem">
          <span className="bulletIcon"></span>
          <span dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(point.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'))
          }} />
        </li>
      ))}
    </ul>
  </div>
);

const CodeSnippetBlock = ({ codeSnippet, extractCodeFromBulletPoints, extractOutputFromBulletPoints, calculateMonacoHeight }) => (
  <div className="codeExampleContainer">
    <div className="codeEditorWrapper">
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
      <div className="outputContainer">
        <div className="outputHeader">
          <span className="outputLabel">Output</span>
        </div>
        <pre className="outputContent">
          <code>
            {extractOutputFromBulletPoints(codeSnippet)}
          </code>
        </pre>
      </div>
    )}
  </div>
);

const RealWorldBulletPointsBlock = ({ bulletPoints }) => (
  <div className="bulletContainer">
    <ul className="bulletList">
      {bulletPoints.map((point, index) => (
        <li key={index} className="bulletItem">
          <span className="bulletIcon"></span>
          <span dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(point.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'))
          }} />
        </li>
      ))}
    </ul>
  </div>
);

const HowItWorksBlock = ({ bulletPoints }) => (
  <div className="bulletContainer">
    <ul className="bulletList">
      {bulletPoints.map((point, index) => (
        <li key={index} className="bulletItem">
          <span className="bulletIcon"></span>
          <span dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(point.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'))
          }} />
        </li>
      ))}
    </ul>
  </div>
);

const SummaryBlock = ({ summary }) => (
  <div className="summaryBox">
    <h3 className="summaryTitle">Key Takeaways</h3>
    <ul className="summaryList">
      {summary.map((point, index) => (
        <li key={index}>{point}</li>
      ))}
    </ul>
  </div>
);

const ObjectivesBlock = ({ objectives }) => (
  <div className="objectivesBox">
    <h3 className="objectivesTitle">Learning Objectives</h3>
    <div className="bulletContainer">
      <ul className="bulletList">
        {objectives.map((objective, index) => (
          <li key={index} className="bulletItem">
            <span className="bulletIcon"></span>
            {objective}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const LessonTitleBlock = ({ lessonTitle }) => (
  <h1 className="lessonTitle">{lessonTitle}</h1>
);

const LessonIntroBlock = ({ lessonIntro }) => (
  <div className="conceptText">
    <p className="introText">{lessonIntro}</p>
  </div>
);

// Content Renderer Component
const ContentRenderer = ({ section, extractCodeFromBulletPoints, extractOutputFromBulletPoints, calculateMonacoHeight }) => {
  const blocks = [];

  const sectionKeys = Object.keys(section);

  sectionKeys.forEach(key => {
    switch (key) {
      case 'lessonTitle':
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
      
      default:
        break;
    }
  });

  return <div className="sectionContent">{blocks}</div>;
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
    <div className="contentsSidebar">
      <h3 className="contentsTitle">Contents</h3>
      <div className="contentsList">
        {sections.map((section, index) => {
          const title = getSectionTitle(section);
          const isActive = currentSection === index;
          
          return (
            <div 
              key={index} 
              className={`contentsItem ${isActive ? 'activeItem' : ''}`}
              onClick={() => onSectionClick(index)}
            >
              <div className="contentsNumber">{index + 1}</div>
              <div className="contentsText">{title}</div>
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
  
  useEffect(() => {
    setMinTimePassed(false);
    const timer = setTimeout(() => setMinTimePassed(true), 200);
    return () => clearTimeout(timer);
  }, []);
  
  const { lessonData, loading, error } = useLessonData(subtopicId);
  
  const { completeSubtopicComponent } = useContext(MyDeckContext);
  
  const { getUserSubtopic } = useChallengeService();
  
  const lessonTitle = lessonData?.[0]?.lessonTitle || "Loading...";

  // Removed automatic lesson completion - now happens on "Start Practice" button click

  useEffect(() => {
    const fetchUserSubtopicData = async () => {
      if (user && subtopicId) {
        try {
          const data = await getUserSubtopic(user.id, subtopicId);
          setUserSubtopicData(data);
        } catch (error) {
          setUserSubtopicData({ progress: 0 });
        }
      }
    };

    fetchUserSubtopicData();
  }, [user, subtopicId]);

  useEffect(() => {
    if (lessonData && lessonData.length > 0 && userSubtopicData) {
      let progress = 0;
      if (userSubtopicData.lessons_completed) progress += 0.5;
      if (userSubtopicData.practice_completed) progress += 0.5;
      
      if (progress >= 0.66) {
        const timer = setTimeout(() => {
          setShowSkipSnackbar(true);
        }, 2000);

        const hideTimer = setTimeout(() => {
          setShowSkipSnackbar(false);
        }, 10000);

        return () => {
          clearTimeout(timer);
          clearTimeout(hideTimer);
        };
      }
    }
  }, [lessonData, userSubtopicData?.lessons_completed, userSubtopicData?.practice_completed]);

  useEffect(() => {
    if (titleRef.current && accentRef.current) {
      const titleWidth = titleRef.current.offsetWidth;
      const defaultWidth = titleWidth * 0.25; 
      accentRef.current.style.width = isHovered ? `${titleWidth}px` : `${defaultWidth}px`;
    }
  }, [lessonData?.title, isHovered]);

  const handleStartChallenges = async () => {
    // Mark lesson as completed when user clicks "Start Practice"
    if (user && subtopicId) {
      const lessonCompletionKey = `lesson_completed_${subtopicId}_${user.id}`;
      const isLessonCompleted = localStorage.getItem(lessonCompletionKey);
      
      if (!isLessonCompleted) {
        try {
          await completeSubtopicComponent(parseInt(subtopicId), 'lesson');
          localStorage.setItem(lessonCompletionKey, 'true');
        } catch (error) {
          // Handle error silently - don't block navigation
          console.warn('Failed to mark lesson as completed:', error);
        }
      }
    }
    
    // Navigate to practice page
    navigate(`/lesson/${topicId}/${subtopicId}/practice`);
  };

  const handleSkipToChallenges = () => {
    setShowSkipSnackbar(false);
    navigate(`/lesson/${topicId}/${subtopicId}/challenge-instructions`);
  };

  const handleCloseSkipSnackbar = () => {
    setShowSkipSnackbar(false);
  };

  const handleSectionClick = (sectionIndex) => {
    setCurrentSection(sectionIndex);
    setIsProgrammaticScroll(true);
    
    const sectionElement = document.querySelector(`[data-section="${sectionIndex}"]`);
    if (sectionElement) {
      sectionElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      
      setTimeout(() => {
        const currentScrollY = window.scrollY;
        const offset = 100;
        window.scrollTo({
          top: currentScrollY - offset,
          behavior: 'smooth'
        });
      }, 100);
      
      setTimeout(() => {
        setIsProgrammaticScroll(false);
      }, 10);
    }
  };

  useEffect(() => {
    if (!lessonData || lessonData.length === 0) return;

    const initializeObserver = () => {
    const sections = document.querySelectorAll('[data-section]');
    
      if (sections.length === 0) {
        return false;
      }

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll) {
          return;
        }
        
        let bestSection = null;
        let bestScore = -1;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionIndex = parseInt(entry.target.getAttribute('data-section'));
            const rect = entry.boundingClientRect;
            const viewportHeight = window.innerHeight;
            
            const visibleRatio = entry.intersectionRatio;
            const distanceFromTop = Math.abs(rect.top);
            const distanceFromCenter = Math.abs(rect.top + rect.height / 2 - viewportHeight / 2);
            
            const topWeight = rect.top <= 150 ? 2 : 1;
            const score = (visibleRatio * topWeight) - (distanceFromTop / viewportHeight);
            
            if (score > bestScore) {
              bestScore = score;
              bestSection = entry.target;
            }
          }
        });

        if (bestSection) {
          const sectionIndex = parseInt(bestSection.getAttribute('data-section'));
          setCurrentSection(sectionIndex);
        }
      },
      {
        rootMargin: '-10% 0px -60% 0px',
        threshold: [0.3, 0.5, 0.7]
      }
    );

    sections.forEach((section) => {
      observer.observe(section);
    });

      const handleScroll = () => {
        if (isProgrammaticScroll) return;
        
        let closestSection = null;
        let closestDistance = Infinity;
        
        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          const distance = Math.abs(rect.top);
          
          if (distance < closestDistance && rect.top <= 100) {
            closestDistance = distance;
            closestSection = section;
          }
        });
        
        if (closestSection) {
          const sectionIndex = parseInt(closestSection.getAttribute('data-section'));
          setCurrentSection(sectionIndex);
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });

      if (sections.length > 0) {
        const firstSection = sections[0];
        const sectionIndex = parseInt(firstSection.getAttribute('data-section'));
        setCurrentSection(sectionIndex);
      }

      return () => {
        observer.disconnect();
        window.removeEventListener('scroll', handleScroll);
      };
    };

    let cleanup = initializeObserver();
    
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

  const calculateMonacoHeight = (codeContent) => {
    if (!codeContent) return "200px";
    
    const lines = codeContent.split('\n').length;
    const lineHeight = 24;
    const padding = 60;
    const calculatedHeight = Math.min(lines * lineHeight + padding, 1000);
    
    return `${calculatedHeight}px`;
  };

  if (authLoading || !user || !minTimePassed || loading) {
    return <LoadingScreen message="Loading lesson content..." />;
  }

  if (error) {
    return <ErrorScreen message={error} />;
  }

  if (!lessonData || lessonData.length === 0) {
    return <ErrorScreen message="No lesson content available for this subtopic." />;
  }

  return (
    <LessonThemeProvider>
    <div className="lessonLayout">
      
      <div 
        className="lessonCard"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="lessonsPageDocumentContainer">
          <div className="documentHeader">
            <div className="documentTitle">
              <div className="titleWrapper">
                <h1 ref={titleRef}>{lessonTitle}</h1>
                <div className="titleAccent" ref={accentRef}></div>
              </div>
            </div>
          </div>

          <div className="documentContent">
            {Array.isArray(lessonData) && lessonData.map((section, index) => (
              <section 
                key={index} 
                className="contentSection"
                data-section={index}
              >
                <div className="conceptBlock">
                  <div className="conceptContent">
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

          <div className="documentFooter">
            <div className="navigationButtons">
              <Button 
                className="lessonsBackButton"
                onClick={() => navigate(`/my-deck/${topicId}`)}
              >
                ← Back to Topics
              </Button>
              
              <Button
                className="lessonsStartButton"
                onClick={handleStartChallenges}
              >
                Start Practice →
              </Button>
            </div>
          </div>
        </div>
      </div>

      {Array.isArray(lessonData) && lessonData.length > 0 && (
        <ContentsSidebar 
          sections={lessonData}
          currentSection={currentSection}
          onSectionClick={handleSectionClick}
        />
      )}
    </div>

      {showSkipSnackbar && (
        <div className="skipSnackbar">
          <button 
            className="snackbarCloseButton"
            onClick={handleCloseSkipSnackbar}
            aria-label="Close notification"
          >
            ×
          </button>
          <div className="snackbarContent">
            <span>Want to skip lesson & practice, and go straight to challenge?</span>
            <button 
              className="snackbarButton"
              onClick={handleSkipToChallenges}
            >
              Skip to Challenge 
            </button>
          </div>
        </div>
      )}
    </LessonThemeProvider>
  );
};

export default LessonsPage;
