import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "features/challenges/styles/CodeFixer.module.scss";
import Editor from "@monaco-editor/react";
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

const CodeFixer = ({ challenge, onComplete, isLastChallenge, topicId }) => {
  const navigate = useNavigate();
  const editorWrapperRef = useRef(null);
  const { getThemeStyles } = useChallengeTheme();

  const [timeLeft, setTimeLeft] = useState(480);
  const [attemptsLeft, setAttemptsLeft] = useState(2);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const {
    question,
    code: codeString,
    answers: correctAnswers,
    hints: HINTS,
    scenarioTitle,
    scenarioDescription,
  } = challenge;

  const initialCode = codeString.replace(/\/\*__INPUT_(\d+)__\*\//g, "FIX_$1");
  const [code, setCode] = useState(initialCode);
  const editorRef = useRef(null);

  const handleCompletion = useCallback(
    (success) => {
      if (isCompleted) return;
      setIsCompleted(true);

      const result = {
        success,
        score: success
          ? 100 - (3 - hintsLeft) * 10 - (2 - attemptsLeft) * 5
          : 0,
      };

      onComplete(result);

      if (success && isLastChallenge) {
        setTimeout(() => navigate(`/my-deck/${topicId}`), 1000);
      }
    },
    [
      isCompleted,
      onComplete,
      hintsLeft,
      attemptsLeft,
      isLastChallenge,
      navigate,
      topicId,
    ]
  );

  useEffect(() => {
    if (isCompleted) return;

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          handleCompletion(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isCompleted, handleCompletion]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const systemIntegrity = Math.floor((timeLeft / 480) * 100);

  const handleHintClick = () => {
    if (hintsLeft > 0) {
      setHintsRevealed((prev) => prev + 1);
      setHintsLeft((prev) => prev - 1);
    } else {
      alert("Engineering manual unavailable!");
    }
  };

  const checkSolution = () => {
    // Build the expected final code by replacing placeholders with correct answers.
    // This approach avoids complex regex and the associated escaping issues.
    let expectedCode = initialCode;
    for (const fixId in correctAnswers) {
      const bugNum = fixId.replace("fix", "");
      const placeholder = `FIX_${bugNum}`;
      expectedCode = expectedCode.replace(placeholder, correctAnswers[fixId]);
    }

    // Compare the user's code with the expected code, ignoring whitespace.
    const isSolutionCorrect =
      code.replace(/\s/g, "") === expectedCode.replace(/\s/g, "");

    if (isSolutionCorrect) {
      alert("SYSTEM RESTORED! Thrusters operational!");
      handleCompletion(true);
    } else {
      const newAttemptsLeft = attemptsLeft - 1;
      setAttemptsLeft(newAttemptsLeft);

      if (newAttemptsLeft > 0) {
        alert(
          `Warning: System still unstable! ${newAttemptsLeft} attempts remaining.`
        );
      } else {
        alert("SYSTEM FAILURE! Too many incorrect attempts.");
        handleCompletion(false);
      }
    }
  };

  const handleBugClick = (bugNum) => {
    const textarea = editorWrapperRef.current?.querySelector("textarea");
    if (!textarea) return;

    const placeholder = `FIX_${bugNum}`;
    const index = code.indexOf(placeholder);

    if (index !== -1) {
      textarea.focus();
      textarea.setSelectionRange(index, index + placeholder.length);
    }
  };

  const instruction = INSTRUCTION_MAP["CodeFixer"];

  return (
    <div className={styles.missionContainer} style={getThemeStyles()}>
      <ChallengeSidebar
        missionTitle={scenarioTitle || "MISSION: BETA-9"}
        missionDescription={scenarioDescription || question}
        timerLabel="EMERGENCY TIMER"
        timerValue={formatTime(timeLeft)}
        timerPercent={systemIntegrity}
        hintTitle="ENGINEERING MANUAL"
        hintBtnText={`REQUEST HELP (${hintsLeft} LEFT)`}
        hintBtnDisabled={hintsLeft === 0}
        onHintClick={handleHintClick}
        hintsRevealed={hintsRevealed}
        hints={HINTS}
        scenarioTitle={challenge.scenarioTitle || "🛠️ System Malfunction:"}
        scenarioDescription={challenge.scenarioDescription}
      >
        {/* General Instruction Box */}
        <div className={styles.generalInstructionBox}>
          <h3 className={styles.generalInstructionTitle}>{instruction.title}</h3>
          <p className={styles.generalInstructionDescription}>{instruction.description}</p>
        </div>
      </ChallengeSidebar>
      <div className={styles.challengeArea}>
        <h2 className={styles.challengeTitle}>CODE FIXER CHALLENGE</h2>

        <div className={styles.codeEditor} ref={editorWrapperRef}>
          <MonacoCodeBlock
            value={code}
            onChange={(newCode) => newCode !== undefined && setCode(newCode)}
            language="java"
            fixTagClass="bug-placeholder"
            fixTagRegex={/FIX_\d+/g}
            fixTagHoverMessage="Fix this bug"
            height="400px"
          />
        </div>

        <div className={styles.terminalWindow}>
          <div className={styles.terminalHeader}>
            <div className={styles.terminalButtons}>
              <span className={styles.closeBtn}></span>
              <span className={styles.minimizeBtn}></span>
              <span className={styles.expandBtn}></span>
            </div>
            <div className={styles.terminalTitle}>console</div>
          </div>
          <div className={styles.terminalContent}>
            <div className={styles.terminalLine}>
              <span className={styles.prompt}>{'>'}</span>
              <span>{'System ready. Waiting for code execution...'}</span>
            </div>
            <div className={`${styles.terminalLine} ${styles.comment}`}>
              {'// Type your code above and click "RUN CODE" to see the output here'}
            </div>
          </div>
        </div>

        <button
          className={styles.submitBtn}
          onClick={checkSolution}
          disabled={timeLeft <= 0 || isCompleted}
        >
          {timeLeft > 0 ? "VALIDATE REPAIRS" : "SYSTEM FAILURE"}
        </button>
      </div>
    </div>
  );
};

export default CodeFixer;
