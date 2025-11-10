import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faTrophy, faBolt, faGem, faMedal, faCrown, faCompass, faMap, faRoute, faMountain } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/LevelXPBar.module.scss';

const LevelXPBar = ({ totalPoints = 0 }) => {
  const [displayPoints, setDisplayPoints] = useState(0);
  
  // Tier thresholds based on actual challenge points (6,075 total)
  const tiers = [
    { rank: 'Bronze', title: 'Wanderer', min: 0, max: 500, icon: faCompass, color: '#CD7F32' },
    { rank: 'Silver', title: 'Explorer', min: 501, max: 1200, icon: faMap, color: '#C0C0C0' },
    { rank: 'Gold', title: 'Adventurer', min: 1201, max: 2100, icon: faTrophy, color: '#FFD700' },
    { rank: 'Platinum', title: 'Pathfinder', min: 2101, max: 3150, icon: faRoute, color: '#E5E4E2' },
    { rank: 'Diamond', title: 'Vanguard', min: 3151, max: 4300, icon: faGem, color: '#B9F2FF' },
    { rank: 'Titanium', title: 'Trailblazer', min: 4301, max: 5550, icon: faMountain, color: '#B4B4CD' },
    { rank: 'Mithril', title: 'Legend', min: 5551, max: 6075, icon: faCrown, color: '#FFD700' }
  ];
  
  // Find current tier
  const getCurrentTier = (points) => {
    return tiers.find(tier => points >= tier.min && points <= tier.max) || tiers[0];
  };
  
  const currentTier = getCurrentTier(totalPoints);
  const tierIndex = tiers.indexOf(currentTier);
  const nextTier = tierIndex < tiers.length - 1 ? tiers[tierIndex + 1] : null;
  
  // Calculate progress within current tier
  const tierRange = currentTier.max - currentTier.min;
  const tierProgress = totalPoints - currentTier.min;
  const progressPercent = (tierProgress / tierRange) * 100;
  const pointsToNextTier = nextTier ? nextTier.min - totalPoints : 0;
  
  // Animated counter effect
  useEffect(() => {
    let start = 0;
    const end = totalPoints;
    const duration = 2000; // 2 seconds
    const increment = Math.ceil(end / (duration / 16)); // 60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayPoints(end);
        clearInterval(timer);
      } else {
        setDisplayPoints(start);
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [totalPoints]);
  
  return (
    <motion.div 
      className={styles.levelXPContainer}
      data-joyride="level-xp-bar"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className={styles.levelBadge} style={{ borderColor: currentTier.color }}>
        <div className={styles.levelNumber}>
          <FontAwesomeIcon icon={currentTier.icon} className={styles.levelIcon} style={{ color: currentTier.color }} />
          <span style={{ color: currentTier.color, fontSize: '1.5rem', fontWeight: 900 }}>{tierIndex + 1}</span>
        </div>
        <div className={styles.levelTier} style={{ color: currentTier.color }}>
          {currentTier.rank}
        </div>
      </div>
      
      <div className={styles.xpSection}>
        <div className={styles.xpHeader}>
          <div className={styles.xpTitle}>
            <span className={styles.realmPower} style={{ color: currentTier.color }}>
              ⚡ {currentTier.title}
            </span>
            <motion.span 
              className={styles.totalPoints}
              key={displayPoints}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {displayPoints.toLocaleString()} pts
            </motion.span>
          </div>
          <div className={styles.levelInfo}>
            {nextTier ? (
              <>
                {currentTier.rank} → {nextTier.rank} 
                <span className={styles.pointsNeeded}>({pointsToNextTier} pts to {nextTier.title})</span>
              </>
            ) : (
              <>
                {currentTier.rank} <span className={styles.pointsNeeded}>(Max Tier Reached! 👑)</span>
              </>
            )}
          </div>
        </div>
        
        <div className={styles.xpBarContainer}>
          <motion.div 
            className={styles.xpBar}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ 
              background: `linear-gradient(90deg, ${currentTier.color}, ${currentTier.color}dd)`,
              boxShadow: `0 0 20px ${currentTier.color}55`
            }}
          >
            <div className={styles.xpBarGlow}></div>
            <div className={styles.xpBarShine}></div>
          </motion.div>
          <div className={styles.xpBarText}>
            {tierProgress.toLocaleString()} / {tierRange.toLocaleString()} XP
          </div>
        </div>
        
        {/* Particle effects */}
        <div className={styles.particles}>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className={styles.particle}
              style={{ 
                left: `${20 + i * 15}%`,
                backgroundColor: currentTier.color
              }}
              animate={{
                y: [-10, -30, -10],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default LevelXPBar;

