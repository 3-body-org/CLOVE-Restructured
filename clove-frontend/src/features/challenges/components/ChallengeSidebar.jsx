/**
 * @file ChallengeSidebar.jsx
 * @description Challenge sidebar component with backend integration
 * 
 * Usage Examples:
 * 
 * // Show both timer and hints (default)
 * <ChallengeSidebar
 *   showTimer={true}
 *   showHints={true}
 *   disableTimer={false}
 *   disableHints={false}
 *   // ... other props
 * />
 * 
 * // Hide timer completely, show hints
 * <ChallengeSidebar
 *   showTimer={false}
 *   showHints={true}
 *   // ... other props
 * />
 * 
 * // Show timer but disable it (grayed out), show hints
 * <ChallengeSidebar
 *   showTimer={true}
 *   showHints={true}
 *   disableTimer={true}
 *   // ... other props
 * />
 * 
 * // Hide hints completely, show timer
 * <ChallengeSidebar
 *   showHints={false}
 *   showTimer={true}
 *   // ... other props
 * />
 * 
 * // Minimal sidebar - no timer, no hints
 * <ChallengeSidebar
 *   showTimer={false}
 *   showHints={false}
 *   // ... other props
 * />
 */

import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/ChallengeSidebar.module.scss";
import { useChallengeTheme } from '../hooks/useChallengeTheme';
import { useSidebar } from '../../../components/layout/Sidebar/Layout';
import { MyDeckContext } from '../../../contexts/MyDeckContext';
import ChallengeTimer from './ChallengeTimer';
import ChallengeHints from './ChallengeHints';

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
  timerState = 'active'
}) => {
  const { getThemeStyles, topicTheme } = useChallengeTheme();
  const navigate = useNavigate();
  const { closeSidebar } = useSidebar();
  const { topicId, subtopicId } = useContext(MyDeckContext);
  

  
  // Get mode-specific information
  const getModeInfo = (mode) => {
    switch (mode) {
      case 'code_completion':
        return {
          title: "🧩 CODE COMPLETION",
          description: "Fill in the missing code blocks to complete the program logic as described in the scenario.",
          instructions: [
            { icon: "🖱️", text: "Drag and drop the code choices into the marked positions" },
            { icon: "🔄", text: "Click on filled choices to remove them if needed" },
            { icon: "✅", text: "Ensure the code produces the expected output" },
            { icon: "🔍", text: "Check for proper syntax and logic flow" }
          ],
          timerLabel: "TIMER"
        };
      case 'code_fixer':
        return {
          title: "🛠️ CODE FIXER",
          description: "Identify and fix all errors in the code to restore correct functionality.",
          instructions: [
            { icon: "🔧", text: "Edit the code to fix all syntax errors and logical issues" },
            { icon: "✅", text: "Make sure the code produces the expected output" },
            { icon: "📝", text: "Check for missing semicolons, brackets, and other syntax elements" },
            { icon: "🔍", text: "Verify that variable declarations and method calls are correct" }
          ],
          timerLabel: "TIMER"
        };
      case 'output_tracing':
        return {
          title: "🔍 OUTPUT TRACING",
          description: "Analyze the code and predict the output that will be produced when it runs.",
          instructions: [
            { icon: "🧠", text: "Analyze the code and predict the output" },
            { icon: "📋", text: "Select the correct output from the choices below" },
            { icon: "🔢", text: "Consider the order and content of program outputs" },
            { icon: "👣", text: "Trace through the code step by step" }
          ],
          timerLabel: "TIMER"
        };
      default:
        return {
          title: "🎯 CHALLENGE",
          description: "Complete the challenge as described in the scenario.",
          instructions: [
            { icon: "📖", text: "Follow the scenario description carefully" },
            { icon: "✅", text: "Complete all required tasks" },
            { icon: "📤", text: "Submit your answer when ready" }
          ],
          timerLabel: "TIMER"
        };
    }
  };
  
  const modeInfo = getModeInfo(mode);
  
  // Handle navigation
  const handleNavigation = (path) => {
    if (onNavigation) {
      onNavigation(path);
    } else {
      navigate(path);
    }
    closeSidebar(); // Close sidebar after navigation
  };
  

  
  return (
    <div className={styles.sidebarContainer} style={getThemeStyles()}>
      {/* Back Button at Top */}
      <div className={styles.topNavigation}>
        <button
          className={styles.backButton}
          onClick={() => handleNavigation(`/lesson/${topicId}/${subtopicId}/practice`)}
          disabled={false}
        >
          ← Back to Practice
        </button>
      </div>

      <div className={styles.missionDetails}>
        {/* Mode Instruction Box */}
        <div className={styles.instructionBox}>
          <h3 className={styles.instructionTitle}>{modeInfo.title}</h3>
          <p className={styles.instructionDescription}>{modeInfo.description}</p>
          {modeInfo.instructions && (
            <ul className={styles.instructionList}>
              {modeInfo.instructions.map((instruction, index) => (
                <li key={index} className={styles.instructionItem}>
                  <span className={styles.instructionIcon}>{instruction.icon}</span> {instruction.text}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Custom children */}
        {children}
      </div>
      
      <div className={styles.controlsPanel}>
        {/* Scenario Box */}
        {scenario && (
          <div className={styles.scenarioBox}>
            <h3 className={styles.scenarioTitle}>SCENARIO:</h3>
            <p className={styles.scenarioDescription}>
              {scenario}
            </p>
          </div>
        )}
        
        {/* Timer Component */}
        <ChallengeTimer
          timeRemaining={timeRemaining}
          initialTimerDuration={initialTimerDuration}
          disabled={disableTimer || !showTimer}
          visible={showTimer}
          timerState={timerState}
        />
        
        {/* Hints Component */}
        <ChallengeHints
          hintsUsed={hintsUsed}
          hintsAvailable={hintsAvailable}
          onHint={onHint}
          revealedHints={revealedHints}
          disabled={disabled || disableHints || !showHints}
          visible={showHints}
        />
      </div>
    </div>
  );
};

export default ChallengeSidebar; 