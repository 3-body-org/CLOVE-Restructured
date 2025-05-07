//react
import React, { useEffect, useContext } from "react";
//react router
import { useNavigate, useParams } from "react-router-dom";
//context
import { MyDeckContext } from "../../context/ContextPage";
//react bootstrap
import Button from "react-bootstrap/Button";
//component
import { lessons } from "./lessons";
//scss
import styles from "../../scss modules/pages/lessons page/LessonsPage.module.scss";

const LessonsPage = () => {
  const { topicId, subtopicId } = useParams();
  const navigate = useNavigate();
  const { setLessonCompleted } = useContext(MyDeckContext);

  // Get lesson data from your lessons.js file
  const lessonData = lessons[topicId]?.[subtopicId] || {};

  // console.log(topicId); // Check the topicId value
  // console.log(subtopicId); // Check the subtopicId value
  // console.log(lessons[topicId]); // Log the topic object to see if it's correctly accessed
  // console.log(lessons[topicId]?.[subtopicId]); // Log the lessonData

  // Stars animation effect
  useEffect(() => {
    const createStars = () => {
      const stars = document.getElementById("stars");
      if (!stars) return;

      stars.innerHTML = "";

      for (let i = 0; i < 200; i++) {
        const star = document.createElement("div");
        star.style.position = "absolute";
        star.style.width = `${Math.random() * 3}px`;
        star.style.height = star.style.width;
        star.style.backgroundColor = "white";
        star.style.borderRadius = "50%";
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.opacity = Math.random();
        star.style.animation = `twinkle ${
          2 + Math.random() * 3
        }s infinite alternate`;
        stars.appendChild(star);
      }
    };

    createStars();
  }, []);

  const handleStartChallenges = () => {
    // setLessonCompleted(subtopicId);
    navigate(`/lesson/${topicId}/${subtopicId}/practice`);
  };

  return (
    <div className={styles.lessonWrapper}>
      <div className={styles.stars} id="stars"></div>

      <div className={styles.lessonContainer}>
        <div className={styles.lessonHeader}>
          <div className={styles.missionPatch}>🚀</div>
          <h1 className={styles.courseTitle}>Cosmic Java</h1>
          <p>Mission: {lessonData?.title || "Loading..."}</p>
        </div>

        {/* Dynamic Lesson Content */}
        <div className={styles.lessonContent}>
          <div className={styles.introSection}>
            <h2 className={styles.introTitle}>
              STARLOG: ENTRY {subtopicId?.toUpperCase()}
            </h2>
            <div className={styles.introDescription}>
              <p>{lessonData?.intro || "Loading lesson content..."}</p>
              {lessonData?.objectives && (
                <ul>
                  {lessonData.objectives.map((obj, index) => (
                    <li key={index}>{obj}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Sections */}
        {lessonData?.sections?.map((section, index) => (
          <div key={index} className={styles.lessonContent}>
            <div className={styles.subtopicContainer}>
              <div className={styles.subtopicHeader}>
                <div className={styles.subtopicNumber}>{index + 1}</div>
                <h2 className={styles.subtopicTitle}>
                  {section.heading.toUpperCase()}
                </h2>
              </div>

              <div className={styles.conceptCard}>
                {section.thematicIntro && (
                  <div className={styles.thematicIntro}>
                    {section.thematicIntro}
                  </div>
                )}

                <h3 className={styles.conceptTitle}>
                  <span className={styles.icon}>{section.icon || "📝"}</span>
                  {section.subheading}
                </h3>

                <div className={styles.technicalContent}>
                  {section.content && <p>{section.content}</p>}

                  {section.code && (
                    <div className={styles.codeBlock}>
                      {section.code.split("\n").map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {/* Navigation Buttons */}
        <div className={styles.lessonContent}>
          <div className={styles.navButtons}>
            <Button className={styles.navBtn} onClick={() => navigate(-1)}>
              <span className={styles.icon}>⬅️</span>
              Back to Topics
            </Button>
            <Button
              className={`${styles.navBtn} ${styles.nextBtn}`}
              onClick={handleStartChallenges}
            >
              <span className={styles.icon}>⚡</span>
              Start Practice
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonsPage;
