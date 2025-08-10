// Assessment.js
import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import styles from "components/assessments/styles/Assessment.module.scss";

import { MyDeckContext } from "contexts/MyDeckContext";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "contexts/AuthContext";
import { useMyDeckService } from "features/mydeck/hooks/useMydeckService";
import LoadingScreen from "../../components/layout/StatusScreen/LoadingScreen";
import { showErrorNotification, showSuccessNotification } from "../../utils/notifications";
import { getSubtopicContent } from "features/mydeck/content/subtopicContent";

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
  const { topicId, assessmentType } = useParams(); // assessmentType: 'pre' or 'post'
  const numericTopicId = topicId ? topicId.split('-')[0] : null;
  const navigate = useNavigate();
  const { getTopicsWithProgress } = useMyDeckService();
  const { setTopics, loadTopicOverview, refreshTopics, getAssessmentQuestionsSummary } = useContext(MyDeckContext);
  
  // Get theme for dynamic styling
  const frontendContent = getSubtopicContent(numericTopicId);
  const theme = frontendContent?.theme || 'space';

  useEffect(() => {
    // Check if assessment is already completed
    const checkCompleted = async () => {
      if (user?.id && numericTopicId) {
        try {
          const endpoint = assessmentType === 'post' 
            ? `/post_assessments/user/${user.id}/topic/${numericTopicId}`
            : `/pre_assessments/user/${user.id}/topic/${numericTopicId}`;
          
          const res = await get(endpoint);
          if (res.ok) {
            const data = await res.json();
            if (data.total_items >= 15) {
              setAssessmentCompleted(true);
              setIsRedirecting(true);
              // Navigate to result page after a short delay
              setTimeout(() => {
                navigate(`/my-deck/${topicId}/assessment/${assessmentType}/result`);
              }, 1500); // Increased delay to show loading screen
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
    checkCompleted();
  }, [assessmentType, user, numericTopicId, get, navigate, topicId]);

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
        // Get questions summary and store in context
        try {
          await getAssessmentQuestionsSummary(numericTopicId, assessmentType);
        } catch (summaryError) {
          // Failed to fetch questions summary, continuing without it
          // Continue without the summary - it's not critical for the assessment to work
        }
        
        const response = await get(`/assessment_questions/topic/${numericTopicId}/randomized?assessment_type=${assessmentType}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch questions: ${response.status} ${errorText}`);
        }
        const questions = await response.json();
        setQuestionsToAsk(questions);
        

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
  }, [numericTopicId, assessmentType, assessmentCompleted, isCheckingCompletion]);

  useEffect(() => {
    if (questionsToAsk.length > 0) {
      setProgress(((questionIndex + 1) / questionsToAsk.length) * 100);
    }
  }, [questionIndex, questionsToAsk.length]);

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
    const endpoint = assessmentType === 'post'
      ? '/post_assessments/submit-single-answer'
      : '/pre_assessments/submit-single-answer';
    try {
      await post(endpoint, {
        user_id: user?.id,
        topic_id: numericTopicId,
        question_id: currentQuestion.id,
        user_answer: option,
      });
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
      setProgress(((questionIndex + 2) / questionsToAsk.length) * 100); // +2 because we're moving to next question
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Assessment completed - immediately refresh topics to unlock subtopics
      try {
        // Show success notification
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
        
      } catch (error) {
        // Failed to refresh topics
      }
      
      // Navigate to result page after refreshing topics
      navigate(`/my-deck/${topicId}/assessment/${assessmentType}/result`);
    }
  };

  return (
    <div className={styles.pageContainer} data-theme={theme}>
      <div className={styles.testContainer}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className={styles.questionCount}>
          Question {questionIndex + 1} of {questionsToAsk.length}
        </div>

        <div
          className={styles.questionText}
          dangerouslySetInnerHTML={{ __html: currentQuestion.question_choices_correctanswer?.question }}
        />

        <div className={styles.optionsContainer}>
          {currentQuestion.question_choices_correctanswer?.choices?.map((option, index) => {
            const isCorrect = option === currentQuestion.question_choices_correctanswer.correct_answer;
            const isSelected = selectedOption === option;

            return (
              <div
                key={index}
                className={`${styles.option} 
                  ${isSelected && !isCorrect ? styles.incorrect : ""}
                  ${isAnswered && isCorrect ? styles.correct : ""}
                  ${isAnswered ? styles.disabled : ""}`}
                onClick={() => handleOptionClick(option)}
              >
                {option}
                {isAnswered && isCorrect && (
                  <div className={styles.checkmark}></div>
                )}
                {isSelected && !isCorrect && (
                  <div className={styles.crossmark}></div>
                )}
              </div>
            );
          })}
        </div>

        {showError && (
          <div className={styles.errorMessage}>
            Please select an answer before proceeding.
          </div>
        )}

        <button className={styles.nextBtn} onClick={handleNextQuestion}>
          {questionIndex < questionsToAsk.length - 1
            ? "Next Question"
            : "Finish"}
        </button>
      </div>
    </div>
  );
};

export default Assessment;
