// React
import React, { useState, useEffect } from "react";
// React Router
import { useNavigate, useParams } from "react-router-dom";
// Import your new quiz data structure
import { AssessmentData } from "./AssessmentData"; // Adjust path if necessary
// SCSS styles
import styles from "../../scss modules/components/assessments/Assessment.module.scss";

// Flatten all questions into one array for easy access
const getRandomQuestions = () => {
  const selectedQuestions = [];

  AssessmentData.subtopics.forEach((subtopic, subtopicIndex) => {
    const difficulties = ['easy', 'medium', 'hard'];
    const pool = [];

    // Collect all questions with labeled difficulty
    difficulties.forEach((level) => {
      subtopic.questions[level].forEach((q, idx) => {
        pool.push({
          ...q,
          category: subtopic.title,
          difficulty: level,
          id: `${subtopicIndex}-${level}-${idx}`
        });
      });
    });

    // Shuffle pool to randomize
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Pick 5 random questions with mixed difficulties
    const chosen = pool.slice(0, 5);

    // ✅ Simplified debug: Just log total selected
    console.log(`Selected ${chosen.length} questions from subtopic: "${subtopic.title}"`);

    selectedQuestions.push(...chosen);
  });

  return selectedQuestions;
};


const PreAssessment = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isAnswered, setIsAnswered] = useState(false);
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
        difficulty: currentQuestion.difficulty
      }
    ]);
  };

  const handleNextQuestion = () => {
    if (questionIndex < questionsToAsk.length - 1) {
      setQuestionIndex(questionIndex + 1);
      setProgress(((questionIndex + 1) / questionsToAsk.length) * 100);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      navigate(`/my-deck/${topicId}/pre-assessment/result`, {
        state: {
          userAnswers,
          questionsToAsk,
          topicId
        }
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
                ${selectedOption === option
                  ? currentQuestion.answer === option
                    ? styles.correct
                    : styles.incorrect
                  : ""}
                ${isAnswered ? styles.disabled : ""}
                ${selectedOption === option && isAnswered ? styles.shake : ""}
              `}
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </div>
          ))}
        </div>

        <button className={styles.nextBtn} onClick={handleNextQuestion}>
          {questionIndex < questionsToAsk.length - 1 ? "Next Question" : "Finish"}
        </button>
      </div>
    </div>
  );
};

export default PreAssessment;
