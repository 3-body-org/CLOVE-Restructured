import React from "react";
import styles from "../../scss modules/pages/landing page/Footer.module.scss";
import CloveLogo from "../../assets/images/landing page/CloveLogo.png";

export default function Footer() {
  return (
    <footer className={styles.footerSection}>
      {/* ===== Top Separator Line (Full Width) ===== */}
      <div className={styles.topLine}></div>

      {/* ===== Container for Link Columns (custom .footerContainer) ===== */}
      <div className={styles.footerContainer}>
        <div className={styles.linkContainer}>
          {/* 5 columns in a grid */}
          <div>
            <h4 className={styles.columnTitle}>Resources Section</h4>
            <ul className={styles.linkList}>
              <li>About Us</li>
              <li>Contact Support</li>
              <li>FAQs</li>
            </ul>
          </div>

          <div>
            <h4 className={styles.columnTitle}>Connect With Us</h4>
            <ul className={styles.linkList}>
              <li>Facebook</li>
              <li>X (Twitter)</li>
              <li>YouTube</li>
            </ul>
          </div>

          <div>
            <h4 className={styles.columnTitle}>Support</h4>
            <ul className={styles.linkList}>
              <li>Help Center</li>
              <li>Submit a Ticket</li>
              <li>Feedback</li>
            </ul>
          </div>

          <div>
            <h4 className={styles.columnTitle}>Legal</h4>
            <ul className={styles.linkList}>
              <li>Cookie Policy</li>
              <li>Accessibility Statement</li>
              <li>User Agreement</li>
              <li>Copyright Notice</li>
            </ul>
          </div>

          <div>
            <h4 className={styles.columnTitle}>Contact</h4>
            <ul className={styles.linkList}>
              <li>Email Us</li>
              <li>Call Us</li>
              <li>Visit Us</li>
              <li>Feedback Form</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ===== Second Separator Line (Full Width) ===== */}
      <div className={styles.bottomLine}></div>

      {/* ===== Bottom Container: Logo & Copyright ===== */}
      <div className={`${styles.footerContainer}`}>
        <div className={styles.bottomContainer}>
          {/* Left side: Logo or text */}
          <div className={styles.logoSection}>
            {/* <img src={cloveLogo} alt="CLOVE Logo" className={styles.footerLogo} /> */}
            <h2 className={styles.logoText}>CLOVE</h2>
            <img src={CloveLogo} alt="Clover Logo" className={styles.logoImg} />
          </div>
          {/* Right side: Copyright */}
          <div>
            <p>© 2025 CLOVE. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
