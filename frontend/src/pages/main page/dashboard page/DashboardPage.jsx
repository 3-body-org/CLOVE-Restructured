import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faChartLine,
  faLayerGroup,
  faSignOutAlt,
  faBookOpen,
  faFire,
  faChartBar,
  faTrophy,
  faCheckCircle,
  faCheck,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../../../scss modules/pages/main page/dashboard page/DashboardPage.module.scss";

const Dashboard = () => {
  return (
    <div className={styles.container}>
      {/* <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>📚</div>
          CodeMaster
        </div>

        <nav>
          <a href="#" className={`${styles.navItem} ${styles.active}`}>
            <FontAwesomeIcon icon={faHome} />
            Dashboard
          </a>
          <a href="#" className={styles.navItem}>
            <FontAwesomeIcon icon={faChartLine} />
            Progress
          </a>
          <a href="#" className={styles.navItem}>
            <FontAwesomeIcon icon={faLayerGroup} />
            Courses
          </a>
          <a href="#" className={styles.navItem}>
            <FontAwesomeIcon icon={faBookOpen} />
            Library
          </a>
        </nav>

        <a href="#" className={styles.logout}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          Log Out
        </a>
      </aside> */}

      <main className={styles.dashboard}>
        <header>
          <div className={styles.headerLeft}>
            <h2>
              Hello, <span className={styles.username}>John Doe!</span>
            </h2>
            <p>Here's your learning journey progress 🌱</p>
          </div>
          <img
            className={styles.profile}
            src="https://i.pravatar.cc/48?img=12"
            alt="User avatar"
          />
        </header>

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
                  <div className={`${styles.day} ${styles.streakFilled}`}>
                    M
                  </div>
                  <div className={`${styles.day} ${styles.streakFilled}`}>
                    T
                  </div>
                  <div className={`${styles.day} ${styles.streakFilled}`}>
                    W
                  </div>
                  <div className={`${styles.day} ${styles.streakFilled}`}>
                    Th
                  </div>
                  <div className={`${styles.day} ${styles.streakFilled}`}>
                    F
                  </div>
                  <div className={styles.day}>S</div>
                  <div className={styles.day}>S</div>
                </div>
                <p className={styles.streakText}>
                  You're on a <strong>4-day streak</strong>! Consistency is key.
                  Keep that brain fired up! 🔥
                </p>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3>
              <FontAwesomeIcon icon={faChartBar} /> Progress Overview
            </h3>
            <div className={styles.barChart}>
              <div className={styles.barContainer}>
                <div className={styles.barLabel}>
                  <span>Topic 1 – Variables</span>
                  <span>80%</span>
                </div>
                <div className={styles.bar}>
                  <div
                    className={styles.barFill}
                    style={{ width: "80%" }}
                  ></div>
                </div>
              </div>
              <div className={styles.barContainer}>
                <div className={styles.barLabel}>
                  <span>Topic 2 – Loops</span>
                  <span>45%</span>
                </div>
                <div className={styles.bar}>
                  <div
                    className={styles.barFill}
                    style={{ width: "45%" }}
                  ></div>
                </div>
              </div>
              <div className={styles.barContainer}>
                <div className={styles.barLabel}>
                  <span>Topic 3 – Functions</span>
                  <span>20%</span>
                </div>
                <div className={styles.bar}>
                  <div
                    className={styles.barFill}
                    style={{ width: "20%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3>
              <FontAwesomeIcon icon={faTrophy} /> Challenges Solved
            </h3>
            <div className={styles.chartWrapper}>
              <div className={styles.donutChart}>
                <div className={styles.donutCenter}>
                  <div className={styles.donutCenterText}>75%</div>
                  <div className={styles.donutCenterLabel}>completed</div>
                </div>
              </div>
              <div className={styles.chartLabel}>
                You've solved 75 out of 100 challenges. Keep up the great work!
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3>
              <FontAwesomeIcon icon={faCheckCircle} /> Completed Topics
            </h3>
            <div className={styles.completedTopics}>
              <div className={styles.completedTopic}>
                <div className={styles.topicInfo}>
                  <h5>
                    <FontAwesomeIcon icon={faCheck} /> Topic 1: Variables
                  </h5>
                  <small>Completed on April 1, 2025</small>
                </div>
                <div className={styles.topicBadge}>Mastered</div>
              </div>
              <div className={styles.completedTopic}>
                <div className={styles.topicInfo}>
                  <h5>
                    <FontAwesomeIcon icon={faCheck} /> Topic 2: Loops
                  </h5>
                  <small>Completed on April 4, 2025</small>
                </div>
                <div className={styles.topicBadge}>Proficient</div>
              </div>
              <div className={styles.completedTopic}>
                <div className={styles.topicInfo}>
                  <h5>
                    <FontAwesomeIcon icon={faCheck} /> Topic 3: Functions
                  </h5>
                  <small>Completed on April 7, 2025</small>
                </div>
                <div className={styles.topicBadge}>Learned</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
