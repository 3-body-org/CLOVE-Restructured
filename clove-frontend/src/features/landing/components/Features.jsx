import React from "react";
import ScrollReveal from "./ScrollReveal";
import styles from "features/landing/styles/Features.module.scss";
// Import the 3 feature videos
import feature1Video from "assets/Mp4/landing/mp4-feature1.mp4";
import feature2Video from "assets/Mp4/landing/mp4-feature2.mp4";
import feature3Video from "assets/Mp4/landing/mp4-feature3.mp4";

export default function Features() {
  return (
    <section className={styles.featuresSection}>
      <div className={`container-fluid ${styles.wideContainer}`}>
        {/* ===== Top Row: Title / Paragraph ===== */}
        <ScrollReveal animation="staggerContainer" className="row">
          <ScrollReveal animation="fadeInUp" className="col-md-6">
            <p className={styles.innovateText}>✨ Dimensional Powers</p>
            <h1 className={styles.featuresHeading}>
              Master Java Through Realm-Adaptive Learning
            </h1>
          </ScrollReveal>
          <ScrollReveal animation="fadeInUp" className="col-md-6">
            <p className={styles.featuresParagraph}>
              Each dimensional realm responds to your energy—challenges evolve,
              portals adapt, and mysteries unfold based on your journey.
              Navigate through enchanted academies, noir-lit streets, and cosmic
              stations as you unlock the secrets of Java programming.
            </p>
          </ScrollReveal>
        </ScrollReveal>

        {/* ===== Main Feature Cards ===== */}
        <div className="row mt-5">
          {/* Feature 1 */}
          <div className="col-md-4 d-flex align-items-stretch">
            <div className={styles.featureCard}>
              <video
                src={feature1Video}
                alt="Personalized Learning"
                className={styles.featureImg}
                autoPlay
                loop
                muted
                playsInline
              />
              <h3 className={styles.featureTitle}>
                🌟 Realm-Adaptive Pathways
              </h3>
              <p className={styles.featureDescription}>
                The dimensional fabric responds to your essence—each realm
                shifts its challenges to match your current power level,
                ensuring every portal leads to growth.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="col-md-4 d-flex align-items-stretch mt-4 mt-md-0">
            <div className={styles.featureCard}>
              <video
                src={feature2Video}
                alt="Real-Time Adaptability"
                className={styles.featureImg}
                autoPlay
                loop
                muted
                playsInline
              />
              <h3 className={styles.featureTitle}>
                ⚡ Mastery Through Dimensions
              </h3>
              <p className={styles.featureDescription}>
                Each trial you face is woven into the realm's ancient tapestry—
                build your powers gradually through carefully crafted challenges
                that unlock deeper mysteries of the coding arts.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="col-md-4 d-flex align-items-stretch mt-4 mt-md-0">
            <div className={styles.featureCard}>
              <video
                src={feature3Video}
                alt="Engaging Content"
                className={styles.featureImg}
                autoPlay
                loop
                muted
                playsInline
              />
              <h3 className={styles.featureTitle}>🔮 Dimensional Guidance</h3>
              <p className={styles.featureDescription}>
                Ancient realm spirits manifest when you need them most— subtle
                whispers and glowing hints appear in your darkest moments,
                guiding without disrupting your journey through the code.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
