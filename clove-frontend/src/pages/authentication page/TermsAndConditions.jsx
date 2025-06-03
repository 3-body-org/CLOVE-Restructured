import React from "react";
import styles from "../../scss modules/pages/authentication page/TermsAndConditions.module.scss";

export default function TermsAndConditions({ onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.termsContainer}>
        <h2>Terms and Conditions</h2>

        <p>
          Welcome to <strong>CLOVE</strong>, an adaptive educational game
          platform for learning coding and programming skills. By accessing or
          using our services, you agree to comply with and be bound by these
          Terms and Conditions.
        </p>

        <h3>1. Acceptance of Terms</h3>
        <p>
          By creating an account or otherwise using the platform, you affirm
          that you have read, understood, and agree to be legally bound by these
          Terms. If you do not agree, please discontinue use of CLOVE.
        </p>

        <h3>2. User Eligibility</h3>
        <p>
          You must be at least 13 years old to create an account on CLOVE. If
          you are under 18, you must have the consent of a parent or legal
          guardian. We reserve the right to refuse service to any user.
        </p>

        <h3>3. Platform Purpose and Use</h3>
        <p>
          CLOVE provides educational games for learning coding skills. You agree
          to use the platform for personal, non-commercial educational purposes
          only. You will not use CLOVE to distribute harmful code, violate
          intellectual property, or engage in any illegal activity.
        </p>

        <h3>4. Account Security</h3>
        <p>
          You are responsible for maintaining the confidentiality of your login
          credentials and for all activities that occur under your account.
          Notify us immediately if you suspect any unauthorized access or breach
          of security.
        </p>

        <h3>5. Data Privacy</h3>
        <p>
          We collect and process personal information in accordance with our
          Privacy Policy. By using CLOVE, you consent to such collection and
          processing. We do not sell or share personal data with third parties
          except as described in our Privacy Policy.
        </p>

        <h3>6. Adaptive Learning and Game Mechanics</h3>
        <p>
          CLOVE uses adaptive algorithms to tailor the difficulty and content to
          your performance. You acknowledge that these algorithms are provided
          on a best-effort basis, and results may vary depending on factors such
          as user input and network connectivity.
        </p>

        <h3>7. Intellectual Property</h3>
        <p>
          All content, including text, images, logos, and software, are the
          property of CLOVE or its licensors. You may not reproduce, modify,
          distribute, or create derivative works without explicit permission.
        </p>

        <h3>8. Limitations of Liability</h3>
        <p>
          CLOVE is provided “as is” without warranty of any kind. We do not
          guarantee uninterrupted service or error-free operation. In no event
          shall CLOVE be liable for any indirect or consequential damages
          arising from your use of the platform.
        </p>

        <h3>9. Termination</h3>
        <p>
          We reserve the right to suspend or terminate any account that violates
          these Terms, infringes upon the rights of others, or otherwise engages
          in illegal or disruptive behavior.
        </p>

        <h3>10. Modifications to Terms</h3>
        <p>
          CLOVE may update these Terms from time to time. We will notify users
          of any material changes by posting a notice on our website or sending
          an email to registered users. Continued use of the platform after
          changes indicates acceptance of the revised Terms.
        </p>

        <button onClick={onClose} className={styles.closeButton}>
          Close
        </button>
      </div>
    </div>
  );
}
