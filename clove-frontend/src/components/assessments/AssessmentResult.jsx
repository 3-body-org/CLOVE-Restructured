//react
import React, { useEffect, useRef, useState } from "react";
//react router
import { useParams, useNavigate } from "react-router-dom";
//react confetti
import ReactConfetti from "react-confetti"; // Import the confetti component
//scss
import styles from "components/assessments/styles/AssessmentResult.module.scss";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "contexts/AuthContext";

const AssessmentResult = () => {
  const { user } = useAuth();
  const { get } = useApi();
  const { topicId, assessmentType } = useParams();
  const numericTopicId = topicId.split('-')[0];
  const navigate = useNavigate();

  // For tracking the size of the .resultsContainer
  const resultsContainerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // State for backend result
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id || !numericTopicId || !assessmentType) return;
    setLoading(true);
    const endpoint =
      assessmentType === "post"
        ? `/post_assessments/user/${user.id}/topic/${numericTopicId}`
        : `/pre_assessments/user/${user.id}/topic/${numericTopicId}`;
    get(endpoint)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setResult(data);
        } else {
          setError("Failed to fetch assessment result.");
        }
      })
      .catch(() => setError("Failed to fetch assessment result."))
      .finally(() => setLoading(false));
  }, [user, numericTopicId, assessmentType, get]);

  useEffect(() => {
    if (resultsContainerRef.current) {
      setContainerWidth(resultsContainerRef.current.offsetWidth);
      setContainerHeight(resultsContainerRef.current.offsetHeight);
    }
  }, []);

  if (loading) return <div>Loading results...</div>;
  if (error) return <div>{error}</div>;
  if (!result) return <div>No result data available.</div>;

  // Subtopic ID to name mapping (example, adjust as needed)
  const subtopicNameMap = {
    '1': 'Declaring Variables',
    '2': 'Primitive Data Types',
    '3': 'Non-Primitive Data Types',
  };
  // Parse subtopic scores from backend result
  const subtopics = result.subtopic_scores || {};
  // Calculate motivational message
  const score = result.total_score || 0;
  let feedback = "Keep practicing!";
  if (score >= 13) feedback = "Excellent! You're a master of this topic!";
  else if (score >= 10) feedback = "Great job! You're almost there!";
  else if (score >= 7) feedback = "Good effort! Review the material and try again.";

  // Handle the finish button to navigate to the topic page
  const handleFinish = () => {
    navigate(`/my-deck/${topicId}`);
  };

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
            {score}/15
          </div>
          <div className={styles.feedback}>{feedback}</div>
        </div>

        <div className={styles.subtopicResults}>
          {Object.keys(subtopics).length === 0 && <div>No subtopic data available.</div>}
          {Object.keys(subtopics).map((subtopicId, index) => {
            const score = subtopics[subtopicId];
            const name = subtopicNameMap[subtopicId] || subtopicId;
            return (
              <div key={index} className={styles.subtopicItem}>
                <div className={styles.subtopicName}>{name}</div>
                <div className={styles.subtopicScore}>
                  {Math.round((score || 0) * 100)}%
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
