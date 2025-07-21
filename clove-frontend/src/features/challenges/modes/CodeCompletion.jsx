import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import styles from "features/challenges/styles/CodeCompletion.module.scss";
import { useNavigate } from "react-router-dom";
import ChallengeSidebar from '../components/ChallengeSidebar';
import Editor from "@monaco-editor/react";
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

const CodeCompletion = ({
  onComplete,
  challengeType,
  isLastChallenge,
  topicId,
  challenge = {}, // Accept challenge prop for scenario data
}) => {
  const { getThemeStyles } = useChallengeTheme();
  const [timeLeft, setTimeLeft] = useState(300);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [hintsRevealed, setHintsRevealed] = useState(0);
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
  const [consoleOutput, setConsoleOutput] = useState('System ready. Waiting for code execution...');
  const [usedChoices, setUsedChoices] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [currentDragItem, setCurrentDragItem] = useState(null);
  const [hoveredPlaceholder, setHoveredPlaceholder] = useState(null);
  const decorationsRef = useRef([]);

  const missing1Ref = useRef(null);
  const missing2Ref = useRef(null);
  const missing3Ref = useRef(null);
  const challengeAreaRef = useRef(null);
  const monacoEditorRef = useRef(null);
  const dropOverlayRef = useRef(null);
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
      setHintsRevealed((prev) => prev + 1);
      setHintsLeft((prev) => prev - 1);
      setScore((prev) => Math.max(0, prev - 10));
    } else {
      alert("No hints remaining!");
    }
  };

  const calculationChoices = [
    { value: "fuel * fuelEfficiency", fix: "FIX_1" },
    { value: "fuel / fuelEfficiency", fix: "FIX_1" },
    { value: "Math.sqrt(fuel)", fix: "FIX_1" },
    { value: "fuel + 10", fix: "FIX_1" },
    { value: "fuelEfficiency * 2", fix: "FIX_1" },
    { value: "0", fix: "FIX_1" },
    { value: "fuel - 1", fix: "FIX_1" }
  ];

  const conditionChoices = [
    { value: "fuel < 15.0", fix: "FIX_2" },
    { value: "fuel > 100.0", fix: "FIX_2" },
    { value: "fuel == 0", fix: "FIX_2" },
    { value: "fuel != 10", fix: "FIX_2" },
    { value: "fuel <= 0", fix: "FIX_2" },
    { value: "fuel >= 100", fix: "FIX_2" },
    { value: "fuel === 15.0", fix: "FIX_2" }
  ];

  const typeChoices = [
    { value: "double", fix: "FIX_3" },
    { value: "int", fix: "FIX_3" },
    { value: "float", fix: "FIX_3" },
    { value: "String", fix: "FIX_3" },
    { value: "boolean", fix: "FIX_3" },
    { value: "char", fix: "FIX_3" },
    { value: "Object", fix: "FIX_3" }
  ];

  const allChoices = [...calculationChoices, ...conditionChoices, ...typeChoices];

  const codeTemplate = `public class SpacecraftNavigation {
  private double fuelEfficiency = 0.85;

  public double calculateSpeed(double fuel) {
    // Calculate speed using fuel and efficiency
    double speed = FIX_1;
    return speed;
  }

  public boolean checkFuel(double fuel) {
    // Check fuel level safety
    if (FIX_2) {
      System.out.println("WARNING: Low fuel!");
      return false;
    }
    return true;
  }

  public void adjustCourse(FIX_3 angle) {
    // Validate course adjustment
    if (angle > 30 || angle < -30) {
      throw new IllegalArgumentException("Adjustment too extreme");
    }
    this.courseAngle += angle;
  }
}`;

  const [code, setCode] = useState(codeTemplate);

  // Helper: find all FIX tag ranges in code
  function getFixTagRanges(code) {
    const tags = ["FIX_1", "FIX_2", "FIX_3"];
    const ranges = [];
    tags.forEach(tag => {
      let idx = code.indexOf(tag);
      while (idx !== -1) {
        const start = idx;
        const end = idx + tag.length;
        ranges.push({ tag, start, end });
        idx = code.indexOf(tag, end);
      }
    });
    return ranges;
  }

  // Helper: find all FIX tag and replaced choice ranges in code
  function getReplaceableRanges(code) {
    // Matches FIX_1, FIX_2, FIX_3, or any of the original choices
    const tags = ["FIX_1", "FIX_2", "FIX_3"];
    const originalChoicesArr = [
      "fuel * fuelEfficiency",
      "fuel / fuelEfficiency",
      "Math.sqrt(fuel)",
      "fuel + 10",
      "fuelEfficiency * 2",
      "0",
      "fuel - 1",
      "fuel < 15.0",
      "fuel > 100.0",
      "fuel == 0",
      "fuel != 10",
      "fuel <= 0",
      "fuel >= 100",
      "fuel === 15.0",
      "double",
      "int",
      "float",
      "String",
      "boolean",
      "char",
      "Object"
    ];
    const allReplaceables = [...tags, ...originalChoicesArr];
    const ranges = [];
    allReplaceables.forEach(tag => {
      let idx = code.indexOf(tag);
      while (idx !== -1) {
        const start = idx;
        const end = idx + tag.length;
        ranges.push({ tag, start, end });
        idx = code.indexOf(tag, end);
      }
    });
    return ranges;
  }

  // Update Monaco decorations for FIX tags
  const updateDecorations = (editor, monaco) => {
    const model = editor.getModel();
    if (!model) return [];
    
    const codeVal = model.getValue();
    const ranges = getFixTagRanges(codeVal);
    
    const decorations = ranges.map(r => ({
      range: new monaco.Range(
        model.getPositionAt(r.start).lineNumber,
        model.getPositionAt(r.start).column,
        model.getPositionAt(r.end).lineNumber,
        model.getPositionAt(r.end).column
      ),
      options: {
        inlineClassName: hoveredPlaceholder === r.tag ? 'fix-tag-hover' : 'fix-tag',
        hoverMessage: { value: `Drop a choice for ${r.tag} here` },
        stickiness: 1
      }
    }));
    
    return decorations;
  };

  // Handle drop in Monaco editor - implementation is in the useCallback below

  // Dropdown logic for Monaco
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0 });

  const showOptions = (placeholder, event) => {
    event.stopPropagation();
    setActiveDropdown(placeholder);
    // Calculate dropdown position near cursor
    if (editorRef.current) {
      const editor = editorRef.current;
      const position = editor.getPosition();
      const coords = editor.getScrolledVisiblePosition(position);
      setDropdownPosition({ left: coords.left, top: coords.top + 30 });
    }
  };

  const insertOption = (placeholder, value) => {
    setCode((prev) => prev.replace(`[${placeholder}]`, value));
    setActiveDropdown(null);
  };

  // Check solution by comparing filled code to correct answers
  const checkSolution = () => {
    const codeVal = code.toLowerCase();
    const correct1 = codeVal.includes('fuel * fuelEfficiency'.toLowerCase());
    const correct2 = codeVal.includes('fuel < 15.0'.toLowerCase());
    const correct3 = codeVal.includes('double'.toLowerCase());

    const correctCount = [correct1, correct2, correct3].filter(Boolean).length;
    const allCorrect = correctCount === 3;

    handleCompletion(true, correctCount, allCorrect);
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

  // Compute which FIX tags are still present in the code
  const remainingFixTags = [];
  const tagRegex = /FIX_\d+/g;
  let match;
  while ((match = tagRegex.exec(code)) !== null) {
    remainingFixTags.push(match[0]);
  }

  // Custom fixTagRegex for MonacoCodeBlock: only highlight remaining FIX tags
  const dynamicFixTagRegex =
    remainingFixTags.length > 0
      ? new RegExp(remainingFixTags.join("|"), "g")
      : /$^/g; // match nothing if all replaced

  // Handle drag start on a choice item or editor selection
  const handleDragStart = (e, choice, isFromEditor = false, selection = null) => {
    console.log('=== DRAG START ===');
    
    const dragData = isFromEditor ? {
      type: 'editor-selection',
      value: selection?.text || '',
      range: selection?.range,
      isFromEditor: true
    } : {
      ...choice,
      type: 'choice',
      isFromEditor: false
    };

    console.log('Drag data:', dragData);
    
    // Set both effectAllowed and dropEffect to 'copyMove' to enable both operations
    e.dataTransfer.effectAllowed = 'copyMove';
    e.dataTransfer.dropEffect = isFromEditor ? 'move' : 'copy';
    
    // Set data in multiple formats for better compatibility
    e.dataTransfer.clearData();
    e.dataTransfer.setData('text/plain', dragData.value);
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    
    // Set a nice drag image
    const dragImage = document.createElement('div');
    dragImage.textContent = dragData.value;
    dragImage.style.position = 'absolute';
    dragImage.style.padding = '8px 12px';
    dragImage.style.background = isFromEditor ? '#e6f3ff' : '#f0f0f0';
    dragImage.style.border = `1px solid ${isFromEditor ? '#0078d7' : '#ccc'}`;
    dragImage.style.borderRadius = '4px';
    dragImage.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    dragImage.style.zIndex = '1000';
    dragImage.style.fontFamily = 'monospace';
    dragImage.style.whiteSpace = 'nowrap';
    dragImage.style.overflow = 'hidden';
    dragImage.style.textOverflow = 'ellipsis';
    dragImage.style.maxWidth = '300px';
    
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 10, 10);
    setTimeout(() => document.body.removeChild(dragImage), 0);
    
    // Update the current drag item
    setCurrentDragItem(dragData);
    
    // Add dragging class to the dragged element if it's a choice
    if (!isFromEditor) {
      e.currentTarget.classList.add('dragging');
    }
  };

  const handleDragEnd = (e) => {
    setCurrentDragItem(null);
    
    // Remove dragging class
    const elements = document.querySelectorAll('.choice');
    elements.forEach((el) => el.classList.remove('dragging'));
  };

  // Handle drop into the Monaco editor
  const handleDropIntoEditor = useCallback((editor, monaco, e) => {
    console.log('=== DROP INTO EDITOR ===');
    e.preventDefault();
    e.stopPropagation();
    
    let dragData;
    try {
      const jsonData = e.dataTransfer.getData('application/json');
      dragData = jsonData ? JSON.parse(jsonData) : null;
    } catch (error) {
      console.error('Error parsing drag data:', error);
      return;
    }
    
    const textToInsert = dragData?.value || currentDragItem?.value || '';
    
    if (!textToInsert) {
      console.error('No text to insert');
      return;
    }
    
    console.log('Inserting text:', { textToInsert, dragData });
    
    // If this is a move from the editor itself, remove the original text
    if (dragData?.isFromEditor && dragData.range) {
      editor.executeEdits('drag-move', [{
        range: new monaco.Range(
          dragData.range.startLineNumber,
          dragData.range.startColumn,
          dragData.range.endLineNumber,
          dragData.range.endColumn
        ),
        text: '',
        forceMoveMarkers: true
      }]);
    }

    try {
      // Get the mouse position relative to the editor
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Get the position where the drop occurred
      const position = editor.getPositionAt({ left: x, top: y });
      if (!position) return;

      // Create edit operation to insert the text at the drop position
      const editOperation = {
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        },
        text: textToInsert,
        forceMoveMarkers: true,
      };

      // Apply the edit operation
      editor.executeEdits('drag-and-drop', [editOperation]);

      // Update the code state
      const newCode = editor.getModel().getValue();
      setCode(newCode);

      // Move cursor to after the inserted text
      const newPosition = {
        lineNumber: position.lineNumber,
        column: position.column + textToInsert.length,
      };

      editor.setPosition(newPosition);
      editor.focus();

      // Update state
      setUsedChoices((prev) => [...prev, textToInsert]);
      setCurrentDragItem(null);
      setIsDragging(false);

      // Clear any decorations
      if (decorationsRef.current?.length) {
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
      }
    } catch (error) {
      console.error('Error handling drop event:', error);
    }
  }, [currentDragItem, setUsedChoices, setIsDragging]);

  // Using the initial declarations of calculationChoices and allChoices from above

  // Handle drop on the overlay
  const handleOverlayDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!monacoEditorRef.current) return;
    
    // Forward the drop event to the editor
    const editor = monacoEditorRef.current;
    handleDropIntoEditor(editor, window.monaco, e);
    
    // Hide the overlay
    if (dropOverlayRef.current) {
      dropOverlayRef.current.style.display = 'none';
    }
  }, [handleDropIntoEditor]);
  
  // Handle drag over the overlay
  const handleOverlayDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  }, []);
  
  // Handle drag enter on the editor container
  const handleEditorDragEnter = useCallback((e) => {
    e.preventDefault();
    if (dropOverlayRef.current) {
      dropOverlayRef.current.style.display = 'block';
    }
  }, []);
  
  // Handle drag leave from the overlay
  const handleOverlayDragLeave = useCallback((e) => {
    e.preventDefault();
    if (dropOverlayRef.current) {
      dropOverlayRef.current.style.display = 'none';
    }
  }, []);

  // Handle drop on choices bar
  const handleChoicesBarDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('=== DROP ON CHOICES BAR ===');
    
    let dragData;
    try {
      const jsonData = e.dataTransfer.getData('application/json');
      dragData = jsonData ? JSON.parse(jsonData) : null;
      console.log('Drag data received:', dragData);
    } catch (error) {
      console.error('Error parsing drag data:', error);
      return;
    }
    
    // Only process if this is coming from the editor and has a value
    if (dragData?.isFromEditor && dragData.value) {
      console.log('Processing drop from editor:', dragData.value);
      
      // Add the dragged text as a new choice
      const newChoice = {
        value: dragData.value.trim(),
        fix: `CUSTOM_${Date.now()}` // Generate a unique fix ID
      };
      
      console.log('Adding new choice:', newChoice);
      
      // Update the available choices
      setAllChoices(prev => {
        // Check if the choice already exists to avoid duplicates
        const exists = prev.some(choice => 
          choice.value === newChoice.value && 
          choice.fix && choice.fix.startsWith('CUSTOM_')
        );
        
        if (exists) {
          console.log('Choice already exists, not adding duplicate');
          return prev;
        }
        
        console.log('Adding new choice to choices');
        return [...prev, newChoice];
      });
      
      // If this was a move operation (not a copy), remove the text from the editor
      if (e.dataTransfer.dropEffect === 'move' && dragData.range) {
        console.log('Performing move operation, removing text from editor');
        const editor = monacoEditorRef.current;
        if (editor) {
          try {
            editor.executeEdits('drag-remove', [{
              range: new window.monaco.Range(
                dragData.range.startLineNumber,
                dragData.range.startColumn,
                dragData.range.endLineNumber,
                dragData.range.endColumn
              ),
              text: '',
              forceMoveMarkers: true
            }]);
            
            // Update the code state after removal
            const newCode = editor.getValue();
            setCode(newCode);
            
            console.log('Successfully removed text from editor');
          } catch (error) {
            console.error('Error removing text from editor:', error);
          }
        }
      }
    } else {
      console.log('Drop event ignored - not from editor or missing value');
    }
  }, []);

  // Update the choices bar to reflect used choices
  const availableChoices = useMemo(() => {
    return allChoices.filter((choice) => !usedChoices.includes(choice.value));
  }, [allChoices, usedChoices]);

  // Dynamic scenario text based on challenge data
  const scenarioTitle = challenge.scenarioTitle || "🧪 Scenario:";
  const scenarioDescription = challenge.scenarioDescription ||
    "The Pathfinder’s Decision Core is confused. It needs to decide whether to activate shields based on the current threat level. However, part of its decision logic is missing. You must complete the core's code so it can react logically.";
  const instruction = INSTRUCTION_MAP["CodeCompletion"];
  return (
    <div className={styles.missionContainer} style={getThemeStyles()}>
      <ChallengeSidebar
        missionTitle={scenarioTitle}
        missionDescription={scenarioDescription}
        timerLabel="EMERGENCY TIMER"
        timerValue={formatTime(timeLeft)}
        timerPercent={Math.floor((timeLeft / 480) * 100)}
        hintTitle="ENGINEERING MANUAL"
        hintBtnText={`REQUEST HELP (${hintsLeft} LEFT)`}
        hintBtnDisabled={hintsLeft === 0}
        onHintClick={handleHintClick}
        hintsRevealed={hintsRevealed}
        hints={["Check the calculation logic", "Review the condition for low fuel", "Ensure the correct data type for angle"]}
        activeDropdown={activeDropdown}
        setActiveDropdown={setActiveDropdown}
        challengeType={challengeType}
        scenarioTitle={challenge.scenarioTitle || "🧪 Scenario:"}
        scenarioDescription={challenge.scenarioDescription}
      >
        {/* General Instruction Box */}
        <div className={styles.generalInstructionBox}>
          <h3 className={styles.generalInstructionTitle}>{instruction.title}</h3>
          <p className={styles.generalInstructionDescription}>{instruction.description}</p>
        </div>
      </ChallengeSidebar>
      <div className={styles.challengeArea}>
        <h2 className={styles.challengeTitle}>Code Completion Challenge</h2>
        
        {/* Choices Bar */}
        <div 
          className={`${styles.choicesBar} ${isDragging ? styles.dragOver : ''}`}
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
              console.error('Error checking drag data:', error);
              e.dataTransfer.dropEffect = 'none';
            }
          }}
          onDragLeave={() => {
            setIsDragging(false);
          }}
          onDrop={handleChoicesBarDrop}
        >
          {availableChoices.map((choice, idx) => (
            <div
              key={idx}
              className={`${styles.choice} ${
                currentDragItem?.value === choice.value ? styles.dragging : ''
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, choice)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              {choice.value}
              <span className={styles.dragHandle}>⋮⋮</span>
            </div>
          ))}
        </div>
        
        {/* Code Editor with Drop Target */}
        <div 
          className={styles.codeEditor}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
          }}
          onDrop={(e) => {
            e.preventDefault();
            // Only handle drops from the pool (not from editor)
            let dragData;
            try {
              const jsonData = e.dataTransfer.getData('application/json');
              dragData = jsonData ? JSON.parse(jsonData) : null;
            } catch (error) {
              return;
            }
            if (!dragData || dragData.isFromEditor) return;
            // Get drop position in the editor
            const editor = monacoEditorRef.current;
            if (!editor) return;
            const model = editor.getModel();
            if (!model) return;
            // Get mouse position relative to editor
            const rect = editor.getDomNode().getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const position = editor.getTargetAtClientPoint ? editor.getTargetAtClientPoint(e.clientX, e.clientY) : null;
            let offset = null;
            if (position && position.position) {
              offset = model.getOffsetAt(position.position);
            } else {
              // fallback: try to get position from mouse coordinates
              const lineCount = model.getLineCount();
              for (let line = 1; line <= lineCount; line++) {
                const lineTop = editor.getTopForLineNumber(line);
                const lineHeight = editor.getOption && editor.getOption(editor.constructor.EditorOption.lineHeight) || 24;
                if (y >= lineTop && y < lineTop + lineHeight) {
                  // Approximate column
                  offset = model.getOffsetAt({ lineNumber: line, column: 1 });
                  break;
                }
              }
            }
            if (offset === null) return;
            // Find if the drop is on a FIX tag or original choice
            const codeVal = model.getValue();
            const replaceables = getReplaceableRanges(codeVal);
            const target = replaceables.find(r => offset >= r.start && offset <= r.end);
            if (!target) return; // Only allow drop on FIX tag or original choice
            // Replace the target text with the dragged choice
            const before = codeVal.slice(0, target.start);
            const after = codeVal.slice(target.end);
            const newCode = before + dragData.value + after;
            setCode(newCode);
            // Update usedChoices: add the new one, remove the old one if it was a choice, and return the replaced text to the pool if not a FIX tag
            setUsedChoices(prev => {
              let updated = prev.filter(v => v !== target.tag); // Remove the old one if present
              if (!updated.includes(dragData.value)) {
                updated = [...updated, dragData.value];
              }
              // If the replaced text is not a FIX tag and is a valid choice, return it to the pool (remove from usedChoices)
              const fixTags = ["FIX_1", "FIX_2", "FIX_3"];
              if (!fixTags.includes(target.tag) && target.tag !== dragData.value) {
                updated = updated.filter(v => v !== target.tag);
              }
              return updated;
            });
            setCurrentDragItem(null);
          }}
        >
          <MonacoCodeBlock
            value={code}
            onChange={(newCode) => newCode !== undefined && setCode(newCode)}
            language="java"
            fixTagClass="bug-placeholder"
            fixTagRegex={dynamicFixTagRegex}
            fixTagHoverMessage="Drop a choice here"
            height="400px"
            onMount={(editor) => {
              monacoEditorRef.current = editor;
              editor.updateOptions({ 
                dragAndDrop: true,
                acceptSuggestionOnEnter: 'smart',
                selectOnLineNumbers: true,
                selectionClipboard: true,
                quickSuggestions: false
              });

              // Add mouse down listener to handle text selection dragging
              const handleMouseDown = (e) => {
                // Only proceed if it's a left mouse button click
                if (e.button !== 0) return;
                
                const selection = editor.getSelection();
                if (!selection || selection.isEmpty()) return;
                
                const model = editor.getModel();
                if (!model) return;
                
                const selectedText = model.getValueInRange(selection);
                if (!selectedText.trim()) return;
                
                // Store the selection and text for the drag start
                const dragData = {
                  type: 'editor-selection',
                  value: selectedText,
                  range: {
                    startLineNumber: selection.startLineNumber,
                    startColumn: selection.startColumn,
                    endLineNumber: selection.endLineNumber,
                    endColumn: selection.endColumn
                  },
                  isFromEditor: true
                };
                
                // Create a temporary element to handle the drag start
                const tempDiv = document.createElement('div');
                document.body.appendChild(tempDiv);
                
                // Add drag start handler
                const onDragStart = (e) => {
                  e.stopPropagation();
                  
                  // Set the drag data
                  e.dataTransfer.effectAllowed = 'copyMove';
                  e.dataTransfer.setData('text/plain', selectedText);
                  e.dataTransfer.setData('application/json', JSON.stringify(dragData));
                  
                  // Create a nice drag image
                  const dragImage = document.createElement('div');
                  dragImage.textContent = selectedText;
                  dragImage.style.position = 'absolute';
                  dragImage.style.padding = '8px 12px';
                  dragImage.style.background = '#e6f3ff';
                  dragImage.style.border = '1px solid #0078d7';
                  dragImage.style.borderRadius = '4px';
                  dragImage.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                  dragImage.style.zIndex = '1000';
                  dragImage.style.fontFamily = 'monospace';
                  dragImage.style.whiteSpace = 'nowrap';
                  dragImage.style.overflow = 'hidden';
                  dragImage.style.textOverflow = 'ellipsis';
                  dragImage.style.maxWidth = '300px';
                  
                  document.body.appendChild(dragImage);
                  e.dataTransfer.setDragImage(dragImage, 10, 10);
                  
                  // Clean up after a short delay
                  setTimeout(() => {
                    document.body.removeChild(dragImage);
                    document.body.removeChild(tempDiv);
                  }, 0);
                };
                
                // Add drag end handler
                const onDragEnd = () => {
                  document.body.removeChild(tempDiv);
                };
                
                // Set up the temporary element for dragging
                tempDiv.draggable = true;
                tempDiv.style.position = 'absolute';
                tempDiv.style.top = '-100px';
                tempDiv.style.width = '10px';
                tempDiv.style.height = '10px';
                tempDiv.style.opacity = '0';
                tempDiv.style.pointerEvents = 'none';
                tempDiv.style.zIndex = '10000';
                
                // Add event listeners
                tempDiv.addEventListener('dragstart', onDragStart, { once: true });
                tempDiv.addEventListener('dragend', onDragEnd, { once: true });
                
                // Trigger the drag start
                setTimeout(() => {
                  const dataTransfer = new DataTransfer();
                  dataTransfer.effectAllowed = 'copyMove';
                  dataTransfer.setData('text/plain', selectedText);
                  dataTransfer.setData('application/json', JSON.stringify(dragData));
                  
                  const event = new DragEvent('dragstart', {
                    dataTransfer,
                    bubbles: true,
                    cancelable: true
                  });
                  
                  tempDiv.dispatchEvent(event);
                }, 0);
              };
              
              // Add mousedown listener to the editor's DOM node
              const editorNode = editor.getDomNode();
              if (editorNode) {
                editorNode.addEventListener('mousedown', handleMouseDown);
              }
              
              // Cleanup function
              return () => {
                if (editorNode) {
                  editorNode.removeEventListener('mousedown', handleMouseDown);
                }
              };
            }}
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
              <span>{consoleOutput}</span>
            </div>
            <div className={`${styles.terminalLine} ${styles.comment}`}>
              {'// Type your code above and click "VALIDATE SOLUTION" to see the output here'}
            </div>
          </div>
        </div>
        <div className={styles.actionButtons}>
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
  );
};

export default CodeCompletion;
