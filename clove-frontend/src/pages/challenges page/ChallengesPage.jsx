// ChallengesPage.js
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CodeFixer from "../challenges page/modes page/CodeFixer";
import CodeCompletion from "../challenges page/modes page/CodeCompletion";
import OutputTracing from "../challenges page/modes page/OutputTracing";
import styles from "../../scss modules/pages/challenges page/ChallengesPage.module.scss";

const ChallengesPage = () => {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const [results, setResults] = useState([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);

  // Generate challenges with unique IDs
  const [challenges] = useState(() => {
    const components = [
      { type: 'CodeFixer', component: CodeFixer },
      { type: 'CodeCompletion', component: CodeCompletion },
      { type: 'OutputTracing', component: OutputTracing }
    ];
    
    return Array.from({ length: 5 }, (_, i) => {
      const random = components[Math.floor(Math.random() * components.length)];
      return {
        id: i + 1,
        type: random.type,
        component: random.component,
        status: 'pending',
        score: 0
      };
    });
  });

  const handleChallengeComplete = (challengeId, result) => {
    setResults(prev => {
      const newResults = [...prev];
      newResults[challengeId - 1] = {
        type: challenges[challengeId - 1].type,
        score: result.score,
        status: result.success ? 'completed' : 'failed',
        timestamp: new Date().toISOString()
      };
      return newResults;
    });

    // Check if this was the last challenge
    if (currentChallengeIndex === challenges.length - 1) {
      navigate(`/my-deck/${topicId}`);
      return;
    }

    // Move to next challenge
    setCurrentChallengeIndex(prev => prev + 1);
  };

  return (
    <div className={styles.challengesContainer}>
      <div className={styles.challengeWrapper}>
        <div className={styles.fullWidthChallenge}>
          {(() => {
            const { id, component: Component, type } = challenges[currentChallengeIndex];
            return (
              <Component 
                key={id}
                onComplete={(result) => handleChallengeComplete(id, result)}
                challengeType={type}
                isLastChallenge={currentChallengeIndex === challenges.length - 1}
                topicId={topicId}
              />
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default ChallengesPage;