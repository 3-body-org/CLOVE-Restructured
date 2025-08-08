/**
 * @file CodeCompletion.jsx
 * @description Code Completion challenge mode with backend integration
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import MonacoCodeBlock from '../components/MonacoCodeBlock';
import ChoicesBar from '../components/ChoicesBar';
import ProgressIndicator from '../components/ProgressIndicator';
import styles from '../styles/CodeCompletion.module.scss';

const CodeCompletion = ({
  challengeData,
  onAnswerSubmit,
  timeRemaining,
  initialTimerDuration,
  hintsUsed,
  hintsAvailable,
  onHint,
  disabled = false,
  challengeIndex = 0,
  totalChallenges = 5,
  revealedHints = [],
  resetChallengeState,
  isSubmitting = false,
  isResumed = false,
  userAnswer = null,
  onAnswerUpdate = null,
  timerState = 'active',
  isTimerEnabled = true,
  isHintsEnabled = true
}) => {
  // Local state - Updated to include position information
  const [userChoices, setUserChoices] = useState({});
  const [usedChoices, setUsedChoices] = useState(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentDragItem, setCurrentDragItem] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  const editorRef = useRef(null);
  const userChoicesRef = useRef(userChoices);
  const usedChoicesRef = useRef(usedChoices);

  const { code, choices, blankPositions, scenario, expectedOutput } = challengeData;

  // Reset state when challenge data changes
  useEffect(() => {
    setIsSubmitted(false);
    setUserChoices({});
    setUsedChoices(new Set());
    setIsDragging(false);
  }, [challengeData]);

  // Restore user answer when resuming a cancelled challenge
  useEffect(() => {
    if (userAnswer && isResumed) {
      // Only restore if userAnswer is not empty
      if (userAnswer && typeof userAnswer === 'object' && Object.keys(userAnswer).length > 0) {
        setUserChoices(userAnswer);
        const usedChoicesSet = new Set();
        Object.values(userAnswer).forEach(choice => {
          if (choice && choice.choice) {
            usedChoicesSet.add(choice.choice);
          }
        });
        setUsedChoices(usedChoicesSet);
      }
    }
  }, [userAnswer, isResumed]);

  // Update refs when state changes
  useEffect(() => {
    userChoicesRef.current = userChoices;
  }, [userChoices]);

  useEffect(() => {
    usedChoicesRef.current = usedChoices;
  }, [usedChoices]);

  // Process code to replace ??? with [1], [2], etc. placeholders
  const processedCode = useMemo(() => {
    if (!code) return { code: '', blanks: [], finalChoicePositions: {} };

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
        const placedChoice = userChoices[blank.id];
        const placeholder = placedChoice ? placedChoice.choice : blank.displayId; // Use [1], [2] for display
        
        const before = processedLine.substring(0, blank.matchIndex);
        const after = processedLine.substring(blank.matchIndex + 3);
        processedLine = before + placeholder + after;
      });

      // Second pass: find final positions of placed choices in the processed line
      lineBlanks.forEach((blank) => {
        const placedChoice = userChoices[blank.id];
        if (placedChoice) {
          // Find the actual position of this choice in the final processed line
          const choiceIndex = processedLine.indexOf(placedChoice.choice);
          if (choiceIndex !== -1) {
            finalChoicePositions[blank.id] = {
              line: lineIndex + 1,
              column: choiceIndex + 1, // +1 because Monaco uses 1-based columns
              length: placedChoice.choice.length
            };
            
            console.log('🔄 POSITION: Found final position for', blank.id, 'at column:', choiceIndex + 1, 'length:', placedChoice.choice.length);
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
    
    console.log('🔄 PROCESSED CODE: Final result:', result.code);
    console.log('🔄 PROCESSED CODE: Final choice positions:', finalChoicePositions);
    return result;
  }, [code, userChoices, isResumed]);

  // Get available choices (not used yet)
  const availableChoices = useMemo(() => {
    const available = choices.filter(choice => !usedChoices.has(choice));
    return available;
  }, [choices, usedChoices]);

  // Update editor value when processed code changes
  useEffect(() => {
    if (editorRef.current && processedCode.code) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== processedCode.code) {
        editorRef.current.setValue(processedCode.code);
      }
    }
  }, [processedCode.code]);

  // Simple state update - no complex decoration logic needed
  // The MonacoCodeBlock component handles all decorations automatically

  // Handle drag start from choices bar
  const handleDragStart = useCallback((e, choice) => {
    if (disabled || isSubmitted || usedChoicesRef.current.has(choice) || timerState === 'expired') return;
    setIsDragging(true);
    setCurrentDragItem(choice);
    
    const dragData = {
      type: 'choice',
      value: choice,
      isFromEditor: false
    };
    
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', choice);
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
  }, [disabled, isSubmitted, timerState]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setCurrentDragItem(null);
  }, []);

  // Handle drag start with timeout to reset state
  const handleDragStartWithTimeout = useCallback((e, choice) => {
    if (disabled || isSubmitted || usedChoicesRef.current.has(choice) || timerState === 'expired' || isResumed) return;
    
    setIsDragging(true);
    setCurrentDragItem(choice);
    
    const dragData = {
      type: 'choice',
      value: choice,
      isFromEditor: false
    };
    
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', choice);
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    
    // Set a timeout to reset dragging state if drag events don't fire properly
    setTimeout(() => {
      setIsDragging(false);
      setCurrentDragItem(null);
    }, 5000); // 5 second timeout
  }, [disabled, isSubmitted, timerState]);

  // Add global event listeners to reset dragging state
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setCurrentDragItem(null);
    };

    const handleGlobalDragEnd = () => {
      setIsDragging(false);
      setCurrentDragItem(null);
    };

    // Add event listeners
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('dragend', handleGlobalDragEnd);

    // Cleanup
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('dragend', handleGlobalDragEnd);
    };
  }, []);
  
  // Handle drop on editor - Enhanced with position tracking
  const handleDrop = useCallback((e) => {
    if (disabled || isSubmitted || timerState === 'expired' || isResumed) return;
    e.preventDefault();
    
    let dragData;
    try {
      const jsonData = e.dataTransfer.getData('application/json');
      dragData = jsonData ? JSON.parse(jsonData) : null;
    } catch (error) {
      return;
    }
    
    const choice = dragData?.value || e.dataTransfer.getData('text/plain');
    if (!choice || usedChoicesRef.current.has(choice)) return;
    
    // Get the target element
    const target = e.target;
    
    // Check if the target is a placeholder element
    if (target && target.classList && target.classList.contains('bug-placeholder')) {
      // Extract the placeholder text (e.g., "1", "2" - just the number)
      const placeholderText = target.textContent.trim();
      
      // Find the placeholder in our data
      const editor = editorRef.current;
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
              const targetPlaceholder = {
                tag: match[0],
                startPos,
                blankId: slotId, // Use slot_1, slot_2 format
                lineNumber: startPos.lineNumber,
                column: startPos.column
              };
              
              // Check if placeholder is already filled
              if (userChoicesRef.current[targetPlaceholder.blankId]) {
                return;
              }
              
              // Store choice with position information
              setUserChoices(prev => {
                const newChoices = { 
                  ...prev, 
                  [targetPlaceholder.blankId]: {
                    choice: choice,
                    position: {
                      line: targetPlaceholder.lineNumber,
                      column: targetPlaceholder.column
                    },
                    slotId: targetPlaceholder.blankId
                  }
                };
                console.log('🔄 DRAG-DROP: Placed choice:', choice, 'in slot:', targetPlaceholder.blankId, 'All choices:', newChoices);
                return newChoices;
              });
              setUsedChoices(prev => new Set([...prev, choice]));
              
              return; // Successfully filled the placeholder
            }
          }
        }
      }
    }
  }, [disabled, isSubmitted, timerState]);

  // Handle click on filled choice to remove it - Updated for new structure
  const handleChoiceClick = useCallback((choice) => {
    if (disabled || isSubmitted || timerState === 'expired' || isResumed) return;
    
    // Use the ref to get current state to avoid closure issues
    const currentUserChoices = userChoicesRef.current;
    
    // Find which blank this choice was placed in
    const blankId = Object.keys(currentUserChoices).find(key => 
      currentUserChoices[key].choice === choice
    );
    if (!blankId) {
      return;
    }
      
    // Remove the choice
    setUserChoices(prev => {
      const newChoices = { ...prev };
      delete newChoices[blankId];
      return newChoices;
    });
      
    setUsedChoices(prev => {
      const newUsed = new Set(prev);
      newUsed.delete(choice);
      return newUsed;
    });
      
    // The processedCode will automatically update and reflect the change
  }, [disabled, isSubmitted, timerState]);

  // Handle drop on choices bar (return choices from editor) - Updated for new structure
  const handleChoicesBarDrop = useCallback((e) => {
    if (disabled || isSubmitted || timerState === 'expired') return;
    e.preventDefault();
    e.stopPropagation();
    
    // Always reset dragging state when dropping on choices bar
    setIsDragging(false);
    setCurrentDragItem(null);
    
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
      setUsedChoices(prev => {
        const newUsed = new Set(prev);
        newUsed.delete(dragData.value);
        return newUsed;
      });
      
      // If this was a move operation, remove the text from the editor
      if (e.dataTransfer.dropEffect === 'move' && dragData.range) {
        const editor = editorRef.current;
        if (editor) {
          try {
            const model = editor.getModel();
            if (!model) return;
            
            // Find which blank this choice was placed in and restore placeholder
            const blankId = Object.keys(userChoices).find(key => 
              userChoices[key].choice === dragData.value
            );
            if (blankId) {
              setUserChoices(prev => {
                const newChoices = { ...prev };
                delete newChoices[blankId];
                return newChoices;
              });
            }
          } catch (error) {
            // Error handling
          }
        }
      }
    }
  }, [userChoices, disabled, isSubmitted, timerState]);

  // Ref to store current final positions for click handler
  const finalPositionsRef = useRef({});

  // Update ref whenever final positions change
  useEffect(() => {
    finalPositionsRef.current = processedCode.finalChoicePositions;
  }, [processedCode.finalChoicePositions]);

  // Handle Monaco editor mount
  const handleMonacoMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    
    // Set editor options - Read-only is now handled by MonacoCodeBlock based on mode
    editor.updateOptions({
      contextmenu: false,
      quickSuggestions: false,
      suggestOnTriggerCharacters: false,
      acceptSuggestionOnCommitCharacter: false,
      acceptSuggestionOnEnter: 'off',
      tabCompletion: 'off',
      wordBasedSuggestions: 'off',
      parameterHints: { enabled: false },
      hover: { enabled: false }
    });
    
    // Set initial value
    editor.setValue(processedCode.code);
    
    // Enhanced click handler for removing choices - Position-Based Detection
    const handleMouseDown = (e) => {
      if (disabled || isSubmitted || timerState === 'expired' || isResumed) {
        return;
      }
      
      const model = editor.getModel();
      if (!model) {
        return;
      }
      
      // Get the clicked position
      const position = e.target.position;
      if (!position) {
        return;
      }
      
      try {
        // Get current user choices from ref to avoid closure issues
        const currentUserChoices = userChoicesRef.current;
        
        // Use final choice positions from ref for accurate click detection
        const finalPositions = finalPositionsRef.current;
        
        console.log('🔄 CLICK DEBUG: Clicked position:', position);
        console.log('🔄 CLICK DEBUG: Final positions:', finalPositions);
        console.log('🔄 CLICK DEBUG: Current user choices:', currentUserChoices);
        
        // Check each placed choice using its final position
        for (const [slotId, finalPosition] of Object.entries(finalPositions)) {
          const { line, column, length } = finalPosition;
          const choiceData = currentUserChoices[slotId];
          if (!choiceData) continue;
          
          const choice = choiceData.choice;
          
          // Calculate the end position of this choice
          const endColumn = column + length;
          
          // EXPANDED CLICK AREA: Add buffer zone around the choice (±2 characters)
          const expandedStartColumn = Math.max(1, column - 2); // Don't go below column 1
          const expandedEndColumn = endColumn + 2; // Add 2 characters buffer
          
          console.log('🔄 CLICK DEBUG: Checking slot:', slotId, 'choice:', choice);
          console.log('🔄 CLICK DEBUG: Position range:', expandedStartColumn, 'to', expandedEndColumn);
          
          // Check if the click position is within the expanded range
          const isInExpandedRange = position.lineNumber === line &&
                                   position.column >= expandedStartColumn && 
                                   position.column <= expandedEndColumn;
          
          if (isInExpandedRange) {
            console.log('🔄 CLICK: Clicked on choice:', choice, 'in slot:', slotId);
            handleChoiceClick(choice);
            return; // Found and removed the choice, exit
          }
        }
        
        console.log('🔄 CLICK DEBUG: No choice found at clicked position');
      } catch (error) {
        console.error('Error in click handler:', error);
      }
    };
          
    // Add Monaco mouse down event listener for click-to-remove ONLY if not disabled/expired/resumed
    let mouseDownDisposable = null;
    if (!disabled && !isSubmitted && timerState !== 'expired' && !isResumed) {
      mouseDownDisposable = editor.onMouseDown(handleMouseDown);
    }
    
    // Cleanup function
    return () => {
      if (mouseDownDisposable) {
        mouseDownDisposable.dispose();
      }
    };
  }, [processedCode.code, choices, disabled, isSubmitted, handleChoiceClick, timerState, isResumed]);

  // Update parent component with current answer for partial progress saving
  useEffect(() => {
    if (onAnswerUpdate) {
      onAnswerUpdate(userChoices);
    }
  }, [userChoices, onAnswerUpdate]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (isSubmitted || isSubmitting) return;
    setIsSubmitted(true);
    onAnswerSubmit(userChoices);
  }, [isSubmitted, userChoices, onAnswerSubmit, isSubmitting, disabled]);

  return (
        <div className={styles.challengeArea}>
          {/* Progress Indicator at the very top */}
          <ProgressIndicator
            challengeIndex={challengeIndex}
            totalChallenges={totalChallenges}
          />

          {/* Challenge Title */}
          <div className={styles.challengeTitle}>
            <h2>CODE COMPLETION CHALLENGE</h2>
          </div>
          
          {/* Choices Bar */}
          <div 
            className={`${styles.choicesBar} ${isDragging ? styles.dragOver : ''} ${(disabled || isSubmitted || timerState === 'expired' || isResumed) ? styles.disabled : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Check if this is coming from the editor
              try {
                const jsonData = e.dataTransfer.getData('application/json');
                const dragData = jsonData ? JSON.parse(jsonData) : null;
                
                if (dragData?.isFromEditor) {
                  e.dataTransfer.dropEffect = 'copy';
                  setIsDragging(true);
                } else {
                  e.dataTransfer.dropEffect = 'none';
                }
              } catch (error) {
                e.dataTransfer.dropEffect = 'none';
              }
            }}
            onDragLeave={() => {
              setIsDragging(false);
            }}
            onDrop={handleChoicesBarDrop}
          >
            {choices.map((choice, index) => (
              !usedChoices.has(choice) && (
              <div
                key={index}
                  className={`${styles.choiceItem} ${
                    currentDragItem === choice ? styles.dragging : ''
                  } ${(disabled || isSubmitted || timerState === 'expired' || isResumed) ? styles.disabled : ''}`}
                  draggable={!disabled && !isSubmitted && timerState !== 'expired' && !isResumed}
                onDragStart={(e) => handleDragStartWithTimeout(e, choice)}
                onDragEnd={handleDragEnd}
                  title={timerState === 'expired' ? 'Time\'s up! Cannot drag choices.' : isResumed ? 'Challenge cancelled. Cannot drag choices.' : `Drag "${choice}" to fill a blank`}
              >
                {choice}
              </div>
              )
            ))}
          </div>
          
          <div className={`${styles.codeEditorContainer} ${isDragging ? styles.dragOver : ''}`}>
            <h3>COMPLETE THE CODE:</h3>
            {code ? (
              <div
                onDragOver={(e) => {
                  // Don't allow drag over when timer is expired, disabled, or resumed
                  if (disabled || isSubmitted || timerState === 'expired' || isResumed) {
                    e.preventDefault();
                    setDropTarget(null);
                    return;
                  }
                  
                  e.preventDefault();
                  
                  // Simple approach: check if cursor is over a highlighted placeholder element
                  const target = e.target;
                  
                  // Check if the target is a placeholder element
                  if (target && target.classList && target.classList.contains('bug-placeholder')) {
                    // Extract the placeholder text (e.g., "1", "2" - just the number)
                    const placeholderNumber = target.textContent.trim();
                  
                    // Find the placeholder in our data
                    const editor = editorRef.current;
                    if (editor) {
                      const model = editor.getModel();
                      if (model) {
                        const codeText = model.getValue();
                        const blankPattern = /\[[0-9]+\]/g;
                        let match;
                        
                        while ((match = blankPattern.exec(codeText)) !== null) {
                          // Extract just the number from [1], [2], etc.
                          const matchNumber = match[0].replace(/[\[\]]/g, '');
                          if (matchNumber === placeholderNumber) {
                            const startPos = model.getPositionAt(match.index);
                            const placeholder = {
                              tag: match[0],
                              startPos,
                              blankId: match[0],
                              lineNumber: startPos.lineNumber,
                              column: startPos.column
                            };
                            
                            setDropTarget(placeholder);
                            return;
                          }
                        }
                      }
                    }
                  } else {
                    // Cursor is not over a placeholder
                    setDropTarget(null);
                  }
                }}
                onDragLeave={() => setDropTarget(null)}
                onDrop={handleDrop}
              >
                <MonacoCodeBlock
                  key={isResumed ? 'resumed-code-completion' : 'active-code-completion'} // Force re-render when isResumed state changes
                  value={processedCode.code}
                  language="java"
                  mode="code_completion" // NEW: Pass mode to determine read-only behavior
                  height="100%"
                  timerState={timerState}
                  disabled={disabled}
                  isResumed={isResumed}
                  fixTagClass={dropTarget ? "bug-placeholder-highlight" : "bug-placeholder"}
                  fixTagRegex={/\[\d+\]/g}
                  fixTagHoverMessage={dropTarget ? `Drop here to fill ${dropTarget.tag}` : "Drop a choice here"}
                  onMount={handleMonacoMount}
                  userChoices={userChoices}
                  placedChoicePositions={processedCode.finalChoicePositions} // NEW: Pass final positions
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
            ) : (
              <div className={styles.noCodeMessage}>
                <p>No code available for this challenge.</p>
              </div>
            )}
          </div>

          {/* Expected Output */}
          {expectedOutput && (
            <div className={styles.expectedOutput}>
              <h3>Expected Output:</h3>
              <div className={styles.outputText}>
                {Array.isArray(expectedOutput) 
                  ? expectedOutput.map((output, index) => (
                      <div key={index}>{output}</div>
                    ))
                  : expectedOutput
                }
              </div>
            </div>
          )}

          <div className={styles.submitButton}>
            <button
              onClick={() => {
                handleSubmit();
              }}
              disabled={isSubmitted || isSubmitting}
              className={`${isSubmitted ? styles.submitted : ''} ${isSubmitting ? styles.submitting : ''}`}
              title={isSubmitting ? "Submitting..." : "Submit your answer (empty submissions allowed)"}
            >
              {isSubmitting ? 'Submitting...' : isSubmitted ? 'Submitted' : 'Submit'}
            </button>
            {isResumed && (
              <p className={styles.submitHint}>
                This challenge was cancelled earlier. Your answers will be counted as wrong regardless of your progress.
              </p>
            )}
            {timerState === 'expired' && (
              <p className={styles.submitHint}>
                Time's up! Your answers will be counted as wrong regardless of your progress.
              </p>
            )}
          </div>
        </div>
  );
};

export default CodeCompletion;
