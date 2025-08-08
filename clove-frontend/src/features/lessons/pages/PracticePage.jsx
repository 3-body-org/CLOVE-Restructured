import React, { useState, useEffect, useCallback, useRef, useMemo, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import confetti from "canvas-confetti";
import styles from "features/lessons/styles/PracticePage.module.scss";
import LessonThemeProvider from "features/lessons/components/LessonThemeProvider";
import LessonMonacoEditor from "../components/LessonMonacoEditor";
import ChallengeSidebar from "features/challenges/components/ChallengeSidebar";
import { useChallengeTheme } from 'features/challenges/hooks/useChallengeTheme';
import { useChallengeData } from '../hooks/useChallengeData';
import { useLessonService } from '../services/lessonService';
import { useAuth } from "contexts/AuthContext";
import LoadingScreen from "components/layout/StatusScreen/LoadingScreen";
import ErrorScreen from "components/layout/StatusScreen/ErrorScreen";

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
      isCompleted: false
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
      hoveredPlaceholder: null
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
             // Check if user has attempted the challenge (has output, selected option, or used choices)
             return state && (
               state.output || 
               state.selectedOption || 
               (state.selectedOptions && state.selectedOptions.length > 0) ||
               (state.usedChoices && state.usedChoices.length > 0) ||
               state.isCompleted
             );
           });
    
    console.log('🔍 [PracticePage] Completion check:', {
      availableChallenges,
      challengeStates,
      completed,
              attempts: availableChallenges.map(type => ({
          type,
          hasAttempted: challengeStates[type] && (
            challengeStates[type].output || 
            challengeStates[type].selectedOption || 
            (challengeStates[type].selectedOptions && challengeStates[type].selectedOptions.length > 0) ||
            (challengeStates[type].usedChoices && challengeStates[type].usedChoices.length > 0) ||
            challengeStates[type].isCompleted
          )
        }))
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
            console.log('🔍 [PracticePage] Marking practice as completed for user:', user.id, 'subtopic:', subtopicId);
            await completePractice(user.id, parseInt(subtopicId));
            console.log('✅ [PracticePage] Practice marked as completed successfully');
            
            // Mark as completed in localStorage to prevent repeated calls
            localStorage.setItem(practiceCompletionKey, 'true');
          } catch (error) {
            console.error('❌ [PracticePage] Failed to mark practice as completed:', error);
            // Don't show error notification to user as this is a background operation
          }
        };
        
        markPracticeAsCompleted();
      } else {
        console.log('🔍 [PracticePage] Practice already marked as completed for user:', user.id, 'subtopic:', subtopicId);
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
      // Convert ??? placeholders to FIX_ tags for Monaco editor
      let code = challenges.codeCompletion.challenge_data.initial_code;
      let fixCounter = 1;
      
      // Replace ??? with FIX_1, FIX_2, etc.
      code = code.replace(/\?\?\?/g, () => `FIX_${fixCounter++}`);
      
      setChallengeStates(prev => ({
        ...prev,
        codeCompletion: {
          ...prev.codeCompletion,
          code: code
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
      // Get solution code from challenge data (CORRECT approach)
      const solutionCode = challenges.codeFixer?.challenge_data?.solution_code;
      
      if (!solutionCode) {
        setChallengeStates(prev => ({
          ...prev,
          codeFixer: {
            ...prev.codeFixer,
            output: '❌ Error: No solution code available for validation'
          }
        }));
        return;
      }

      // Normalize both codes for comparison (like the proper validation service)
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
            output: '✅ Correct! Code fixed successfully!'
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
            output: `❌ Incorrect! Your code produces: ${actualOutput}\nExpected solution: ${solutionCode}`
          }
        }));
      }
    } catch (error) {
      setChallengeStates(prev => ({
        ...prev,
        codeFixer: {
          ...prev.codeFixer,
          output: `❌ Error: ${error.message}`
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

  // Code Completion Functions
  const handleCodeCompletionDragStart = useCallback((e, choice) => {
    const dragData = {
      ...choice,
      type: 'choice',
      isFromEditor: false
    };

    e.dataTransfer.effectAllowed = 'copyMove';
    e.dataTransfer.dropEffect = 'copy';
    e.dataTransfer.clearData();
    e.dataTransfer.setData('text/plain', dragData.value);
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    
    setChallengeStates(prev => ({
      ...prev,
      codeCompletion: {
        ...prev.codeCompletion,
        currentDragItem: dragData
      }
    }));
    
    e.currentTarget.classList.add('dragging');
  }, []);

  const handleCodeCompletionDragEnd = useCallback((e) => {
    setChallengeStates(prev => ({
      ...prev,
      codeCompletion: {
        ...prev.codeCompletion,
        currentDragItem: null
      }
    }));
    
    const elements = document.querySelectorAll('.choice');
    elements.forEach((el) => el.classList.remove('dragging'));
  }, []);

  const checkCodeCompletionSolution = useCallback(() => {
    const currentState = challengeStates.codeCompletion;
    if (currentState.isCompleted) return;

    // Get completion slots from challenge data (CORRECT approach)
    const completionSlots = challenges.codeCompletion?.challenge_data.completion_slots || [];
    
    // Create user choices object from the used choices (from drag-and-drop)
    const userChoices = {};
    const usedChoices = currentState.usedChoices || [];
    
    // Map used choices to completion slots
    completionSlots.forEach((slot, index) => {
      const slotId = slot.id;
      if (usedChoices[index]) {
        userChoices[slotId] = { choice: usedChoices[index] };
      }
    });
    
    // Count correct choices using the proper validation logic
    const correctCount = completionSlots.filter((slot) => {
      const slotId = slot.id;
      const userChoice = userChoices && userChoices[slotId];
      return userChoice && userChoice.choice === slot.correct_answer;
    }).length;
    
    const totalSlots = completionSlots.length;
    const allCorrect = correctCount === totalSlots && totalSlots > 0;
    const totalScore = correctCount * 25 + (allCorrect ? 50 : 0);

    setChallengeStates(prev => ({
      ...prev,
      codeCompletion: {
        ...prev.codeCompletion,
        score: totalScore,
        allCorrect
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

  // Helper function to get replaceable ranges for code completion
  const getReplaceableRanges = useCallback((code) => {
    // First, convert ??? to FIX_ tags if they exist
    let processedCode = code;
    let fixCounter = 1;
    processedCode = processedCode.replace(/\?\?\?/g, () => `FIX_${fixCounter++}`);
    
    // Get all FIX tags and choices
    const fixTags = processedCode.match(/FIX_\d+/g) || [];
    const choices = challenges.codeCompletion?.challenge_data.choices || [];
    const allReplaceables = [...fixTags, ...choices];
    const ranges = [];
    
    allReplaceables.forEach(tag => {
      let idx = processedCode.indexOf(tag);
      while (idx !== -1) {
        ranges.push({ tag, start: idx, end: idx + tag.length });
        idx = processedCode.indexOf(tag, idx + tag.length);
      }
    });
    
    return ranges;
  }, [challenges.codeCompletion]);

  // Available choices for code completion
  const codeCompletionAvailableChoices = useMemo(() => {
    const choices = challenges.codeCompletion?.challenge_data.choices || [];
    const usedChoices = challengeStates.codeCompletion.usedChoices;
    return choices.filter(choice => !usedChoices.includes(choice));
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

              <div className={styles.submitButton}>
                <button
                  onClick={checkCodeFixerSolution}
                  disabled={challengeStates.codeFixer.isExecuting || challengeStates.codeFixer.isCompleted}
                  className={challengeStates.codeFixer.isExecuting ? styles.submitting : ''}
                >
                  {challengeStates.codeFixer.isExecuting ? 'Executing...' : 'Submit'}
                </button>
              </div>
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
              <div className={`${styles.choicesBar} ${challengeStates.codeCompletion.isDragging ? styles.dragOver : ''}`}>
                {codeCompletionAvailableChoices.map((choice, idx) => (
                  <div
                    key={idx}
                    className={`${styles.choiceItem} ${
                      challengeStates.codeCompletion.currentDragItem?.value === choice ? styles.dragging : ''
                    }`}
                    draggable
                    onDragStart={(e) => handleCodeCompletionDragStart(e, { value: choice })}
                    onDragEnd={handleCodeCompletionDragEnd}
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
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    
                    let dragData;
                    try {
                      const jsonData = e.dataTransfer.getData('application/json');
                      dragData = jsonData ? JSON.parse(jsonData) : null;
                    } catch (error) {
                      return;
                    }
                    
                    if (!dragData || dragData.isFromEditor) return;
                    
                    const editor = editorRefs.current.codeCompletion;
                    if (!editor) return;
                    
                    const model = editor.getModel();
                    if (!model) return;
                    
                    const rect = editor.getDomNode().getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const position = editor.getTargetAtClientPoint ? editor.getTargetAtClientPoint(e.clientX, e.clientY) : null;
                    
                    let offset = null;
                    if (position && position.position) {
                      offset = model.getOffsetAt(position.position);
                    } else {
                      const lineCount = model.getLineCount();
                      for (let line = 1; line <= lineCount; line++) {
                        const lineTop = editor.getTopForLineNumber(line);
                        const lineHeight = editor.getOption && editor.getOption(editor.constructor.EditorOption.lineHeight) || 24;
                        if (y >= lineTop && y < lineTop + lineHeight) {
                          offset = model.getOffsetAt({ lineNumber: line, column: 1 });
                          break;
                        }
                      }
                    }
                    
                    if (offset === null) return;
                    
                    const codeVal = model.getValue();
                    const replaceables = getReplaceableRanges(codeVal);
                    const target = replaceables.find(r => offset >= r.start && offset <= r.end);
                    
                    if (!target) return;
                    
                    const before = codeVal.slice(0, target.start);
                    const after = codeVal.slice(target.end);
                    const newCode = before + dragData.value + after;
                    
                    setChallengeStates(prev => ({
                      ...prev,
                      codeCompletion: {
                        ...prev.codeCompletion,
                        code: newCode
                      }
                    }));
                    
                    setChallengeStates(prev => ({
                      ...prev,
                      codeCompletion: {
                        ...prev.codeCompletion,
                        usedChoices: [...prev.codeCompletion.usedChoices, dragData.value]
                      }
                    }));
                    
                    setChallengeStates(prev => ({
                      ...prev,
                      codeCompletion: {
                        ...prev.codeCompletion,
                        currentDragItem: null
                      }
                    }));
                  }}
                >
                  <LessonMonacoEditor
                    value={challengeStates.codeCompletion.code}
                    onChange={(newCode) => newCode !== undefined && setChallengeStates(prev => ({
                      ...prev,
                      codeCompletion: { ...prev.codeCompletion, code: newCode }
                    }))}
                    language="java"
                    height="100%"
                    onMount={(editor) => {
                      editorRefs.current.codeCompletion = editor;
                      editor.updateOptions({ 
                        dragAndDrop: true,
                        acceptSuggestionOnEnter: 'smart',
                        selectOnLineNumbers: true,
                        selectionClipboard: true,
                        quickSuggestions: false
                      });
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

              <div className={styles.submitButton}>
                <button
                  onClick={checkCodeCompletionSolution}
                  disabled={challengeStates.codeCompletion.isCompleted}
                  className={challengeStates.codeCompletion.isCompleted ? styles.submitted : ''}
                >
                  {challengeStates.codeCompletion.isCompleted ? "Submitted" : "Submit"}
                </button>
              </div>
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
        {console.log('🔍 [PracticePage] Rendering completion button:', allChallengesCompleted)}
      </div>
    </LessonThemeProvider>
  );
};

export default PracticePage;
