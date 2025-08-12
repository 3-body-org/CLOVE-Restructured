import React from "react";
import HeaderNavbar from "features/landing/components/HeaderNavbar";
import Heading from "features/landing/components/Heading";
import Features from "features/landing/components/Features";
import Team from "features/landing/components/Team";
import Footer from "features/landing/components/Footer";
import styles from "./LandingPage.module.scss";

export default function LandingPage() {
  return (
    <div className={styles.landingPage}>
      <div className={styles.backgroundWrapper}>
        <HeaderNavbar />
        <div className={styles.contentWrapper}>
          <Heading />
          <Features />
          <Team />
        </div>
        <Footer />
      </div>
    </div>
  );
}
