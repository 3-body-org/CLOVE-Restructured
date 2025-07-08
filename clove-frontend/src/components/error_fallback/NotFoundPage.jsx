import React from "react";
import styles from "./styles/NotFoundPage.module.scss";
import { useNavigate } from "react-router-dom";
import { useAuth } from "contexts/AuthContext";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const handleGoHome = () => {
    if (user || token) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <div className={styles.notFoundContainer}>
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for does not exist or has been moved.</p>
      <button className={styles.homeButton} onClick={handleGoHome}>Go to Home</button>
    </div>
  );
};

export default NotFoundPage; 