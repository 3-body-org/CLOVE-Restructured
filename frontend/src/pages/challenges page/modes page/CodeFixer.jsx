//react
import React, { useEffect, useState } from "react";
//scss
import styles from "../../../scss modules/pages/challenges page/modes page/CodeFixer.module.scss";

const CosmicJava = () => {
  const [timeLeft, setTimeLeft] = useState(480); // 8 minutes
  const [score, setScore] = useState(0);
  const [bugsFixed, setBugsFixed] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(2);
  const [showHint, setShowHint] = useState(false);

  const correctAnswers = {
    fix1: "int",
    fix2: "&&",
    fix3: "power",
    fix4: "int",
    fix5: "thrusterPower[i]",
  };

  // Timer effect
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timerInterval);
          alert("SYSTEM FAILURE! Thrusters offline!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate system integrity
  const systemIntegrity = Math.floor((timeLeft / 480) * 100);

  // Handle hint button click
  const handleHintClick = () => {
    if (hintsLeft > 0) {
      setShowHint(true);
      setHintsLeft(hintsLeft - 1);
      updateScore(-15);
    } else {
      alert("Engineering manual unavailable!");
    }
  };

  // Update score
  const updateScore = (points) => {
    setScore((prev) => prev + points);
  };

  // Update bugs fixed count
  const updateBugsFixed = () => {
    setBugsFixed((prev) => prev + 1);
    updateScore(20);
  };

  // Check single input
  const checkSingleInput = (input) => {
    const id = input.id;
    if (input.value === correctAnswers[id]) {
      input.classList.add("correct");
      input.classList.remove("wrong");
      return true;
    } else {
      input.classList.add("wrong");
      input.classList.remove("correct");
      return false;
    }
  };

  // Check all solutions
  const checkSolution = () => {
    let allCorrect = true;
    let newBugsFixed = 0;

    // Check each input
    for (const [id, answer] of Object.entries(correctAnswers)) {
      const input = document.getElementById(id);
      if (checkSingleInput(input)) {
        if (!input.classList.contains("verified")) {
          newBugsFixed++;
          input.classList.add("verified");
        }
      } else {
        allCorrect = false;
      }
    }

    // Update score and bugs fixed
    if (newBugsFixed > 0) {
      updateScore(newBugsFixed * 20);
      for (let i = 0; i < newBugsFixed; i++) {
        updateBugsFixed();
      }
    }

    // Show appropriate message
    if (allCorrect) {
      setTimeout(() => {
        alert(
          "SYSTEM RESTORED! Thrusters operational!\n+50pt bonus for perfect repair!"
        );
        updateScore(50);
      }, 500);
    } else if (newBugsFixed > 0) {
      alert(`Partial repair complete! ${newBugsFixed} bugs fixed!`);
    } else {
      alert("Warning: System still unstable! Keep debugging!");
    }
  };

  // Handle bug indicator click
  const handleBugClick = (bugNum) => {
    const input = document.getElementById(`fix${bugNum}`);
    input.focus();

    // Highlight corresponding code
    document.querySelectorAll(".buggy-code").forEach((code) => {
      code.style.background = "rgba(255, 100, 100, 0.1)";
    });

    input.parentElement.style.background = "rgba(255, 100, 100, 0.3)";
    setTimeout(() => {
      input.parentElement.style.background = "";
    }, 2000);
  };

  // Handle drag and drop events
  useEffect(() => {
    // Toolbox drag start
    document.querySelectorAll(".tool-item").forEach((tool) => {
      tool.addEventListener("dragstart", function (e) {
        this.classList.add("dragging");
        e.dataTransfer.setData("text/plain", this.getAttribute("data-value"));
        e.dataTransfer.effectAllowed = "copy";
      });

      tool.addEventListener("dragend", function () {
        this.classList.remove("dragging");
      });
    });

    // Code input drop events
    document.querySelectorAll(".code-input").forEach((input) => {
      input.addEventListener("dragover", function (e) {
        e.preventDefault();
        this.classList.add("drag-over");
        e.dataTransfer.dropEffect = "copy";
      });

      input.addEventListener("dragenter", function (e) {
        e.preventDefault();
        this.classList.add("drag-over");
      });

      input.addEventListener("dragleave", function () {
        this.classList.remove("drag-over");
      });

      input.addEventListener("drop", function (e) {
        e.preventDefault();
        this.classList.remove("drag-over");
        const data = e.dataTransfer.getData("text/plain");
        this.value = data;
        checkSingleInput(this);
      });
    });

    // Initialize with first bug highlighted
    handleBugClick(1);

    // Cleanup event listeners
    return () => {
      document.querySelectorAll(".tool-item").forEach((tool) => {
        tool.removeEventListener("dragstart", () => {});
        tool.removeEventListener("dragend", () => {});
      });

      document.querySelectorAll(".code-input").forEach((input) => {
        input.removeEventListener("dragover", () => {});
        input.removeEventListener("dragenter", () => {});
        input.removeEventListener("dragleave", () => {});
        input.removeEventListener("drop", () => {});
      });
    };
  }, []);

  return (
    <div className={styles.missionContainer}>
      {/* Game Mechanics Panel */}
      <div className={styles.gamePanel}>
        <div className={styles.missionInfo}>
          <h2 className={styles.missionTitle}>MISSION: BETA-9</h2>
          <p className={styles.missionDescription}>
            Debug the spacecraft's thruster control system before it's too late!
            Find and fix all bugs to prevent catastrophic failure.
          </p>
        </div>

        <div className={styles.timerContainer}>
          <div>EMERGENCY TIMER</div>
          <div
            className={styles.timer}
            id="timer"
            style={
              timeLeft < 120
                ? { color: styles.accent, animation: "pulse 1s infinite" }
                : null
            }
          >
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className={styles.hintSystem}>
          <div className={styles.hintTitle}>ENGINEERING MANUAL</div>
          <p>Need help? Consult the manual (costs 15pts)</p>
          <div
            className={styles.hintContent}
            id="hint-content"
            style={{ display: showHint ? "block" : "none" }}
          >
            Common thruster issues:
            <br />
            1. Incorrect loop conditions
            <br />
            2. Wrong variable types
            <br />
            3. Missing termination statements
          </div>
          <button
            className={styles.hintBtn}
            id="hint-btn"
            onClick={handleHintClick}
          >
            REQUEST HELP ({hintsLeft} LEFT)
          </button>
        </div>

        <div className={styles.scoring}>
          <div className={styles.scoreDisplay}>
            CREDITS: <span id="score">{score}</span>
          </div>
          <div>
            Bugs Fixed: <span id="bugs-fixed">{bugsFixed}</span>/5
          </div>
          <div>
            System Integrity: <span id="integrity">{systemIntegrity}</span>%
          </div>
        </div>
      </div>

      {/* Challenge Area */}
      <div className={styles.challengeArea}>
        <h2 className={styles.challengeTitle}>CODE FIXER CHALLENGE</h2>

        <div className={styles.bugRadar}>
          {[1, 2, 3, 4, 5].map((num) => (
            <div
              key={num}
              className={`${styles.bugIndicator} ${bugsFixed >= num ? styles.found : ""}`}
              data-bug={num}
              onClick={() => handleBugClick(num)}
            >
              {num}
            </div>
          ))}
        </div>

        <div className={styles.codeFixerEditor}>
          <p style={{ color: "var(--bug)", marginBottom: "15px" }}>
            // THRUSTER CONTROL SYSTEM - DEBUG REQUIRED
          </p>

          <div className={styles.codeLine}>
            <span className={styles.lineNumber}>1</span>
            <span>public class ThrusterController {"{"}</span>
          </div>
          <div className={styles.codeLine}>
            <span className={styles.lineNumber}>2</span>
            <span> private int[] thrusterPower = {"{0, 0, 0, 0}"};</span>
          </div>
          <div className={styles.codeLine}>
            <span className={styles.lineNumber}>3</span>
            <span> </span>
          </div>
          <div className={styles.codeLineBuggy}>
            <span className={styles.lineNumber}>4</span>
            <span> public void setPower(int thruster, </span>
            <input
              type="text"
              className={styles.codeInput}
              id="fix1"
              defaultValue="String"
              placeholder="Fix type"
            />
            <span>power) {"{"}</span>
          </div>
          <div className={styles.codeLine}>
            <span className={styles.lineNumber}>5</span>
            <span> if (thruster &gt;= 0 </span>
            <input
              type="text"
              className={styles.codeInput}
              id="fix2"
              defaultValue="||"
              placeholder="Fix operator"
            />
            <span>
              {" "}
              thruster {"<"} thrusterPower.length) {"{"}
            </span>
          </div>
          <div className={styles.codeLineBuggy}>
            <span className={styles.lineNumber}>6</span>
            <span> thrusterPower[thruster] = </span>
            <input
              type="text"
              className={styles.codeInput}
              id="fix3"
              defaultValue="power.length()"
              placeholder="Fix value"
            />
            <span>;</span>
          </div>
          <div className={styles.codeLine}>
            <span className={styles.lineNumber}>7</span>
            <span> {"}"}</span>
          </div>
          <div className={styles.codeLine}>
            <span className={styles.lineNumber}>8</span>
            <span> {"}"}</span>
          </div>
          <div className={styles.codeLine}>
            <span className={styles.lineNumber}>9</span>
            <span> </span>
          </div>
          <div className={styles.codeLineBuggy}>
            <span className={styles.lineNumber}>10</span>
            <span> public void fireThrusters(</span>
            <input
              type="text"
              className={styles.codeInput}
              id="fix4"
              defaultValue="Double"
              placeholder="Fix type"
            />
            <span>duration) {"{"}</span>
          </div>
          <div className={styles.codeLine}>
            <span className={styles.lineNumber}>11</span>
            <span>
              {" "}
              for (int i = 0; i {"<"} thrusterPower.length; i++) {"{"}
            </span>
          </div>
          <div className={styles.codeLineBuggy}>
            <span className={styles.lineNumber}>12</span>
            <span> System.out.println("Thruster " + i + " firing at " + </span>
            <input
              type="text"
              className={styles.codeInput}
              id="fix5"
              defaultValue="duration.toUpperCase()"
              placeholder="Fix value"
            />
            <span> + "% power");</span>
          </div>
          <div className={styles.codeLine}>
            <span className={styles.lineNumber}>13</span>
            <span> {"}"}</span>
          </div>
          <div className={styles.codeLine}>
            <span className={styles.lineNumber}>14</span>
            <span> {"}"}</span>
          </div>
          <div className={styles.codeLine}>
            <span className={styles.lineNumber}>15</span>
            <span>{"}"}</span>
          </div>
        </div>

        <div className={styles.toolbox}>
          <div className={styles.toolboxTitle}>DEBUGGING TOOLS</div>
          <div className={styles.toolItems}>
            <div className={styles.toolItem} draggable="true" data-value="int">
              int
            </div>
            <div className={styles.toolItem} draggable="true" data-value="double">
              double
            </div>
            <div className={styles.toolItem} draggable="true" data-value="power">
              power
            </div>
            <div className={styles.toolItem} draggable="true" data-value="||">
              ||
            </div>
            <div className={styles.toolItem} draggable="true" data-value="&&">
              &&
            </div>
            <div
              className={styles.toolItem}
              draggable="true"
              data-value="thrusterPower[i]"
            >
              thrusterPower[i]
            </div>
          </div>
        </div>

        <button className={styles.submitBtn} onClick={checkSolution}>
          LAUNCH REPAIRS
        </button>
      </div>
    </div>
  );
};

export default CosmicJava;
