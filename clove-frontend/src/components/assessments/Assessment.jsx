// Assessment.js
import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";

import styles from "components/assessments/styles/Assessment.module.scss";

import { MyDeckContext } from "contexts/MyDeckContext";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "contexts/AuthContext";
// import Assessment from "./Assessment";

const Assessment = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [questionsToAsk, setQuestionsToAsk] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showError, setShowError] = useState(false);
  const [assessmentLocked, setAssessmentLocked] = useState(false);
  const [lockedMessage, setLockedMessage] = useState("");

  const { get, post } = useApi();
  const { user } = useAuth();
  const { topicId, assessmentType } = useParams(); // assessmentType: 'pre' or 'post'
  const numericTopicId = topicId.split('-')[0];
  const navigate = useNavigate();
  const { setPreAssessmentTaken } = useContext(MyDeckContext);

  useEffect(() => {
    // Check if assessment is already completed/locked
    const checkLocked = async () => {
      if (assessmentType === 'pre' && user?.id && numericTopicId) {
        try {
          const res = await get(`/pre_assessments/user/${user.id}/topic/${numericTopicId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.total_items >= 15 || data.is_unlocked === false) {
              setAssessmentLocked(true);
              setLockedMessage("You have already completed this assessment. Retakes are not allowed.");
            }
          }
        } catch {}
      }
    };
    checkLocked();
  }, [assessmentType, user, numericTopicId, get]);

  useEffect(() => {
    if (assessmentLocked) return;
    // Fetch questions from backend
    setIsLoading(true);
    const fetchQuestions = async () => {
      try {
        const response = await get(`/assessment_questions/topic/${numericTopicId}/randomized?assessment_type=${assessmentType}`);
        if (!response.ok) throw new Error("Failed to fetch questions");
        const questions = await response.json();
        setQuestionsToAsk(questions);
      } catch (err) {
        setQuestionsToAsk([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [numericTopicId, assessmentType, assessmentLocked]);

  if (assessmentLocked) {
    return <div style={{ padding: 32, textAlign: 'center', color: 'red' }}>{lockedMessage}</div>;
  }

  if (isLoading) {
    return <div>Loading questions...</div>;
  }

  const currentQuestion = questionsToAsk[questionIndex];

  // Defensive check for backend structure
  if (!currentQuestion || !currentQuestion.question_choices_correctanswer) {
    return <div>Loading question...</div>;
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
      // Optionally handle error
    }
  };

  const handleNextQuestion = () => {
    if (!isAnswered) {
      setShowError(true);
      return;
    }

    setShowError(false);
    if (questionIndex < questionsToAsk.length - 1) {
      setQuestionIndex(questionIndex + 1);
      setProgress(((questionIndex + 1) / questionsToAsk.length) * 100);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      navigate(`/my-deck/${topicId}/assessment/${assessmentType}/result`, {
        state: {
          userAnswers,
          questionsToAsk,
          topicId,
        },
      });
    }
  };

  return (
    <div className={styles.pageContainer}>
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
