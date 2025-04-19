import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faQuestionCircle,
  faLayerGroup,
  faTrophy,
  faChartLine,
  faBrain,
  faChartPie,
  faThumbsUp,
  faThumbsDown,
  faStar,
  faStarHalfAlt,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../../../scss modules/pages/main page/progress page/ProgressPage.module.scss";
import TitleAndProfile from "../../../components/navbar/TitleAndProfile";

const ProgressPage = () => {
  return (
    <main className={styles.progressContent}>
      <TitleAndProfile
        nonColored={"Learning"}
        colored={"Progress"}
        description={"Detailed analysis of your learning performance 📊"}
      />

      {/* Learning Mode Performance Section */}
      <section className={styles.learningModesSection}>
        <div className={styles.performanceCard}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faTrophy} />
            Learning Mode Performance
          </h2>
          <div className={styles.modePerformanceGrid}>
            {/* Mode Cards */}
            <div className={styles.modeCard}>
              <div className={styles.modeHeader}>
                <div className={styles.modeIcon}>
                  <FontAwesomeIcon icon={faCheckCircle} />
                </div>
                <div className={styles.modeInfo}>
                  <div className={styles.modeName}>Code Completion Mode</div>
                  <div className={styles.modeCategory}>Needs Improvement</div>
                </div>
              </div>
              <div className={styles.modeStats}>
                <div className={styles.statItem}>
                  <span
                    className={`${styles.statValue} ${styles.accuracyLow}`}
                  >
                    0%
                  </span>
                  <span className={styles.statLabel}>Accuracy Rate</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>0</span>
                  <span className={styles.statLabel}>Attempts</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>0h</span>
                  <span className={styles.statLabel}>Time Spent</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>0%</span>
                  <span className={styles.statLabel}>Completion Rate</span>
                </div>
              </div>
            </div>

            <div className={styles.modeCard}>
              <div className={styles.modeHeader}>
                <div className={styles.modeIcon}>
                  <FontAwesomeIcon icon={faQuestionCircle} />
                </div>
                <div className={styles.modeInfo}>
                  <div className={styles.modeName}>Code Fixer Mode</div>
                  <div className={styles.modeCategory}>Needs improvement</div>
                </div>
              </div>
              <div className={styles.modeStats}>
                <div className={styles.statItem}>
                  <span
                    className={`${styles.statValue} ${styles.accuracyLow}`}
                  >
                    0%
                  </span>
                  <span className={styles.statLabel}>Accuracy Rate</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>0</span>
                  <span className={styles.statLabel}>Attempts</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>0h</span>
                  <span className={styles.statLabel}>Time Spent</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>0%</span>
                  <span className={styles.statLabel}>Completion Rate</span>
                </div>
              </div>
            </div>

            <div className={styles.modeCard}>
              <div className={styles.modeHeader}>
                <div className={styles.modeIcon}>
                  <FontAwesomeIcon icon={faLayerGroup} />
                </div>
                <div className={styles.modeInfo}>
                  <div className={styles.modeName}>Output Tracing Mode</div>
                  <div className={styles.modeCategory}>
                    Needs Improvement
                  </div>
                </div>
              </div>
              <div className={styles.modeStats}>
                <div className={styles.statItem}>
                  <span
                    className={`${styles.statValue} ${styles.accuracyLow}`}
                  >
                    0%
                  </span>
                  <span className={styles.statLabel}>Accuracy Rate</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>0</span>
                  <span className={styles.statLabel}>Attempts</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>0h</span>
                  <span className={styles.statLabel}>Time Spent</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>0%</span>
                  <span className={styles.statLabel}>Completion Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Topic Progress Section */}
      <section className={styles.topicProgress}>
        <div className={styles.topicCard}>
          <div className={styles.topicHeader}>
            <h2 className={styles.topicTitle}>Topic 1 : Variables and Data Types</h2>
            <div className={styles.overallProgress}>
              <div className={styles.progressCircle}>
                <span className={styles.progressPercent}>0%</span>
              </div>
              <span>Overall Progress</span>
            </div>
          </div>

          {/* Subtopic 1 - Declaring Variables */}
          <div className={styles.subtopicCard}>
            <div className={styles.subtopicHeader}>
              <h3 className={styles.subtopicName}>Subtopic 1: Declaring Variables</h3>
              <span
                className={`${styles.masteryLevel} ${styles.masteryBeginner}`}
              >
                <FontAwesomeIcon icon={faStar} />
                Beginner
              </span>
            </div>

            <div className={styles.progressDetails}>
              <div className={styles.progressMetrics}>
                <div className={styles.metricCard}>
                  <div className={styles.metricTitle}>
                    <FontAwesomeIcon icon={faChartLine} />
                    Progress Completion
                  </div>
                  <div className={styles.progressBarContainer}>
                    <div
                      className={styles.progressBar}
                      style={{ width: "0%" }}
                    ></div>
                  </div>
                  <small>0% completed</small>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricTitle}>
                    <FontAwesomeIcon icon={faBrain} />
                    Knowledge Retention
                  </div>
                  <div className={styles.progressBarContainer}>
                    <div
                      className={styles.progressBar}
                      style={{ width: "0%" }}
                    ></div>
                  </div>
                  <small>0% retention score</small>
                </div>
              </div>

              <div className={styles.performanceAnalytics}>
                <div className={styles.metricCard}>
                  <h4 className={styles.metricTitle}>
                    <FontAwesomeIcon icon={faChartPie} />
                    Performance Analysis
                  </h4>

                  <div className={styles.strengthsWeaknesses}>
                    <div className={`${styles.swCard} ${styles.strengthCard}`}>
                      <h5 className={styles.swTitle}>
                        <FontAwesomeIcon icon={faThumbsUp} />
                        Strengths
                      </h5>
                      <div className={styles.swList}>
                        <div className={styles.swItem}></div>
                      </div>
                    </div>

                    <div className={`${styles.swCard} ${styles.weaknessCard}`}>
                      <h5 className={styles.swTitle}>
                        <FontAwesomeIcon icon={faThumbsDown} />
                        Weaknesses
                      </h5>
                      <div className={styles.swList}>
                        <div className={styles.swItem}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subtopic 2 - Primitive Data Types */}
          <div className={styles.subtopicCard}>
            <div className={styles.subtopicHeader}>
              <h3 className={styles.subtopicName}>
                Subtopic 2: Primitive Data Types
              </h3>
              <span
                className={`${styles.masteryLevel} ${styles.masteryBeginner}`}
              >
                <FontAwesomeIcon icon={faStar} />
                Beginner
              </span>
            </div>

            <div className={styles.progressDetails}>
              <div className={styles.progressMetrics}>
                <div className={styles.metricCard}>
                  <div className={styles.metricTitle}>
                    <FontAwesomeIcon icon={faChartLine} />
                    Progress Completion
                  </div>
                  <div className={styles.progressBarContainer}>
                    <div
                      className={styles.progressBar}
                      style={{ width: "0%" }}
                    ></div>
                  </div>
                  <small>0% completed</small>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricTitle}>
                    <FontAwesomeIcon icon={faBrain} />
                    Knowledge Retention
                  </div>
                  <div className={styles.progressBarContainer}>
                    <div
                      className={styles.progressBar}
                      style={{ width: "0%" }}
                    ></div>
                  </div>
                  <small>0% retention score</small>
                </div>
              </div>

              <div className={styles.performanceAnalytics}>
                <div className={styles.metricCard}>
                  <h4 className={styles.metricTitle}>
                    <FontAwesomeIcon icon={faChartPie} />
                    Performance Analysis
                  </h4>

                  <div className={styles.strengthsWeaknesses}>
                    <div className={`${styles.swCard} ${styles.strengthCard}`}>
                      <h5 className={styles.swTitle}>
                        <FontAwesomeIcon icon={faThumbsUp} />
                        Strengths
                      </h5>
                      <div className={styles.swList}>
                        <div className={styles.swItem}></div>
                      </div>
                    </div>

                    <div className={`${styles.swCard} ${styles.weaknessCard}`}>
                      <h5 className={styles.swTitle}>
                        <FontAwesomeIcon icon={faThumbsDown} />
                        Weaknesses
                      </h5>
                      <div className={styles.swList}>
                        <div className={styles.swItem}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subtopic 3 - Non-Primitive Data Types */}
          <div className={styles.subtopicCard}>
            <div className={styles.subtopicHeader}>
              <h3 className={styles.subtopicName}>
                Subtopic 3: Non-Primitive Data Types
              </h3>
              <span
                className={`${styles.masteryLevel} ${styles.masteryBeginner}`}
              >
                <FontAwesomeIcon icon={faStar} />
                Beginner
              </span>
            </div>

            <div className={styles.progressDetails}>
              <div className={styles.progressMetrics}>
                <div className={styles.metricCard}>
                  <div className={styles.metricTitle}>
                    <FontAwesomeIcon icon={faChartLine} />
                    Progress Completion
                  </div>
                  <div className={styles.progressBarContainer}>
                    <div
                      className={styles.progressBar}
                      style={{ width: "0%" }}
                    ></div>
                  </div>
                  <small>0% completed</small>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricTitle}>
                    <FontAwesomeIcon icon={faBrain} />
                    Knowledge Retention
                  </div>
                  <div className={styles.progressBarContainer}>
                    <div
                      className={styles.progressBar}
                      style={{ width: "0%" }}
                    ></div>
                  </div>
                  <small>0% retention score</small>
                </div>
              </div>

              <div className={styles.performanceAnalytics}>
                <div className={styles.metricCard}>
                  <h4 className={styles.metricTitle}>
                    <FontAwesomeIcon icon={faChartPie} />
                    Performance Analysis
                  </h4>

                  <div className={styles.strengthsWeaknesses}>
                    <div className={`${styles.swCard} ${styles.strengthCard}`}>
                      <h5 className={styles.swTitle}>
                        <FontAwesomeIcon icon={faThumbsUp} />
                        Strengths
                      </h5>
                      <div className={styles.swList}>
                        <div className={styles.swItem}></div>
                      </div>
                    </div>

                    <div className={`${styles.swCard} ${styles.weaknessCard}`}>
                      <h5 className={styles.swTitle}>
                        <FontAwesomeIcon icon={faThumbsDown} />
                        Weaknesses
                      </h5>
                      <div className={styles.swList}>
                        <div className={styles.swItem}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProgressPage;
