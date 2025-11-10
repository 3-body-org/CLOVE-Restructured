import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar, faTrophy, faStar, faFire, faCheckCircle, faBullseye } from "@fortawesome/free-solid-svg-icons";
import styles from "../styles/DashboardAnalytics.module.scss";
import { getTopicThemeConfig, THEME_TYPES } from "../config/topicThemeConfig";
import wizardBackgroundSvg from "../../../assets/background/WizardBackground.svg";
import detectiveBackgroundSvg from "../../../assets/background/DetectiveBackground.svg";
import spaceBackgroundSvg from "../../../assets/background/SpaceBackground.svg";

/**
 * TopicCard Component
 * Displays a topic card with themed background, progress ring, and status badge
 * Memoized for performance optimization
 */
const TopicCard = React.memo(({ topic, percentage, index }) => {
  // Memoize expensive calculations
  const { radius, circumference, offset } = useMemo(() => {
    const r = 40;
    const circ = 2 * Math.PI * r;
    const off = circ - (percentage / 100) * circ;
    return { radius: r, circumference: circ, offset: off };
  }, [percentage]);

  // Memoize theme configuration
  const theme = useMemo(() => {
    return getTopicThemeConfig(topic, percentage);
  }, [topic, percentage]);

  // Memoize background image source
  const backgroundImageSrc = useMemo(() => {
    if (theme.themeType === THEME_TYPES.WIZARD) {
      return wizardBackgroundSvg;
    } else if (theme.themeType === THEME_TYPES.DETECTIVE) {
      return detectiveBackgroundSvg;
    } else if (theme.themeType === THEME_TYPES.SPACE) {
      return spaceBackgroundSvg;
    }
    return null;
  }, [theme.themeType]);
  
  return (
    <motion.div 
      className={styles.topicCard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, type: "spring", stiffness: 150 }}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      {/* Themed SVG Background */}
      {backgroundImageSrc && (
        <img 
          src={backgroundImageSrc} 
          alt="" 
          className={styles.themeSvg}
          aria-hidden="true"
        />
      )}
      
      {/* Accent bar at top */}
      <div 
        className={styles.cardAccent}
        style={{ background: theme.bgGradient }}
      />
      
      <div className={styles.cardContent}>
        {/* Header with topic name and status */}
        <div className={styles.cardHeader}>
          <h4 className={styles.topicTitle}>{topic}</h4>
          <div 
            className={styles.statusBadge}
            style={{ 
              backgroundColor: `${theme.color}20`,
              color: theme.color,
              border: `1px solid ${theme.color}40`
            }}
          >
            <span className={styles.statusIcon}>{theme.icon}</span>
            {theme.status}
          </div>
        </div>
        
        {/* Progress ring and percentage */}
        <div className={styles.cardBody}>
          <div className={styles.progressRingContainer}>
            <svg width="100" height="100" className={styles.progressRing}>
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <motion.circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={theme.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, delay: index * 0.15 + 0.5, ease: "easeOut" }}
                style={{
                  transform: "rotate(-90deg)",
                  transformOrigin: "50% 50%",
                  filter: `drop-shadow(0 0 5px ${theme.color}70)`
                }}
              />
            </svg>
            <div className={styles.ringCenter}>
              <motion.div 
                className={styles.percentageValue}
                style={{ color: theme.color }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.15 + 1, type: "spring" }}
              >
                {percentage}%
              </motion.div>
              <div className={styles.percentageLabel}>Complete</div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className={styles.progressBarContainer}>
            <motion.div 
              className={styles.progressBar}
              style={{ background: theme.bgGradient }}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, delay: index * 0.15 + 0.3 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
});

TopicCard.displayName = 'TopicCard';

const DonutChart = ({ percentage, label, description }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  // Get color and effects based on completion
  const getTheme = (percent) => {
    if (percent === 100) return { color: '#FFD700', glow: '#FFD700', icon: faTrophy};
    if (percent >= 75) return { color: '#10b981', glow: '#10b981', icon: faFire};
    if (percent >= 50) return { color: '#f59e0b', glow: '#f59e0b', icon: faFire};
    return { color: '#8b5cf6', glow: '#8b5cf6', icon: faStar};
  };
  
  const theme = getTheme(percentage);
  
  // Parse label to get solved/total
  const [solved, total] = label.split('/').map(num => parseInt(num.trim()));
  
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <div className={styles.chartWrapper}>
      {/* Floating particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className={styles.floatingParticle}
          style={{
            left: `${20 + i * 30}%`,
            top: `${20 + (i % 3) * 30}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Sparkles for high performance - reduced for performance */}
      {percentage >= 75 && [...Array(2)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className={styles.sparkle}
        style={{
            left: `${35 + i * 30}%`,
            top: `${25 + i * 25}%`,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 1,
            ease: "easeInOut"
          }}
        >
          ✨
        </motion.div>
      ))}

      <motion.div 
        className={styles.donutChartContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Static glow ring */}
        <div 
          className={styles.glowRing}
          style={{ 
            boxShadow: `0 0 40px ${theme.glow}50, inset 0 0 40px ${theme.glow}20`
          }}
        />


        <svg viewBox="0 0 180 180" className={styles.donutChart}>
          {/* Background circle */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="16"
          />
          {/* Progress circle */}
          <motion.circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={theme.color}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "50% 50%",
              filter: `drop-shadow(0 0 10px ${theme.glow})`
            }}
          />
        </svg>
        
        <div className={styles.donutCenter}>
          <motion.div 
            className={styles.donutCenterText}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            style={{ color: theme.color }}
          >
            {percentage}%
          </motion.div>
          <motion.div 
            className={styles.donutCenterLabel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.7, duration: 0.3 }}
          >
            SOLVED
          </motion.div>
        </div>
        
        {percentage === 100 && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className={styles.confetti}
                style={{
                  left: '50%',
                  top: '50%',
                  backgroundColor: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#8b5cf6' : '#10b981'
                }}
                animate={{
                  x: [0, (Math.random() - 0.5) * 200],
                  y: [0, Math.random() * -150],
                  opacity: [1, 0],
                  rotate: [0, Math.random() * 360]
                }}
                transition={{
                  duration: 1.2,
                  delay: 1 + i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}
          </>
        )}
      </motion.div>
      
      <motion.div 
        className={styles.chartLabel}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        {description}
      </motion.div>
    </div>
  );
};

export const DashboardAnalytics = ({ progressData, challengesData }) => (
  <motion.div 
    className={styles.analyticsRow}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.4 }}
  >
    <div className={styles.card} data-joyride="progress-overview">
      <div className={styles.cardHeaderRow}>
      <h3>
        <FontAwesomeIcon icon={faChartBar} /> Progress Overview
      </h3>
      </div>
      <div className={styles.scrollContainer}>
        <div className={styles.topicCardsGrid}>
          {progressData.map((item, index) => (
            <TopicCard
              key={`${item.topic}-${index}`}
              topic={item.topic}
              percentage={item.percentage}
              index={index}
            />
          ))}
        </div>
        <div className={styles.fadeLeft}></div>
        <div className={styles.fadeRight}></div>
      </div>
    </div>

    <div className={styles.card} data-joyride="challenges-solved">
      <h3>
        <FontAwesomeIcon icon={faBullseye} /> Challenges Solved
      </h3>
      <DonutChart
        percentage={challengesData.percentage}
        label={challengesData.label}
        description={challengesData.description}
      />
    </div>
  </motion.div>
);
