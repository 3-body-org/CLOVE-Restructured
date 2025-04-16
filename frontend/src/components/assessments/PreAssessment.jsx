//react
import React, { useState, useEffect } from "react";
//react router
import { useNavigate, useParams } from "react-router-dom";
//components
import { questions } from "./questions.js";
//scss
import styles from "../../scss modules/components/assessments/Assessment.module.scss";

const getRandomQuestions = () => {
  const allQuestions = [
    ...questions.basicLoops,
    ...questions.conditionalStatements,
    ...questions.advancedLoops,
  ];
  const randomQuestions = [];
  const selectedIndices = new Set();

  while (randomQuestions.length < 15) {
    const randomIndex = Math.floor(Math.random() * allQuestions.length);
    if (!selectedIndices.has(randomIndex)) {
      selectedIndices.add(randomIndex);
      randomQuestions.push(allQuestions[randomIndex]);
    }
  }

  return randomQuestions;
};

const PreAssessment = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isAnswered, setIsAnswered] = useState(false); // Track if an answer was selected
  const [questionsToAsk, setQuestionsToAsk] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { topicId } = useParams();
  const navigate = useNavigate();

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
    if (isAnswered) return; // Don't allow selection after answering

    const isCorrect = option === currentQuestion.answer;
    setSelectedOption(option);
    setIsAnswered(true);

    let category = "";
    if (currentQuestion.id >= 5) {
      category = "Basic Loops";
    } else if (currentQuestion.id >= 10) {
      category = "Conditional Statements";
    } else {
      category = "Advanced Loops";
    }

    setUserAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedOption: option,
        isCorrect,
        category,
      },
    ]);
  };

  const handleNextQuestion = () => {
    if (questionIndex < questionsToAsk.length - 1) {
      setQuestionIndex(questionIndex + 1);
      setProgress((prevProgress) => prevProgress + 100 / questionsToAsk.length);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      navigate(`/my-deck/${topicId}/pre-assessment/result`, {
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
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              className={`${styles.option} 
                ${
                  selectedOption === option
                    ? currentQuestion.answer === option
                      ? styles.correct
                      : styles.incorrect
                    : ""
                } 
                ${isAnswered ? styles.disabled : ""} 
                ${selectedOption === option && isAnswered ? styles.shake : ""}`}
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </div>
          ))}
        </div>
        <button className={styles.nextBtn} onClick={handleNextQuestion}>
          {questionIndex < questionsToAsk.length - 1
            ? "Next Question"
            : "Finish"}
        </button>
      </div>
    </div>
  );
};

export default PreAssessment;
