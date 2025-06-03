// Assessment.js
import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AssessmentData } from "./AssessmentData";

import styles from "components/assessments/styles/Assessment.module.scss";

import { MyDeckContext } from "contexts/MyDeckContext";
// import Assessment from "./Assessment";

const getRandomQuestions = () => {
  const selectedQuestions = [];

  AssessmentData.subtopics.forEach((subtopic, subtopicIndex) => {
    const difficulties = ["easy", "medium", "hard"];
    const pool = [];

    difficulties.forEach((level) => {
      subtopic.questions[level].forEach((q, idx) => {
        pool.push({
          ...q,
          category: subtopic.title,
          difficulty: level,
          id: `${subtopicIndex}-${level}-${idx}`,
        });
      });
    });

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const chosen = pool.slice(0, 5);
    selectedQuestions.push(...chosen);
  });

  return selectedQuestions;
};

const Assessment = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [questionsToAsk, setQuestionsToAsk] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showError, setShowError] = useState(false);

  const { topicId } = useParams();
  const navigate = useNavigate();
  const { setPreAssessmentTaken } = useContext(MyDeckContext);

  useEffect(() => {
    const randomQuestions = getRandomQuestions();
    setQuestionsToAsk(randomQuestions);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading questions...</div>;
  }

  const currentQuestion = questionsToAsk[questionIndex];

  const handleOptionClick = (option) => {
    if (isAnswered) return;

    const isCorrect = option === currentQuestion.answer;
    setSelectedOption(option);
    setIsAnswered(true);

    setUserAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedOption: option,
        isCorrect,
        category: currentQuestion.category,
        difficulty: currentQuestion.difficulty,
      },
    ]);
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
      navigate(`/my-deck/${topicId}/assessment/result`, {
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
          dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
        />

        <div className={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isCorrect = option === currentQuestion.answer;
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
