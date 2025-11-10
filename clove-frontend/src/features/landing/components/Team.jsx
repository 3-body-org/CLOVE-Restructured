import React from "react";
import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "features/landing/styles/Team.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { faFacebookF } from "@fortawesome/free-brands-svg-icons";

// Replace these with actual images
import teamPic1 from "assets/images/landing/image-profile-1.webp";
import teamPic2 from "assets/images/landing/image-profile-2.webp";
import teamPic3 from "assets/images/landing/image-profile-3.webp";

export default function Team() {
  return (
    <section className={styles.teamSection}>
      <div className={`container-fluid ${styles.wideContainer} text-center`}>
        {/* Top Labels */}
        <ScrollReveal animation="fadeInUp">
          <p className={styles.teamLabel}>
            🌌 REALM ARCHITECTS
          </p>
        </ScrollReveal>
        
        <ScrollReveal animation="fadeInUp" delay={0.1}>
          <h1 className={styles.teamHeading}>
            Meet the Dimensional Guardians
          </h1>
        </ScrollReveal>
        
        <ScrollReveal animation="fadeInUp" delay={0.2}>
          <p className={styles.teamSubheading}>
            The master architects who crafted the dimensional pathways and realm experiences for your journey.
          </p>
        </ScrollReveal>

        {/* Team Members */}
        <div className="row mt-5">
          {/* Member 1 */}
          <div className="col-md-4 d-flex flex-column align-items-center mb-4">
            <motion.div
              className="d-flex flex-column align-items-center"
              custom={0}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { y: 60, opacity: 0, scale: 0.9 },
                visible: (custom) => ({
                  y: 0,
                  opacity: 1,
                  scale: 1,
                  transition: {
                    duration: 0.6,
                    delay: custom * 0.2,
                    ease: "easeOut"
                  }
                })
              }}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.img
                src={teamPic1}
                alt="Kerzania Macalde"
                className={styles.teamPhoto}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
              <h3 className={styles.teamName}>Kerzania Macalde</h3>
              <p className={styles.teamRole}>⚗️ Realm Scholar</p>
              <p className={styles.teamDesc}>
                Studies traveler journeys across dimensions, mapping experience pathways and testing portal stability.
              </p>
              <div className={styles.teamIcons}>
                <motion.a
                  href="https://linkedin.com/in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.iconLink} ${styles.linkedinIcon}`}
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FontAwesomeIcon icon={faLinkedinIn} />
                </motion.a>
                <motion.a
                  href="https://x.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.iconLink} ${styles.xIcon}`}
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FontAwesomeIcon icon={faXTwitter} />
                </motion.a>
                <motion.a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.iconLink} ${styles.facebookIcon}`}
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FontAwesomeIcon icon={faFacebookF} />
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* Member 2 */}
          <div className="col-md-4 d-flex flex-column align-items-center mb-4">
            <motion.div
              className="d-flex flex-column align-items-center"
              custom={1}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { y: 60, opacity: 0, scale: 0.9 },
                visible: (custom) => ({
                  y: 0,
                  opacity: 1,
                  scale: 1,
                  transition: {
                    duration: 0.6,
                    delay: custom * 0.2,
                    ease: "easeOut"
                  }
                })
              }}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.img
                src={teamPic2}
                alt="Rexie Ryl Nadela"
                className={styles.teamPhoto}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
              <h3 className={styles.teamName}>Rexie Ryl Nadela</h3>
              <p className={styles.teamRole}>🗝️ Master Architect</p>
              <p className={styles.teamDesc}>
                Weaves the fabric between dimensions, designing the immersive realm experiences
                that transform code into adventure.
              </p>
              <div className={styles.teamIcons}>
                <motion.a
                  href="https://linkedin.com/in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.iconLink} ${styles.linkedinIcon}`}
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FontAwesomeIcon icon={faLinkedinIn} />
                </motion.a>
                <motion.a
                  href="https://x.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.iconLink} ${styles.xIcon}`}
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FontAwesomeIcon icon={faXTwitter} />
                </motion.a>
                <motion.a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.iconLink} ${styles.facebookIcon}`}
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FontAwesomeIcon icon={faFacebookF} />
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* Member 3 */}
          <div className="col-md-4 d-flex flex-column align-items-center mb-4">
            <motion.div
              className="d-flex flex-column align-items-center"
              custom={2}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { y: 60, opacity: 0, scale: 0.9 },
                visible: (custom) => ({
                  y: 0,
                  opacity: 1,
                  scale: 1,
                  transition: {
                    duration: 0.6,
                    delay: custom * 0.2,
                    ease: "easeOut"
                  }
                })
              }}
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.img
                src={teamPic3}
                alt="Michael Saymo"
                className={styles.teamPhoto}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
              <h3 className={styles.teamName}>Michael Saymo</h3>
              <p className={styles.teamRole}>⚡ Dimensional Engineer</p>
              <p className={styles.teamDesc}>
                Forges the portal gateways and adaptive enchantments,
                crafting the mystical learning systems that power each realm.
              </p>
              <div className={styles.teamIcons}>
                <motion.a
                  href="https://linkedin.com/in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.iconLink} ${styles.linkedinIcon}`}
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FontAwesomeIcon icon={faLinkedinIn} />
                </motion.a>
                <motion.a
                  href="https://x.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.iconLink} ${styles.xIcon}`}
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FontAwesomeIcon icon={faXTwitter} />
                </motion.a>
                <motion.a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.iconLink} ${styles.facebookIcon}`}
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FontAwesomeIcon icon={faFacebookF} />
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

