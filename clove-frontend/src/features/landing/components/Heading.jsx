import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "features/landing/styles/Heading.module.scss";
import ImageCarousel from "./ImageCarousel";
import ScrollIndicator from "./ScrollIndicator";

export default function Heading() {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate("/login-signup", { state: { isLogin: false } });
  };

  const handleLearnMore = () => {
    const featuresSection = document.querySelector('[class*="featuresSection"]');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className={styles.page}>
      {/* ====== HERO SECTION ====== */}
      <section className={styles.hero}>
        <div className={`container-fluid ${styles.wideContainer}`}>
          <div className="row align-items-center">
            {/* Left side text */}
            <motion.div 
              className="col-md-7"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h1 
                className={styles.heroTitle}
                variants={itemVariants}
              >
                Journey Through Dimensional Realms to Master Java
              </motion.h1>
              <motion.p 
                className={styles.heroParagraph}
                variants={itemVariants}
              >
                Step through mystical portals into unique coding dimensions. 
                As a realm traveler, your path adapts with each challenge—
                explore the Wizard Academy, Noir Investigations, and Space Frontiers.
              </motion.p>
              <motion.div 
                className={styles.heroButtons}
                variants={itemVariants}
              >
                <motion.button 
                  className={styles.signUpBtn} 
                  onClick={handleRedirect}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  Begin Your Journey
                </motion.button>
                <motion.button 
                  className={styles.learnMoreBtn} 
                  onClick={handleLearnMore}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  Learn More
                </motion.button>
              </motion.div>
            </motion.div>
            {/* Right side carousel */}
            <motion.div 
              className="col-md-5 mt-4 mt-md-0 text-center"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            >
              <ImageCarousel />
            </motion.div>
          </div>
        </div>
        <ScrollIndicator />
      </section>
    </div>
  );
}
