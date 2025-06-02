import React, { useState, useEffect, useRef } from "react";
import styles from "../../../scss modules/pages/challenges page/modes page/CodeCompletion.module.scss";
import { useNavigate } from "react-router-dom";

const CosmicCompletion = ({
  onComplete,
  challengeType,
  isLastChallenge,
  topicId,
}) => {
  const [timeLeft, setTimeLeft] = useState(300);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [showHint, setShowHint] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeMissingId, setActiveMissingId] = useState(null);
  const [codeAnswers, setCodeAnswers] = useState({
    missing1: "",
    missing2: "",
    missing3: "",
  });
  const [feedback, setFeedback] = useState({
    missing1: "",
    missing2: "",
    missing3: "",
  });
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const [allCorrect, setAllCorrect] = useState(false);

  const missing1Ref = useRef(null);
  const missing2Ref = useRef(null);
  const missing3Ref = useRef(null);
  const challengeAreaRef = useRef(null);
const navigate = useNavigate();

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timerInterval);
          setTimeExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  useEffect(() => {
    if (timeExpired && !isCompleted) {
      handleCompletion(false);
    }
  }, [timeExpired, isCompleted]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        challengeAreaRef.current &&
        !challengeAreaRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleHintClick = () => {
    if (hintsLeft > 0) {
      setShowHint(true);
      setHintsLeft((prev) => prev - 1);
      setScore((prev) => Math.max(0, prev - 10));
    } else {
      alert("No hints remaining!");
    }
  };

  const showOptions = (id, event) => {
    event.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
    setActiveMissingId(id);
  };

  const selectOption = (value) => {
    setCodeAnswers((prev) => ({
      ...prev,
      [activeMissingId]: value,
    }));
    setActiveDropdown(null);
    setFeedback((prev) => ({
      ...prev,
      [activeMissingId]: "",
    }));
  };

  const updateScore = (points) => {
    setScore((prev) => Math.max(0, prev + points));
    setStreak((prev) => (points > 0 ? prev + 1 : 0));
  };

  const checkAllCorrect = () => {
    const correctAnswers = {
      missing1: "fuel * fuelEfficiency",
      missing2: "fuel < 15.0",
      missing3: "double",
    };

    return Object.keys(correctAnswers).every(
      (key) => codeAnswers[key] === correctAnswers[key]
    );
  };

  const handleCompletion = (success) => {
    if (isCompleted) return;

    setIsCompleted(true);
    const allCorrect = checkAllCorrect();
    setAllCorrect(allCorrect);

    const correctAnswers = {
      missing1: "fuel * fuelEfficiency",
      missing2: "fuel < 15.0",
      missing3: "double",
    };

    const newFeedback = {};
    let correctCount = 0;

    Object.keys(codeAnswers).forEach((key) => {
      const isCorrect = codeAnswers[key] === correctAnswers[key];
      if (isCorrect) correctCount++;
      newFeedback[key] = isCorrect ? "correct" : "wrong";
    });

    setFeedback(newFeedback);

    const basePoints = correctCount * 25;
    const bonusPoints = allCorrect ? 50 : 0;
    const totalScore = basePoints + bonusPoints;

    setScore((prev) => Math.max(0, prev + totalScore));
    setStreak((prev) => (totalScore > 0 ? prev + 1 : 0));

    if (onComplete) {
      onComplete({
        success: allCorrect,
        score: totalScore,
        type: challengeType,
        timestamp: new Date().toISOString(),
      });
    }

    if (success) {
      if (allCorrect) {
        setTimeout(() => {
          alert("Perfect! Navigation system online! +50pt bonus!");
          if (isLastChallenge) {
            setTimeout(() => navigate(`/my-deck/${topicId}`), 1000);
          }
        }, 500);
      } else if (correctCount > 0) {
        alert(`Mission partially completed! +${totalScore}pts`);
      } else {
        alert("Critical error! Try again!");
      }
    } else {
      alert("Time's up! Mission failed!");
    }
  };

  const checkSolution = () => {
    const allCorrect = checkAllCorrect();
    if (allCorrect) {
      handleCompletion(true);
    } else {
      const correctAnswers = {
        missing1: "fuel * fuelEfficiency",
        missing2: "fuel < 15.0",
        missing3: "double",
      };

      const newFeedback = {};
      let correctCount = 0;

      Object.keys(codeAnswers).forEach((key) => {
        const isCorrect = codeAnswers[key] === correctAnswers[key];
        if (isCorrect) correctCount++;
        newFeedback[key] = isCorrect ? "correct" : "wrong";
      });

      setFeedback(newFeedback);

      if (correctCount > 0) {
        alert(`You got ${correctCount}/3 correct. Keep trying!`);
      } else {
        alert("All answers are incorrect. Please try again!");
      }
    }
  };

  const getDropdownPosition = (id) => {
    const ref =
      id === "missing1"
        ? missing1Ref
        : id === "missing2"
        ? missing2Ref
        : missing3Ref;

    if (ref.current && challengeAreaRef.current) {
      const codeRect = ref.current.getBoundingClientRect();
      const challengeRect = challengeAreaRef.current.getBoundingClientRect();
      return {
        left: `${codeRect.left - challengeRect.left}px`,
        top: `${codeRect.bottom - challengeRect.top + 10}px`,
      };
    }
    return { left: "50%", top: "50%" };
  };

  const getLineContent = (lineNumber) => {
    switch (lineNumber) {
      case 1:
        return "public class SpacecraftNavigation {";
      case 2:
        return "  private double fuelEfficiency = 0.85;";
      case 4:
        return "  public double calculateSpeed(double fuel) {";
      case 5:
        return "    // Calculate speed using fuel and efficiency";
      case 6:
        return (
          <>
            {"    double speed = "}
            <span
              ref={missing1Ref}
              className={`${styles.codeMissing} ${styles[feedback.missing1]}`}
              onClick={(e) => showOptions("missing1", e)}
            >
              {codeAnswers.missing1 || (
                <span className={styles.placeholder}>[calculation]</span>
              )}
            </span>
          </>
        );
      case 7:
        return "    return speed;";
      case 8:
        return "  }";
      case 10:
        return "  public boolean checkFuel(double fuel) {";
      case 11:
        return "    // Check fuel level safety";
      case 12:
        return (
          <>
            {"    if("}
            <span
              ref={missing2Ref}
              className={`${styles.codeMissing} ${styles[feedback.missing2]}`}
              onClick={(e) => showOptions("missing2", e)}
            >
              {codeAnswers.missing2 || (
                <span className={styles.placeholder}>[condition]</span>
              )}
            </span>
            {") {"}
          </>
        );
      case 13:
        return '      System.out.println("WARNING: Low fuel!");';
      case 14:
        return "    return false;";
      case 16:
        return "    return true;";
      case 17:
        return "  }";
      case 19:
        return (
          <>
            {"  public void adjustCourse("}
            <span
              ref={missing3Ref}
              className={`${styles.codeMissing} ${styles[feedback.missing3]}`}
              onClick={(e) => showOptions("missing3", e)}
            >
              {codeAnswers.missing3 || (
                <span className={styles.placeholder}>[type]</span>
              )}
            </span>
            {" angle) {"}
          </>
        );
      case 20:
        return "    // Validate course adjustment";
      case 21:
        return "    if (angle > 30 || angle < -30) {";
      case 22:
        return '      throw new IllegalArgumentException("Adjustment too extreme");';
      case 24:
        return "    this.courseAngle += angle;";
      case 25:
        return "  }";
      case 26:
        return "}";
      default:
        return "";
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.missionContainer}>
        <div className={styles.gamePanel}>
          <div className={styles.missionInfo}>
            <h2 className={styles.missionTitle}>MISSION: ALPHA-7</h2>
            <p className={styles.missionDescription}>
              Complete the spacecraft's navigation system by fixing the Java
              code. Earn points for correct solutions and speed bonuses.
            </p>
          </div>

          <div className={styles.timerContainer}>
            <div>TIME REMAINING</div>
            <div className={styles.timer}>{formatTime(timeLeft)}</div>
          </div>

          <div className={styles.hintSystem}>
            <div className={styles.hintTitle}>CRYSTAL OF KNOWLEDGE</div>
            <button
              className={styles.hintBtn}
              onClick={handleHintClick}
              disabled={hintsLeft === 0}
            >
              REQUEST HINT ({hintsLeft} LEFT) -10pts
            </button>
            {showHint && (
              <div className={styles.hintContent}>
                The spacecraft's speed should be calculated using fuel and
                efficiency. Fuel warnings should trigger below 15.0 units.
                Course adjustments require precise decimal values.
              </div>
            )}
          </div>

          <div className={styles.scoring}>
            <div>
              <span>SCORE:</span>
              <span>{score}pts</span>
            </div>
            <div>
              <span>STREAK:</span>
              <span>{streak}✧</span>
            </div>
            <div>
              <span>HINTS:</span>
              <span>{hintsLeft}</span>
            </div>
          </div>
        </div>

        <div className={styles.challengeArea} ref={challengeAreaRef}>
          <h2 className={styles.challengeTitle}>Code Completion Challenge</h2>

          <div className={styles.codeFixerEditor}>
            <p className={styles.codeComment}>
              // COMPLETE THE MISSING CODE SECTIONS
            </p>

            <div className={styles.codeBlock}>
              {[
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
                19, 20, 21, 22, 23, 24, 25, 26,
              ].map((line) => (
                <div key={line} className={styles.codeLine}>
                  <span className={styles.lineNumber}>{line}</span>
                  <span className={styles.codeContent}>
                    {getLineContent(line)}
                  </span>
                </div>
              ))}
            </div>

            {activeDropdown && (
              <div
                className={styles.codeDropdown}
                style={getDropdownPosition(activeDropdown)}
                onClick={(e) => e.stopPropagation()}
              >
                {activeDropdown === "missing1" && (
                  <>
                    <div
                      className={styles.codeOption}
                      onClick={() => selectOption("fuel * fuelEfficiency")}
                    >
                      fuel * fuelEfficiency
                    </div>
                    <div
                      className={styles.codeOption}
                      onClick={() => selectOption("fuel / fuelEfficiency")}
                    >
                      fuel / fuelEfficiency
                    </div>
                    <div
                      className={styles.codeOption}
                      onClick={() => selectOption("Math.sqrt(fuel)")}
                    >
                      Math.sqrt(fuel)
                    </div>
                  </>
                )}

                {activeDropdown === "missing2" && (
                  <>
                    <div
                      className={styles.codeOption}
                      onClick={() => selectOption("fuel < 15.0")}
                    >
                      fuel &lt; 15.0
                    </div>
                    <div
                      className={styles.codeOption}
                      onClick={() => selectOption("fuel > 100.0")}
                    >
                      fuel &gt; 100.0
                    </div>
                    <div
                      className={styles.codeOption}
                      onClick={() => selectOption("fuel == 0")}
                    >
                      fuel == 0
                    </div>
                  </>
                )}

                {activeDropdown === "missing3" && (
                  <>
                    <div
                      className={styles.codeOption}
                      onClick={() => selectOption("int")}
                    >
                      int
                    </div>
                    <div
                      className={styles.codeOption}
                      onClick={() => selectOption("double")}
                    >
                      double
                    </div>
                    <div
                      className={styles.codeOption}
                      onClick={() => selectOption("float")}
                    >
                      float
                    </div>
                  </>
                )}
              </div>
            )}

            <button
              className={styles.submitBtn}
              onClick={checkSolution}
              disabled={isCompleted}
            >
              {isCompleted ? "MISSION COMPLETE" : "VALIDATE SOLUTION"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CosmicCompletion;
