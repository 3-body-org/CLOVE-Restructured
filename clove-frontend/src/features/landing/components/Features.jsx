//react
import { useState } from "react";
//scss
import styles from "features/landing/styles/Features.module.scss";
// Replace with your actual images
import tempPic from "assets/images/landing/image-landing-flowers.jpg";

export default function Features() {
  return (
    <section className={styles.featuresSection}>
      <div className="container">
        {/* ===== Top Row: Title / Paragraph ===== */}
        <div className="row">
          <div className="col-md-6">
            <p className={styles.innovateText}>Innovate</p>
            <h1 className={styles.featuresHeading}>
              How Clove Helps You Learn Java Better
            </h1>
          </div>
          <div className="col-md-6">
            <p className={styles.featuresParagraph}>
              Clove adjusts each coding challenge based on how you're doing,
               from hints to timers to difficulty levels. Set inside unique,
                themed scenarios, your learning journey stays fresh, balanced, 
                and just challenging enough to keep you moving forward.
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
                Challenges That Adjust With You
              </h3>
              <p className={styles.featureDescription}>
                Clove responds intelligently to your progress, 
                adapting each challenge to meet you at your current skill level.
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
                 More Than Just Practice
              </h3>
              <p className={styles.featureDescription}>
                Every challenge is purposefully designed to build
                mastery through thoughtful pacing and gradual complexity.
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
                Built-In Support That Doesn't Interrupt
              </h3>
              <p className={styles.featureDescription}>
                Assistance appears only when it's needed, 
                helping you stay focused without breaking your learning flow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
