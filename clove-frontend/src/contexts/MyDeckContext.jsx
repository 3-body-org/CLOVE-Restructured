import { createContext, useState, useEffect } from "react";
import { registerLogoutReset } from "./AuthContext";

const MyDeckContext = createContext();

const MyDeckProvider = ({ children }) => {
  const [topicId, setTopicId] = useState(null);
  const [subtopicId, setSubtopicId] = useState(null);

  // Add topic cache for efficient sharing
  const [topicCache, setTopicCache] = useState({});

  const [topics, setTopics] = useState([]);

  const [preAssessmentTaken, setPreAssessmentTaken] = useState(() => {
    const saved = localStorage.getItem("preAssessmentTaken");
    return saved ? JSON.parse(saved) : false;
  });
  const [postAssessmentTaken, setPostAssessmentTaken] = useState(false);
  const [completedSubtopics, setCompletedSubtopics] = useState(() => {
    const saved = localStorage.getItem("completedSubtopics");
    return saved ? JSON.parse(saved) : [];
  });
  const [masteryLevels, setMasteryLevels] = useState({});

  const [completedChallenges, setCompletedChallenges] = useState(() => {
    const saved = localStorage.getItem("completedChallenges");
    return saved ? JSON.parse(saved) : [];
  });
  const [challengeScores, setChallengeScores] = useState(() => {
    const saved = localStorage.getItem("challengeScores");
    return saved ? JSON.parse(saved) : {};
  });

  // Register a reset function to clear all state on logout
  useEffect(() => {
    registerLogoutReset(() => {
      setTopicId(null);
      setSubtopicId(null);
      setTopicCache({});
      setTopics([]);
      setPreAssessmentTaken(false);
      setPostAssessmentTaken(false);
      setCompletedSubtopics([]);
      setMasteryLevels({});
      setCompletedChallenges([]);
      setChallengeScores({});
    });
  }, []);

  // LocalStorage persistence for various states
  useEffect(() => {
    const savedCompleted = localStorage.getItem("completedSubtopics");
    if (!savedCompleted) {
      localStorage.setItem("completedSubtopics", JSON.stringify([]));
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("preAssessmentTaken", JSON.stringify(preAssessmentTaken));
  }, [preAssessmentTaken]);

  useEffect(() => {
    localStorage.setItem("completedSubtopics", JSON.stringify(completedSubtopics));
  }, [completedSubtopics]);

  useEffect(() => {
    localStorage.setItem("completedChallenges", JSON.stringify(completedChallenges));
  }, [completedChallenges]);

  useEffect(() => {
    localStorage.setItem("challengeScores", JSON.stringify(challengeScores));
  }, [challengeScores]);

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
    // Add topic cache to context
    topicCache,
    setTopicCache,
    // Add topics to context
    topics,
    setTopics,
  };

  return (
    <MyDeckContext.Provider value={value}>{children}</MyDeckContext.Provider>
  );
};

export { MyDeckContext, MyDeckProvider };
