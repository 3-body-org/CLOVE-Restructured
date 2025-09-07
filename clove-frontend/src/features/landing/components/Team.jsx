import React from "react";
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
        <p className={styles.teamLabel}>INNOVATORS AND RESEARCHERS</p>
        <h1 className={styles.teamHeading}>Our Team</h1>
        <p className={styles.teamSubheading}>
          Meet the developers driving our educational programming games.
        </p>

        {/* Team Members */}
        <div className="row mt-5">
          {/* Member 1 */}
          <div className="col-md-4 d-flex flex-column align-items-center mb-4">
            <img
              src={teamPic1}
              alt="Kerzania Macalde"
              className={styles.teamPhoto}
            />
            <h3 className={styles.teamName}>Kerzania Macalde</h3>
            <p className={styles.teamRole}>Researcher</p>
            <p className={styles.teamDesc}>
              Focused on enhancing user experience through research and testing.
            </p>
            <div className={styles.teamIcons}>
              <a
                href="https://linkedin.com/in/"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.iconLink} ${styles.linkedinIcon}`}
              >
                <FontAwesomeIcon icon={faLinkedinIn} />
              </a>
              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.iconLink} ${styles.xIcon}`}
              >
                <FontAwesomeIcon icon={faXTwitter} />
              </a>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.iconLink} ${styles.facebookIcon}`}
              >
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
            </div>
          </div>

          {/* Member 2 */}
          <div className="col-md-4 d-flex flex-column align-items-center mb-4">
            <img
              src={teamPic2}
              alt="Rexie Ryl Nadela"
              className={styles.teamPhoto}
            />
            <h3 className={styles.teamName}>Rexie Ryl Nadela</h3>
            <p className={styles.teamRole}>Project Leader</p>
            <p className={styles.teamDesc}>
              Passionate about creating engaging learning experiences through
              innovative game design.
            </p>
            <div className={styles.teamIcons}>
              <a
                href="https://linkedin.com/in/"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.iconLink} ${styles.linkedinIcon}`}
              >
                <FontAwesomeIcon icon={faLinkedinIn} />
              </a>
              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.iconLink} ${styles.xIcon}`}
              >
                <FontAwesomeIcon icon={faXTwitter} />
              </a>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.iconLink} ${styles.facebookIcon}`}
              >
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
            </div>
          </div>

          {/* Member 3 */}
          <div className="col-md-4 d-flex flex-column align-items-center mb-4">
            <img
              src={teamPic3}
              alt="Michael Saymo"
              className={styles.teamPhoto}
            />
            <h3 className={styles.teamName}>Michael Saymo</h3>
            <p className={styles.teamRole}>Lead Developer</p>
            <p className={styles.teamDesc}>
              Expert in coding and developing adaptive learning technologies for
              education.
            </p>
            <div className={styles.teamIcons}>
              <a
                href="https://linkedin.com/in/"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.iconLink} ${styles.linkedinIcon}`}
              >
                <FontAwesomeIcon icon={faLinkedinIn} />
              </a>
              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.iconLink} ${styles.xIcon}`}
              >
                <FontAwesomeIcon icon={faXTwitter} />
              </a>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.iconLink} ${styles.facebookIcon}`}
              >
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
