import { createContext, useState, useEffect } from "react";

const MyDeckContext = createContext();

const MyDeckProvider = ({ children }) => {
  const [topicId, setTopicId] = useState(null);
  const [subtopicId, setSubtopicId] = useState(null);

  const [preAssessmentTaken, setPreAssessmentTaken] = useState(true);
  const [postAssessmentTaken, setPostAssessmentTaken] = useState(false);
  const [completedSubtopics, setCompletedSubtopics] = useState([]);
  const [masteryLevels, setMasteryLevels] = useState({});

  const [completedChallenges, setCompletedChallenges] = useState(() => {
    const saved = localStorage.getItem("completedChallenges");
    return saved ? JSON.parse(saved) : [];
  });
  const [challengeScores, setChallengeScores] = useState(() => {
    const saved = localStorage.getItem("challengeScores");
    return saved ? JSON.parse(saved) : {};
  });

  // State to store the results of the challenges
  const [results, setResults] = useState([]);

  // LocalStorage persistence for various states
  useEffect(() => {
    localStorage.setItem("preAssessmentTaken", JSON.stringify(preAssessmentTaken));
  }, [preAssessmentTaken]);

  useEffect(() => {
    localStorage.setItem("completedChallenges", JSON.stringify(completedChallenges));
  }, [completedChallenges]);

  useEffect(() => {
    localStorage.setItem("challengeScores", JSON.stringify(challengeScores));
  }, [challengeScores]);

  // LocalStorage persistence for results (Added)
  useEffect(() => {
    localStorage.setItem("results", JSON.stringify(results));
  }, [results]);

  const value = {
    topicId,
    setTopicId,
    subtopicId,
    setSubtopicId,
    preAssessmentTaken,
    setPreAssessmentTaken,
    postAssessmentTaken,
    setPostAssessmentTaken,
    completedSubtopics,
    setCompletedSubtopics,
    masteryLevels,
    setMasteryLevels,
    completedChallenges,
    setCompletedChallenges,
    challengeScores,
    setChallengeScores,
    results, // Provide results to components
    setResults, // Allow components to set results
  };

  return (
    <MyDeckContext.Provider value={value}>{children}</MyDeckContext.Provider>
  );
};

export { MyDeckContext, MyDeckProvider };
