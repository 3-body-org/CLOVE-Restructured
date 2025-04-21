import React, { useState, useEffect, useRef } from "react";
import styles from "../../../scss modules/pages/challenges page/modes page/CodeFixer.module.scss";

const OutputTracing = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [selectedOption, setSelectedOption] = useState(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const timerInterval = useRef(null);

  const questions = [
    {
      code: [
        "public class VariableAnalysis {",
        "    public static void main(String[] args) {",
        "        int a = 5;",
        "        int b = a++;",
        "        int c = ++a;",
        '        System.out.println("a: " + a + ", b: " + b + ", c: " + c);',
        "    }",
        "}",
      ],
      question: "What will be the output of this code?",
      options: [
        { text: "a: 5, b: 5, c: 6", correct: false },
        { text: "a: 6, b: 5, c: 5", correct: false },
        { text: "a: 5, b: 6, c: 6", correct: false },
        { text: "a: 7, b: 5, c: 7", correct: true },
      ],
      explanation:
        "a++ is post-increment (returns 5 then increments), ++a is pre-increment (increments then returns 7)",
      expectedOutput: "a: 7, b: 5, c: 7",
    },
    {
      code: [
        "public class ReferenceTest {",
        "    public static void main(String[] args) {",
        '        String s1 = "hello";',
        "        String s2 = s1;",
        '        s1 = "world";',
        "        System.out.println(s2);",
        "    }",
        "}",
      ],
      question: "What will be printed?",
      options: [
        { text: "hello", correct: true },
        { text: "world", correct: false },
        { text: "helloworld", correct: false },
        { text: "null", correct: false },
      ],
      explanation:
        'Strings are immutable - s2 points to the original "hello" string',
      expectedOutput: "hello",
    },
  ];

  useEffect(() => {
    timerInterval.current = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timerInterval.current);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) endGame();
  }, [timeLeft]);

  const handleOptionSelect = (option, isCorrect) => {
    if (!selectedOption) {
      setSelectedOption({ option, isCorrect });
      if (isCorrect) {
        setCorrectAnswers((prev) => prev + 1);
        setScore((prev) => prev + 20);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedOption(null);
      setShowHint(false);
    } else {
      endGame();
    }
  };

  const handleHint = () => {
    if (hintsLeft > 0 && score >= 10) {
      setHintsLeft((prev) => prev - 1);
      setScore((prev) => prev - 10);
      setShowHint(true);
    }
  };

  const endGame = () => {
    clearInterval(timerInterval.current);
    setGameEnded(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const systemIntegrity = Math.floor((timeLeft / 300) * 100);

  if (gameEnded) {
    return (
      <div className={styles.missionContainer}>
        <div className={styles.gamePanel}>
          <div className={styles.missionInfo}>
            <h2 className={styles.missionTitle}>MISSION REPORT</h2>
            <div className={styles.scoring}>
              <div className={styles.scoreDisplay}>
                CREDITS: <span>{score}</span>
              </div>
              <div>
                CORRECT ANSWERS: <span>{correctAnswers}</span>/{questions.length}
              </div>
              <div>
                ACCURACY:{" "}
                <span>
                  {Math.round((correctAnswers / questions.length) * 100)}%
                </span>
              </div>
            </div>
            <button
              className={styles.submitBtn}
              onClick={() => window.location.reload()}
            >
              RESTART MISSION
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.missionContainer}>
      <div className={styles.gamePanel}>
        <div className={styles.missionInfo}>
          <h2 className={styles.missionTitle}>MISSION: TRACE-7</h2>
          <p className={styles.missionDescription}>
            Analyze the code execution and predict the output sequence. Your
            spacecraft's navigation depends on accurate calculations!
          </p>
        </div>

        <div className={styles.timerContainer}>
          <div>ANALYSIS TIMER</div>
          <div className={`${styles.timer} ${timeLeft < 60 ? styles.critical : ""}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className={styles.hintSystem}>
          <div className={styles.hintTitle}>MEMORY CORE</div>
          <button
            className={styles.hintBtn}
            onClick={handleHint}
            disabled={hintsLeft === 0}
          >
            REQUEST HELP ({hintsLeft} LEFT) -10pts
          </button>
          {showHint && (
            <div className={styles.hintContent}>
              <p>Common Issues:</p>
              <ul>
                <li>Check operator precedence</li>
                <li>Trace variable mutations</li>
                <li>Watch for shadowed variables</li>
                <li>Note object references</li>
              </ul>
            </div>
          )}
        </div>

        <div className={styles.scoring}>
          <div className={styles.scoreDisplay}>
            CREDITS: <span>{score}</span>
          </div>
          <div>
            CORRECT ANSWERS: <span>{correctAnswers}</span>/{questions.length}
          </div>
          <div>
            SYSTEM INTEGRITY: <span>{systemIntegrity}%</span>
          </div>
        </div>
      </div>

      <div className={styles.challengeArea}>
        <h2 className={styles.challengeTitle}>OUTPUT TRACING CHALLENGE</h2>

        <div className={styles.bugRadar}>
          {questions.map((_, index) => (
            <div
              key={index}
              className={`${styles.bugIndicator} ${
                index <= currentQuestion ? styles.fixed : ""
              } ${currentQuestion === index ? styles.active : ""}`}
            >
              {index + 1}
              {index < currentQuestion && <div className={styles.checkmark}></div>}
            </div>
          ))}
        </div>

        <div className={styles.codeEditor}>
          <pre>
            <code>
              {questions[currentQuestion].code.map((line, i) => (
                <div key={i} className={styles.codeLine}>
                  <span className={styles.lineNumber}>{i + 1}</span>
                  {line}
                </div>
              ))}
            </code>
          </pre>
        </div>

        <div className={styles.optionsContainer}>
          {questions[currentQuestion].options.map((option, i) => (
            <button
              key={i}
              className={`${styles.optionCard} ${
                selectedOption?.option === option.text
                  ? option.correct
                    ? styles.correct
                    : styles.wrong
                  : ""
              }`}
              onClick={() => handleOptionSelect(option.text, option.correct)}
              disabled={!!selectedOption}
            >
              <div className={styles.optionContent}>
                <span className={styles.optionNumber}>{i + 1}</span>
                <span className={styles.optionText}>{option.text}</span>
              </div>
              {selectedOption?.option === option.text && (
                <div className={styles.feedbackIcon}>
                  {option.correct ? "✓" : "✗"}
                </div>
              )}
            </button>
          ))}
        </div>

        <div className={styles.controls}>
          <button
            className={styles.submitBtn}
            onClick={handleNextQuestion}
            disabled={!selectedOption}
          >
            {currentQuestion < questions.length - 1
              ? "NEXT QUESTION →"
              : "COMPLETE MISSION"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutputTracing;