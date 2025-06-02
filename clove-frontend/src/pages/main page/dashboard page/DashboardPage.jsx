import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faFire,
  faCheckCircle,
  faCheck,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../../../scss modules/pages/main page/dashboard page/DashboardPage.module.scss";
import { DashboardAnalytics } from "./DashboardAnalytics";
import TitleAndProfile from "../../../components/navbar/TitleAndProfile";

// Reusable components
const CompletedTopicItem = ({ topicNumber, date, badgeText }) => (
  <div className={styles.completedTopic}>
    <div className={styles.topicInfo}>
      <h5>
        <FontAwesomeIcon icon={faCheck} /> Topic {topicNumber}: ...
      </h5>
      <small>Completed on {date}</small>
    </div>
    <div className={styles.topicBadge}>{badgeText}</div>
  </div>
);

const StreakDay = ({ day, filled }) => (
  <div className={`${styles.day} ${filled ? styles.streakFilled : ""}`}>
    {day}
  </div>
);

const Dashboard = () => {
  // Data arrays
  const progressData = [
    { topic: "Topic 1 – Variables and Data Types", percentage: 0 },
    { topic: "Topic 2 – Coming Soon", percentage: 0 },
    { topic: "Topic 3 – Coming Soon", percentage: 0 },
  ];

  const challengesData = {
    percentage: 0,
    label: "completed",
    description:
      "You've solved 0 challenges. Keep up answering the challenges!",
  };

  const streakDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const completedTopics = [
    { topicNumber: "#", date: "April 1, 2025", badgeText: "Mastered" },
    { topicNumber: "#", date: "April 1, 2025", badgeText: "Proficient" },
    { topicNumber: "#", date: "April 1, 2025", badgeText: "Learned" },
  ];

  return (
    <div className={styles.container}>
      <main className={styles.dashboard}>

        <TitleAndProfile
          nonColored={"Hello,"}
          colored={"John Doe!"}
          description={
            "Here's your learning journey progress 🌱<"
          }
        />

        <div className={styles.mainContent}>
          <div className={styles.topRow}>
            <div className={`${styles.card} ${styles.highlight}`}>
              <h3>
                <FontAwesomeIcon icon={faBookOpen} /> Most Recent Topic
              </h3>
              <p>
                You were last seen studying <strong>Topic 1: Variables</strong>.
                Let's keep going!
              </p>
              <a href="#">
                Resume Topic <FontAwesomeIcon icon={faArrowRight} />
              </a>
            </div>

            <div className={styles.card}>
              <h3>
                <FontAwesomeIcon icon={faFire} /> Your Streak
              </h3>
              <div className={styles.streak}>
                <div className={styles.days}>
                  {streakDays.map((day, index) => (
                    <StreakDay key={day} day={day} filled={index === 0} />
                  ))}
                </div>
                <p className={styles.streakText}>
                  You're on a <strong>1-day streak</strong>. Consistency is key.
                </p>
              </div>
            </div>
          </div>

          <DashboardAnalytics
            progressData={progressData}
            challengesData={challengesData}
          />

          <div className={styles.card}>
            <h3>
              <FontAwesomeIcon icon={faCheckCircle} /> Completed Topics
            </h3>
            <div className={styles.completedTopics}>
              {completedTopics.map((topic, index) => (
                <CompletedTopicItem
                  key={index}
                  topicNumber={topic.topicNumber}
                  date={topic.date}
                  badgeText={topic.badgeText}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
