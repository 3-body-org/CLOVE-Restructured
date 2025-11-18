//react
import React, { useEffect, useRef, useState, useContext } from "react";
//react router
import { useParams, useNavigate } from "react-router-dom";
//react confetti
import ReactConfetti from "react-confetti"; // Import the confetti component
//scss
import "../../styles/components/assessment.scss";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "contexts/AuthContext";
import { useMyDeckService } from "features/mydeck/hooks/useMydeckService";
import { MyDeckContext } from "contexts/MyDeckContext";
import LoadingScreen from "../../components/layout/StatusScreen/LoadingScreen";
import { getSubtopicContent } from "features/mydeck/content/subtopicContent";
import { getThemeCursor } from "../../utils/themeCursors";

const AssessmentResult = ({ topicId: topicIdFromProps, assessmentType: assessmentTypeFromProps }) => {
  const { user } = useAuth();
  const { topicId: topicIdFromParams, assessmentType: assessmentTypeFromParams } = useParams();
  const navigate = useNavigate();

  // Use props if available, otherwise fall back to params
  const topicId = topicIdFromProps || topicIdFromParams;
  const assessmentType = assessmentTypeFromProps || assessmentTypeFromParams;

  const numericTopicId = topicId ? String(topicId).split('-')[0] : null;

  // Determine assessment type from URL params or URL path
  const currentPath = window.location.pathname;
  const isRetentionTest = currentPath.includes('retention-test');
  const actualAssessmentType = assessmentType || (isRetentionTest ? 'retention-test' : null);

  // Get topic theme for styling
  const { getComprehensiveAssessmentResults } = useMyDeckService();
  const { loadTopicOverview, refreshTopics } = useContext(MyDeckContext);
  const { get } = useApi();
  
  // Get theme for dynamic styling using centralized theme system
  const frontendContent = getSubtopicContent(numericTopicId);
  const topicTheme = frontendContent ? frontendContent.theme : 'space';

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
    if (!user?.id || !topicId || !actualAssessmentType) {
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
        let comprehensiveResults;
        
        if (actualAssessmentType === 'retention-test') {
          // For retention tests, fetch comprehensive results from the new endpoint
          // Get stage from URL params if available
          const urlParams = new URLSearchParams(window.location.search);
          const stage = urlParams.get('stage');
          const stageParam = stage ? `?stage=${stage}` : '';
          
          const response = await get(`/assessment_questions/topic/${numericTopicId}/retention-test/results${stageParam}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch retention test results: ${response.status}`);
          }
          
          comprehensiveResults = await response.json();
        } else {
          // For regular assessments, use the comprehensive assessment results function
          comprehensiveResults = await getComprehensiveAssessmentResults(numericTopicId, actualAssessmentType);
        }
        
        setResults(comprehensiveResults);
      } catch (error) {
        setError("Failed to fetch assessment result.");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      }
    };
    
    fetchAssessmentData();
  }, [user, topicId, actualAssessmentType, getComprehensiveAssessmentResults, get]);

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
  if (!topicId) return <div>Invalid topic ID.</div>;
  
  // Check if assessment is completed - use actual total items
  const actualTotalItems = results.assessment.total_items || results.totalQuestions;
  const isCompleted = results.assessment.is_completed || actualTotalItems >= 15;
  if (!isCompleted) return <div>Assessment not completed yet. Please complete all questions.</div>;

  // Calculate motivational message based on actual score
  const scorePercentage = results.scorePercentage;
  let feedback = "Keep practicing!";
  
  if (actualAssessmentType === 'retention-test') {
    if (scorePercentage >= 80) feedback = "Excellent! You've retained the knowledge well!";
    else if (scorePercentage >= 60) feedback = "Great job! Your retention is good!";
    else if (scorePercentage >= 40) feedback = "Good effort! Review the material to improve retention.";
  } else {
    if (scorePercentage >= 80) feedback = "Excellent! You're a master of this topic!";
    else if (scorePercentage >= 60) feedback = "Great job! You're almost there!";
    else if (scorePercentage >= 40) feedback = "Good effort! Review the material and try again.";
  }

  // Function to normalize difficulty values (internal use only)
  const normalizeDifficulty = (difficulty) => {
    if (!difficulty) return 'easy';
    
    const lower = difficulty.toLowerCase();
    if (lower === 'medium' || lower === 'average') return 'medium';
    if (lower === 'hard') return 'hard';
    return 'easy'; // default to easy
  };
  
  // Function to get display text for difficulty
  const getDifficultyDisplay = (difficulty) => {
    const normalized = normalizeDifficulty(difficulty);
    if (normalized === 'medium') return 'Average';
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  // Get subtopic data for overview
  const subtopicData = Object.values(results.questionsBySubtopic).map(subtopic => ({
    id: subtopic.id,
    name: subtopic.name,
    score: `${subtopic.correctCount}/${subtopic.totalCount}`,
    percentage: Math.round((subtopic.correctCount / subtopic.totalCount) * 100),
    questions: subtopic.questions.map(question => ({
      ...question,
      // Normalize the data structure for both assessment types
      isCorrect: question.is_correct || question.isCorrect || false,
      difficulty: normalizeDifficulty(question.difficulty),
      question: question.question_text || question.question || 'Question text not available',
      choices: question.question_choices || question.choices || [],
      correctAnswer: question.correct_answer || question.correctAnswer,
      userAnswer: question.user_answer || question.userAnswer,
      explanation: question.explanation || null  // Include explanation field
    }))
  }));

  // Handle the finish button to navigate to the appropriate page
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
      // Failed to refresh topics
    }
    
    // Navigate based on assessment type
    if (actualAssessmentType === 'retention-test') {
      // For retention tests, go back to My Deck page to see overall progress
      navigate('/my-deck');
    } else {
      // For regular assessments, go back to the specific topic page
      navigate(`/my-deck/${topicId}`);
    }
  };

  // Difficulty mapping using official CLOVE color palette - Updated to match Dashboard/Progress logic
  const difficultyColors = {
    easy: '#10b981',      // Green (Advanced)
    medium: '#f59e0b',    // Orange (Intermediate)  
    hard: '#ef4444',      // Red (Beginner)
    // Map alternative labels to the same colors
    beginner: '#10b981',  // Green (Advanced)
    intermediate: '#f59e0b', // Orange (Intermediate)
    advanced: '#ef4444'   // Red (Beginner)
  };

  // Decoupled color mapping for correctness
  const correctnessColors = {
    correct: '#10b981',   // Green for correct
    incorrect: '#ef4444'  // Red for incorrect
  };

  return (
    <div className={`assessment-results-page-container theme-${topicTheme}`} style={{ cursor: getThemeCursor(topicTheme) }}>
      <div className="assessment-results-container" ref={resultsContainerRef}>
        {containerWidth > 0 && containerHeight > 0 && scorePercentage >= 80 && (
          <ReactConfetti
            width={containerWidth}
            height={containerHeight}
            numberOfPieces={200}
            gravity={0.05}
            style={{ position: "absolute", top: 0, left: 0, zIndex: 10 }}
          />
        )}

        <div className="assessment-holographic-effect"></div>
        
        <div className="results-header">
          <h1 className="results-title">
            {actualAssessmentType === 'retention-test' ? 'Retention Test Results' : 'Assessment Test Results'}
          </h1>
          <p>
            Here's how you performed on the {actualAssessmentType === 'retention-test' ? 'retention test' : 'assessment'}
	</p>
          <div className="total-score">
            {results.totalCorrect}/{results.totalQuestions}
          </div>
          <div className="feedback">{feedback}</div>
          
          <div className="difficulty-legend">
            <span className="legend-title">Difficulty:</span>
            <div className="legend-chips">
              <span className="legend-chip" style={{ backgroundColor: difficultyColors.easy }}>
                Easy
              </span>
              <span className="legend-chip" style={{ backgroundColor: difficultyColors.medium }}>
                Average
              </span>
              <span className="legend-chip" style={{ backgroundColor: difficultyColors.hard }}>
                Hard
              </span>
            </div>
          </div>
        </div>

        <div className="results-content">
          <div className="subtopic-overview">
            {subtopicData.map((subtopic) => (
              <div key={subtopic.id} className="subtopic-card">
                <div className="subtopic-header">
                  <div className="subtopic-info">
                    <h3 className="subtopic-title">{subtopic.name}</h3>
                    <div className="subtopic-score">{subtopic.score}</div>
                  </div>
                  <button 
                    className="expand-btn"
                    onClick={() => setExpandedSubtopic(expandedSubtopic === subtopic.id ? null : subtopic.id)}
                  >
                    {expandedSubtopic === subtopic.id ? '▼' : '▶'}
                  </button>
                </div>
                
                {/* Colored Lines for Questions - Only show when collapsed */}
                {expandedSubtopic !== subtopic.id && (
                  <div className="question-lines">
                    {subtopic.questions.map((question, qIndex) => {
                      const handleLineClick = () => {
                        setExpandedSubtopic(subtopic.id);
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
                        <div key={qIndex} className="question-line">
                          <div 
                            className={`line ${question.isCorrect ? 'correct' : 'incorrect'}`}
                            onClick={handleLineClick}
                            title={`Question ${qIndex + 1}: ${question.isCorrect ? 'Correct' : 'Incorrect'}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Expanded Question Details */}
                {expandedSubtopic === subtopic.id && (
                  <div className="question-details">
                    <div className="question-breakdown">
                      {subtopic.questions.map((question, qIndex) => (
                        <div key={qIndex} className="question-item" data-question={`${subtopic.id}-${qIndex}`}>
                          <div className="question-header">
                            <div className="question-number-container">
                              <span className="question-number">Question {qIndex + 1}</span>
                              <div 
                                className="difficulty-chip"
                                style={{ 
                                  backgroundColor: difficultyColors[question.difficulty?.toLowerCase() || 'easy']
                                }}
                                title={`${getDifficultyDisplay(question.difficulty)} difficulty`}
                              >
                                {getDifficultyDisplay(question.difficulty)}
                              </div>
                          </div>
                        </div>
                          <div className="question-text">
                          {typeof question.question === 'string' && question.question !== 'Question text not available'
                            ? question.question 
                            : `Question ${qIndex + 1}`}
                        </div>
                        {question.choices && question.choices.length > 0 && (
                            <div className="choices-section">
                              <span className="choices-label">Choices:</span>
                              <div className="choices-list">
                              {question.choices.map((choice, choiceIndex) => (
                                <span 
                                  key={choiceIndex} 
                                    className={`choice ${
                                      choice === question.correctAnswer ? 'correct-choice' : ''
                                  } ${
                                      choice === question.userAnswer && !question.isCorrect ? 'incorrect-choice' : ''
                                  }`}
                                >
                                  {String.fromCharCode(65 + choiceIndex)}. {choice}
                            </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {question.explanation && (
                            <div className="explanation">
                              <span className="explanation-label">Explanation:</span>
                              <span className="explanation-text">{question.explanation}</span>
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
        </div>

        <button className="finish-button" onClick={handleFinish}>
          {actualAssessmentType === 'retention-test' ? 'Finish & Return to My Deck' : 'Finish & Continue Learning'}
        </button>
      </div>
    </div>
  );
};

export default AssessmentResult;
