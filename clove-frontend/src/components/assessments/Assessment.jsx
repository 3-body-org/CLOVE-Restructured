// Assessment.js
import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "../../styles/components/assessment.scss";

import { MyDeckContext } from "contexts/MyDeckContext";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "contexts/AuthContext";
import { useMyDeckService } from "features/mydeck/hooks/useMydeckService";
import LoadingScreen from "../../components/layout/StatusScreen/LoadingScreen";
import { showErrorNotification, showSuccessNotification } from "../../utils/notifications";
import { getSubtopicContent } from "features/mydeck/content/subtopicContent";
import DOMPurify from 'dompurify';
const Assessment = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [questionsToAsk, setQuestionsToAsk] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showError, setShowError] = useState(false);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isCheckingCompletion, setIsCheckingCompletion] = useState(true);
  const hasFetchedQuestionsRef = useRef(false);

  const { get, post } = useApi();
  const { user } = useAuth();
  const { topicId, assessmentType } = useParams(); // assessmentType: 'pre', 'post', or 'retention-test'
  const numericTopicId = topicId ? topicId.split('-')[0] : null;
  const navigate = useNavigate();
  const { getTopicsWithProgress } = useMyDeckService();
  const { setTopics, loadTopicOverview, refreshTopics } = useContext(MyDeckContext);
  
  // Get theme for dynamic styling using centralized theme system
  const frontendContent = getSubtopicContent(numericTopicId);
  const topicTheme = frontendContent ? frontendContent.theme : 'space';

 // Check if this is a retention test (either from URL or from path)
  const isRetentionTest = assessmentType === 'retention-test' || window.location.pathname.includes('retention-test');

  useEffect(() => {
    // Check if assessment is already completed and restore progress
    const checkCompletedAndRestoreProgress = async () => {
      if (user?.id && numericTopicId) {
        try {
          let endpoint;
          if (isRetentionTest) {
            endpoint = `/assessment_questions/topic/${numericTopicId}/retention-test/status`;
          } else {
            endpoint = assessmentType === 'post' 
              ? `/post_assessments/user/${user.id}/topic/${numericTopicId}`
              : `/pre_assessments/user/${user.id}/topic/${numericTopicId}`;
          }
          
          const res = await get(endpoint);
          if (res.ok) {
            const data = await res.json();
            // For retention test, check if it's completed (has 15 questions answered)
            if (isRetentionTest) {
              if (data.is_completed) {
                setAssessmentCompleted(true);
                setIsRedirecting(true);
                setTimeout(() => {
                  navigate(`/my-deck/${topicId}/retention-test/result`);
                }, 1500);
              } else {
                // Restore progress for retention test
                // Backend returns 'total_answered' for retention tests, not 'total_items'
                const answeredCount = data.total_answered || 0;
                if (answeredCount > 0) {
                  // Don't set questionIndex here - it will be set after questions are loaded
                  // Store the answered count for later use
                  sessionStorage.setItem(`assessment_answered_${numericTopicId}_${assessmentType}`, answeredCount.toString());
                }
              }
            } else {
              // Regular pre/post assessment
              if (data.total_items >= 15) {
                setAssessmentCompleted(true);
                setIsRedirecting(true);
                setTimeout(() => {
                  navigate(`/my-deck/${topicId}/assessment/${assessmentType}/result`);
                }, 1500);
              } else {
                // Restore progress for regular assessment
                const answeredCount = data.total_items || 0;
                if (answeredCount > 0) {
                  // Don't set questionIndex here - it will be set after questions are loaded
                  // Store the answered count for later use
                  sessionStorage.setItem(`assessment_answered_${numericTopicId}_${assessmentType}`, answeredCount.toString());
                }
              }
            }
          }
        } catch (error) {
          // Error checking assessment completion
        } finally {
          // Increased minimum loading time
          setTimeout(() => {
            setIsCheckingCompletion(false);
          }, 1500);
        }
      } else {
        // Increased minimum loading time
        setTimeout(() => {
          setIsCheckingCompletion(false);
        }, 1500);
      }
    };
    checkCompletedAndRestoreProgress();
  }, [assessmentType, user, numericTopicId, get, navigate, topicId, isRetentionTest]);

  useEffect(() => {
    if (assessmentCompleted || isCheckingCompletion) return;
    
    // Prevent multiple fetches
    if (hasFetchedQuestionsRef.current) {
      return;
    }
    
    hasFetchedQuestionsRef.current = true;
    
    // Fetch questions from backend and store in context
    setIsLoading(true);
    const fetchQuestions = async () => {
      try {
        let response;
        if (isRetentionTest) {
          response = await get(`/assessment_questions/topic/${numericTopicId}/retention-test`);
        } else {
          response = await get(`/assessment_questions/topic/${numericTopicId}/randomized?assessment_type=${assessmentType}`);
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch questions: ${response.status} ${errorText}`);
        }
        const questions = await response.json();
        setQuestionsToAsk(questions);
        
        // Restore progress after questions are loaded
        const answeredCountKey = `assessment_answered_${numericTopicId}_${assessmentType}`;
        const storedAnsweredCount = sessionStorage.getItem(answeredCountKey);
        if (storedAnsweredCount) {
          const answeredCount = parseInt(storedAnsweredCount);
          // Set questionIndex to 0 since we're now working with remaining questions
          setQuestionIndex(0);
          // Store the answered count for progress calculation
          sessionStorage.setItem(`assessment_base_progress_${numericTopicId}_${assessmentType}`, answeredCount.toString());
          // Clear the stored value
          sessionStorage.removeItem(answeredCountKey);
        }
        
      } catch (err) {
        setQuestionsToAsk([]);
        // Show error notification
        if (err.message.includes('Failed to fetch')) {
          showErrorNotification('Unable to load assessment questions. Please check your connection and try again.');
        } else {
          showErrorNotification('Failed to load assessment questions. Please try again.');
        }
      } finally {
        // Increased minimum loading time
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };
    fetchQuestions();
  }, [numericTopicId, assessmentType, assessmentCompleted, isCheckingCompletion, isRetentionTest]);

  useEffect(() => {
    if (questionsToAsk.length > 0) {
      // Calculate progress accounting for previously answered questions
      const baseProgressKey = `assessment_base_progress_${numericTopicId}_${assessmentType}`;
      const baseProgress = parseInt(sessionStorage.getItem(baseProgressKey) || '0');
      const currentQuestionNumber = baseProgress + questionIndex + 1;
      setProgress((currentQuestionNumber / 15) * 100);
    }
  }, [questionIndex, questionsToAsk.length, numericTopicId, assessmentType]);

  // Reset fetch flag when component unmounts or assessment type changes
  useEffect(() => {
    return () => {
      hasFetchedQuestionsRef.current = false;
    };
  }, [assessmentType]);

  // Show loading screen while redirecting to results
  if (assessmentCompleted && isRedirecting) {
    return <LoadingScreen message="Loading results..." />;
  }

  // Show loading screen while fetching questions
  if (isLoading) {
    return <LoadingScreen message="Loading questions..." />;
  }



  const currentQuestion = questionsToAsk[questionIndex];

  // Defensive check for backend structure
  if (!currentQuestion || !currentQuestion.question_choices_correctanswer) {
    return <LoadingScreen message="Loading question..." />;
  }

  const handleOptionClick = async (option) => {
    if (isAnswered) return;
    // Use backend structure for correct answer
    const isCorrect = option === currentQuestion.question_choices_correctanswer.correct_answer;
    setSelectedOption(option);
    setIsAnswered(true);
    setUserAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedOption: option,
        isCorrect,
        category: currentQuestion.category, // may be undefined, keep for now
        difficulty: currentQuestion.difficulty,
      },
    ]);
    // Submit answer to backend
    let endpoint;
    let submissionData;
    
    if (isRetentionTest) {
      endpoint = `/assessment_questions/topic/${numericTopicId}/retention-test/submit-answer`;
      submissionData = {
        user_id: user?.id,
        topic_id: parseInt(numericTopicId),
        question_id: currentQuestion.id,
        user_answer: option,
      };
    } else {
      endpoint = assessmentType === 'post'
        ? '/post_assessments/submit-single-answer'
        : '/pre_assessments/submit-single-answer';
      submissionData = {
        user_id: user?.id,
        topic_id: numericTopicId,
        question_id: currentQuestion.id,
        user_answer: option,
      };
    }
    
    try {
      await post(endpoint, submissionData);
    } catch (e) {
      // Error submitting answer
    }
  };

  const handleNextQuestion = async () => {
    if (!isAnswered) {
      setShowError(true);
      return;
    }

    setShowError(false);
    if (questionIndex < questionsToAsk.length - 1) {
      setQuestionIndex(questionIndex + 1);
      // Progress will be updated by the useEffect
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Assessment completed - clean up session storage
      const baseProgressKey = `assessment_base_progress_${numericTopicId}_${assessmentType}`;
      sessionStorage.removeItem(baseProgressKey);
      
      try {
        if (isRetentionTest) {
          // For retention test, just show completion message
          showSuccessNotification('Retention test completed! Viewing your results...');
        } else {
          // For regular assessments, refresh topics to unlock subtopics
          showSuccessNotification('Assessment completed! Viewing your results...');
          
          // Reduced delay to ensure backend has processed the final answer
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // First refresh the topics list
          await refreshTopics();
          
          // Then refresh the topic overview to update unlock status
          if (loadTopicOverview) {
            const parsedTopicId = parseInt(numericTopicId);
            await loadTopicOverview(parsedTopicId, true); // Force refresh
          }
        }
        
      } catch (error) {
        // Failed to refresh topics
      }
      
      // Navigate to result page
      if (isRetentionTest) {
        navigate(`/my-deck/${topicId}/retention-test/result`);
      } else {
        navigate(`/my-deck/${topicId}/assessment/${assessmentType}/result`);
      }
    }
  };

  return (
    <div className={`assessment-page-container theme-${topicTheme}`}>
      <div className="assessment-test-container">
        <div className="assessment-progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="assessment-question-count">
          {(() => {
            const baseProgressKey = `assessment_base_progress_${numericTopicId}_${assessmentType}`;
            const baseProgress = parseInt(sessionStorage.getItem(baseProgressKey) || '0');
            const currentQuestionNumber = baseProgress + questionIndex + 1;
            return `${isRetentionTest ? 'Retention Test' : 'Assessment'} - Question ${currentQuestionNumber} of 15`;
          })()}
        </div>

        <div
          className="assessment-question-text"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentQuestion.question_choices_correctanswer?.question) }}
        />

        <div>
          {currentQuestion.question_choices_correctanswer?.choices?.map((option, index) => {
            const isCorrect = option === currentQuestion.question_choices_correctanswer.correct_answer;
            const isSelected = selectedOption === option;

            return (
              <div
                key={index}
                className={`assessment-option${isSelected && !isCorrect ? ' incorrect' : ''}${isAnswered && isCorrect ? ' correct' : ''}`}
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </div>
            );
          })}
        </div>

        {showError && (
          <div className="assessment-error-message">
            Please select an answer before proceeding.
          </div>
        )}

        <button className="assessment-next-button" onClick={handleNextQuestion}>
          {questionIndex < questionsToAsk.length - 1
            ? "Next Question"
            : "Finish"}
        </button>
      </div>
    </div>
  );
};

export default Assessment;
