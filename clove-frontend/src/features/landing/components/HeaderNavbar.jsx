import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "features/landing/styles/HeaderNavbar.module.scss";
import CloveLogo from "assets/icons/common/icon-common-clove-logo.png";

export default function HeaderNavbar() {
  const navigate = useNavigate();

  return (
    <motion.header 
      className={styles.header}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div 
        className={styles.logoSection}
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h1 className={styles.logo}>
          CLOVE
          <motion.img 
            src={CloveLogo} 
            alt="Clover Logo" 
            className={styles.logoImg}
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          />
        </h1>
      </motion.div>
      <motion.div 
        className={styles.headerButtons}
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.button
          onClick={() =>
            navigate("/login-signup", { state: { isLogin: false } })
          }
          className={styles.signUpBtnBtn}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          Sign Up
        </motion.button>
        <motion.button
          onClick={() =>
            navigate("/login-signup", { state: { isLogin: true } })
          }
          className={styles.loginBtnBtn}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          Login
        </motion.button>
      </motion.div>
    </motion.header>
  );
} 