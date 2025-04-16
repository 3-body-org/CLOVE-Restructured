import React, { useState, useEffect, useRef } from 'react';

const CosmicJavaGame = () => {
  // Game State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [hintsLeft, setHintsLeft] = useState(3);
  const [currentHint, setCurrentHint] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [gameEnded, setGameEnded] = useState(false);
  const timerInterval = useRef(null);

  const questions = [
    {
      code: [
        "public class VariableAnalysis {",
        "    public static void main(String[] args) {",
        "        int a = 5;",
        "        int b = a++;",
        "        int c = ++a;",
        "        System.out.println(\"a: \" + a + \", b: \" + b + \", c: \" + c);",
        "    }",
        "}"
      ],
      question: "What will be the output of this code?",
      options: [
        { text: "a: 5, b: 5, c: 6", correct: false },
        { text: "a: 6, b: 5, c: 5", correct: false },
        { text: "a: 5, b: 6, c: 6", correct: false },
        { text: "a: 7, b: 5, c: 7", correct: true }
      ],
      explanation: "a++ is post-increment (returns 5 then increments), ++a is pre-increment (increments then returns 7)",
      variables: ['a', 'b', 'c']
    },
    {
      code: [
        "public class ReferenceTest {",
        "    public static void main(String[] args) {",
        "        String s1 = \"hello\";",
        "        String s2 = s1;",
        "        s1 = \"world\";",
        "        System.out.println(s2);",
        "    }",
        "}"
      ],
      question: "What will be printed?",
      options: [
        { text: "hello", correct: true },
        { text: "world", correct: false },
        { text: "helloworld", correct: false },
        { text: "null", correct: false }
      ],
      explanation: "Strings are immutable - s2 points to the original \"hello\" string",
      variables: ['s1', 's2']
    },
    {
      code: [
        "public class ArrayTest {",
        "    public static void main(String[] args) {",
        "        int[] arr = new int[3];",
        "        arr[0] = 1;",
        "        arr[1] = arr[0]++;",
        "        arr[2] = ++arr[0];",
        "        System.out.println(Arrays.toString(arr));",
        "    }",
        "}"
      ],
      question: "What will be the array contents?",
      options: [
        { text: "[1, 1, 2]", correct: false },
        { text: "[1, 1, 3]", correct: true },
        { text: "[2, 1, 3]", correct: false },
        { text: "[1, 2, 3]", correct: false }
      ],
      explanation: "arr[0]++ returns 1 then increments to 2, then ++arr[0] increments to 3 and returns 3",
      variables: ['arr[0]', 'arr[1]', 'arr[2]']
    },
    {
      code: [
        "public class ScopeTest {",
        "    static int x = 10;",
        "    public static void main(String[] args) {",
        "        int x = 20;",
        "        System.out.print(x + \" \");",
        "        System.out.print(ScopeTest.x);",
        "    }",
        "}"
      ],
      question: "What will be printed?",
      options: [
        { text: "10 10", correct: false },
        { text: "20 10", correct: true },
        { text: "10 20", correct: false },
        { text: "20 20", correct: false }
      ],
      explanation: "Local variable shadows the class variable - use class name to access static variable",
      variables: ['x', 'ScopeTest.x']
    },
    {
      code: [
        "public class FinalTest {",
        "    public static void main(String[] args) {",
        "        final int y = 5;",
        "        int z = y++;",
        "        System.out.println(z);",
        "    }",
        "}"
      ],
      question: "What will happen when this code runs?",
      options: [
        { text: "Prints 5", correct: false },
        { text: "Prints 6", correct: false },
        { text: "Compilation error", correct: true },
        { text: "Runtime exception", correct: false }
      ],
      explanation: "Cannot increment a final variable - compilation error",
      variables: ['y', 'z']
    }
  ];

  const hints = [
    "Hint 1: Primitive types hold direct values.",
    "Hint 2: Reference types hold memory addresses.",
    "Hint 3: Default values: 0, false, or null.",
  ];

  const [trackerItems, setTrackerItems] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [hintContent, setHintContent] = useState("");
  const [showNextButton, setShowNextButton] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);

  // Timer
  useEffect(() => {
    timerInterval.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timerInterval.current);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval.current);
  }, []);

  const updateTimerDisplay = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Hint System
  const handleHintClick = () => {
    if (hintsLeft > 0) {
      if (currentHint < hints.length) {
        setHintContent(hints[currentHint]);
        setShowHint(true);
        setCurrentHint(prev => prev + 1);
        setHintsLeft(prev => prev - 1);
        updateScore(-10);
      } else {
        alert("No more hints available!");
      }
    } else {
      alert("Memory core depleted!");
    }
  };

  // Load Question
  const loadQuestion = (index) => {
    if (index >= questions.length) {
      endGame();
      return;
    }

    setCurrentQuestion(index);
    setSelectedOption(null);
    setShowNextButton(false);
    setAnsweredCorrectly(false);
    setTrackerItems([]);
    setShowHint(false);
  };

  // Option Selection
  const handleOptionSelect = (option, isCorrect) => {
    if (showNextButton) return;
    setSelectedOption({ option, isCorrect });
  };

  // Submit Answer
  const handleSubmit = () => {
    if (!selectedOption) {
      alert("Please select an answer!");
      return;
    }

    if (selectedOption.isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      updateScore(20);
      setAnsweredCorrectly(true);
    }

    setShowNextButton(true);
  };

  // Next Question
  const handleNextQuestion = () => {
    loadQuestion(currentQuestion + 1);
    setShowNextButton(false);
  };

  // Variable Tracker
  const addToTracker = (variable) => {
    let explanation = "";
    
    switch(currentQuestion) {
      case 0: // Question 1 - VariableAnalysis
        if (variable === 'a') explanation = "a starts at 5, becomes 6 after a++, then 7 after ++a";
        if (variable === 'b') explanation = "b gets value of a (5) before increment";
        if (variable === 'c') explanation = "c gets value of a after increment (7)";
        break;
      case 1: // Question 2 - ReferenceTest
        if (variable === 's1') explanation = "Changes from 'hello' to 'world'";
        if (variable === 's2') explanation = "Remains 'hello' (points to original string)";
        break;
      case 2: // Question 3 - ArrayTest
        if (variable === 'arr[0]') explanation = "Starts at 1, becomes 2 after arr[0]++, then 3 after ++arr[0]";
        if (variable === 'arr[1]') explanation = "Gets original arr[0] value (1)";
        if (variable === 'arr[2]') explanation = "Gets incremented arr[0] value (3)";
        break;
      case 3: // Question 4 - ScopeTest
        if (variable === 'x') explanation = "Local x is 20";
        if (variable === 'ScopeTest.x') explanation = "Static x is 10";
        break;
      case 4: // Question 5 - FinalTest
        if (variable === 'y') explanation = "Final variable (constant), cannot be modified";
        if (variable === 'z') explanation = "Would get value of y if code compiled (but it doesn't)";
        break;
    }
    
    setTrackerItems(prev => [...prev, { variable, explanation }]);
  };

  const resetTracker = () => {
    setTrackerItems([]);
  };

  // Scoring
  const updateScore = (points) => {
    setScore(prev => prev + points);
  };

  // End Game
  const endGame = () => {
    clearInterval(timerInterval.current);
    setGameEnded(true);
  };

  const restartGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setCorrectAnswers(0);
    setTimeLeft(300);
    setHintsLeft(3);
    setCurrentHint(0);
    setGameEnded(false);
    setSelectedOption(null);
    setTrackerItems([]);
    setShowHint(false);
    setShowNextButton(false);
    timerInterval.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timerInterval.current);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const accuracy = correctAnswers > 0 ? Math.floor((correctAnswers / (currentQuestion + 1)) * 100 ) : 100;

  // Styles
  const styles = {
    root: {
      background: '#0a0a1a',
      fontFamily: "'Space Grotesk', sans-serif",
      color: '#ffffff',
      minHeight: '100vh',
      padding: '20px',
      backgroundImage: `
        radial-gradient(circle at 20% 30%, rgba(108, 92, 231, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(255, 118, 117, 0.1) 0%, transparent 50%)
      `
    },
    missionContainer: {
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      gap: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    gamePanel: {
      background: '#1a1a2e',
      borderRadius: '20px',
      padding: '20px',
      border: '1px solid #6c5ce7',
      boxShadow: '0 0 30px rgba(108, 92, 231, 0.2)'
    },
    timerContainer: {
      background: 'rgba(255, 118, 117, 0.1)',
      borderRadius: '10px',
      padding: '15px',
      textAlign: 'center',
      marginBottom: '20px',
      border: '1px solid #ff7675'
    },
    hintSystem: {
      background: 'rgba(168, 165, 230, 0.1)',
      borderRadius: '10px',
      padding: '15px',
      border: '1px solid #a8a5e6',
      marginBottom: '20px'
    },
    hintBtn: {
      background: '#a8a5e6',
      color: '#0a0a1a',
      border: 'none',
      padding: '8px 15px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      cursor: 'pointer',
      marginTop: '10px',
      transition: 'all 0.3s'
    },
    scoring: {
      background: 'rgba(100, 255, 150, 0.1)',
      borderRadius: '10px',
      padding: '15px',
      border: '1px solid #64ff96'
    },
    challengeArea: {
      background: '#1a1a2e',
      borderRadius: '20px',
      padding: '30px',
      border: '1px solid #6c5ce7',
      boxShadow: '0 0 30px rgba(108, 92, 231, 0.2)',
      position: 'relative',
      overflow: 'hidden'
    },
    challengeTitle: {
      fontFamily: "'Orbitron', sans-serif",
      color: '#ff7675',
      marginBottom: '20px',
      fontSize: '1.5rem'
    },
    codeDisplay: {
      background: '#252540',
      borderRadius: '15px',
      padding: '25px',
      fontFamily: "'Courier New', monospace",
      lineHeight: '1.5',
      position: 'relative',
      marginBottom: '20px',
      borderLeft: '4px solid #6c5ce7'
    },
    codeLine: {
      marginBottom: '5px',
      position: 'relative',
      paddingLeft: '30px'
    },
    lineNumber: {
      position: 'absolute',
      left: '0',
      color: '#a8a5e6',
      opacity: '0.6',
      userSelect: 'none'
    },
    outputOptions: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '15px',
      marginBottom: '20px'
    },
    outputOption: {
      background: 'rgba(108, 92, 231, 0.1)',
      border: '1px solid #6c5ce7',
      borderRadius: '10px',
      padding: '15px',
      cursor: 'pointer',
      transition: 'all 0.3s'
    },
    outputOptionHover: {
      background: 'rgba(108, 92, 231, 0.3)',
      transform: 'translateY(-3px)'
    },
    outputOptionSelected: {
      background: 'rgba(108, 92, 231, 0.678)',
      borderColor: '#6c5ce7'
    },
    outputOptionCorrect: {
      background: 'rgba(100, 255, 150, 0.2)',
      borderColor: '#64ff96'
    },
    outputOptionWrong: {
      background: 'rgba(255, 100, 100, 0.2)',
      borderColor: '#ff6464'
    },
    toolbox: {
      background: 'rgba(108, 92, 231, 0.1)',
      borderRadius: '10px',
      padding: '15px',
      marginTop: '20px',
      border: '1px dashed #6c5ce7'
    },
    toolboxTitle: {
      fontFamily: "'Orbitron', sans-serif",
      fontSize: '0.9rem',
      marginBottom: '10px',
      color: '#a8a5e6'
    },
    toolItems: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap'
    },
    toolItem: {
      background: '#6c5ce7',
      padding: '8px 12px',
      borderRadius: '5px',
      fontSize: '0.8rem',
      cursor: 'pointer',
      userSelect: 'none'
    },
    submitBtn: {
      background: 'linear-gradient(135deg, #6c5ce7, #ff7675)',
      color: 'white',
      border: 'none',
      padding: '12px 25px',
      borderRadius: '10px',
      fontFamily: "'Orbitron', sans-serif",
      cursor: 'pointer',
      transition: 'all 0.3s',
      marginTop: '20px',
      width: '100%'
    },
    submitBtnHover: {
      transform: 'translateY(-3px)',
      boxShadow: '0 5px 15px rgba(108, 92, 231, 0.4)'
    },
    nextBtn: {
      background: 'linear-gradient(135deg, #ff7675, #6c5ce7)',
      color: 'white',
      border: 'none',
      padding: '12px 25px',
      borderRadius: '10px',
      fontFamily: "'Orbitron', sans-serif",
      cursor: 'pointer',
      transition: 'all 0.3s',
      marginTop: '10px',
      width: '100%'
    },
    variableTracker: {
      marginTop: '10px',
      padding: '10px',
      background: 'rgba(108, 92, 231, 0.1)',
      borderRadius: '5px'
    },
    '@keyframes hologram': {
      '0%': { backgroundPosition: '0% 0%' },
      '100%': { backgroundPosition: '200% 200%' }
    }
  };

  if (gameEnded) {
    const finalAccuracy = Math.floor((correctAnswers / questions.length) * 100);
    return (
      <div style={styles.root}>
        <div style={styles.missionContainer}>
          <div style={styles.challengeArea}>
            <h2 style={styles.challengeTitle}>MISSION COMPLETE</h2>
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <p>Final Score: {score} credits</p>
              <p>Accuracy: {finalAccuracy}%</p>
              <p>Time Remaining: {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2, '0')}</p>
              <button 
                style={styles.submitBtn} 
                onClick={restartGame}
              >
                TRY AGAIN
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <div style={styles.missionContainer}>
        {/* Game Mechanics Panel */}
        <div style={styles.gamePanel}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontFamily: "'Orbitron', sans-serif", color: '#ff7675' }}>MISSION: TRACE-7</h2>
            <p>
              Analyze the variable declarations and predict the output.
              Your spacecraft's navigation depends on accurate calculations! 
            </p>
            <br />
          </div>
          
          <div style={styles.timerContainer}>
            <div>ANALYSIS TIMER</div>
            <div style={{ 
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '1.2rem',
              color: timeLeft < 60 ? '#ff7675' : 'inherit',
              animation: timeLeft < 60 ? 'pulse 1s infinite' : 'none'
            }}>
              {updateTimerDisplay()}
            </div>
          </div>
          
          <div style={styles.hintSystem}>
            <div style={{ fontFamily: "'Orbitron', sans-serif" }}>MEMORY CORE</div>
            <p>Need help? Access memory core (costs 10pts)</p>
            <br />
            {showHint && (
              <div style={{ marginBottom: '10px' }}>
                {hintContent}
              </div>
            )}
            <button 
              style={styles.hintBtn} 
              onClick={handleHintClick}
            >
              REQUEST HELP ({hintsLeft} LEFT)
            </button>
          </div>
          
          <div style={styles.scoring}>
            <div>CREDITS: <span>{score}</span></div>
            <div>Questions Solved: <span>{correctAnswers}</span>/5</div>
            <div>Accuracy: <span>{accuracy}</span>%</div>
          </div>
        </div>
        
        {/* Challenge Area */}
        <div style={styles.challengeArea}>
          <h2 style={styles.challengeTitle}>OUTPUT TRACING CHALLENGE</h2>
          
          <div style={styles.codeDisplay}>
            {questions[currentQuestion].code.map((line, i) => (
              <div key={i} style={styles.codeLine}>
                <span style={styles.lineNumber}>{i+1}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
          
          <div style={{ marginBottom: '20px' }}>{questions[currentQuestion].question}</div>
          <br />
          
          <div style={styles.outputOptions}>
            {questions[currentQuestion].options.map((option, i) => {
              let optionStyle = { ...styles.outputOption };
              
              if (selectedOption && selectedOption.option === option.text) {
                optionStyle = { ...optionStyle, ...styles.outputOptionSelected };
              }
              
              if (showNextButton) {
                if (option.correct) {
                  optionStyle = { ...optionStyle, ...styles.outputOptionCorrect };
                } else if (selectedOption && selectedOption.option === option.text && !selectedOption.isCorrect) {
                  optionStyle = { ...optionStyle, ...styles.outputOptionWrong };
                }
              }
              
              return (
                <div 
                  key={i}
                  style={optionStyle}
                  onClick={() => handleOptionSelect(option.text, option.correct)}
                >
                  {option.text}
                </div>
              );
            })}
          </div>
          
          {/* Variable Tracker Section */}
          <div style={styles.toolbox}>
            <div style={styles.toolboxTitle}>VARIABLE TRACKER</div>
            <div style={styles.toolItems}>
              {questions[currentQuestion].variables.map((varName) => (
                <div 
                  key={varName}
                  style={styles.toolItem}
                  onClick={() => addToTracker(varName)}
                >
                  Track {varName}
                </div>
              ))}
              <div 
                style={styles.toolItem}
                onClick={resetTracker}
              >
                Reset
              </div>
            </div>
            <div style={styles.variableTracker}>
              {trackerItems.length === 0 ? (
                <em>Track variables to see their values change</em>
              ) : (
                trackerItems.map((item, i) => (
                  <div key={i} style={{ marginBottom: '5px' }}>
                    {item.variable}: {item.explanation}
                  </div>
                ))
              )}
            </div>
          </div>
          
          {showNextButton ? (
            <button 
              style={{ ...styles.submitBtn, background: 'linear-gradient(135deg, #ff7675, #6c5ce7)' }}
              onClick={handleNextQuestion}
            >
              NEXT CHALLENGE
            </button>
          ) : (
            <button 
              style={styles.submitBtn}
              onClick={handleSubmit}
            >
              VERIFY SOLUTION
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CosmicJavaGame;