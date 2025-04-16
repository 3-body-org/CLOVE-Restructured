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
                  <div className={styles.modeCategory}>Your strongest mode</div>
                </div>
              </div>
              <div className={styles.modeStats}>
                <div className={styles.statItem}>
                  <span
                    className={`${styles.statValue} ${styles.accuracyHigh}`}
                  >
                    92%
                  </span>
                  <span className={styles.statLabel}>Accuracy Rate</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>127</span>
                  <span className={styles.statLabel}>Attempts</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>24h</span>
                  <span className={styles.statLabel}>Time Spent</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>87%</span>
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
                    className={`${styles.statValue} ${styles.accuracyMedium}`}
                  >
                    68%
                  </span>
                  <span className={styles.statLabel}>Accuracy Rate</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>84</span>
                  <span className={styles.statLabel}>Attempts</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>15h</span>
                  <span className={styles.statLabel}>Time Spent</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>72%</span>
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
                    Moderate performance
                  </div>
                </div>
              </div>
              <div className={styles.modeStats}>
                <div className={styles.statItem}>
                  <span
                    className={`${styles.statValue} ${styles.accuracyMedium}`}
                  >
                    75%
                  </span>
                  <span className={styles.statLabel}>Accuracy Rate</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>63</span>
                  <span className={styles.statLabel}>Attempts</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>9h</span>
                  <span className={styles.statLabel}>Time Spent</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>81%</span>
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
            <h2 className={styles.topicTitle}>Topic: Conditionals and Loops</h2>
            <div className={styles.overallProgress}>
              <div className={styles.progressCircle}>
                <span className={styles.progressPercent}>65%</span>
              </div>
              <span>Overall Progress</span>
            </div>
          </div>

          {/* Subtopic 1 - Basic Loops */}
          <div className={styles.subtopicCard}>
            <div className={styles.subtopicHeader}>
              <h3 className={styles.subtopicName}>Subtopic 1: Basic Loops</h3>
              <span
                className={`${styles.masteryLevel} ${styles.masteryIntermediate}`}
              >
                <FontAwesomeIcon icon={faStarHalfAlt} />
                Intermediate
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
                      style={{ width: "70%" }}
                    ></div>
                  </div>
                  <small>70% completed (14/20 lessons)</small>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricTitle}>
                    <FontAwesomeIcon icon={faBrain} />
                    Knowledge Retention
                  </div>
                  <div className={styles.progressBarContainer}>
                    <div
                      className={styles.progressBar}
                      style={{ width: "62%" }}
                    ></div>
                  </div>
                  <small>62% retention score</small>
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
                        <div className={styles.swItem}>
                          For loop implementation
                        </div>
                        <div className={styles.swItem}>
                          While loop understanding
                        </div>
                        <div className={styles.swItem}>Basic loop control</div>
                      </div>
                    </div>

                    <div className={`${styles.swCard} ${styles.weaknessCard}`}>
                      <h5 className={styles.swTitle}>
                        <FontAwesomeIcon icon={faThumbsDown} />
                        Weaknesses
                      </h5>
                      <div className={styles.swList}>
                        <div className={styles.swItem}>Loop optimization</div>
                        <div className={styles.swItem}>
                          Infinite loop prevention
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subtopic 2 - Conditional Statements */}
          <div className={styles.subtopicCard}>
            <div className={styles.subtopicHeader}>
              <h3 className={styles.subtopicName}>
                Subtopic 2: Conditional Statements
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
                      style={{ width: "45%" }}
                    ></div>
                  </div>
                  <small>45% completed (9/20 lessons)</small>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricTitle}>
                    <FontAwesomeIcon icon={faBrain} />
                    Knowledge Retention
                  </div>
                  <div className={styles.progressBarContainer}>
                    <div
                      className={styles.progressBar}
                      style={{ width: "38%" }}
                    ></div>
                  </div>
                  <small>38% retention score</small>
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
                        <div className={styles.swItem}>
                          Basic if-else statements
                        </div>
                        <div className={styles.swItem}>
                          Simple condition evaluation
                        </div>
                      </div>
                    </div>

                    <div className={`${styles.swCard} ${styles.weaknessCard}`}>
                      <h5 className={styles.swTitle}>
                        <FontAwesomeIcon icon={faThumbsDown} />
                        Weaknesses
                      </h5>
                      <div className={styles.swList}>
                        <div className={styles.swItem}>Nested conditionals</div>
                        <div className={styles.swItem}>
                          Switch statement usage
                        </div>
                        <div className={styles.swItem}>Ternary operators</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subtopic 3 - Advanced Loops */}
          <div className={styles.subtopicCard}>
            <div className={styles.subtopicHeader}>
              <h3 className={styles.subtopicName}>
                Subtopic 3: Advanced Loops
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
                      style={{ width: "30%" }}
                    ></div>
                  </div>
                  <small>30% completed (6/20 lessons)</small>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricTitle}>
                    <FontAwesomeIcon icon={faBrain} />
                    Knowledge Retention
                  </div>
                  <div className={styles.progressBarContainer}>
                    <div
                      className={styles.progressBar}
                      style={{ width: "25%" }}
                    ></div>
                  </div>
                  <small>25% retention score</small>
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
                        <div className={styles.swItem}>
                          Understanding loop concepts
                        </div>
                      </div>
                    </div>

                    <div className={`${styles.swCard} ${styles.weaknessCard}`}>
                      <h5 className={styles.swTitle}>
                        <FontAwesomeIcon icon={faThumbsDown} />
                        Weaknesses
                      </h5>
                      <div className={styles.swList}>
                        <div className={styles.swItem}>
                          Nested loops implementation
                        </div>
                        <div className={styles.swItem}>
                          Loop control statements
                        </div>
                        <div className={styles.swItem}>
                          Performance optimization
                        </div>
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
