import React, { useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
  faSatellite,
  faCode,
  faDna,
  faDatabase,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import styles from "features/mydeck/styles/IntroductionPage.module.scss";

import { MyDeckContext } from "contexts/MyDeckContext";

const Introduction = () => {
  const navigate = useNavigate();
  const { topicId } = useParams();
  const { setTopicId } = useContext(MyDeckContext);

  useEffect(() => {
    setTopicId(topicId);
  }, [topicId, setTopicId]);

  console.log("Topic ID:", topicId);

  useEffect(() => {
    const canvas = document.getElementById("particleCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Particle animation implementation
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (
          this.x > canvas.width ||
          this.x < 0 ||
          this.y > canvas.height ||
          this.y < 0
        ) {
          this.reset();
        }
      }

      draw() {
        ctx.fillStyle = `rgba(168, 165, 230, ${this.size / 2})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles = Array(100)
      .fill()
      .map(() => new Particle());

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animate);
    }

    animate();
    return () => cancelAnimationFrame(animate);
  }, []);

  return (
    <div className={styles.container}>
      <canvas id="particleCanvas" className={styles.particleCanvas}></canvas>

      <div className={styles.content}>
        {/* Header Section with Improved Visibility */}
        <div className={styles.header}>
          <div className={styles.hologramTitle}>
            <FontAwesomeIcon icon={faRocket} className={styles.titleIcon} />
            <h1 className={styles.mainTitle}>Cosmic Variables Initiative</h1>
            <div className={styles.subtitle}>Introductory System Briefing</div>
          </div>
        </div>

        {/* Story Section with Animated Border */}
        <div className={styles.storySection}>
          <div className={styles.storyGlow}></div>
          <div className={styles.storyContent}>
            <h2>
              <FontAwesomeIcon icon={faSatellite} /> Mission Briefing
            </h2>
            <p className={styles.storyText}>
              Stardate 2347.05: You’ve just been appointed
              <em> Chief Systems Engineer</em> aboard the
              <em> SS JVM Horizon</em>, a starship heading into the vast unknown
              of the <em> Andromeda Sector </em>. Everything seemed calm until
              your first shift—then the alarms went off. The ship’s systems,
              once in perfect harmony, are now malfunctioning. Readings are
              erratic, protocols are failing, and the AI can barely keep up.
              It’s up to you to master Java’s fundamental data types and bring
              the ship back online. By properly declaring and managing
              variables, you’ll stabilize the core systems and get the crew back
              on course. The success of this mission—and the future of the
              Horizon—depends on you.
            </p>
          </div>
        </div>

        {/* Visualized Content Section */}
        <div className={styles.visualizationGrid}>
          {/* Variable Declaration Visualization */}
          <div className={styles.visCard}>
            <div className={styles.visIcon}>
              <FontAwesomeIcon icon={faCode} />
              <div className={styles.particleEffect}></div>
            </div>
            <h3>Declaring Variables</h3>
            <p>Initialize core parameters with proper Java syntax </p>
            <div className={styles.codeVisual}>
              <span>double warpFactor = 9.9;</span>
              <span>String destination = "Andromeda";</span>
            </div>
          </div>

          {/* Primitive Types Visualization */}
          <div className={styles.visCard}>
            <div className={styles.visIcon}>
              <FontAwesomeIcon icon={faDna} />
              <div className={styles.particleEffect}></div>
            </div>
            <h3>Primitive Types</h3>
            <p>Used to monitor and control essential ship metrics</p>
            <div className={styles.typeVisual}>
              <div className={styles.typeBadge}>int</div>
              <div className={styles.typeBadge}>double</div>
              <div className={styles.typeBadge}>boolean</div>
            </div>
          </div>

          {/* Non-Primitive Visualization */}
          <div className={styles.visCard}>
            <div className={styles.visIcon}>
              <FontAwesomeIcon icon={faDatabase} />
              <div className={styles.particleEffect}></div>
            </div>
            <h3>Non-Primitive Data Types</h3>
            <p>Used for handling complex starship systems and input logs</p>
            <div className={styles.typeVisual}>
              <div className={styles.typeBadge}>String</div>
              <div className={styles.typeBadge}>Array</div>
              <div className={styles.typeBadge}>Object</div>
            </div>
          </div>
        </div>

        {/* Single CTA Button with Animation */}
        <div className={styles.ctaContainer}>
          <button
            className={styles.ctaButton}
            onClick={() => navigate(`/my-deck/${topicId}`)}
          >
            <FontAwesomeIcon icon={faPlay} className={styles.ctaIcon} />
            Initialize Training Protocol
            <div className={styles.buttonGlow}></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Introduction;
