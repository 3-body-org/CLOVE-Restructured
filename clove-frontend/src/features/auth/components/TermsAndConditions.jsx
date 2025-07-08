import React from "react";
import styles from "features/auth/styles/TermsAndConditions.module.scss";

export default function TermsAndConditions({ onClose, onAccept, onDecline }) {
  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.termsContainer}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <span className={styles.headerTitle}>Terms and Conditions</span>
            <button onClick={onClose} className={styles.closeX} aria-label="Close Terms and Conditions">×</button>
          </div>
          <div className={styles.headerDivider}></div>
          <div className={styles.termsIntro}>
            <div className={styles.termsIcon}>
              <span role="img" aria-label="document">📄</span>
            </div>
            <div>
              <div className={styles.termsUpdated}>Last updated: <b>June 2024</b></div>
              <div className={styles.termsSummary}>
                Please review and accept our Terms and Conditions to create your account and use CLOVE.
              </div>
            </div>
          </div>
          <div className={styles.termsSection}>
            <div className={styles.termsSectionTitle}>Your Agreement</div>
            <ul className={styles.termsList}>
              <li>By creating an account, you agree to be legally bound by these Terms and our Privacy Policy.</li>
              <li>You must be at least 13 years old (or have parental consent if under 18).</li>
              <li>You agree to use CLOVE for personal, non-commercial educational purposes only.</li>
            </ul>
          </div>
          <div className={styles.termsSection}>
            <div className={styles.termsSectionTitle}>Key Points</div>
            <ul className={styles.termsList}>
              <li>Keep your login credentials secure and notify us of any unauthorized access.</li>
              <li>We collect and process your data as described in our Privacy Policy. We do not sell your data.</li>
              <li>All content is the property of CLOVE or its licensors. Do not copy or distribute without permission.</li>
              <li>CLOVE is provided "as is" without warranty. We are not liable for indirect or consequential damages.</li>
              <li>We may update these Terms and will notify you of material changes.</li>
            </ul>
          </div>
          <div className={styles.termsSection}>
            <div className={styles.termsSectionTitle}>Need Help?</div>
            <div className={styles.termsHelpText}>
              If you have questions, contact us at <a href="mailto:support@clove.com">support@clove.com</a>.
            </div>
          </div>
          <div className={styles.termsActions}>
            <button onClick={onDecline || onClose} className={styles.declineButton} type="button">Decline</button>
            <button onClick={onAccept} className={styles.acceptButton} type="button">Accept</button>
          </div>
        </div>
      </div>
    </div>
  );
}
