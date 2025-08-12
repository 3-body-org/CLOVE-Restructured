import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "features/landing/styles/Heading.module.scss";
import ImageCarousel from "./ImageCarousel";
import ScrollIndicator from "./ScrollIndicator";

export default function Heading() {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate("/login-signup", { state: { isLogin: false } });
  };

  const handleLearnMore = () => {
    const featuresSection = document.querySelector('[class*="featuresSection"]');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.page}>
      {/* ====== HERO SECTION ====== */}
      <section className={styles.hero}>
        <div className={`container-fluid ${styles.wideContainer}`}>
          <div className="row align-items-center">
            {/* Left side text */}
            <div className="col-md-7">
              <h1 className={styles.heroTitle}>
                Learn Java Through Immersive, Game-Inspired Challenges
              </h1>
              <p className={styles.heroParagraph}>
              Dive into a coding experience shaped by your performance. 
              Clove adapts each challenge to your learning patterns — 
              all within immersive, theme-inspired environments
              </p>
              <div className={styles.heroButtons}>
                <button className={styles.signUpBtn} onClick={handleRedirect}>
                  Sign Up
                </button>
                <button className={styles.learnMoreBtn} onClick={handleLearnMore}>Learn More</button>
              </div>
            </div>
            {/* Right side carousel */}
            <div className="col-md-5 mt-4 mt-md-0 text-center">
              <ImageCarousel />
            </div>
          </div>
        </div>
        <ScrollIndicator />
      </section>
    </div>
  );
}
