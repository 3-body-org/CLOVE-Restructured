import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/components/challenge.scss";
import { useChallengeTheme } from "../hooks/useChallengeTheme";
import { useSidebar } from "../../../components/layout/Sidebar/Layout";
import { MyDeckContext } from "../../../contexts/MyDeckContext";
import ChallengeTimer from "./ChallengeTimer";
import ChallengeHints from "./ChallengeHints";
import DOMPurify from 'dompurify';

const ChallengeSidebar = ({
  mode,
  scenario,
  timeRemaining,
  hintsUsed,
  hintsAvailable,
  onHint,
  onNavigation,
  disabled = false,
  children,
  challengeIndex = 0,
  totalChallenges = 5,
  revealedHints = [],
  initialTimerDuration = 300,
  showTimer = true,
  showHints = true,
  disableTimer = false,
  disableHints = false,
  timerState = "active",
}) => {
  const { topicTheme } = useChallengeTheme();
  const navigate = useNavigate();
  const { closeSidebar } = useSidebar();
  const { topicId, subtopicId } = useContext(MyDeckContext);

  const getModeInfo = (mode) => {
    switch (mode) {
      case "code_completion":
        return {
          title: "🧩 CODE COMPLETION",
          description:
            "Fill in the missing code blocks to complete the program logic as described in the scenario.",
          instructions: [
            {
              icon: "🖱️",
              text: "Drag and drop the code choices into the marked positions",
            },
            {
              icon: "🔄",
              text: "Click on filled choices to remove them if needed",
            },
            {
              icon: "✅",
              text: "Ensure the code produces the expected output",
            },
            { icon: "🔍", text: "Check for proper syntax and logic flow" },
          ],
          timerLabel: "TIMER",
        };
      case "code_fixer":
        return {
          title: "🛠️ CODE FIXER",
          description:
            "Identify and fix all errors in the code to restore correct functionality.",
          instructions: [
            {
              icon: "🔧",
              text: "Edit the code to fix all syntax errors and logical issues",
            },
            {
              icon: "✅",
              text: "Make sure the code produces the expected output",
            },
            {
              icon: "📝",
              text: "Check for missing semicolons, brackets, and other syntax elements",
            },
            {
              icon: "🔍",
              text: "Verify that variable declarations and method calls are correct",
            },
          ],
          timerLabel: "TIMER",
        };
      case "output_tracing":
        return {
          title: "🔍 OUTPUT TRACING",
          description:
            "Analyze the code and predict the output that will be produced when it runs.",
          instructions: [
            { icon: "🧠", text: "Analyze the code and predict the output" },
            {
              icon: "📋",
              text: "Select the correct output from the choices below",
            },
            {
              icon: "🔢",
              text: "Consider the order and content of program outputs",
            },
            { icon: "👣", text: "Trace through the code step by step" },
          ],
          timerLabel: "TIMER",
        };
      default:
        return {
          title: "🎯 CHALLENGE",
          description: "Complete the challenge as described in the scenario.",
          instructions: [
            { icon: "📖", text: "Follow the scenario description carefully" },
            { icon: "✅", text: "Complete all required tasks" },
            { icon: "📤", text: "Submit your answer when ready" },
          ],
          timerLabel: "TIMER",
        };
    }
  };

  const modeInfo = getModeInfo(mode);

  const handleNavigation = (path) => {
    if (onNavigation) {
      onNavigation(path);
    } else {
      navigate(path);
    }
    closeSidebar();
  };

  return (
    <div className={`sidebar-container theme-${topicTheme || 'space'}`}>
      <div className="mission-details">
        <div className="instruction-box">
          <h3 className="instruction-title">{modeInfo.title}</h3>
          <p className="instruction-description">
            {modeInfo.description}
          </p>
          {modeInfo.instructions && (
            <ul className="instruction-list">
              {modeInfo.instructions.map((instruction, index) => (
                <li key={index} className="instruction-item">
                  <span className="instruction-icon">
                    {instruction.icon}
                  </span>{" "}
                  {instruction.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        {children}
      </div>

      <div className="controls-panel">
        {scenario && (
          <div className="scenario-box">
            <h3 className="scenario-title">SCENARIO:</h3>
            <p 
              className="scenario-description"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(scenario
                  .replace(/`([^`]+)`/g, '<code>$1</code>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'))
              }}
            />
          </div>
        )}

        <ChallengeTimer
          timeRemaining={timeRemaining}
          initialTimerDuration={initialTimerDuration}
          disabled={disableTimer || !showTimer}
          visible={showTimer}
          timerState={timerState}
        />

        <ChallengeHints
          hintsUsed={hintsUsed}
          hintsAvailable={hintsAvailable}
          onHint={onHint}
          revealedHints={revealedHints}
          disabled={disabled || disableHints || !showHints}
          visible={showHints}
        />

        <button
          className="back-button"
          onClick={() =>
            handleNavigation(`/lesson/${topicId}/${subtopicId}/practice`)
          }
          disabled={false}
        >
          ← Back to Practice
        </button>
      </div>
    </div>
  );
};

export default ChallengeSidebar;
