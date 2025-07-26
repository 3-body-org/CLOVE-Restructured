//react
import React, { useEffect, useRef, useState, useContext } from "react";
//react router
import { useParams, useNavigate } from "react-router-dom";
//react confetti
import ReactConfetti from "react-confetti"; // Import the confetti component
//scss
import styles from "components/assessments/styles/AssessmentResult.module.scss";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "contexts/AuthContext";
import { useMyDeckService } from "features/mydeck/hooks/useMydeckService";
import { MyDeckContext } from "contexts/MyDeckContext";
import LoadingScreen from "../../components/layout/StatusScreen/LoadingScreen";

const AssessmentResult = () => {
  const { user } = useAuth();
  const { topicId, assessmentType } = useParams();
  const numericTopicId = topicId ? topicId.split('-')[0] : null;
  const navigate = useNavigate();
  const { getTopicsWithProgress, getComprehensiveAssessmentResults } = useMyDeckService();
  const { setTopics, loadTopicOverview, refreshTopics, assessmentQuestions } = useContext(MyDeckContext);

  // For tracking the size of the .resultsContainer
  const resultsContainerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // State for comprehensive assessment results
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedSubtopic, setExpandedSubtopic] = useState(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!user?.id || !numericTopicId || !assessmentType) {
      setLoading(false);
      return;
    }
    
    // Prevent multiple fetches
    if (hasFetchedRef.current) {
      return;
    }
    
    hasFetchedRef.current = true;
    setLoading(true);
    setError("");
    
    const fetchAssessmentData = async () => {
      try {
        // Use the comprehensive assessment results function
        const comprehensiveResults = await getComprehensiveAssessmentResults(numericTopicId, assessmentType);
        setResults(comprehensiveResults);
      } catch (error) {
        console.error('Error fetching assessment data:', error);
        setError("Failed to fetch assessment result.");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      }
    };
    
    fetchAssessmentData();
  }, [user, numericTopicId, assessmentType, getComprehensiveAssessmentResults]);

  // Reset fetch flag when component unmounts
  useEffect(() => {
    return () => {
      hasFetchedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (resultsContainerRef.current) {
      setContainerWidth(resultsContainerRef.current.offsetWidth);
      setContainerHeight(resultsContainerRef.current.offsetHeight);
    }
  }, []);

  if (loading) return <LoadingScreen message="Loading assessment results..." />;
  if (error) return <div>{error}</div>;
  if (!results) return <div>No result data available.</div>;
  if (!numericTopicId) return <div>Invalid topic ID.</div>;
  
  // Check if assessment is completed - use actual total items
  const actualTotalItems = results.assessment.total_items || results.totalQuestions;
  const isCompleted = results.assessment.is_completed || actualTotalItems >= 15;
  if (!isCompleted) return <div>Assessment not completed yet. Please complete all questions.</div>;

  // Calculate motivational message based on actual score
  const scorePercentage = results.scorePercentage;
  let feedback = "Keep practicing!";
  if (scorePercentage >= 80) feedback = "Excellent! You're a master of this topic!";
  else if (scorePercentage >= 60) feedback = "Great job! You're almost there!";
  else if (scorePercentage >= 40) feedback = "Good effort! Review the material and try again.";

  // Get subtopic data for overview
  const subtopicData = Object.values(results.questionsBySubtopic).map(subtopic => ({
    id: subtopic.id,
    name: subtopic.name,
    score: `${subtopic.correctCount}/${subtopic.totalCount}`,
    percentage: Math.round((subtopic.correctCount / subtopic.totalCount) * 100),
    questions: subtopic.questions
  }));
  
  // Debug subtopic data
  console.log('🔍 Subtopic Data:', subtopicData);

  // Handle the finish button to navigate to the topic page
  const handleFinish = async () => {
    try {
      // Refresh topics to update progress
      await refreshTopics();
      
      // Also refresh topic overview to ensure unlock status is updated
      if (loadTopicOverview) {
        const parsedTopicId = parseInt(numericTopicId);
        await loadTopicOverview(parsedTopicId, true); // Force refresh
      }
    } catch (error) {
      console.error('Failed to refresh topics:', error);
    }
    // Navigate back to topic page
    navigate(`/my-deck/${topicId}`);
  };

  // Difficulty mapping for consistent colors
  const difficultyColors = {
    easy: '#10b981',      // Green
    medium: '#f59e0b',    // Yellow  
    hard: '#ef4444',      // Red
    intermediate: '#f59e0b', // Yellow (alias for medium)
    advanced: '#ef4444'   // Red (alias for hard)
  };

  // Debug logging
  console.log('🔍 Comprehensive Assessment Results:', {
    assessmentType,
    totalCorrect: results.totalCorrect,
    totalQuestions: results.totalQuestions,
    scorePercentage: results.scorePercentage,
    actualTotalItems: results.assessment.total_items,
    assessmentData: results.assessment,
    questionsBySubtopic: results.questionsBySubtopic,
    storedAssessmentQuestions: assessmentQuestions[`${numericTopicId}-${assessmentType}`]
  });

  return (
    <div className={styles.pageContainer}>
      <div className={styles.resultsContainer} ref={resultsContainerRef}>
        {/* Confetti effect only inside the card */}
        {containerWidth > 0 && containerHeight > 0 && scorePercentage >= 80 && (
          <ReactConfetti
            width={containerWidth}
            height={containerHeight}
            numberOfPieces={200}
            gravity={0.05}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 10, // Ensure it's above content
            }}
          />
        )}

        <div className={styles.holographicEffect}></div>
        
        {/* Header Section */}
        <div className={styles.resultsHeader}>
          <h1 className={styles.resultsTitle}>Test Results</h1>
          <p className={styles.resultsSubtitle}>Here's how you performed on the assessment</p>
          <div className={styles.totalScore}>
            {results.totalCorrect}/{results.totalQuestions}
          </div>
          <div className={styles.feedback}>{feedback}</div>
          
          {/* Difficulty Legend */}
          <div className={styles.difficultyLegend}>
            <span className={styles.legendTitle}>Difficulty:</span>
            <div className={styles.legendChips}>
              <span className={styles.legendChip} style={{ backgroundColor: difficultyColors.easy }}>
                Easy
              </span>
              <span className={styles.legendChip} style={{ backgroundColor: difficultyColors.medium }}>
                Medium
              </span>
              <span className={styles.legendChip} style={{ backgroundColor: difficultyColors.hard }}>
                Hard
              </span>
            </div>
          </div>
        </div>

        {/* Subtopic Overview */}
        <div className={styles.subtopicOverview}>
          {subtopicData.map((subtopic, index) => (
            <div key={subtopic.id} className={styles.subtopicCard}>
              <div className={styles.subtopicHeader}>
                <div className={styles.subtopicInfo}>
                  <h3 className={styles.subtopicName}>{subtopic.name}</h3>
                  <div className={styles.subtopicScore}>{subtopic.score}</div>
                </div>
                <button 
                  className={styles.expandBtn}
                  onClick={() => setExpandedSubtopic(expandedSubtopic === subtopic.id ? null : subtopic.id)}
                >
                  {expandedSubtopic === subtopic.id ? '▼' : '▶'}
                </button>
              </div>
              
              {/* Colored Lines for Questions - Only show when collapsed */}
              {expandedSubtopic !== subtopic.id && (
                <div className={styles.questionLines}>
                  {subtopic.questions.map((question, qIndex) => {
                    const difficulty = question.difficulty?.toLowerCase() || 'easy';
                    // Use difficulty mapping for consistent colors
                    const lineColor = question.isCorrect 
                      ? difficultyColors[difficulty] || difficultyColors.easy
                      : '#6b7280'; // Gray for incorrect
                    
                    const handleLineClick = () => {
                      // Expand the subtopic and scroll to the specific question
                      setExpandedSubtopic(subtopic.id);
                      // Add a small delay to ensure the expansion happens first
                      setTimeout(() => {
                        const questionElement = document.querySelector(`[data-question="${subtopic.id}-${qIndex}"]`);
                        if (questionElement) {
                          questionElement.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                          });
                        }
                      }, 100);
                    };
                    
                    return (
                      <div key={qIndex} className={styles.questionLine}>
                        <div 
                          className={`${styles.line} ${!question.isCorrect ? styles.incorrect : ''}`}
                          style={{ backgroundColor: lineColor }}
                          title={`Click to view Question ${qIndex + 1}: ${question.isCorrect ? 'Correct' : 'Incorrect'} (${difficulty})`}
                          onClick={handleLineClick}
                        ></div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Expanded Question Details */}
              {expandedSubtopic === subtopic.id && (
                <div className={styles.questionDetails}>
                  <div className={styles.questionBreakdown}>
                    {subtopic.questions.map((question, qIndex) => (
                      <div key={qIndex} className={styles.questionItem} data-question={`${subtopic.id}-${qIndex}`}>
                        <div className={styles.questionHeader}>
                          <div className={styles.questionNumberContainer}>
                          <span className={styles.questionNumber}>Question {qIndex + 1}</span>
                            <div 
                              className={styles.difficultyChip}
                              style={{ backgroundColor: difficultyColors[question.difficulty?.toLowerCase() || 'easy'] }}
                              title={`${question.difficulty || 'Easy'} difficulty`}
                            ></div>
                          </div>
                        </div>
                        <div className={styles.questionText}>
                          {typeof question.question === 'string' && question.question !== 'Question text not available'
                            ? question.question 
                            : `Question ${qIndex + 1}`}
                        </div>
                        {question.choices && question.choices.length > 0 && (
                          <div className={styles.choicesSection}>
                            <span className={styles.choicesLabel}>Choices:</span>
                            <div className={styles.choicesList}>
                              {question.choices.map((choice, choiceIndex) => (
                                <span 
                                  key={choiceIndex} 
                                  className={`${styles.choice} ${
                                    choice === question.correctAnswer ? styles.correctChoice : ''
                                  } ${
                                    choice === question.userAnswer && !question.isCorrect ? styles.incorrectChoice : ''
                                  }`}
                                >
                                  {String.fromCharCode(65 + choiceIndex)}. {choice}
                            </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {question.explanation && (
                          <div className={styles.explanation}>
                            <span className={styles.explanationLabel}>Explanation:</span>
                            <span className={styles.explanationText}>{question.explanation}</span>
                            </div>
                          )}
                        {/* Removed redundant answer section since choices show correct/incorrect answers visually */}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button className={styles.finishBtn} onClick={handleFinish}>
          Finish & Continue Learning
        </button>
      </div>
    </div>
  );
};

export default AssessmentResult;
