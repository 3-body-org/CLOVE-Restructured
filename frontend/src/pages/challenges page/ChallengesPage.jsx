import React from "react";
import { useNavigate } from "react-router-dom";
import CodeFixer from "../challenges page/modes page/CodeFixer";
import CodeCompletion from "../challenges page/modes page/CodeCompletion";
import OutputTracing from "../challenges page/modes page/OutputTracing";
import styles from "../../scss modules/pages/challenges page/ChallengesPage.module.scss";

const ChallengesPage = () => {
  // const navigate = useNavigate();

  return (
    <div className={styles.challengesContainer}>
      <div className={styles.challengeWrapper}>
        <div className={styles.fullWidthChallenge}>
          {/* <CodeFixer /> */}
          {/* <CodeCompletion /> */}
          <OutputTracing />
        </div>
      </div>
    </div>
  );
};

export default ChallengesPage;
