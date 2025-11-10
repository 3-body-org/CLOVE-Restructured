import React from "react";
import HeaderNavbar from "features/landing/components/HeaderNavbar";
import Heading from "features/landing/components/Heading";
import Features from "features/landing/components/Features";
import Team from "features/landing/components/Team";
import Footer from "features/landing/components/Footer";
import AnimateOnScroll from "features/landing/components/AnimateOnScroll";
import styles from "features/landing/styles/LandingPage.module.scss";

export default function LandingPage() {
  return (
    <div className={styles.landingPage}>
      {/* Animated background with gradient orbs */}
      <div className={styles.background}>
        <div className={styles.gradientOrb1}></div>
        <div className={styles.gradientOrb2}></div>
        <div className={styles.gradientOrb3}></div>
        <div className={styles.gradientOrb4}></div>
      </div>

      <div className={styles.backgroundWrapper}>
        <HeaderNavbar />
        <div className={styles.contentWrapper}>
          <Heading />
          <AnimateOnScroll>
            <Features />
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <Team />
          </AnimateOnScroll>
        </div>
        <Footer />
      </div>
    </div>
  );
}
