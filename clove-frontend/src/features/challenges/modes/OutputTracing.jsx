import React, { useState, useEffect, useRef } from "react";
import styles from "features/challenges/styles/OutputTracing.module.scss";
import { useNavigate } from "react-router-dom";
import ChallengeSidebar from '../components/ChallengeSidebar';
import MonacoCodeBlock from '../components/MonacoCodeBlock';
import { useChallengeTheme } from '../hooks/useChallengeTheme';

const INSTRUCTION_MAP = {
  CodeCompletion: {
    title: "🧩 CODE COMPLETION",
    description: "Fill in the missing code blocks to complete the program logic as described in the scenario.",
  },
  CodeFixer: {
    title: "🛠️ CODE FIXER",
    description: "Identify and fix all errors in the code to restore correct functionality.",
  },
  OutputTracing: {
    title: "🔍 OUTPUT TRACING",
    description: "Analyze the code and predict the output that will be produced when it runs.",
  },
};

const OutputTracing = ({
  onComplete,
  challengeType,
  isLastChallenge,
  topicId,
  challenge = {}, // Accept challenge prop for scenario data
}) => {
  const navigate = useNavigate();
  const { getThemeStyles } = useChallengeTheme();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const timerInterval = useRef(null);

  // Convert challenge data to questions format
  const questions = React.useMemo(() => {
    if (!challenge || !challenge.code) {
      // Fallback to hardcoded questions if no challenge data
      return [
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
    }

    // Convert challenge data to questions format
    const codeLines = challenge.code.split('\n');
    const correctAnswer = challenge.answer;
    
    // Generate multiple choice options based on the correct answer
    // This is a simple implementation - you might want to enhance this
    const options = [
      { text: correctAnswer, correct: true },
      { text: "null", correct: false },
      { text: "Error", correct: false },
      { text: "Undefined", correct: false },
    ];

    return [{
      code: codeLines,
      question: challenge.question || "What will be the output of this code?",
      options: options,
      explanation: `Expected output: ${correctAnswer}`,
      expectedOutput: correctAnswer,
      scenarioTitle: challenge.scenarioTitle,
      scenarioDescription: challenge.scenarioDescription,
    }];
  }, [challenge]);

  useEffect(() => {
    timerInterval.current = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timerInterval.current);
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && !isCompleted) {
      handleCompletion();
    }
  }, [timeLeft, isCompleted]);

  const handleOptionSelect = (option, isCorrect) => {
    if (!selectedOption && !isCompleted) {
      setSelectedOption({ option, isCorrect });
      if (isCorrect) {
        setCorrectAnswers((prev) => prev + 1);
        setScore((prev) => prev + 20);
      }
    }
  };

  const handleCompletion = () => {
    if (isCompleted) return;

    clearInterval(timerInterval.current);
    setIsCompleted(true);

    if (onComplete) {
      onComplete({
        success: correctAnswers === questions.length,
        score: score,
        type: challengeType,
        timestamp: new Date().toISOString(),
      });
    }

    if (isLastChallenge) {
      setTimeout(() => navigate(`/my-deck/${topicId}`), 1000);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedOption(null);
      setShowHint(false);
    } else {
      handleCompletion();
    }
  };

  const handleHint = () => {
    if (hintsLeft > 0 && score >= 10 && !isCompleted) {
      setHintsLeft((prev) => prev - 1);
      setScore((prev) => prev - 10);
      setShowHint(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const systemIntegrity = Math.floor((timeLeft / 300) * 100);

  const scenarioTitle = questions[currentQuestion]?.scenarioTitle || challenge.scenarioTitle || "MISSION: TRACE-7";
  const scenarioDescription = questions[currentQuestion]?.scenarioDescription || challenge.scenarioDescription || "Analyze the code execution and predict the output sequence. Your spacecraft's navigation depends on accurate calculations!";
  const instruction = INSTRUCTION_MAP["OutputTracing"];

  return (
    <div className={styles.missionContainer} style={getThemeStyles()}>
      <ChallengeSidebar
        missionTitle={scenarioTitle}
        missionDescription={scenarioDescription}
        timerLabel="ANALYSIS TIMER"
        timerValue={formatTime(timeLeft)}
        timerPercent={systemIntegrity}
        hintTitle="MEMORY CORE"
        hintBtnText={`REQUEST HELP (${hintsLeft} LEFT) -10pts`}
        hintBtnDisabled={hintsLeft === 0 || isCompleted}
        onHintClick={handleHint}
        hintsRevealed={showHint ? 1 : 0}
        hints={["Common Issues:", "Check operator precedence", "Trace variable mutations", "Watch for shadowed variables", "Note object references"]}
        scenarioTitle={challenge.scenarioTitle || "🔍 Output Analysis:"}
        scenarioDescription={challenge.scenarioDescription}
      >
        {/* General Instruction Box */}
        <div className={styles.generalInstructionBox}>
          <h3 className={styles.generalInstructionTitle}>{instruction.title}</h3>
          <p className={styles.generalInstructionDescription}>{instruction.description}</p>
        </div>
      </ChallengeSidebar>
      <div className={styles.challengeArea}>
        <h2 className={styles.challengeTitle}>OUTPUT TRACING CHALLENGE</h2>

        <div className={styles.codeEditor}>
          <MonacoCodeBlock
            value={questions[currentQuestion].code.join('\n')}
            onChange={() => {}}
            language="java"
            fixTagClass="bug-placeholder"
            fixTagRegex={/FIX_\d+/g}
            fixTagHoverMessage="Trace this code"
            height="220px"
            options={{ readOnly: true }}
          />
        </div>

        <div className={styles.questionContainer}>
          <h3 className={styles.questionText}>What is the output of the following code?</h3>
        </div>

        <div className={styles.optionsGrid}>
          {questions[currentQuestion].options.map((option, i) => (
            <div
              key={i}
              className={`${styles.codeInput} ${
                selectedOption?.option === option.text
                  ? option.correct
                    ? styles.correct
                    : styles.wrong
                  : ""
              }`}
              onClick={() =>
                !isCompleted && handleOptionSelect(option.text, option.correct)
              }
            >
              {option.text}
            </div>
          ))}
        </div>

        <button
          className={styles.submitBtn}
          onClick={handleNextQuestion}
          disabled={!selectedOption || isCompleted}
        >
          {currentQuestion < questions.length - 1
            ? "NEXT QUESTION →"
            : "COMPLETE MISSION"}
        </button>
      </div>
    </div>
  );
};

export default OutputTracing;
