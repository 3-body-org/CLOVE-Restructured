import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "../../scss modules/pages/landing page/Team.module.scss";

// Replace these with actual images
import teamPic1 from "../../assets/images/flower.jpg";
import teamPic2 from "../../assets/images/flower.jpg";
import teamPic3 from "../../assets/images/flower.jpg";

export default function Team() {
  return (
    <section className={styles.teamSection}>
      <div className="container text-center">
        {/* Top Labels */}
        <p className={styles.teamLabel}>Innovators and RESEARCHERS</p>
        <h2 className={styles.teamHeading}>Our Team</h2>
        <p className={styles.teamSubheading}>
          Meet the developers driving our educational prgramming games.
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
            <p className={styles.teamRole}>Game Designer</p>
            <p className={styles.teamDesc}>
              Passionate about creating engaging learning experiences through
              innovative game design.
            </p>
            <div className={styles.teamIcons}>
              <a
                href="https://linkedin.com/in/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.iconLink}
              >
                <i className="bi bi-linkedin"></i>
              </a>
              <button
                type="button"
                className={styles.iconLink}
                onClick={() => alert("X icon clicked")}
              >
                <i className="bi bi-x"></i>
              </button>
              <button
                type="button"
                className={styles.iconLink}
                onClick={() => alert("Gear icon clicked")}
              >
                <i className="bi bi-gear"></i>
              </button>
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
                className={styles.iconLink}
              >
                <i className="bi bi-linkedin"></i>
              </a>
              <button
                type="button"
                className={styles.iconLink}
                onClick={() => alert("X icon clicked")}
              >
                <i className="bi bi-x"></i>
              </button>
              <button
                type="button"
                className={styles.iconLink}
                onClick={() => alert("Gear icon clicked")}
              >
                <i className="bi bi-gear"></i>
              </button>
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
            <p className={styles.teamRole}>UX Researcher</p>
            <p className={styles.teamDesc}>
              Focused on enhancing user experience through research and testing.
            </p>
            <div className={styles.teamIcons}>
              <a
                href="https://linkedin.com/in/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.iconLink}
              >
                <i className="bi bi-linkedin"></i>
              </a>
              <button
                type="button"
                className={styles.iconLink}
                onClick={() => alert("X icon clicked")}
              >
                <i className="bi bi-x"></i>
              </button>
              <button
                type="button"
                className={styles.iconLink}
                onClick={() => alert("Gear icon clicked")}
              >
                <i className="bi bi-gear"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
