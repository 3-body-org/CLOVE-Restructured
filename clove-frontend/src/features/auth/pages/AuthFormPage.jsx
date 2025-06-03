//react
import { useState } from "react";
//react router
import { useNavigate, useLocation } from "react-router-dom";
//framer motion
import { motion } from "framer-motion"; //this is being USED, its just flaging as "unused"
//scss
import styles from "features/auth/styles/AuthFormPage.module.scss";
//assets
import CloveLogo from "assets/icons/common/icon-common-clove-logo.png";
//components
import TermsAndConditions from "features/auth/components/TermsAndConditions";

export default function AuthFormPage() {
  // Set default to Sign Up (false = Sign Up, true = Login)
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(location.state?.isLogin || false);
  const [showTerms, setShowTerms] = useState(false);
  const [email, setEmail] = useState("user@gmail.com"); // Default email
  const [password, setPassword] = useState("user"); // Default password
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "user@gmail.com" && password === "user") {
      navigate("/dashboard");
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <div className={styles.page}>
      {/* ===== HEADER ===== */}
      <header className={styles.header}>
        <div className={styles.logoSection}>
          <h1 className={styles.logo}>
            CLOVE
            <img src={CloveLogo} alt="Clover Logo" className={styles.logoImg} />
          </h1>
        </div>
      </header>
      {/* ===== MAIN CONTENT ===== */}
      <main className={styles.content}>
        <div className={styles.formWrapper}>
          {/* Toggle Nav */}
          <div className={styles.toggleNav}>
            <button
              className={`${styles.toggleButton} ${
                !isLogin ? styles.active : ""
              }`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
            <button
              className={`${styles.toggleButton} ${
                isLogin ? styles.active : ""
              }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
          </div>

          {/* Motion Animation */}
          <motion.div
            initial={{ opacity: 0, x: isLogin ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isLogin ? -50 : 50 }}
            key={isLogin ? "login" : "signup"}
          >
            {isLogin ? (
              <div>
                {/* Login Form */}
                <h2 className={styles.loginHeading}>Log In</h2>
                <p className={styles.loginDescription}>
                  Nice to see you again!
                </p>
                <form onSubmit={handleLogin}>
                  <label htmlFor="email">Email*</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Email"
                    className={styles.formField}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label htmlFor="password">Password*</label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Password"
                    className={styles.formField}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className={styles.forgotPassword}>
                    <a
                      href="/forgot-password"
                      className={styles.forgotPassword}
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <button type="submit" className={styles.formButton}>
                    Login
                  </button>
                </form>
              </div>
            ) : (
              <div>
                {/* Sign Up Form */}
                <h2 className={styles.signupHeading}>Sign Up</h2>
                <p className={styles.signupDescription}>
                  Your journey in programming starts now!
                </p>
                <form>
                  <label htmlFor="name">Name*</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Name"
                    className={styles.formField}
                  />
                  <label htmlFor="email">Email*</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Email"
                    className={styles.formField}
                  />
                  <label htmlFor="password">Password*</label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Password"
                    className={styles.formField}
                  />
                  <div className={styles.checkboxWrapper}>
                    <input
                      type="checkbox"
                      id="termsCheckbox"
                      className={styles.checkbox}
                      required
                    />
                    <label
                      htmlFor="termsCheckbox"
                      className={styles.checkboxLabel}
                    >
                      I have read and agree to the{" "}
                      <span
                        className={styles.termsLink}
                        onClick={() => setShowTerms(true)}
                      >
                        Terms and Conditions
                      </span>
                    </label>
                  </div>
                  <button className={styles.formButton}>Sign Up</button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      {/* ===== FOOTER ===== */}
      <footer className={styles.footer}>
        <p>© 2025 CLOVE</p>
      </footer>
      {/* ===== TERMS MODAL ===== */}
      {showTerms && <TermsAndConditions onClose={() => setShowTerms(false)} />}
    </div>
  );
}
