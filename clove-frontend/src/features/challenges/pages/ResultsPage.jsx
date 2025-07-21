import React, { useContext } from "react";
import { useNavigate } from "react-router-dom"; 
import { MyDeckContext } from "../../context/MyDeckContext"; 
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import styles from "../../css modules/pages/Results.module.scss";

// Register chart elements
ChartJS.register(ArcElement, Tooltip, Legend);

const ResultsPage = () => {
  const { results, topicId } = useContext(MyDeckContext); 
  const correctCount = results.filter((result) => result.isCorrect).length;
  const totalChallenges = results.length;
  const incorrectCount = totalChallenges - correctCount;
  const navigate = useNavigate(); 

  // Chart data for doughnut chart
  const chartData = {
    labels: ["Correct Answers", "Incorrect Answers"],
    datasets: [
      {
        data: [correctCount, incorrectCount],
        backgroundColor: ["#1e88e5", "#ff4081"], 
        hoverOffset: 4,
      },
    ],
  };

  // Handle Go Back button click
  const handleGoBack = () => {
    navigate(`/my-deck/${topicId}`);
  };

  // Conditional message based on score
  const getResultMessage = () => {
    if (correctCount === 0) {
      return "Don't worry, you'll improve with more practice!";
    } else if (correctCount < totalChallenges) {
      return `You solved ${correctCount} out of ${totalChallenges} challenges. Keep going!`;
    } else {
      return `Excellent! You solved all ${totalChallenges} challenges correctly!`;
    }
  };

  return (
    <div className={styles.resultsPageContainer}>
      <div className={styles.resultsSummary}>
        <h2 className={styles.resultsTitle}>Your Challenge Results</h2>
        <p className={styles.resultsDescription}>
          Here's how you did on your challenges:
        </p>

        <div className={styles.scoreSummary}>
          <p className={styles.scoreText}>Total Challenges: {totalChallenges}</p>
          <p className={styles.scoreText}>
            Correct Answers: {correctCount} / {totalChallenges}
          </p>
          <p className={styles.scoreText}>Total Score: {correctCount * 100}</p>
        </div>

        <div className={styles.chartContainer}>
          <Doughnut data={chartData} />
        </div>

        <div className={styles.explanationText}>
          <h3>What do these results mean?</h3>
          <p>{getResultMessage()}</p>
        </div>  

        {/* Detailed Challenge Results */}
        <div className={styles.detailedResults}>
          <h3>Challenge Details</h3>
          <ul className={styles.challengeList}>
            {results.map((result, index) => (
              <li key={index} className={styles.challengeItem}>
                <div className={styles.challengeHeader}>
                  <h4>Challenge {index + 1}: {result.challengeType}</h4>
                  <p className={styles.resultStatus}>
                    {result.isCorrect ? "Correct" : "Incorrect"}
                  </p>
                </div>
                <div className={styles.challengeBody}>
                  <p><strong>Your Answer:</strong> {result.userAnswer}</p>
                  <p><strong>Correct Answer:</strong> {result.correctAnswer}</p>
                  <p><strong>Time Taken:</strong> {result.timeTaken} seconds</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.goBackButtonContainer}>
        <button className={styles.goBackButton} onClick={handleGoBack}>
          <FontAwesomeIcon icon={faArrowLeft} /> Go Back
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;
