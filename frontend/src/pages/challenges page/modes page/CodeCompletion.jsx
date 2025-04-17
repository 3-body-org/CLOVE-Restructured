//react
import React, { useState, useEffect, useRef } from "react";
//scss
import styles from "../../../scss modules/pages/challenges page/modes page/CodeCompletion.module.scss";

const CosmicCompletion = () => {
  // Game state
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

  // Refs
  const missing1Ref = useRef(null);
  const missing2Ref = useRef(null);
  const missing3Ref = useRef(null);
  const challengeAreaRef = useRef(null);

  // Timer
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timerInterval);
          alert("Time's up! Mission failed!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Hint system
  const handleHintClick = () => {
    if (hintsLeft > 0) {
      setShowHint(true);
      setHintsLeft((prev) => prev - 1);
      updateScore(-10);
    } else {
      alert("No hints remaining!");
    }
  };

  // Code completion
  const showOptions = (id, event) => {
    event.stopPropagation();
    setActiveDropdown(id);
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

  useEffect(() => {
    const handleResize = () => {
      if (activeDropdown) {
        const currentId = activeDropdown;
        setActiveDropdown(null);
        setTimeout(() => setActiveDropdown(currentId), 0);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeDropdown]);

  // Scoring
  const updateScore = (points) => {
    setScore((prev) => prev + points);
    if (points > 0) {
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  // Solution check
  const checkSolution = () => {
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

    const pointsEarned = correctCount * 25;
    if (pointsEarned > 0) {
      updateScore(pointsEarned);
      alert(
        `Mission partially completed! +${pointsEarned}pts\n${correctCount}/3 correct`
      );

      if (correctCount === 3) {
        setTimeout(() => {
          alert("Perfect! Navigation system online! +50pt bonus!");
          updateScore(50);
        }, 500);
      }
    } else {
      alert("Critical error! Try again!");
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

      const left = codeRect.left - challengeRect.left;
      const top = codeRect.bottom - challengeRect.top;

      let adjustedLeft = left;
      if (left < 0) adjustedLeft = challengeRect.width / 2 - 100;
      if (left > challengeRect.width - 200)
        adjustedLeft = challengeRect.width / 2 - 100;

      return {
        left: `${adjustedLeft}px`,
        top: `${top}px`,
      };
    }

    return { left: "50%", top: "50%" };
  };

  const getCodeMissingClass = (id) => {
    let className = styles.codeMissing;
    if (!codeAnswers[id]) className += ` ${styles.codeMissingEmpty}`;
    if (feedback[id] === "correct")
      className += ` ${styles.codeMissingCorrect}`;
    if (feedback[id] === "wrong") className += ` ${styles.codeMissingWrong}`;
    return className;
  };

  return (
    <div className={styles.root}>
      <div className={styles.missionContainer}>
        {/* Game Mechanics Panel */}
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
            <p>Stuck? Use hints to reveal clues (costs 10pts)</p>
            <div
              className={styles.hintContent}
              style={{ display: showHint ? "block" : "none" }}
            >
              The spacecraft's speed should be calculated based on fuel
              efficiency. Remember the formula: speed = fuel *
              efficiencyConstant.
            </div>
            <button className={styles.hintBtn} onClick={handleHintClick}>
              REQUEST HINT ({hintsLeft} LEFT)
            </button>
          </div>

          <div className="scoring">
            <div className="scoreDisplay">
              SCORE: <span>{score}</span>pts
            </div>
            <div>Difficulty: Medium</div>
            <div>
              Current Streak: <span>{streak}</span>✧
            </div>
          </div>
        </div>

        {/* Challenge Area */}
        <div className={styles.challengeArea} ref={challengeAreaRef}>
          <h2 className={styles.challengeTitle}>CODE COMPLETION CHALLENGE</h2>

          <div className={styles.codeChallenge}>
            <p>Complete the spacecraft navigation system code:</p>

            <div className={styles.codeEditor}>
              {/* Line 1 */}
              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>1</span>
                <span className={styles.codeContent}>
                  public class SpacecraftNavigation {"{"}
                </span>
              </div>

              {/* Line 2 */}
              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>2</span>
                <span className={styles.codeContent}>
                  {" "}
                  private double fuelEfficiency = 0.85;
                </span>
              </div>

              {/* Line 3 */}
              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>3</span>
                <span className={styles.codeContent}></span>
              </div>

              {/* Line 4 */}
              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>4</span>
                <span className={styles.codeContent}>
                  {" "}
                  public double calculateSpeed(double fuel) {"{"}
                </span>
              </div>

              {/* Line 5 */}
              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>5</span>
                <span className={styles.codeContent}>
                  {" "}
                  // Complete this calculation
                </span>
              </div>

              {/* Line 6 */}
              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>6</span>
                <span className={styles.codeContent}>
                  {" "}
                  double speed =
                  <span
                    ref={missing1Ref}
                    className={getCodeMissingClass("missing1")}
                    onClick={(e) => showOptions("missing1", e)}
                  >
                    {codeAnswers.missing1}
                  </span>
                  ;
                </span>
              </div>

              {/* Line 7 */}
              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>7</span>
                <span className={styles.codeContent}> return speed;</span>
              </div>

              {/* Line 8 */}
              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>8</span>
                <span className={styles.codeContent}> {"}"}</span>
              </div>

              {/* Line 9 */}
              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>9</span>
                <span className={styles.codeContent}></span>
              </div>

              {/* Line 10 */}
              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>10</span>
                <span className={styles.codeContent}>
                  {" "}
                  public boolean checkFuel(double fuel) {"{"}
                </span>
              </div>

              {/* Line 11 */}
              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>11</span>
                <span className={styles.codeContent}>
                  {" "}
                  // Implement safety check
                </span>
              </div>

              {/* Line 12 */}
              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>12</span>
                <span className={styles.codeContent}>
                  {" "}
                  if (
                  <span
                    ref={missing2Ref}
                    className={getCodeMissingClass("missing2")}
                    onClick={(e) => showOptions("missing2", e)}
                  >
                    {codeAnswers.missing2}
                  </span>
                  ) {"{"}
                </span>
              </div>

              {/* Line 13 */}
              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>13</span>
                <span className={styles.codeContent}>
                  {" "}
                  System.out.println("WARNING: Low fuel!");
                </span>
              </div>

              {/* Line 14 */}
              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>14</span>
                <span className={styles.codeContent}> return false;</span>
              </div>

              {/* Line 15 */}
              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>15</span>
                <span className={styles.codeContent}> {"}"}</span>
              </div>

              {/* Line 16 */}
              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>16</span>
                <span className={styles.codeContent}> return true;</span>
              </div>

              {/* Line 17 */}
              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>17</span>
                <span className={styles.codeContent}> {"}"}</span>
              </div>

              {/* Line 18 */}
              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>18</span>
                <span className={styles.codeContent}></span>
              </div>

              {/* Line 19 */}
              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>19</span>
                <span className={styles.codeContent}>
                  {" "}
                  public void adjustCourse(
                  <span
                    ref={missing3Ref}
                    className={getCodeMissingClass("missing3")}
                    onClick={(e) => showOptions("missing3", e)}
                  >
                    {codeAnswers.missing3}
                  </span>
                  ) {"{"}
                </span>
              </div>

              {/* Line 20 */}
              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>20</span>
                <span className={styles.codeContent}>
                  {" "}
                  // Validate course adjustment
                </span>
              </div>

              {/* Line 21 */}
              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>21</span>
                <span className={styles.codeContent}>
                  {" "}
                  if (angle &gt; 30 || angle &lt; -30) {"{"}
                </span>
              </div>

              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>22</span>
                <span className={styles.codeContent}>
                  {" "}
                  throw new IllegalArgumentException("Adjustment too extreme");
                </span>
              </div>

              {/* Line 23 */}
              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>23</span>
                <span className={styles.codeContent}> {"}"}</span>
              </div>

              {/* Line 24 */}
              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>24</span>
                <span className={styles.codeContent}>
                  {" "}
                  this.courseAngle += angle;
                </span>
              </div>

              {/* Line 25 */}
              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>25</span>
                <span className={styles.codeContent}> {"}"}</span>
              </div>

              {/* Line 26 */}
              <div className={styles.codeLine}>
                <span className={styles.lineNumber}>26</span>
                <span className={styles.codeContent}>{"}"}</span>
              </div>
            </div>

            {/* Dropdowns */}
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

            <button className={styles.submitBtn} onClick={checkSolution}>
              LAUNCH SOLUTION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CosmicCompletion;
