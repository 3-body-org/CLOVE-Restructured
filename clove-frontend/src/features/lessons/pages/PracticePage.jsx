import React, { useState, useEffect, useCallback, useRef, useMemo, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import confetti from "canvas-confetti";
import styles from "features/lessons/styles/PracticePage.module.scss";
import LessonThemeProvider from "features/lessons/components/LessonThemeProvider";
import LessonMonacoEditor from "../components/LessonMonacoEditor";
import MonacoCodeBlock from "features/challenges/components/MonacoCodeBlock";
import ChallengeSidebar from "features/challenges/components/ChallengeSidebar";
import { useChallengeTheme } from 'features/challenges/hooks/useChallengeTheme';
import { useChallengeData } from '../hooks/useChallengeData';
import { useLessonService } from '../services/lessonService';
import { useAuth } from "contexts/AuthContext";
import LoadingScreen from "components/layout/StatusScreen/LoadingScreen";
import ErrorScreen from "components/layout/StatusScreen/ErrorScreen";

// Monaco editor types for highlighting
let monaco = null;

const PracticePage = () => {
  const navigate = useNavigate();
  const { topicId, subtopicId } = useParams();
  const { getThemeStyles, currentTheme } = useChallengeTheme();
  const { user, loading: authLoading } = useAuth();
  const [minTimePassed, setMinTimePassed] = useState(false);

  // Minimum loading time effect (like ProfilePage)
  useEffect(() => {
    setMinTimePassed(false);
    const timer = setTimeout(() => setMinTimePassed(true), 200);
    return () => clearTimeout(timer);
  }, []); // Only on mount

  // Use the challenge data hook
  const { challenges, loading, error } = useChallengeData(subtopicId, user);

  // Use the lesson service
  const { completePractice } = useLessonService();

  // Challenge State Management
  const [currentChallenge, setCurrentChallenge] = useState('codeFixer');
  const [showCompletionPopup, setShowCompletionPopup] = useState(true);
  const [challengeStates, setChallengeStates] = useState({
    codeFixer: {
      code: '',
      output: 'System ready. Waiting for code execution...',
      isExecuting: false,
      isCompleted: false,
      isCorrect: false,
      solutionCode: ''
    },
    outputTracing: {
      score: 0,
      correctAnswers: 0,
      selectedOption: null,
      selectedOptions: [],
      isCompleted: false
    },
    codeCompletion: {
      code: '',
      score: 0,
      streak: 0,
      isCompleted: false,
      allCorrect: false,
      consoleOutput: 'System ready. Waiting for code execution...',
      usedChoices: [],
      isDragging: false,
      currentDragItem: null,
      hoveredPlaceholder: null,
      solutionCode: '',
      explanation: '',
      userChoices: {} // Store choices with position info
    }
  });

  // Check if all available challenges are completed
  const allChallengesCompleted = useMemo(() => {
    const availableChallenges = [];
    if (challenges.codeFixer) availableChallenges.push('codeFixer');
    if (challenges.outputTracing) availableChallenges.push('outputTracing');
    if (challenges.codeCompletion) availableChallenges.push('codeCompletion');
    
    const completed = availableChallenges.length > 0 && 
           availableChallenges.every(challengeType => {
             const state = challengeStates[challengeType];
             // Challenges are only completed when user clicks submit button
             // This ensures the modal only appears after actual engagement
             return state && state.isCompleted;
           });
    
    return completed;
  }, [challenges, challengeStates]);

  // Complete practice when all challenges are attempted
  useEffect(() => {
    if (allChallengesCompleted && user && subtopicId) {
      // Check if practice has already been marked as completed
      const practiceCompletionKey = `practice_completed_${subtopicId}_${user.id}`;
      const isPracticeCompleted = localStorage.getItem(practiceCompletionKey);
      
      if (!isPracticeCompleted) {
        const markPracticeAsCompleted = async () => {
          try {
            await completePractice(user.id, parseInt(subtopicId));
            
            // Mark as completed in localStorage to prevent repeated calls
            localStorage.setItem(practiceCompletionKey, 'true');
          } catch (error) {
            // Don't show error notification to user as this is a background operation
          }
        };
        
        markPracticeAsCompleted();
      }
    }
  }, [allChallengesCompleted, user, subtopicId, completePractice]);

  // Handle navigation to challenges page
  const handleProceedToChallenges = useCallback(() => {
    navigate(`/lesson/${topicId}/${subtopicId}/challenges`);
  }, [navigate, topicId, subtopicId]);

  // Handle closing the completion popup
  const handleCloseCompletionPopup = useCallback(() => {
    setShowCompletionPopup(false);
  }, []);

  // Refs
  const editorRefs = useRef({
    codeFixer: null,
    outputTracing: null,
    codeCompletion: null
  });

  // Refs for code completion state to avoid closure issues (like CodeCompletion.jsx)
  const userChoicesRef = useRef({});
  const finalPositionsRef = useRef({});

  // Initialize challenge data when challenges are loaded
  useEffect(() => {
    if (challenges.codeFixer) {
      setChallengeStates(prev => ({
        ...prev,
        codeFixer: {
          ...prev.codeFixer,
          code: challenges.codeFixer.challenge_data.initial_code
        }
      }));
    }
  }, [challenges.codeFixer]);

  useEffect(() => {
    if (challenges.codeCompletion) {
      // Initialize with empty code - the processed code will handle the display
      setChallengeStates(prev => ({
        ...prev,
        codeCompletion: {
          ...prev.codeCompletion,
          code: challenges.codeCompletion.challenge_data.initial_code
        }
      }));
    }
  }, [challenges.codeCompletion]);

  // Challenge completion handlers
  const handleChallengeCompletion = useCallback((challengeType, success, score = 0) => {
    setChallengeStates(prev => ({
      ...prev,
      [challengeType]: {
        ...prev[challengeType],
        isCompleted: true
      }
    }));

    if (success) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, []);

  // Code Fixer Functions
  const handleCodeFixerEditorChange = useCallback((value) => {
    setChallengeStates(prev => ({
      ...prev,
      codeFixer: {
        ...prev.codeFixer,
        code: value
      }
    }));
  }, []);

  const handleCodeFixerEditorMount = useCallback((editor, monaco) => {
    editorRefs.current.codeFixer = editor;
    const themeMap = { 'space': 'space-theme', 'wizard': 'wizard-theme', 'detective': 'detective-theme' };
    monaco.editor.setTheme(themeMap[currentTheme] || 'space-theme');
  }, [currentTheme]);

  const simulateJavaExecution = useCallback(async (javaCode) => {
    const mainMethodMatch = javaCode.match(/public static void main\(String\[\] args\)\s*\{([\s\S]*?)\}/);
    if (!mainMethodMatch) {
      throw new Error('No main method found');
    }

    const mainContent = mainMethodMatch[1];
    const outputs = [];
    const printlnMatches = mainContent.match(/System\.out\.println\(([^)]+)\);?/g);
    
    if (printlnMatches) {
      for (const println of printlnMatches) {
        const contentMatch = println.match(/System\.out\.println\(([^)]+)\);?/);
        if (contentMatch) {
          let content = contentMatch[1];
          if (content.includes('+')) {
            const parts = content.split('+').map(part => part.trim().replace(/"/g, ''));
            content = parts.join('');
          }
          content = content.replace(/"/g, '');
          outputs.push(content);
        }
      }
    }
    
    return outputs.length > 0 ? outputs.join('\n') : 'No output';
  }, []);

  const executeJavaCode = useCallback(async (javaCode) => {
    setChallengeStates(prev => ({
      ...prev,
      codeFixer: {
        ...prev.codeFixer,
        isExecuting: true,
        output: 'Executing code...'
      }
    }));

    try {
      const output = await simulateJavaExecution(javaCode);
      setChallengeStates(prev => ({
        ...prev,
        codeFixer: {
          ...prev.codeFixer,
          output
        }
      }));
      return output;
    } catch (error) {
      const errorOutput = `Error: ${error.message}`;
      setChallengeStates(prev => ({
        ...prev,
        codeFixer: {
          ...prev.codeFixer,
          output: errorOutput
        }
      }));
      return errorOutput;
    } finally {
      setChallengeStates(prev => ({
        ...prev,
        codeFixer: {
          ...prev.codeFixer,
          isExecuting: false
        }
      }));
    }
  }, [simulateJavaExecution]);

  const checkCodeFixerSolution = useCallback(async () => {
    const currentState = challengeStates.codeFixer;
    if (currentState.isExecuting || currentState.isCompleted) return;

    try {
      // Get solution code from challenge data
      const solutionCode = challenges.codeFixer?.challenge_data?.solution_code;
      
      if (!solutionCode) {
        setChallengeStates(prev => ({
          ...prev,
          codeFixer: {
            ...prev.codeFixer,
            output: '❌ Error: No solution code available for validation',
            isCompleted: true
          }
        }));
        return;
      }

      // Normalize both codes for comparison
      const normalizeCode = (code) => {
        if (!code || typeof code !== 'string') return '';
        return code
          .replace(/\/\/.*$/gm, '') // Remove single-line comments
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
          .replace(/\s+/g, ' ') // Remove extra whitespace
          .trim();
      };

      const normalizedUserCode = normalizeCode(currentState.code);
      const normalizedSolutionCode = normalizeCode(solutionCode);
      
      // Compare the normalized codes
      const isCorrect = normalizedUserCode === normalizedSolutionCode;
      
      if (isCorrect) {
        setChallengeStates(prev => ({
          ...prev,
          codeFixer: {
            ...prev.codeFixer,
            output: '✅ Correct! Code fixed successfully!',
            isCompleted: true,
            isCorrect: true,
            solutionCode: solutionCode
          }
        }));
        handleChallengeCompletion('codeFixer', true, 100);
      } else {
        // Execute the code to show what output it produces
        const actualOutput = await executeJavaCode(currentState.code);
        setChallengeStates(prev => ({
          ...prev,
          codeFixer: {
            ...prev.codeFixer,
            output: `❌ Incorrect! Your code produces: ${actualOutput}`,
            isCompleted: true,
            isCorrect: false,
            solutionCode: solutionCode
          }
        }));
      }
    } catch (error) {
      setChallengeStates(prev => ({
        ...prev,
        codeFixer: {
          ...prev.codeFixer,
          output: `❌ Error: ${error.message}`,
          isCompleted: true,
          isCorrect: false,
          solutionCode: challenges.codeFixer?.challenge_data?.solution_code || 'No solution available'
        }
      }));
    }
  }, [challengeStates.codeFixer, challenges.codeFixer, executeJavaCode, handleChallengeCompletion]);

  // Output Tracing Functions
  const handleOutputTracingOptionSelect = useCallback((option) => {
    const currentState = challengeStates.outputTracing;
    if (currentState.isCompleted) return;

    // Toggle selection (add if not selected, remove if already selected)
    const currentSelections = currentState.selectedOptions || [];
    const isAlreadySelected = currentSelections.includes(option);
    
    const newSelections = isAlreadySelected 
      ? currentSelections.filter(selected => selected !== option)
      : [...currentSelections, option];
    
    setChallengeStates(prev => ({
      ...prev,
      outputTracing: {
        ...prev.outputTracing,
        selectedOptions: newSelections,
        isCompleted: false // Reset completion state when selections change
      }
    }));
  }, [challengeStates.outputTracing]);

  const validateOutputTracing = useCallback(() => {
    const currentState = challengeStates.outputTracing;
    if (currentState.isCompleted) return;

    // Get expected outputs from challenge data
    const expectedOutputs = challenges.outputTracing?.challenge_data?.expected_output || [];
    const userSelections = currentState.selectedOptions || [];
    
    // Check if user has selected exactly the correct answers (no more, no less)
    const hasAllCorrect = expectedOutputs.every(expected => 
      userSelections.includes(expected)
    );
    
    const hasNoIncorrect = userSelections.every(selected => 
      expectedOutputs.includes(selected)
    );
    
    const isCorrect = hasAllCorrect && hasNoIncorrect;
    const score = isCorrect ? 100 : 0;
    
    // Generate feedback based on validation logic
    let feedback = "";
    let detailedFeedback = "";
    
    if (isCorrect) {
      feedback = "Perfect! You selected all correct outputs.";
    } else if (userSelections.length === 0) {
      feedback = "No outputs selected. Challenge marked as incorrect.";
    } else {
      feedback = "Incorrect. You need to select exactly the correct outputs.";
      
      // Generate detailed feedback
      const correctSelections = userSelections.filter(selected => 
        expectedOutputs.includes(selected)
      ).length;
      const incorrectSelections = userSelections.filter(selected => 
        !expectedOutputs.includes(selected)
      ).length;
      const missingSelections = expectedOutputs.filter(expected => 
        !userSelections.includes(expected)
      ).length;
      
      if (userSelections.length > expectedOutputs.length) {
        detailedFeedback = `You selected too many outputs (${userSelections.length} selected, ${expectedOutputs.length} expected). You need to select exactly the correct outputs, no more and no less.`;
      } else if (userSelections.length < expectedOutputs.length) {
        detailedFeedback = `You selected too few outputs (${userSelections.length} selected, ${expectedOutputs.length} expected). You need to select all the correct outputs.`;
      } else if (incorrectSelections > 0) {
        detailedFeedback = `You selected ${incorrectSelections} incorrect output(s). Make sure to only select the outputs that will actually be displayed by the program.`;
      } else if (missingSelections > 0) {
        detailedFeedback = `You missed ${missingSelections} correct output(s). Trace through the code carefully to identify all outputs that will be displayed.`;
      }
    }
    
    setChallengeStates(prev => ({
      ...prev,
      outputTracing: {
        ...prev.outputTracing,
        isCompleted: true,
        score: score,
        feedback: feedback,
        detailedFeedback: detailedFeedback
      }
    }));

    // Call completion handler
    handleChallengeCompletion('outputTracing', isCorrect, score);
  }, [challengeStates.outputTracing, challenges.outputTracing, handleChallengeCompletion]);



  // Handle click to remove placed choices
  const handleChoiceClick = useCallback((choice) => {
    if (challengeStates.codeCompletion.isCompleted) return;
    
    // Use ref to avoid closure issues (like CodeCompletion.jsx)
    const currentUserChoices = userChoicesRef.current;
    
    // Find which blank this choice was placed in
    const blankId = Object.keys(currentUserChoices).find(key => 
      currentUserChoices[key].choice === choice
    );
    
    if (!blankId) return;
      
    // Remove the choice
    setChallengeStates(prev => ({
      ...prev,
      codeCompletion: {
        ...prev.codeCompletion,
        userChoices: (() => {
          const newChoices = { ...prev.codeCompletion.userChoices };
          delete newChoices[blankId];
          return newChoices;
        })(),
        usedChoices: prev.codeCompletion.usedChoices.filter(c => c !== choice)
      }
    }));
  }, [challengeStates.codeCompletion.isCompleted, challengeStates.codeCompletion.userChoices]);

  const checkCodeCompletionSolution = useCallback(() => {
    const currentState = challengeStates.codeCompletion;
    if (currentState.isCompleted) return;

    // Get the actual user choices that were placed (CORRECT approach)
    const userChoices = currentState.userChoices || {};
    const completionSlots = challenges.codeCompletion?.challenge_data.completion_slots || [];
    
    // Count correct choices by checking each user choice against the expected answer
    let correctCount = 0;
    let totalSlots = 0;
    
    // Check each completion slot
    completionSlots.forEach((slot) => {
      const slotId = slot.id;
      const userChoice = userChoices[slotId];
      const expectedAnswer = slot.correct_answer;
      
      if (userChoice && userChoice.choice === expectedAnswer) {
        correctCount++;
      }
      
      totalSlots++;
    });
    
    const allCorrect = correctCount === totalSlots && totalSlots > 0;
    const totalScore = correctCount * 25 + (allCorrect ? 50 : 0);

    // Get solution code and explanation from challenge data
    const solutionCode = challenges.codeCompletion?.challenge_data?.solution_code || 'No solution available';
    const explanation = completionSlots.length > 0 ? completionSlots[0].explanation : 'No explanation available';

    setChallengeStates(prev => ({
      ...prev,
      codeCompletion: {
        ...prev.codeCompletion,
        score: totalScore,
        allCorrect,
        isCompleted: true,
        solutionCode: solutionCode,
        explanation: explanation
      }
    }));

    // Update console output with result
    if (allCorrect) {
      setChallengeStates(prev => ({
        ...prev,
        codeCompletion: {
          ...prev.codeCompletion,
          consoleOutput: '✅ Perfect! All placeholders completed correctly!'
        }
      }));
    } else if (correctCount > 0) {
      setChallengeStates(prev => ({
        ...prev,
        codeCompletion: {
          ...prev.codeCompletion,
          consoleOutput: `⚠️ Partially correct! ${correctCount}/${totalSlots} placeholders completed.`
        }
      }));
    } else {
      setChallengeStates(prev => ({
        ...prev,
        codeCompletion: {
          ...prev.codeCompletion,
          consoleOutput: '❌ No correct answers found. Try again!'
        }
      }));
    }

    handleChallengeCompletion('codeCompletion', allCorrect, totalScore);
  }, [challengeStates.codeCompletion, challenges.codeCompletion, handleChallengeCompletion]);



  // Process code to replace ??? with [1], [2], etc. placeholders and track final positions
  const processedCodeCompletion = useMemo(() => {
    if (!challenges.codeCompletion?.challenge_data?.initial_code) {
      return { code: '', blanks: [], finalChoicePositions: {} };
    }

    const code = challenges.codeCompletion.challenge_data.initial_code;
    const lines = code.split('\n');
    const blanks = [];
    const finalChoicePositions = {}; // Store final positions of placed choices
    let blankId = 1;

    const processedLines = lines.map((line, lineIndex) => {
      const blankPattern = /\?\?\?/g;
      let match;
      const lineBlanks = [];

      while ((match = blankPattern.exec(line)) !== null) {
        const blankInfo = {
          id: `slot_${blankId}`, // Use slot_1, slot_2 to match backend
          displayId: `[${blankId}]`, // Keep [1], [2] for display
          line: lineIndex + 1,
          column: match.index + 1,
          length: match[0].length,
          position: { line: lineIndex + 1, column: match.index + 1 }
        };

        blanks.push(blankInfo);
        lineBlanks.push({ ...blankInfo, matchIndex: match.index });
        blankId++;
      }
      
      let processedLine = line;
      
      // Sort lineBlanks by matchIndex in descending order to avoid index shifting
      lineBlanks.sort((a, b) => b.matchIndex - a.matchIndex);
      
      // First pass: replace placeholders with choices
      lineBlanks.forEach((blank) => {
        // Check if we have a placed choice for this blank
        const placedChoice = challengeStates.codeCompletion.userChoices[blank.id];
        const placeholder = placedChoice ? placedChoice.choice : blank.displayId; // Use [1], [2] for display
        
        const before = processedLine.substring(0, blank.matchIndex);
        const after = processedLine.substring(blank.matchIndex + 3);
        processedLine = before + placeholder + after;
      });

      // Second pass: find final positions of placed choices in the processed line
      lineBlanks.forEach((blank) => {
        const placedChoice = challengeStates.codeCompletion.userChoices[blank.id];
        if (placedChoice) {
          // Find the actual position of this choice in the final processed line
          const choiceIndex = processedLine.indexOf(placedChoice.choice);
          if (choiceIndex !== -1) {
            finalChoicePositions[blank.id] = {
              line: lineIndex + 1,
              column: choiceIndex + 1, // +1 because Monaco uses 1-based columns
              length: placedChoice.choice.length
            };
          }
        }
      });

      return processedLine;
    });

    const result = {
      code: processedLines.join('\n'),
      blanks,
      finalChoicePositions
    };
    
    return result;
  }, [challenges.codeCompletion?.challenge_data?.initial_code, challengeStates.codeCompletion.userChoices]);

  // Update refs whenever state changes (like CodeCompletion.jsx)
  useEffect(() => {
    userChoicesRef.current = challengeStates.codeCompletion.userChoices;
  }, [challengeStates.codeCompletion.userChoices]);

  useEffect(() => {
    finalPositionsRef.current = processedCodeCompletion.finalChoicePositions;
  }, [processedCodeCompletion.finalChoicePositions]);

  // Available choices for code completion
  const codeCompletionAvailableChoices = useMemo(() => {
    const choices = challenges.codeCompletion?.challenge_data.choices || [];
    const usedChoices = challengeStates.codeCompletion.usedChoices;
    const availableChoices = choices.filter(choice => !usedChoices.includes(choice));
    
    // Sort choices to maintain consistent order
    return availableChoices.sort((a, b) => {
      const aIndex = choices.indexOf(a);
      const bIndex = choices.indexOf(b);
      return aIndex - bIndex;
    });
  }, [challenges.codeCompletion, challengeStates.codeCompletion.usedChoices]);

  // Loading state (comprehensive like ProfilePage)
  if (authLoading || !user || !minTimePassed || loading) {
    return <LoadingScreen message="Loading practice challenges..." />;
  }

  // Error state
  if (error) {
    return <ErrorScreen message={error} />;
  }

  // Check if we have at least one challenge available
  const hasChallenges = challenges.codeFixer || challenges.outputTracing || challenges.codeCompletion;
  if (!hasChallenges) {
    return <ErrorScreen message="No practice challenges available for this lesson." />;
  }

  return (
    <LessonThemeProvider>
      <div className={styles.container}>
        {/* Left Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarContent}>
            <div className={styles.sidebarSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>🧩</span>
                <h3>PRACTICE CHALLENGES</h3>
              </div>
              <p>Complete interactive coding challenges to test your understanding and improve your programming skills.</p>
            </div>

            <div className={styles.sidebarSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>✏️</span>
                <h3>SCENARIO:</h3>
              </div>
              <p>This section displays the scenario description for each challenge. The scenario provides context and explains what you need to accomplish in the current challenge.</p>
            </div>
          </div>

          <button className={styles.backButton} onClick={() => navigate(`/lesson/${topicId}/${subtopicId}`)}>
            ← Back to Lessons
          </button>
        </div>

        <div className={styles.lessonContainer}>
          {/* Code Fixer Challenge */}
          {challenges.codeFixer && (
            <div className={styles.codeFixerChallenge}>
              <div className={styles.challengeTitle}>CODE FIXER CHALLENGE</div>
              
              <div className={styles.codeEditorContainer}>
                <h3>EDIT THE CODE:</h3>
                <LessonMonacoEditor
                  value={challengeStates.codeFixer.code}
                  onChange={handleCodeFixerEditorChange}
                  language="java"
                  height="100%"
                  onMount={handleCodeFixerEditorMount}
                  options={{
                    readOnly: challengeStates.codeFixer.isCompleted,
                    minimap: { enabled: false },
                    fontSize: 17,
                    wordWrap: 'on',
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    renderWhitespace: 'selection',
                    formatOnPaste: true,
                    formatOnType: true,
                    lineNumbers: 'on',
                    folding: true,
                    lineDecorationsWidth: 10,
                    padding: { top: 15, bottom: 15, left: 15, right: 15 },
                    tabSize: 2,
                    fontFamily: 'Fira Code, monospace',
                    fontWeight: '400',
                    lineHeight: 24,
                    glyphMargin: false,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'all',
                    scrollbar: {
                      vertical: 'hidden',
                      horizontal: 'hidden',
                      useShadows: false,
                      verticalHasArrows: false,
                      horizontalHasArrows: false,
                      verticalScrollbarSize: 0,
                      horizontalScrollbarSize: 0,
                    },
                    fixedOverflowWidgets: true,
                    overviewRulerBorder: false,
                    hideCursorInOverviewRuler: true,
                  }}
                />
              </div>

              {/* Expected Output Section */}
              <div className={styles.expectedOutput}>
                <h3>Expected Output:</h3>
                <div className={styles.outputText}>
                  {challenges.codeFixer?.challenge_data?.expected_output?.[0] || 'No expected output available'}
                </div>
              </div>

              {/* Solution Code Section - Only show after submission */}
              {challengeStates.codeFixer.isCompleted && challengeStates.codeFixer.solutionCode && (
                <div className={styles.solutionCode}>
                  <h3>Solution Code:</h3>
                  <div className={styles.codeBlock}>
                    <pre>{challengeStates.codeFixer.solutionCode}</pre>
                  </div>
                </div>
              )}

              {/* Feedback after validation */}
              {challengeStates.codeFixer.isCompleted && (
                <div className={styles.feedback}>
                  <div className={challengeStates.codeFixer.isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}>
                    <strong>
                      {challengeStates.codeFixer.isCorrect 
                        ? "✅ Correct! Code fixed successfully!" 
                        : "❌ Incorrect! Your code needs fixing."
                      }
                    </strong>
                  </div>
                  {!challengeStates.codeFixer.isCorrect && (
                    <div className={styles.detailedFeedback}>
                      Your code produced: "{challengeStates.codeFixer.output}"
                    </div>
                  )}
                </div>
              )}




              {/* Submit Button - Only show when not completed */}
              {!challengeStates.codeFixer.isCompleted && (
                <div className={styles.submitButton}>
                  <button
                    onClick={checkCodeFixerSolution}
                    disabled={challengeStates.codeFixer.isExecuting}
                    className={challengeStates.codeFixer.isExecuting ? styles.submitting : ''}
                  >
                    {challengeStates.codeFixer.isExecuting ? 'Executing...' : 'Submit'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Output Tracing Challenge */}
          {challenges.outputTracing && (
            <div className={styles.outputTracingChallenge}>
              <div className={styles.challengeTitle}>OUTPUT TRACING CHALLENGE</div>
              
              <div className={styles.codeDisplayContainer}>
                <h3>CODE TO ANALYZE:</h3>
                <LessonMonacoEditor
                  value={challenges.outputTracing.challenge_data.code}
                  onChange={() => {}}
                  language="java"
                  height="100%"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 17,
                    wordWrap: 'on',
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    renderWhitespace: 'selection',
                    formatOnPaste: true,
                    formatOnType: true,
                    lineNumbers: 'on',
                    folding: true,
                    lineDecorationsWidth: 10,
                    padding: { top: 15, bottom: 15, left: 15, right: 15 },
                    tabSize: 2,
                    fontFamily: 'Fira Code, monospace',
                    fontWeight: '400',
                    lineHeight: 24,
                    glyphMargin: false,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'all',
                    scrollbar: {
                      vertical: 'hidden',
                      horizontal: 'hidden',
                      useShadows: false,
                      verticalHasArrows: false,
                      horizontalHasArrows: false,
                      verticalScrollbarSize: 0,
                      horizontalScrollbarSize: 0,
                    },
                    fixedOverflowWidgets: true,
                    overviewRulerBorder: false,
                    hideCursorInOverviewRuler: true,
                  }}
                />
              </div>

              <div className={styles.questionContainer}>
                <h3>What is the output of the following code?</h3>
                <div className={styles.selectionInfo}>
                  Selected: {challengeStates.outputTracing.selectedOptions?.length || 0} option(s)
                </div>
              </div>

              <div className={styles.choicesContainer}>
                {challenges.outputTracing.challenge_data.choices.map((choice, i) => {
                  const isSelected = challengeStates.outputTracing.selectedOptions?.includes(choice);
                  const expectedOutputs = challenges.outputTracing?.challenge_data?.expected_output || [];
                  const isCorrect = expectedOutputs.includes(choice);
                  
                  return (
                    <button
                      key={i}
                      className={`${styles.choiceButton} ${
                        isSelected
                          ? challengeStates.outputTracing.isCompleted
                            ? isCorrect
                              ? styles.correct
                              : styles.wrong
                            : styles.selected
                          : ""
                      }`}
                      onClick={() =>
                        !challengeStates.outputTracing.isCompleted && 
                        handleOutputTracingOptionSelect(choice)
                      }
                      disabled={challengeStates.outputTracing.isCompleted}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>

              {/* Validation button */}
              {!challengeStates.outputTracing.isCompleted && (
                <div className={styles.submitButton}>
                  <button
                    className={styles.submitButton}
                    onClick={validateOutputTracing}
                    disabled={!challengeStates.outputTracing.selectedOptions || challengeStates.outputTracing.selectedOptions.length === 0}
                  >
                    Submit
                  </button>
                </div>
              )}

              {/* Feedback after validation */}
              {challengeStates.outputTracing.isCompleted && (
                <div className={styles.feedback}>
                  <div className={challengeStates.outputTracing.score === 100 ? styles.feedbackCorrect : styles.feedbackWrong}>
                    <strong>{challengeStates.outputTracing.feedback}</strong>
                  </div>
                  {challengeStates.outputTracing.detailedFeedback && (
                    <div className={styles.detailedFeedback}>
                      {challengeStates.outputTracing.detailedFeedback}
                    </div>
                  )}
                  {challenges.outputTracing.challenge_data.explanation && (
                    <div className={styles.explanation}>
                      <strong>Explanation:</strong> {challenges.outputTracing.challenge_data.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Code Completion Challenge */}
          {challenges.codeCompletion && (
            <div className={styles.codeCompletionChallenge}>
              <div className={styles.challengeTitle}>CODE COMPLETION CHALLENGE</div>
              
              {/* Choices Bar */}
              <div 
                className={`${styles.choicesBar} ${challengeStates.codeCompletion.isDragging ? styles.dragOver : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  // Check if this is coming from the editor
                  try {
                    const jsonData = e.dataTransfer.getData('application/json');
                    const dragData = jsonData ? JSON.parse(jsonData) : null;
                    
                    if (dragData?.isFromEditor) {
                      e.dataTransfer.dropEffect = 'copy';
                      setChallengeStates(prev => ({
                        ...prev,
                        codeCompletion: { ...prev.codeCompletion, isDragging: true }
                      }));
                    } else {
                      e.dataTransfer.dropEffect = 'none';
                    }
                  } catch (error) {
                    e.dataTransfer.dropEffect = 'none';
                  }
                }}
                onDragLeave={() => {
                  setChallengeStates(prev => ({
                    ...prev,
                    codeCompletion: { ...prev.codeCompletion, isDragging: false }
                  }));
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  // Always reset dragging state when dropping on choices bar
                  setChallengeStates(prev => ({
                    ...prev,
                    codeCompletion: { ...prev.codeCompletion, isDragging: false }
                  }));
                  
                  let dragData;
                  try {
                    const jsonData = e.dataTransfer.getData('application/json');
                    dragData = jsonData ? JSON.parse(jsonData) : null;
                  } catch (error) {
                    return;
                  }
                  
                  // Only process if this is coming from the editor and has a value
                  if (dragData?.isFromEditor && dragData.value) {
                    // Remove the choice from usedChoices (return it to choices bar)
                    setChallengeStates(prev => ({
                      ...prev,
                      codeCompletion: {
                        ...prev.codeCompletion,
                        usedChoices: prev.codeCompletion.usedChoices.filter(c => c !== dragData.value)
                      }
                    }));
                    
                    // If this was a move operation, remove the text from the editor
                    if (e.dataTransfer.dropEffect === 'move' && dragData.range) {
                      const editor = editorRefs.current.codeCompletion;
                      if (editor) {
                        try {
                          const model = editor.getModel();
                          if (!model) return;
                          
                          // Find which blank this choice was placed in and restore placeholder
                          const blankId = Object.keys(challengeStates.codeCompletion.userChoices).find(key => 
                            challengeStates.codeCompletion.userChoices[key].choice === dragData.value
                          );
                          if (blankId) {
                            setChallengeStates(prev => ({
                              ...prev,
                              codeCompletion: {
                                ...prev.codeCompletion,
                                userChoices: (() => {
                                  const newChoices = { ...prev.codeCompletion.userChoices };
                                  delete newChoices[blankId];
                                  return newChoices;
                                })(),

                              }
                            }));
                          }
                        } catch (error) {
                          // Error handling
                        }
                      }
                    }
                  }
                }}
              >
                {codeCompletionAvailableChoices.map((choice, idx) => (
                  <div
                    key={idx}
                    className={`${styles.choiceItem} ${
                      challengeStates.codeCompletion.currentDragItem?.value === choice ? styles.dragging : ''
                    }`}
                    draggable={!challengeStates.codeCompletion.isCompleted}
                    onDragStart={(e) => {
                      if (challengeStates.codeCompletion.isCompleted) return;
                      
                      setChallengeStates(prev => ({
                        ...prev,
                        codeCompletion: { ...prev.codeCompletion, isDragging: true }
                      }));
                      
                      const dragData = {
                        type: 'choice',
                        value: choice,
                        isFromEditor: false
                      };
                      
                      e.dataTransfer.effectAllowed = 'copy';
                      e.dataTransfer.setData('text/plain', choice);
                      e.dataTransfer.setData('application/json', JSON.stringify(dragData));
                    }}
                    onDragEnd={() => {
                      setChallengeStates(prev => ({
                        ...prev,
                        codeCompletion: { ...prev.codeCompletion, isDragging: false }
                      }));
                    }}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {choice}
                  </div>
                ))}
                

              </div>
              
              {/* Code Editor */}
              <div className={styles.codeEditorContainer}>
                <h3>COMPLETE THE CODE:</h3>
                <div
                  onDragOver={(e) => {
                    // Don't allow drag over when completed
                    if (challengeStates.codeCompletion.isCompleted) {
                      e.preventDefault();
                      return;
                    }
                    
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                  }}
                  onDrop={(e) => {
                    if (challengeStates.codeCompletion.isCompleted) {
                      e.preventDefault();
                      return;
                    }
                    e.preventDefault();
                    
                    let dragData;
                    try {
                      const jsonData = e.dataTransfer.getData('application/json');
                      dragData = jsonData ? JSON.parse(jsonData) : null;
                    } catch (error) {
                      return;
                    }
                    
                    const choice = dragData?.value || e.dataTransfer.getData('text/plain');
                    if (!choice || challengeStates.codeCompletion.usedChoices.includes(choice)) return;
                    
                    // Get the target element
                    const target = e.target;
                    
                    // Check if the target is a placeholder element
                    if (target && target.classList && target.classList.contains('bug-placeholder')) {
                      // Extract the placeholder text (e.g., "1", "2" - just the number)
                      const placeholderText = target.textContent.trim();
                      
                      // Find the placeholder in our data
                      const editor = editorRefs.current.codeCompletion;
                      if (editor) {
                        const model = editor.getModel();
                        if (model) {
                          const codeText = model.getValue();
                          
                          const blankPattern = /\[[0-9]+\]/g;
                          let match;
                          
                          while ((match = blankPattern.exec(codeText)) !== null) {
                            // Extract just the number from [1], [2], etc.
                            const matchNumber = match[0].replace(/[\[\]]/g, '');
                            
                            // Check if this is the placeholder we're looking for
                            if (matchNumber === placeholderText) {
                              const startPos = model.getPositionAt(match.index);
                              const slotId = `slot_${matchNumber}`; // Convert to backend format
                              
                              // Check if placeholder is already filled
                              if (challengeStates.codeCompletion.userChoices[slotId]) {
                                return;
                              }
                              
                              // Store choice with position information
                              setChallengeStates(prev => ({
                                ...prev,
                                codeCompletion: {
                                  ...prev.codeCompletion,
                                  userChoices: {
                                    ...prev.codeCompletion.userChoices,
                                    [slotId]: {
                                      choice: choice,
                                      position: {
                                        line: startPos.lineNumber,
                                        column: startPos.column
                                      },
                                      slotId: slotId
                                    }
                                  },
                                  usedChoices: [...prev.codeCompletion.usedChoices, choice]
                                }
                              }));
                              
                              // Note: finalChoicePositions will be automatically calculated by processedCodeCompletion useMemo
                              
                              return; // Successfully filled the placeholder
                            }
                          }
                        }
                      }
                    }
                  }}
                >
                  <MonacoCodeBlock
                    value={processedCodeCompletion.code}
                    onChange={(newCode) => newCode !== undefined && setChallengeStates(prev => ({
                      ...prev,
                      codeCompletion: { ...prev.codeCompletion, code: newCode }
                    }))}
                    language="java"
                    mode="code_completion"
                    height="100%"
                    fixTagClass="bug-placeholder"
                    fixTagRegex={/(?<!\w)\[\d+\](?!\w)/g}
                    fixTagHoverMessage="Drop a choice here"
                    userChoices={challengeStates.codeCompletion.userChoices}
                    placedChoicePositions={processedCodeCompletion.finalChoicePositions}
                    timerState="active"
                    disabled={challengeStates.codeCompletion.isCompleted}
                    isResumed={false}
                    onMount={(editor, monacoInstance) => {
                      editorRefs.current.codeCompletion = editor;
                      monaco = monacoInstance;
                      
                      // Set up click-to-remove functionality for placed choices
                      const handleMouseDown = (e) => {
                        if (challengeStates.codeCompletion.isCompleted) return;
                        
                        const model = editor.getModel();
                        if (!model) return;
                        
                        // Get the click position from the event using Monaco's position API
                        let clickPosition = e.target.position;
                        if (!clickPosition) {
                          // Fallback: try to get position from the event coordinates
                          const rect = editor.getDomNode().getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const y = e.clientY - rect.top;
                          clickPosition = editor.getPositionAt({ x, y });
                          if (!clickPosition) return;
                        }
                        
                        // Use refs to avoid closure issues (like CodeCompletion.jsx)
                        const currentUserChoices = userChoicesRef.current;
                        const finalPositions = finalPositionsRef.current;
                        
                        // Check each placed choice using its final position
                        for (const [slotId, finalPosition] of Object.entries(finalPositions)) {
                          const { line, column, length } = finalPosition;
                          const choiceData = currentUserChoices[slotId];
                          if (!choiceData) continue;
                          
                          const choice = choiceData.choice;
                          
                          // Calculate the end position of this choice with buffer
                          const expandedStartColumn = Math.max(1, column - 2);
                          const expandedEndColumn = column + length + 2;
                          
                          // Check if the click position is within the expanded range
                          const isInExpandedRange = clickPosition.lineNumber === line &&
                                                   clickPosition.column >= expandedStartColumn && 
                                                   clickPosition.column <= expandedEndColumn;
                          
                          if (isInExpandedRange) {
                            handleChoiceClick(choice);
                            return; // Found and removed the choice, exit
                          }
                        }
                      };
                      
                      // Add Monaco mouse down event listener for click-to-remove
                      const mouseDownDisposable = editor.onMouseDown(handleMouseDown);
                      
                      // Also try onMouseUp as a fallback
                      const mouseUpDisposable = editor.onMouseUp(handleMouseDown);
                      
                      // Cleanup function
                      return () => {
                        if (mouseDownDisposable) {
                          mouseDownDisposable.dispose();
                        }
                        if (mouseUpDisposable) {
                          mouseUpDisposable.dispose();
                        }
                      };
                    }}
                    options={{
                      contextmenu: false,
                      quickSuggestions: false,
                      suggestOnTriggerCharacters: false,
                      acceptSuggestionOnCommitCharacter: false,
                      acceptSuggestionOnEnter: 'off',
                      tabCompletion: 'off',
                      wordBasedSuggestions: 'off',
                      parameterHints: { enabled: false },
                      hover: { enabled: true, delay: 100 }
                    }}
                  />
                </div>
              </div>

              {/* Expected Output Section */}
              <div className={styles.expectedOutput}>
                <h3>Expected Output:</h3>
                <div className={styles.outputText}>
                  {challenges.codeCompletion?.challenge_data?.expected_output?.[0] || 'No expected output available'}
                </div>
              </div>

              {/* Feedback after validation */}
              {challengeStates.codeCompletion.isCompleted && (
                <div className={styles.feedback}>
                  <div className={challengeStates.codeCompletion.allCorrect ? styles.feedbackCorrect : styles.feedbackWrong}>
                    <strong>
                      {challengeStates.codeCompletion.allCorrect 
                        ? "✅ Perfect! All placeholders completed correctly!" 
                        : "❌ Incorrect! Some placeholders need fixing."
                      }
                    </strong>
                  </div>
                  {!challengeStates.codeCompletion.allCorrect && (
                    <div className={styles.detailedFeedback}>
                      {(() => {
                        const completionSlots = challenges.codeCompletion?.challenge_data.completion_slots || [];
                        const userChoices = challengeStates.codeCompletion.userChoices || {};
                        const correctCount = completionSlots.filter((slot) => {
                          const slotId = slot.id;
                          const userChoice = userChoices[slotId];
                          return userChoice && userChoice.choice === slot.correct_answer;
                        }).length;
                        const totalSlots = completionSlots.length;
                        return `You completed ${correctCount} out of ${totalSlots} placeholders correctly.`;
                      })()}
                    </div>
                  )}
                </div>
              )}


              {/* Solution Code Section - Only show after submission */}
              {challengeStates.codeCompletion.isCompleted && challengeStates.codeCompletion.solutionCode && (
                <div className={styles.solutionCode}>
                  <h3>Solution Code:</h3>
                  <div className={styles.codeBlock}>
                    <pre>{challengeStates.codeCompletion.solutionCode}</pre>
                  </div>
                </div>
              )}


              {/* Explanation Section - Only show after submission */}
              {challengeStates.codeCompletion.isCompleted && challengeStates.codeCompletion.explanation && (
                <div className={styles.explanation}>
                  <h3>Explanation:</h3>
                  <div className={styles.explanationText}>
                    {challengeStates.codeCompletion.explanation}
                  </div>
                </div>
              )}


              {/* Submit Button - Only show when not completed */}
              {!challengeStates.codeCompletion.isCompleted && (
                <div className={styles.submitButton}>
                  <button
                    onClick={checkCodeCompletionSolution}
                    disabled={challengeStates.codeCompletion.isCompleted}
                    className={challengeStates.codeCompletion.isCompleted ? styles.submitted : ''}
                  >
                    {challengeStates.codeCompletion.isCompleted ? "Submitted" : "Submit"}
                  </button>
                </div>
              )}
              


            </div>
          )}
        </div>

        {/* Completion Button - Shows when all challenges are completed */}
        {allChallengesCompleted && showCompletionPopup && (
          <div className={styles.completionSection}>
            <div className={styles.completionMessage}>
              <button 
                className={styles.closeButton}
                onClick={handleCloseCompletionPopup}
                aria-label="Close popup"
              >
                ×
              </button>
              <h3>🎯 Practice Attempted!</h3>
              <p>You've attempted all practice challenges. Ready to take on the real challenges?</p>
            </div>
            <div className={styles.completionActions}>
              <button
                className={styles.proceedButton}
                onClick={handleProceedToChallenges}
              >
                🚀 Proceed to Challenges
              </button>
            </div>
          </div>
        )}
      </div>
    </LessonThemeProvider>
  );
};

export default PracticePage;
