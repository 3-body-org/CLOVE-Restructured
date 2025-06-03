import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import confetti from 'canvas-confetti';
import styles from '../../scss modules/pages/lessons page/PracticePage.module.scss';

const PracticePage = () => {
  const [code, setCode] = useState(`// Example:
int crewCount = 5;
double fuelLevel = 87.5;
String shipName = "Galaxy Runner";
boolean enginesOn = true;

// Your turn - add variables below:`);
  const [output, setOutput] = useState("Output will appear here...");
  const [progress, setProgress] = useState(0);
  const [draggedItem, setDraggedItem] = useState(null);
  const [matches, setMatches] = useState({
    int: false,
    double: false,
    boolean: false,
    String: false,
  });
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(null);
  const [confettiFired, setConfettiFired] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [dropErrors, setDropErrors] = useState({
    int: false,
    double: false,
    boolean: false,
    String: false,
  });

  const navigate = useNavigate();
  const { topicId, subtopicId } = useParams();

  useEffect(() => {
    const createStars = () => {
      const stars = document.getElementById("stars");
      if (!stars) return;

      stars.innerHTML = "";

      for (let i = 0; i < 200; i++) {
        const star = document.createElement("div");
        star.style.position = "absolute";
        star.style.width = `${Math.random() * 3}px`;
        star.style.height = star.style.width;
        star.style.backgroundColor = "white";
        star.style.borderRadius = "50%";
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.opacity = Math.random();
        star.style.animation = `twinkle ${
          2 + Math.random() * 3
        }s infinite alternate`;
        stars.appendChild(star);
      }
    };

    createStars();
  }, []);

  const runCode = () => {
    setOutput("Executing code... (In a real app, this would run the Java code)");
    setTimeout(() => {
      setOutput(`✓ Code compiled successfully!
Variables created:
- crewCount (int)
- fuelLevel (double)
- shipName (String)
- enginesOn (boolean)

Try adding more variables!`);
      updateProgress(25);
    }, 1000);
  };

  const checkAnswer = (isCorrect, optionIndex) => {
    setSelectedAnswer(optionIndex);
    setIsCorrectAnswer(isCorrect);
    if (isCorrect) updateProgress(25);
  };

  const handleDragStart = (e, type) => {
    setDraggedItem(type);
    e.target.style.opacity = "0.4";
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add(styles.highlight);
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove(styles.highlight);
  };

  const handleDrop = (e, expectedType) => {
    e.preventDefault();
    e.currentTarget.classList.remove(styles.highlight);

    if (draggedItem === expectedType) {
      setMatches((prev) => ({ ...prev, [expectedType]: true }));
      setDropErrors((prev) => ({ ...prev, [expectedType]: false }));
      updateProgress(25);
    } else {
      setDropErrors((prev) => ({ ...prev, [expectedType]: true }));
      setTimeout(() => {
        setDropErrors((prev) => ({ ...prev, [expectedType]: false }));
      }, 1000);
    }
  };

  const updateProgress = (increment) => {
    setProgress((prev) => {
      const newProgress = Math.min(prev + increment, 100);
      if (newProgress === 100 && !confettiFired) {
        setTimeout(() => {
          setShowCompletion(true);
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
          });
          setConfettiFired(true);
        }, 500);
      }
      return newProgress;
    });
  };

  const resetLesson = () => {
    setProgress(0);
    setMatches({
      int: false,
      double: false,
      boolean: false,
      String: false,
    });
    setConfettiFired(false);
    setShowCompletion(false);
    navigate(-1)
  };

  const handleStartChallenges = () => {
    navigate(`/lesson/${topicId}/${subtopicId}/challenges`);
  };

  return (
    <div className={styles.container}>
      <div id="stars" className={styles.starsContainer}></div>
      
      <div className={styles.lessonContainer}>
        {/* Back Button */}
        <button 
          className={styles.backButton}
          onClick={() => navigate(-1)}
        >
          ← Back to Lessons
        </button>
        
        {/* Code Playground */}
        <div className={styles.codePlayground}>
          <h2>🚀 CODE CONTROL CENTER</h2>
          <div className={styles.editorSection}>
            <h3>Try it yourself:</h3>
            <p>Declare variables for our spaceship's status:</p>
            <textarea
              className={styles.codeEditor}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button className={styles.runButton} onClick={runCode}>
              LAUNCH CODE
            </button>
            <div className={styles.outputContainer}>{output}</div>
          </div>
        </div>

        {/* Quiz Section */}
        <div className={styles.quizContainer}>
          <h3>🪐 KNOWLEDGE CHECKPOINT</h3>
          <div className={styles.quizQuestion}>
            Which of these is NOT a valid Java variable declaration?
          </div>

          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`${styles.quizOption} ${
                selectedAnswer === index && 
                (isCorrectAnswer ? styles.correct : styles.wrong)
              }`}
              onClick={() => checkAnswer(index === 0, index)}
            >
              {[
                "int 2shape = 3;",
                "String argsInName = \"TxY\";",
                "double variables = 5-9;",
                "boolean shieldUp = true"
              ][index]}
            </div>
          ))}

          {selectedAnswer !== null && (
            <div className={`${styles.feedback} ${
              isCorrectAnswer ? styles.feedbackCorrect : styles.feedbackWrong
            }`}>
              {isCorrectAnswer 
                ? "✓ Correct! Variable names can't start with numbers in Java."
                : "✘ Not quite! This is actually a valid declaration. Try again!"}
            </div>
          )}
        </div>

        {/* Matching Game */}
        <div className={styles.matchingGame}>
          <h3>🧩 VARIABLE MATCHING GAME</h3>
          <p>Drag each data type to match with its correct description:</p>

          <div className={styles.dragItems}>
            {!matches.int && (
              <div className={styles.dragItem}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, "int")}
                onDragEnd={handleDragEnd}
              >int</div>
            )}
            {!matches.double && (
              <div className={styles.dragItem}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, "double")}
                onDragEnd={handleDragEnd}
              >double</div>
            )}
            {!matches.boolean && (
              <div className={styles.dragItem}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, "boolean")}
                onDragEnd={handleDragEnd}
              >boolean</div>
            )}
            {!matches.String && (
              <div className={styles.dragItem}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, "String")}
                onDragEnd={handleDragEnd}
              >String</div>
            )}
          </div>

          <div className={styles.dropZones}>
            {['int', 'double', 'boolean', 'String'].map((type) => (
              <div key={type} className={styles.dropZoneWrapper}>
                <p>{{
                  int: 'Whole numbers (no decimals)',
                  double: 'Numbers with decimal points',
                  boolean: 'True or false values',
                  String: 'Textual data'
                }[type]}</p>
                <div
                  className={`${styles.dropZone} ${
                    dropErrors[type] ? styles.dropZoneError : ''
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, type)}
                >
                  {matches[type] && <span className={styles.matchedItem}>{type}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressContainer}>
          <div className={styles.progressRocket}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${progress}%` }}
            ></div>
            <div 
              className={styles.rocket} 
              style={{ left: `${progress}%` }}
            >
              {progress === 100 ? "🎉" : "🚀"}
            </div>
          </div>
        </div>

        {/* Completion Message */}
        {showCompletion && (
          <div className={styles.completionMessage}>
            <h3>🎉 Mission Complete!</h3>
            <p>You've successfully mastered the Java variables lesson!</p>
            <div className={styles.actionButtons}>
              <button 
                className={styles.primaryButton} 
                onClick={handleStartChallenges}
              >
                Start Challenges
              </button>
              <button 
                className={styles.secondaryButton} 
                onClick={resetLesson}
              >
                Review Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticePage;