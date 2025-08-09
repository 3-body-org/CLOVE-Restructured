import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "contexts/AuthContext";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faCheckCircle, faTimesCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";
import styles from "features/auth/styles/EmailVerificationPage.module.scss";
import CloveLogo from "assets/icons/common/icon-common-clove-logo.png";

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, sendVerificationEmail } = useAuth();
  
  const [status, setStatus] = useState("verifying"); // verifying, success, error, resending
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      handleVerification();
    } else {
      setStatus("error");
      setMessage("Invalid verification link. Please check your email for the correct link.");
    }
  }, [token]);

  const handleVerification = async () => {
    setStatus("verifying");
    const result = await verifyEmail(token);
    
    if (result.success) {
      setStatus("success");
      setMessage(result.message);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login-signup", { state: { isLogin: true } });
      }, 3000);
    } else {
      setStatus("error");
      setMessage(result.message);
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    
    setStatus("resending");
    const result = await sendVerificationEmail(resendEmail);
    
    if (result.success) {
      setMessage(`Verification email sent to ${resendEmail}. Please check your inbox.`);
    } else {
      setMessage(result.message);
    }
    
    setTimeout(() => setStatus("error"), 2000); // Return to error state
  };

  const getStatusIcon = () => {
    switch (status) {
      case "verifying":
      case "resending":
        return <FontAwesomeIcon icon={faSpinner} spin className={styles.icon} />;
      case "success":
        return <FontAwesomeIcon icon={faCheckCircle} className={`${styles.icon} ${styles.success}`} />;
      case "error":
        return <FontAwesomeIcon icon={faTimesCircle} className={`${styles.icon} ${styles.error}`} />;
      default:
        return <FontAwesomeIcon icon={faEnvelope} className={styles.icon} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "success": return styles.success;
      case "error": return styles.error;
      case "verifying":
      case "resending": return styles.loading;
      default: return "";
    }
  };

  return (
    <div className={styles.verificationPage}>
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
          {/* Logo */}
          <motion.div 
            className={styles.logoContainer}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <img src={CloveLogo} alt="CLOVE" className={styles.logo} />
          </motion.div>

          {/* Status Icon */}
          <motion.div 
            className={`${styles.iconContainer} ${getStatusColor()}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          >
            {getStatusIcon()}
          </motion.div>

          {/* Title */}
          <motion.h1 
            className={styles.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {status === "verifying" && "Verifying Your Email"}
            {status === "success" && "Email Verified Successfully!"}
            {status === "error" && "Verification Failed"}
            {status === "resending" && "Sending New Verification Email"}
          </motion.h1>

          {/* Message */}
          <motion.p 
            className={styles.message}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {message}
          </motion.p>

          {/* Success Actions */}
          {status === "success" && (
            <motion.div 
              className={styles.successActions}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <p className={styles.redirectMessage}>
                Redirecting to login in 3 seconds...
              </p>
              <button 
                className={styles.primaryButton}
                onClick={() => navigate("/login-signup", { state: { isLogin: true } })}
              >
                Continue to Login
              </button>
            </motion.div>
          )}

          {/* Error Actions */}
          {status === "error" && (
            <motion.div 
              className={styles.errorActions}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <form onSubmit={handleResendVerification} className={styles.resendForm}>
                <p className={styles.resendLabel}>
                  <FontAwesomeIcon icon={faEnvelope} className={styles.emailIcon} />
                  Didn't receive the email? Enter your email to resend:
                </p>
                <div className={styles.resendContainer}>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className={styles.emailInput}
                    required
                  />
                  <button 
                    type="submit" 
                    className={styles.resendButton}
                    disabled={status === "resending"}
                  >
                    {status === "resending" ? "Sending..." : "Resend"}
                  </button>
                </div>
              </form>
              
              <button 
                className={styles.secondaryButton}
                onClick={() => navigate("/login-signup")}
              >
                Back to Login
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 