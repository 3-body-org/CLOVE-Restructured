import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faLock, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/AchievementBadges.module.scss';
import { ACHIEVEMENT_DEFINITIONS, RARITY_CONFIG, ANIMATION_CONFIG } from '../config/achievementConfig';

const AchievementBadge = React.memo(({ achievement, index }) => {
  const { id, name, description, icon, unlocked, progress, maxProgress, rarity } = achievement;
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [particles, setParticles] = useState([]);
  
  const config = useMemo(() => RARITY_CONFIG[rarity] || RARITY_CONFIG.common, [rarity]);
  const progressPercent = useMemo(() => (progress / maxProgress) * 100, [progress, maxProgress]);

  const handleClick = useCallback(() => {
    if (unlocked) {
      // Create ripple effect
      const newRipple = { id: Date.now() };
      setRipples(prev => [...prev, newRipple]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 800);
      
      // Create celebration particles
      const newParticles = Array.from({ length: ANIMATION_CONFIG.CELEBRATION_PARTICLE_COUNT }, (_, i) => ({
        id: Date.now() + i,
        angle: (i * 30) * (Math.PI / 180),
        color: i % 2 === 0 ? config.particle : '#ffffff'
      }));
      setParticles(newParticles);
      setTimeout(() => {
        setParticles([]);
      }, 1000);
    }
  }, [unlocked, config.particle]);
  
  return (
    <motion.div
      className={`${styles.badgeWrapper} ${unlocked ? styles.unlocked : styles.locked}`}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 150 }}
    >
      <motion.div
        className={styles.badge}
        onClick={handleClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: unlocked ? 1.03 : 1, y: unlocked ? -8 : 0 }}
        whileTap={{ scale: unlocked ? 0.98 : 1 }}
        transition={{ duration: 0.3 }}
        style={{
          cursor: unlocked ? 'pointer' : 'default'
        }}
      >
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className={styles.ripple}
            style={{ background: config.gradient }}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        ))}

        {/* Celebration particles */}
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className={styles.particle}
            style={{ backgroundColor: particle.color }}
            initial={{ 
              x: 0, 
              y: 0, 
              opacity: 1, 
              scale: 1 
            }}
            animate={{
              x: Math.cos(particle.angle) * 100,
              y: Math.sin(particle.angle) * 100,
              opacity: 0,
              scale: 0
            }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        ))}

        {/* Floating particles on hover */}
        {isHovered && unlocked && [...Array(ANIMATION_CONFIG.FLOATING_PARTICLE_COUNT)].map((_, i) => (
          <motion.div
            key={`hover-particle-${i}`}
            className={styles.floatingParticle}
            style={{
              backgroundColor: config.particle,
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.sin(i) * 10, 0],
              opacity: [0.4, 0.8, 0.4],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + i * 0.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Card Content */}
        <div className={styles.cardFace}>
          {/* Badge Icon */}
          <div 
            className={styles.iconContainer}
            style={unlocked ? { background: config.gradient } : {}}
          >
            <motion.div
              animate={unlocked ? {
                rotate: isHovered ? [0, 15, -15, 0] : [0, 10, -10, 0],
                scale: isHovered ? [1, 1.2, 1] : [1, 1.1, 1]
              } : {}}
              transition={{ duration: isHovered ? 1.5 : 2, repeat: Infinity, delay: index * 0.3 }}
            >
              {unlocked ? (
                <span className={styles.icon}>{icon}</span>
              ) : (
                <FontAwesomeIcon icon={faLock} className={styles.lockIcon} />
              )}
            </motion.div>
          </div>
          
          {/* Badge Info */}
          <div className={styles.badgeInfo}>
            <div className={styles.badgeName} style={unlocked ? { color: config.color } : {}}>
              {name}
            </div>
            <div className={styles.badgeDescription}>{description}</div>
            
            {/* Progress Bar */}
            {!unlocked && maxProgress > 0 && (
              <div className={styles.progressBar}>
                <motion.div 
                  className={styles.progressFill}
                  style={{ background: config.gradient }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                />
                <div className={styles.progressText}>
                  {progress} / {maxProgress}
                </div>
              </div>
            )}
            
            {/* Rarity Badge */}
            <div 
              className={styles.rarityBadge}
              style={unlocked ? { 
                background: config.gradient,
                boxShadow: `0 2px 8px ${config.glow}`
              } : {}}
            >
              {rarity.toUpperCase()}
            </div>
          </div>
        </div>
        
        {/* Sparkles for legendary */}
        {unlocked && rarity === 'legendary' && (
          <div className={styles.sparkles}>
            {[...Array(ANIMATION_CONFIG.SPARKLE_COUNT)].map((_, i) => (
              <motion.div
                key={i}
                className={styles.sparkle}
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${15 + (i % 3) * 30}%`
                }}
                animate={{
                  scale: [0, 1.2, 0],
                  opacity: [0, 1, 0],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.25
                }}
              >
                ✨
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
});
AchievementBadge.displayName = 'AchievementBadge';

// Floating Trophy Component - Optimized for performance with CSS animation
const FloatingTrophy = React.memo(({ index, left, top }) => {
  return (
    <div
      className={styles.floatingTrophy}
      style={{
        left: `${left}%`,
        top: `${top}%`,
        animationDelay: `${index * 0.3}s`,
      }}
    >
      <FontAwesomeIcon icon={faTrophy} />
    </div>
  );
});
FloatingTrophy.displayName = 'FloatingTrophy';

const AchievementBadges = ({ stats, topicProgress }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);
  // Calculate achievements based on user stats - Memoized
  const achievements = useMemo(() => {
    const achievementsList = [];
    
    // Streak achievements
    const currentStreak = stats?.current_streak || 0;
    const streakDefs = ACHIEVEMENT_DEFINITIONS.STREAK;
    Object.keys(streakDefs).forEach(key => {
      const def = streakDefs[key];
      achievementsList.push({
        id: `streak_${def.threshold}`,
        name: def.name,
        description: def.description,
        icon: def.icon,
        unlocked: currentStreak >= def.threshold,
        progress: Math.min(currentStreak, def.threshold),
        maxProgress: def.threshold,
        rarity: def.rarity,
        unlockedDate: currentStreak >= def.threshold ? 'Recently' : null
      });
    });
    
    // Challenge achievements
    const totalChallenges = stats?.total_challenges_solved || 0;
    const challengeDefs = ACHIEVEMENT_DEFINITIONS.CHALLENGES;
    Object.keys(challengeDefs).forEach(key => {
      const def = challengeDefs[key];
      achievementsList.push({
        id: `challenges_${def.threshold}`,
        name: def.name,
        description: def.description,
        icon: def.icon,
        unlocked: totalChallenges >= def.threshold,
        progress: Math.min(totalChallenges, def.threshold),
        maxProgress: def.threshold,
        rarity: def.rarity,
        unlockedDate: totalChallenges >= def.threshold ? 'Recently' : null
      });
    });
    
    // Topic completion achievements
    const completedTopics = topicProgress?.filter(t => t.progress === 1).length || 0;
    const topicDefs = ACHIEVEMENT_DEFINITIONS.TOPICS;
    Object.keys(topicDefs).forEach(key => {
      const def = topicDefs[key];
      achievementsList.push({
        id: `topics_${def.threshold === 3 ? 'all' : def.threshold}`,
        name: def.name,
        description: def.description,
        icon: def.icon,
        unlocked: completedTopics >= def.threshold,
        progress: Math.min(completedTopics, def.threshold),
        maxProgress: def.threshold,
        rarity: def.rarity,
        unlockedDate: completedTopics >= def.threshold ? 'Recently' : null
      });
    });
    
    // Accuracy achievements
    const avgAccuracy = stats?.accuracy ? 
      (stats.accuracy.code_fixer + stats.accuracy.code_completion + stats.accuracy.output_tracing) / 3 : 0;
    const accuracyDefs = ACHIEVEMENT_DEFINITIONS.ACCURACY;
    Object.keys(accuracyDefs).forEach(key => {
      const def = accuracyDefs[key];
      achievementsList.push({
        id: `accuracy_${def.threshold}`,
        name: def.name,
        description: def.description,
        icon: def.icon,
        unlocked: avgAccuracy >= def.threshold,
        progress: Math.min(Math.floor(avgAccuracy), def.threshold),
        maxProgress: def.threshold,
        rarity: def.rarity,
        unlockedDate: avgAccuracy >= def.threshold ? 'Recently' : null
      });
    });
    
    return achievementsList;
  }, [stats, topicProgress]);
  
  const unlockedCount = useMemo(() => 
    achievements.filter(a => a.unlocked).length,
    [achievements]
  );

  // Memoize trophy positions
  const trophyPositions = useMemo(() => {
    return Array.from({ length: ANIMATION_CONFIG.TROPHY_COUNT }, (_, i) => ({
      index: i,
      left: 10 + (i * 15) + Math.random() * 5,
      top: 10 + (i % 3) * 30 + Math.random() * 10
    }));
  }, []);
  
  return (
    <div className={styles.container}>
      {/* Animated background patterns */}
      <div className={styles.backgroundPatterns}>
        {/* Hexagon grid - Reduced for performance */}
        {[...Array(Math.floor(ANIMATION_CONFIG.HEXAGON_COUNT / 2))].map((_, i) => (
          <div
            key={`hex-${i}`}
            className={styles.hexagon}
            style={{
              left: `${(i % 3) * 30 + 15}%`,
              top: `${Math.floor(i / 3) * 30 + 15}%`,
            }}
          />
        ))}
        
        {/* Floating trophies - Replaced stars - Reduced count */}
        {trophyPositions.slice(0, Math.floor(ANIMATION_CONFIG.TROPHY_COUNT / 2)).map(({ index, left, top }) => (
          <FloatingTrophy key={`trophy-${index}`} index={index} left={left} top={top} />
        ))}
        
        {/* Gradient orbs - Reduced for performance - Static */}
        {[...Array(Math.floor(ANIMATION_CONFIG.ORB_COUNT / 2))].map((_, i) => (
          <div
            key={`orb-${i}`}
            className={styles.gradientOrb}
            style={{
              left: `${i * 40 + 20}%`,
              top: `${i % 2 === 0 ? 25 : 55}%`,
            }}
          />
        ))}
      </div>

      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h3 
            className={styles.title}
            onClick={toggleExpanded}
            style={{ cursor: 'pointer' }}
          >
            <FontAwesomeIcon icon={faTrophy} />
            Achievements
          </h3>
          <motion.div
            className={styles.chevron}
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            onClick={toggleExpanded}
            style={{ cursor: 'pointer' }}
          >
            <FontAwesomeIcon icon={faChevronDown} />
          </motion.div>
        </div>
        <div className={styles.progressBarWrapper}>
          <div className={styles.progressBarContainer}>
            <div 
              className={styles.progressBarFill}
              style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
            />
            {/* Progress indicator text - Centered on progress bar */}
            <span className={styles.progressBarText}>
              {unlockedCount} / {achievements.length}
            </span>
          </div>
        </div>
      </div>
      
      {/* Collapsible badges grid */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className={styles.badgesGrid}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: 'hidden' }}
          >
            {achievements.map((achievement, index) => (
              <AchievementBadge 
                key={achievement.id}
                achievement={achievement}
                index={index}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AchievementBadges;

