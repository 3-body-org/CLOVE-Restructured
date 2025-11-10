import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "contexts/AuthContext";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faCheckCircle, faSpinner, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import styles from "features/auth/styles/ForgotPasswordPage.module.scss";
import CloveLogo from "assets/icons/common/icon-common-clove-logo.png";
import { getEmailValidationError } from "../../../utils/validation";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  
  const [status, setStatus] = useState("form"); // form, loading, success
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    const emailError = getEmailValidationError(email);
    if (emailError) {
      newErrors.email = emailError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setStatus("loading");
    setErrors({});
    
    const result = await forgotPassword(email);
    
    setStatus("success");
    setMessage(result.message);
  };

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <FontAwesomeIcon icon={faSpinner} spin className={styles.icon} />;
      case "success":
        return <FontAwesomeIcon icon={faCheckCircle} className={`${styles.icon} ${styles.success}`} />;
      default:
        return <FontAwesomeIcon icon={faEnvelope} className={styles.icon} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "success": return styles.success;
      case "loading": return styles.loading;
      default: return "";
    }
  };

  return (
    <div className={styles.forgotPasswordPage}>
      <div className={styles.background}>
        <div className={styles.gradientOrb1}></div>
        <div className={styles.gradientOrb2}></div>
        <div className={styles.gradientOrb3}></div>
      </div>
      
      <motion.div 
        className={styles.container}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.card}>
          {/* Back Button */}
          <motion.div 
            className={styles.backButton}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/login-signup" className={styles.backLink}>
              <FontAwesomeIcon icon={faArrowLeft} />
              Back to Login
            </Link>
          </motion.div>

          {/* Logo */}
          <motion.div 
            className={styles.logoContainer}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <img src={CloveLogo} alt="CLOVE" className={styles.logo} />
          </motion.div>

          {/* Status Icon */}
          <motion.div 
            className={`${styles.iconContainer} ${getStatusColor()}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          >
            {getStatusIcon()}
          </motion.div>

          {/* Title */}
          <motion.h1 
            className={styles.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {status === "form" && "Forgot Your Password?"}
            {status === "loading" && "Sending Reset Email"}
            {status === "success" && "Check Your Email!"}
          </motion.h1>

          {/* Form or Success Message */}
          {status === "form" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <p className={styles.description}>
                No worries! Enter your email address below and we'll send you a link to reset your password.
              </p>
              
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email Address *
                  </label>
                  <div className={styles.inputContainer}>
                    <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`${styles.input} ${errors.email ? styles.errorInput : ''}`}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                  {errors.email && (
                    <div className={styles.error}>{errors.email}</div>
                  )}
                </div>

                <button type="submit" className={styles.submitButton}>
                  Send Reset Link
                </button>
              </form>
            </motion.div>
          )}

          {/* Loading State */}
          {status === "loading" && (
            <motion.p 
              className={styles.message}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              Please wait while we send you the reset link...
            </motion.p>
          )}

          {/* Success State */}
          {status === "success" && (
            <motion.div 
              className={styles.successContent}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <p className={styles.message}>{message}</p>
              
              <div className={styles.successInstructions}>
                <h3 className={styles.instructionsTitle}>What's next?</h3>
                <ul className={styles.instructionsList}>
                  <li>📧 Check your email inbox (and spam folder)</li>
                  <li>🔗 Click the reset link in the email</li>
                  <li>🔒 Create your new password</li>
                  <li>🎉 Log in with your new password</li>
                </ul>
              </div>
              
              <div className={styles.successActions}>
                <button 
                  className={styles.primaryButton}
                  onClick={() => navigate("/login-signup", { state: { isLogin: true } })}
                >
                  Back to Login
                </button>
                
                <button 
                  className={styles.secondaryButton}
                  onClick={() => {
                    setStatus("form");
                    setEmail("");
                    setMessage("");
                  }}
                >
                  Send Another Email
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 