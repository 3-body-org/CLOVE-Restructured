import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import styles from "features/auth/styles/AuthFormPage.module.scss";
import CloveLogo from "assets/icons/common/icon-common-clove-logo.png";
import TermsAndConditions from "features/auth/components/TermsAndConditions";
import { useAuth } from "contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEye, 
  faEyeSlash, 
  faCheckCircle, 
  faUser, 
  faEnvelope, 
  faLock,
  faCalendar,
  faSpinner,
    faTimesCircle,
  faArrowLeft
} from "@fortawesome/free-solid-svg-icons";
import clsx from "clsx";
import { getEmailValidationError } from "../../../utils/validation";

export default function AuthFormPage() {
  // Set default to Sign Up (false = Sign Up, true = Login)
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(location.state?.isLogin || false);
  const [showTerms, setShowTerms] = useState(false);
  
  // Separate state for login and signup forms
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();
  const { login, signup, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsOnAttempt, setShowTermsOnAttempt] = useState(false);
  const [termsDeclinedOnce, setTermsDeclinedOnce] = useState(false);
  
  // Separate error states for login and signup forms
  const [loginErrors, setLoginErrors] = useState({});
  const [signupErrors, setSignupErrors] = useState({});

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage(""); // Clear success message on login attempt
    
    // Validate login fields first
    let loginErrors = {};
    if (!loginEmail.trim()) loginErrors.email = "Email is required";
    if (!loginPassword.trim()) loginErrors.password = "Password is required";
    
    // Check email format if email is provided
    if (loginEmail.trim() && !/\S+@\S+\.\S+/.test(loginEmail)) {
      loginErrors.email = "Please enter a valid email";
    }
    
    setLoginErrors(loginErrors);
    
    // If there are validation errors, don't proceed
    if (Object.keys(loginErrors).length > 0) {
      return;
    }
    
    setFormLoading(true);
    setError("");
    const res = await login(loginEmail, loginPassword);
    if (!res.success) setError(res.message);
    setFormLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate all fields first
    let newErrors = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!birthday) newErrors.birthday = "Birthday is required";
    if (!signupEmail.trim()) newErrors.email = "Email is required";
    if (!signupPassword || signupPassword.length < 8) newErrors.password = "Password must be at least 8 characters";
    
    // Check email format if email is provided
    if (signupEmail.trim()) {
      const emailError = getEmailValidationError(signupEmail);
      if (emailError && emailError !== "Email is required") {
        newErrors.email = emailError;
      }
    }
    
    setSignupErrors(newErrors);
    
    // If there are field errors, don't check terms yet
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    // Only check terms if all fields are valid
    if (!acceptedTerms) {
      if (!termsDeclinedOnce) {
        setShowTermsOnAttempt(true);
        return;
      }
      // If already declined once, let browser show required message
    }
    setFormLoading(true);
    const res = await signup(firstName, lastName, birthday, signupEmail, signupPassword);
    setFormLoading(false);
    
    if (res.success) {
      if (res.requiresVerification) {
        // Show success message and switch to login
        setError(""); // Clear any errors
        setSuccessMessage(res.message);
        // Switch to login tab
        setIsLogin(true);
        // Clear signup form
        setSignupEmail("");
        setSignupPassword("");
        setFirstName("");
        setLastName("");
        setBirthday("");
        setAcceptedTerms(false);
        // Clear login errors too
        setLoginErrors({});
        // Auto-clear success message after 10 seconds
        setTimeout(() => setSuccessMessage(""), 10000);
      }
    } else {
      setError(res.message);
      setSuccessMessage("");
    }
  };

  // Helper to validate login fields
  const validateLoginField = (field, value) => {
    switch (field) {
      case "email":
        return getEmailValidationError(value);
      case "password":
        if (!value.trim()) return "Password is required";
        return "";
      default:
        return "";
    }
  };

  // Helper to validate signup fields
  const validateSignupField = (field, value) => {
    switch (field) {
      case "firstName":
        return value.trim() ? "" : "First name is required";
      case "lastName":
        return value.trim() ? "" : "Last name is required";
      case "birthday":
        if (!value) return "Birthday is required";
        // Check if user is at least 13 years old
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 13) return "You must be at least 13 years old to sign up";
        return "";
      case "email":
        return getEmailValidationError(value);
      case "password":
        if (!value.trim()) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        return "";
      default:
        return "";
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError("") , 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className={styles.authPage}>
      {/* Background with animated gradient orbs */}
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
        {/* Back Button */}
        <motion.button
          className={styles.backButton}
          onClick={() => navigate("/")}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ x: -5, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} className={styles.backIcon} />
          <span className={styles.backText}>Back</span>
        </motion.button>

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

          {/* Toggle Nav */}
          <motion.div 
            className={styles.toggleNav}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              className={`${styles.toggleButton} ${!isLogin ? styles.active : ""}`}
              onClick={() => { 
                setIsLogin(false); 
                setError(""); 
                setSuccessMessage("");
                setLoginErrors({});
                setSignupErrors({});
              }}
            >
              Sign Up
            </button>
            <button
              className={`${styles.toggleButton} ${isLogin ? styles.active : ""}`}
              onClick={() => { 
                setIsLogin(true); 
                setError(""); 
                setSuccessMessage("");
                setLoginErrors({});
                setSignupErrors({});
              }}
            >
              Login
            </button>
          </motion.div>

          {/* Forms with AnimatePresence */}
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Login Form */}
                <h2 className={styles.title}>Welcome Back!</h2>
                <p className={styles.description}>
                  Nice to see you again!
                </p>

                {/* Success Message */}
                {successMessage && (
                  <motion.div 
                    className={styles.successMessage}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className={styles.messageIcon} />
                    <span>{successMessage}</span>
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div 
                    className={styles.errorMessage}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} className={styles.messageIcon} />
                    <span>{error}</span>
                  </motion.div>
                )}

                <form onSubmit={handleLogin} className={styles.form}>
                  {/* Email Field */}
                  <div className={styles.formGroup}>
                    <label htmlFor="login-email" className={styles.label}>
                      Email *
                    </label>
                    <div className={styles.inputContainer}>
                      <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
                      <input
                        type="email"
                        id="login-email"
                        name="email"
                        autoComplete="email"
                        placeholder="Enter your email"
                        className={clsx(styles.input, loginErrors.email && styles.errorInput)}
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        onFocus={() => {
                          setLoginErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        onBlur={(e) => {
                          setLoginErrors((prev) => ({ ...prev, email: validateLoginField("email", e.target.value) }));
                        }}
                      />
                    </div>
                    {loginErrors.email && (
                      <div className={styles.error}>{loginErrors.email}</div>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className={styles.formGroup}>
                    <label htmlFor="login-password" className={styles.label}>
                      Password *
                    </label>
                    <div className={styles.passwordInputContainer}>
                      <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="login-password"
                        name="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        className={clsx(styles.input, styles.passwordInput, loginErrors.password && styles.errorInput)}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        onFocus={() => {
                          setLoginErrors((prev) => ({ ...prev, password: undefined }));
                        }}
                        onBlur={(e) => {
                          setLoginErrors((prev) => ({ ...prev, password: validateLoginField("password", e.target.value) }));
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className={styles.eyeButton}
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                      </button>
                    </div>
                    {loginErrors.password && (
                      <div className={styles.error}>{loginErrors.password}</div>
                    )}
                  </div>

                  {/* Forgot Password Link */}
                  <div className={styles.forgotPasswordLink}>
                    <Link to="/forgot-password" className={styles.link}>
                      Forgot your password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className={styles.submitButton} 
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className={styles.buttonIcon} />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Sign Up Form */}
                <h2 className={styles.title}>Join CLOVE</h2>
                <p className={styles.description}>
                  Your journey in programming starts now!
                </p>

                {/* Error Message */}
                {error && (
                  <motion.div 
                    className={styles.errorMessage}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} className={styles.messageIcon} />
                    <span>{error}</span>
                  </motion.div>
                )}

                <form onSubmit={handleSignup} className={styles.form}>
                  {/* First Name & Last Name */}
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="signup-firstName" className={styles.label}>
                        First Name *
                      </label>
                      <div className={styles.inputContainer}>
                        <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
                        <input
                          type="text"
                          id="signup-firstName"
                          name="firstName"
                          autoComplete="given-name"
                          placeholder="First Name"
                          className={clsx(styles.input, signupErrors.firstName && styles.errorInput)}
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          onFocus={() => {
                            setSignupErrors((prev) => ({ ...prev, firstName: undefined }));
                          }}
                          onBlur={(e) => {
                            setSignupErrors((prev) => ({ ...prev, firstName: validateSignupField("firstName", e.target.value) }));
                          }}
                        />
                      </div>
                      {signupErrors.firstName && (
                        <div className={styles.error}>{signupErrors.firstName}</div>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="signup-lastName" className={styles.label}>
                        Last Name *
                      </label>
                      <div className={styles.inputContainer}>
                        <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
                        <input
                          type="text"
                          id="signup-lastName"
                          name="lastName"
                          autoComplete="family-name"
                          placeholder="Last Name"
                          className={clsx(styles.input, signupErrors.lastName && styles.errorInput)}
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          onFocus={() => {
                            setSignupErrors((prev) => ({ ...prev, lastName: undefined }));
                          }}
                          onBlur={(e) => {
                            setSignupErrors((prev) => ({ ...prev, lastName: validateSignupField("lastName", e.target.value) }));
                          }}
                        />
                      </div>
                      {signupErrors.lastName && (
                        <div className={styles.error}>{signupErrors.lastName}</div>
                      )}
                    </div>
                  </div>

                  {/* Birthday */}
                  <div className={styles.formGroup}>
                    <label htmlFor="signup-birthday" className={styles.label}>
                      Birthday *
                    </label>
                    <div className={styles.inputContainer}>
                      <FontAwesomeIcon icon={faCalendar} className={styles.inputIcon} />
                      <input
                        type="date"
                        id="signup-birthday"
                        name="birthday"
                        autoComplete="bday"
                        className={clsx(styles.input, styles.dateInput, signupErrors.birthday && styles.errorInput)}
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        max={(() => {
                          const today = new Date();
                          const minAge = 13;
                          const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
                          return maxDate.toISOString().split('T')[0];
                        })()}
                        onFocus={() => {
                          setSignupErrors((prev) => ({ ...prev, birthday: undefined }));
                        }}
                        onBlur={(e) => {
                          setSignupErrors((prev) => ({ ...prev, birthday: validateSignupField("birthday", e.target.value) }));
                        }}
                      />
                    </div>
                    {signupErrors.birthday && (
                      <div className={styles.error}>{signupErrors.birthday}</div>
                    )}
                  </div>

                  {/* Email */}
                  <div className={styles.formGroup}>
                    <label htmlFor="signup-email" className={styles.label}>
                      Email *
                    </label>
                    <div className={styles.inputContainer}>
                      <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
                      <input
                        type="email"
                        id="signup-email"
                        name="email"
                        autoComplete="email"
                        placeholder="Enter your email"
                        className={clsx(styles.input, signupErrors.email && styles.errorInput)}
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        onFocus={() => {
                          setSignupErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        onBlur={(e) => {
                          setSignupErrors((prev) => ({ ...prev, email: validateSignupField("email", e.target.value) }));
                        }}
                      />
                    </div>
                    {signupErrors.email && (
                      <div className={styles.error}>{signupErrors.email}</div>
                    )}
                  </div>

                  {/* Password */}
                  <div className={styles.formGroup}>
                    <label htmlFor="signup-password" className={styles.label}>
                      Password *
                    </label>
                    <div className={styles.passwordInputContainer}>
                      <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
                      <input
                        type={showSignupPassword ? "text" : "password"}
                        id="signup-password"
                        name="password"
                        autoComplete="new-password"
                        placeholder="Enter your password (min. 8 characters)"
                        className={clsx(styles.input, styles.passwordInput, signupErrors.password && styles.errorInput)}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        onFocus={() => {
                          setSignupErrors((prev) => ({ ...prev, password: undefined }));
                        }}
                        onBlur={(e) => {
                          setSignupErrors((prev) => ({ ...prev, password: validateSignupField("password", e.target.value) }));
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword((v) => !v)}
                        className={styles.eyeButton}
                        tabIndex={-1}
                        aria-label={showSignupPassword ? "Hide password" : "Show password"}
                      >
                        <FontAwesomeIcon icon={showSignupPassword ? faEyeSlash : faEye} />
                      </button>
                    </div>
                    {signupErrors.password && (
                      <div className={styles.error}>{signupErrors.password}</div>
                    )}
                  </div>

                  {/* Terms and Conditions */}
                  <div className={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      id="termsCheckbox"
                      className={styles.checkbox}
                      checked={acceptedTerms}
                      onChange={e => {
                        setAcceptedTerms(e.target.checked);
                        if (e.target.checked) setTermsDeclinedOnce(false);
                      }}
                      {...(termsDeclinedOnce ? { required: true } : {})}
                    />
                    <label htmlFor="termsCheckbox" className={styles.checkboxLabel}>
                      I have read and agree to the{" "}
                      <button
                        type="button"
                        className={styles.termsButton}
                        onClick={() => setShowTerms(true)}
                      >
                        Terms and Conditions
                      </button>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className={styles.submitButton} 
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className={styles.buttonIcon} />
                        Signing up...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Terms and Conditions Modal */}
      {(showTerms || showTermsOnAttempt) && (
        <TermsAndConditions
          onClose={() => { setShowTerms(false); setShowTermsOnAttempt(false); }}
          onAccept={() => { setAcceptedTerms(true); setShowTerms(false); setShowTermsOnAttempt(false); setTermsDeclinedOnce(false); }}
          onDecline={() => { setAcceptedTerms(false); setShowTerms(false); setShowTermsOnAttempt(false); setTermsDeclinedOnce(true); }}
        />
      )}
    </div>
  );
}
