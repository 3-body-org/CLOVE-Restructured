import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "features/landing/styles/HeaderNavbar.module.scss";
import CloveLogo from "assets/icons/common/icon-common-clove-logo.png";

export default function HeaderNavbar() {
  const navigate = useNavigate();

  return (
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
  );
} 