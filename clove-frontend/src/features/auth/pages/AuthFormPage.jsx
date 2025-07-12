//react
import { useState, useEffect } from "react";
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
import { useAuth } from "contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import clsx from "clsx"; // for conditional classnames (optional, if available)

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
    if (signupEmail.trim() && !/\S+@\S+\.\S+/.test(signupEmail)) {
      newErrors.email = "Please enter a valid email";
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
    if (!res.success) setError(res.message);
    setFormLoading(false);
  };

  // Helper to validate login fields
  const validateLoginField = (field, value) => {
    switch (field) {
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Please enter a valid email";
        return "";
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
        if (!value.trim()) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Please enter a valid email";
        return "";
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
              onClick={() => { 
                setIsLogin(false); 
                setError(""); 
                setLoginErrors({});
                setSignupErrors({});
              }}
            >
              <p className={styles.paragraph}>Sign Up</p>
            </button>
            <button
              className={`${styles.toggleButton} ${
                isLogin ? styles.active : ""
              }`}
              onClick={() => { 
                setIsLogin(true); 
                setError(""); 
                setLoginErrors({});
                setSignupErrors({});
              }}
            >
              <p className={styles.paragraph}>Login</p>
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
                {error && (
                  <div className={styles.errorBox}>
                    <FontAwesomeIcon icon={faEyeSlash} style={{ color: "#ef4444", fontSize: 18 }} />
                    <span>{error}</span>
                  </div>
                )}
                <form onSubmit={handleLogin}>
                  <label htmlFor="login-email">Email*</label>
                  <input
                    type="email"
                    id="login-email"
                    name="email"
                    autoComplete="email"
                    placeholder="Email"
                    className={clsx(styles.formField, loginErrors.email && styles.errorField)}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    onFocus={() => {
                      // Clear error when user focuses on field
                      setLoginErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    onBlur={(e) => {
                      setLoginErrors((prev) => ({ ...prev, email: validateLoginField("email", e.target.value) }));
                    }}
                  />
                  {loginErrors.email && <div className={styles.fieldError}>{loginErrors.email}</div>}
                  <label htmlFor="login-password">Password*</label>
                  <div className={styles.relativeWrapper}>
                  <input
                      type={showPassword ? "text" : "password"}
                      id="login-password"
                      name="password"
                      autoComplete="current-password"
                    placeholder="Password"
                      className={clsx(styles.formField, loginErrors.password && styles.errorField)}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      style={{ paddingRight: 44 }}
                      onFocus={() => {
                        // Clear error when user focuses on field
                        setLoginErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      onBlur={(e) => {
                        setLoginErrors((prev) => ({ ...prev, password: validateLoginField("password", e.target.value) }));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className={styles.passwordEyeButton}
                      style={{ color: showPassword ? "#a78bfa" : "#a3a3a3" }}
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  {loginErrors.password && <div className={styles.fieldError}>{loginErrors.password}</div>}
                  <div className={styles.forgotPassword}>
                    <a
                      href="/forgot-password"
                      className={styles.forgotPassword}
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <button 
                    type="submit" 
                    className={styles.formButton} 
                    disabled={formLoading}
                  >
                    {formLoading ? "Logging in..." : "Login"}
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
                {error && (
                  <div className={styles.errorBox}>
                    <FontAwesomeIcon icon={faEyeSlash} style={{ color: "#ef4444", fontSize: 18 }} />
                    <span>{error}</span>
                  </div>
                )}
                <form onSubmit={handleSignup}>
                  <div className={styles.signupGrid}>
                    <div>
                      <label htmlFor="signup-firstName">First Name*</label>
                      <input
                        type="text"
                        id="signup-firstName"
                        name="firstName"
                        autoComplete="given-name"
                        placeholder="First Name"
                        className={clsx(styles.formField, signupErrors.firstName && styles.errorField)}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        onFocus={() => {
                          // Clear error when user focuses on field
                          setSignupErrors((prev) => ({ ...prev, firstName: undefined }));
                        }}
                        onBlur={(e) => {
                          setSignupErrors((prev) => ({ ...prev, firstName: validateSignupField("firstName", e.target.value) }));
                        }}
                      />
                      {signupErrors.firstName && <div className={styles.fieldError}>{signupErrors.firstName}</div>}
                    </div>
                    <div>
                      <label htmlFor="signup-lastName">Last Name*</label>
                      <input
                        type="text"
                        id="signup-lastName"
                        name="lastName"
                        autoComplete="family-name"
                        placeholder="Last Name"
                        className={clsx(styles.formField, signupErrors.lastName && styles.errorField)}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        onFocus={() => {
                          // Clear error when user focuses on field
                          setSignupErrors((prev) => ({ ...prev, lastName: undefined }));
                        }}
                        onBlur={(e) => {
                          setSignupErrors((prev) => ({ ...prev, lastName: validateSignupField("lastName", e.target.value) }));
                        }}
                      />
                      {signupErrors.lastName && <div className={styles.fieldError}>{signupErrors.lastName}</div>}
                    </div>
                  </div>
                  <label htmlFor="signup-birthday">Birthday*</label>
                  <input
                    type="date"
                    id="signup-birthday"
                    name="birthday"
                    autoComplete="bday"
                    className={clsx(styles.formField, styles.dateField, signupErrors.birthday && styles.errorField)}
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    max={(() => {
                      const today = new Date();
                      const minAge = 13;
                      const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
                      return maxDate.toISOString().split('T')[0];
                    })()}
                    onFocus={() => {
                      // Clear error when user focuses on field
                      setSignupErrors((prev) => ({ ...prev, birthday: undefined }));
                    }}
                    onBlur={(e) => {
                      setSignupErrors((prev) => ({ ...prev, birthday: validateSignupField("birthday", e.target.value) }));
                    }}
                  />
                  {signupErrors.birthday && <div className={styles.fieldError}>{signupErrors.birthday}</div>}
                  <label htmlFor="signup-email">Email*</label>
                  <input
                    type="email"
                    id="signup-email"
                    name="email"
                    autoComplete="email"
                    placeholder="Email"
                    className={clsx(styles.formField, signupErrors.email && styles.errorField)}
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    onFocus={() => {
                      // Clear error when user focuses on field
                      setSignupErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    onBlur={(e) => {
                      setSignupErrors((prev) => ({ ...prev, email: validateSignupField("email", e.target.value) }));
                    }}
                  />
                  {signupErrors.email && <div className={styles.fieldError}>{signupErrors.email}</div>}
                  <label htmlFor="signup-password">Password*</label>
                  <div className={styles.relativeWrapper}>
                  <input
                      type={showSignupPassword ? "text" : "password"}
                      id="signup-password"
                      name="password"
                      autoComplete="new-password"
                    placeholder="Password"
                      className={clsx(styles.formField, signupErrors.password && styles.errorField)}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      style={{ paddingRight: 44 }}
                      onFocus={() => {
                        // Clear error when user focuses on field
                        setSignupErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      onBlur={(e) => {
                        setSignupErrors((prev) => ({ ...prev, password: validateSignupField("password", e.target.value) }));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword((v) => !v)}
                      className={styles.passwordEyeButton}
                      style={{ color: showSignupPassword ? "#a78bfa" : "#a3a3a3" }}
                      tabIndex={-1}
                      aria-label={showSignupPassword ? "Hide password" : "Show password"}
                    >
                      <FontAwesomeIcon icon={showSignupPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  {signupErrors.password && <div className={styles.fieldError}>{signupErrors.password}</div>}
                  <div className={`${styles.checkboxWrapper} ${styles.relativeWrapper}`}>
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
                      I have read and agree to the {" "}
                      <button
                        type="button"
                        className={`${styles.termsLink} ${styles.termsLinkButton}`}
                        style={{ background: "none", border: "none", color: "#a78bfa", textDecoration: "underline", cursor: "pointer", padding: 0, marginLeft: 2 }}
                        onClick={() => setShowTerms(true)}
                      >
                        Terms and Conditions
                      </button>
                    </label>
                  </div>
                  <button 
                    className={styles.formButton} 
                    type="submit" 
                    disabled={formLoading}
                  >
                    {formLoading ? "Signing up..." : "Sign Up"}
                  </button>
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
