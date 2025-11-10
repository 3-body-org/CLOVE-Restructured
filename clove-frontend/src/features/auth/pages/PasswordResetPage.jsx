import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "contexts/AuthContext";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faCheckCircle, faTimesCircle, faSpinner, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import styles from "features/auth/styles/PasswordResetPage.module.scss";
import CloveLogo from "assets/icons/common/icon-common-clove-logo.png";

export default function PasswordResetPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  
  const [status, setStatus] = useState("form"); // form, loading, success, error
  const [message, setMessage] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid reset link. Please request a new password reset.");
    }
  }, [token]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setStatus("loading");
    setErrors({});
    
    const result = await resetPassword(token, newPassword);
    
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

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <FontAwesomeIcon icon={faSpinner} spin className={styles.icon} />;
      case "success":
        return <FontAwesomeIcon icon={faCheckCircle} className={`${styles.icon} ${styles.success}`} />;
      case "error":
        return <FontAwesomeIcon icon={faTimesCircle} className={`${styles.icon} ${styles.error}`} />;
      default:
        return <FontAwesomeIcon icon={faLock} className={styles.icon} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "success": return styles.success;
      case "error": return styles.error;
      case "loading": return styles.loading;
      default: return "";
    }
  };

  return (
    <div className={styles.resetPage}>
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
            {status === "form" && "Reset Your Password"}
            {status === "loading" && "Resetting Password"}
            {status === "success" && "Password Reset Successfully!"}
            {status === "error" && "Reset Failed"}
          </motion.h1>

          {/* Form or Message */}
          {status === "form" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className={styles.description}>
                Enter your new password below. Make sure it's at least 8 characters long.
              </p>
              
              <form onSubmit={handleSubmit} className={styles.form}>
                {/* New Password */}
                <div className={styles.formGroup}>
                  <label htmlFor="newPassword" className={styles.label}>
                    New Password *
                  </label>
                  <div className={styles.passwordContainer}>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`${styles.input} ${errors.newPassword ? styles.errorInput : ''}`}
                      placeholder="Enter your new password"
                      required
                    />
                    <button
                      type="button"
                      className={styles.eyeButton}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  {errors.newPassword && (
                    <div className={styles.error}>{errors.newPassword}</div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword" className={styles.label}>
                    Confirm Password *
                  </label>
                  <div className={styles.passwordContainer}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`${styles.input} ${errors.confirmPassword ? styles.errorInput : ''}`}
                      placeholder="Confirm your new password"
                      required
                    />
                    <button
                      type="button"
                      className={styles.eyeButton}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className={styles.error}>{errors.confirmPassword}</div>
                  )}
                </div>

                {/* Submit Button */}
                <button type="submit" className={styles.submitButton}>
                  Reset Password
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
              transition={{ delay: 0.8 }}
            >
              Please wait while we reset your password...
            </motion.p>
          )}

          {/* Success State */}
          {status === "success" && (
            <motion.div 
              className={styles.successActions}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <p className={styles.message}>{message}</p>
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

          {/* Error State */}
          {status === "error" && (
            <motion.div 
              className={styles.errorActions}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <p className={styles.message}>{message}</p>
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