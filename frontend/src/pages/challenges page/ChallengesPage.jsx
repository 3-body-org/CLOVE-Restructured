//react
// import { useState, useEffect, useContext } from "react";
//react router
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirect
// import { MyDeckContext } from "../../context/MyDeckContext"; // Context for sharing data
//component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faLightbulb } from "@fortawesome/free-solid-svg-icons";
// import CodeCompletionChallenge from "../../components/challenges/CodeCompletion";
// import CodeTracingChallenge from "../../components/challenges/CodeTracing";
// import CodeFixerChallenge from "../../components/challenges/CodeFixer";
// import TimerRing from "../../components/challenges/TimerRing";
// import { challenges } from "./challenges";
// import styles from "../../scss modules/pages/challenges page/ChallengesPage.module.scss";
import CodeFixer from "../challenges page/modes page/CodeFixer";
import CodeCompletion from "../challenges page/modes page/CodeCompletion";
import OutputTracing from "../challenges page/modes page/OutputTracing";

const ChallengesPage = () => {
  // const navigate = useNavigate(); // Set up navigation

  return (
    <>
      <CodeFixer />
      {/* <CodeCompletion /> */}
      {/* <OutputTracing /> */}
    </>
  );
};

export default ChallengesPage;
