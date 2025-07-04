//react
import React, { useEffect, useRef, useState } from "react";
//react router
import { useLocation, useNavigate } from "react-router-dom";
//react confetti
import ReactConfetti from "react-confetti"; // Import the confetti component
//scss
import styles from "components/assessments/styles/AssessmentResult.module.scss";

const AssessmentResult = () => {
  const { state } = useLocation(); // Get state from the location
  const { userAnswers, questionsToAsk, topicId } = state || {}; // Destructure state
  const navigate = useNavigate();

  // For tracking the size of the .resultsContainer
  const resultsContainerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Log the received state data for debugging
  console.log("State data received: ", state);
  console.log("User Answers: ", userAnswers);
  console.log("Questions To Ask: ", questionsToAsk);

  if (!userAnswers || !questionsToAsk) {
    return <div>Error: No results data available.</div>;
  }

  // Initialize subtopics dictionary with default structure
  const subtopics = {
    "Declaring Variables": { correctAnswers: 0, total: 0 },
    "Primitive Data Types": { correctAnswers: 0, total: 0 },
    "Non-Primitive Data Types": { correctAnswers: 0, total: 0 },
  };

  // Count correct/total per subtopic using the stored category
  userAnswers.forEach(({ category, isCorrect }) => {
    if (subtopics[category]) {
      subtopics[category].total++;
      if (isCorrect) subtopics[category].correctAnswers++;
    }
  });

  // Handle the finish button to navigate to the topic page
  const handleFinish = () => {
    navigate(`/my-deck/${topicId}`);
  };

  // Effect to measure the dimensions of the results container after mount
  useEffect(() => {
    if (resultsContainerRef.current) {
      setContainerWidth(resultsContainerRef.current.offsetWidth);
      setContainerHeight(resultsContainerRef.current.offsetHeight);
    }
  }, []);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.resultsContainer} ref={resultsContainerRef}>
        {/* Confetti effect only inside the card */}
        {containerWidth > 0 && containerHeight > 0 && (
          <ReactConfetti
            width={containerWidth}
            height={containerHeight}
            numberOfPieces={200}
            gravity={0.05}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 10, // Ensure it's above content
            }}
          />
        )}

        <div className={styles.holographicEffect}></div>
        <div className={styles.resultsHeader}>
          <h1 className={styles.resultsTitle}>Test Results</h1>
          <p>Here's how you performed on the assessment</p>
          <div className={styles.totalScore}>
            {userAnswers.filter((answer) => answer.isCorrect).length}/
            {questionsToAsk.length}
          </div>
        </div>

        <div className={styles.subtopicResults}>
          {Object.keys(subtopics).map((subtopicName, index) => {
            const subtopic = subtopics[subtopicName];

            return (
              <div key={index} className={styles.subtopicItem}>
                <div className={styles.subtopicName}>{subtopicName}</div>

                {/* Render lines based on correct answers count */}
                <div className={styles.subtopicLines}>
                  {[...Array(subtopic.total)].map((_, idx) => {
                    const isCorrectLine = idx < subtopic.correctAnswers; // If index is less than the correct answers count, color it green
                    return (
                      <div
                        key={idx}
                        className={`${styles.line} ${
                          isCorrectLine ? styles.correct : styles.incorrect
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Display the score for each subtopic */}
                <div className={styles.subtopicScore}>
                  {subtopic.correctAnswers}/{subtopic.total}
                </div>
              </div>
            );
          })}
        </div>

        <button className={styles.finishBtn} onClick={handleFinish}>
          Finish & Continue Learning
        </button>
      </div>
    </div>
  );
};

export default AssessmentResult;
