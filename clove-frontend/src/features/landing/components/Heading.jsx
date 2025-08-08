import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "features/landing/styles/Heading.module.scss";
import tempPic from "assets/images/landing/image-landing-flowers.jpg";
import CloveLogo from "assets/icons/common/icon-common-clove-logo.png";

export default function Heading() {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate("/login-signup", { state: { isLogin: false } });
  };

  return (
    <div className={styles.page}>
      {/* ====== HEADER ====== */}
      <header className={styles.header}>
        <div className={styles.logoSection}>
          <h1 className={styles.logo}>
            CLOVE
            <img src={CloveLogo} alt="Clover Logo" className={styles.logoImg} />
          </h1>
        </div>
        <div className={styles.headerButtons}>
          <button
            onClick={() =>
              navigate("/login-signup", { state: { isLogin: false } })
            }
            className={styles.signUpBtnBtn}
          >
            Sign Up
          </button>
          <button
            onClick={() =>
              navigate("/login-signup", { state: { isLogin: true } })
            }
            className={styles.loginBtnBtn}
          >
            Login
          </button>
        </div>
      </header>

      {/* ====== HERO SECTION ====== */}
      <section className={styles.hero}>
        <div className="container">
          <div className="row align-items-center">
            {/* Left side text */}
            <div className="col-md-6">
              <h1 className={styles.heroTitle}>
                Transform Learning with Interactive Educational Games
              </h1>
              <p className={styles.heroParagraph}>
                Discover how educational games can revolutionize learning by
                making it engaging and personalized. Our innovative approach
                combines advanced technologies to adapt to each learner's unique
                needs.
              </p>
              <div className={styles.heroButtons}>
                <button className={styles.learnMoreBtn}>Learn More</button>
                <button className={styles.signUpBtn} onClick={handleRedirect}>
                  Sign Up
                </button>
              </div>
            </div>
            {/* Right side image */}
            <div className="col-md-6 mt-4 mt-md-0 text-center">
              <img
                src={tempPic}
                className={styles.heroImg}
                alt="Large visual"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
