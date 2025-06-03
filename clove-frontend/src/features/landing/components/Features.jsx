//react
import { useState } from "react";
//scss
import styles from "features/landing/styles/Features.module.scss";
// Replace with your actual images
import tempPic from "assets/images/landing/image-landing-flowers.jpg";
//fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";

export default function Features() {
  // State to track whether additional content is expanded
  const [expanded, setExpanded] = useState(false);

  // Toggles the expanded state
  const handleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <section className={styles.featuresSection}>
      <div className="container">
        {/* ===== Top Row: Title / Paragraph ===== */}
        <div className="row">
          <div className="col-md-6">
            <p className={styles.innovateText}>Innovate</p>
            <h2 className={styles.featuresHeading}>
              Unlock Your Learning Potential with Us
            </h2>
          </div>
          <div className="col-md-6">
            <p className={styles.featuresParagraph}>
              Experience a transformative learning journey tailored just for
              you. Our innovative approach ensures that every learner receives
              personalized content that adapts in real-time. This not only
              enhances understanding but also keeps you motivated and engaged.
            </p>
          </div>
        </div>

        {/* ===== Main Feature Cards ===== */}
        <div className="row mt-5">
          {/* Feature 1 */}
          <div className="col-md-4 d-flex align-items-stretch">
            <div className={styles.featureCard}>
              <img
                src={tempPic}
                alt="Personalized Learning"
                className={styles.featureImg}
              />
              <h3 className={styles.featureTitle}>
                Personalized Learning Paths for Every Student
              </h3>
              <p className={styles.featureDescription}>
                Our system creates unique learning paths based on individual
                progress.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="col-md-4 d-flex align-items-stretch mt-4 mt-md-0">
            <div className={styles.featureCard}>
              <img
                src={tempPic}
                alt="Real-Time Adaptability"
                className={styles.featureImg}
              />
              <h3 className={styles.featureTitle}>
                Real-Time Adaptability to Enhance Learning Experience
              </h3>
              <p className={styles.featureDescription}>
                Adjustments are made instantly to match your skill level.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="col-md-4 d-flex align-items-stretch mt-4 mt-md-0">
            <div className={styles.featureCard}>
              <img
                src={tempPic}
                alt="Engaging Content"
                className={styles.featureImg}
              />
              <h3 className={styles.featureTitle}>
                Boost Retention and Motivation with Engaging Content
              </h3>
              <p className={styles.featureDescription}>
                Stay motivated with challenges that evolve with you.
              </p>
            </div>
          </div>
        </div>

        {/* ===== Hidden Feature Row (Expanded Content) ===== */}
        {expanded && (
          <div className="row mt-5">
            <div className="col-md-4 d-flex align-items-stretch">
              <div className={styles.featureCard}>
                <img
                  src={tempPic}
                  alt="Analytics"
                  className={styles.featureImg}
                />
                <h3 className={styles.featureTitle}>In-Depth Analytics</h3>
                <p className={styles.featureDescription}>
                  Gain insights into your performance with real-time analytics.
                </p>
              </div>
            </div>
            {/* Add more cards if needed */}
          </div>
        )}

        {/* ===== Arrow to Expand/Collapse ===== */}
        <div className={styles.arrowWrapper}>
          {/* White line above the arrow */}
          <div className={styles.arrowSeparator}></div>

          {/* Arrow button toggles expanded content */}
          <button onClick={handleExpand} className={styles.arrowBtn}>
            <FontAwesomeIcon
              icon={faAngleDown}
              className={`${styles.arrowIcon} ${
                expanded ? styles.rotated : ""
              }`}
            />
          </button>
        </div>
      </div>
    </section>
  );
}
