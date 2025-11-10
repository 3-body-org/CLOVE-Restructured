    import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench, faCode, faSearchPlus, faTrophy, faClock, faBullseye } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/ChallengeModeCards.module.scss';

const ModeCard = ({ mode, stats, index }) => {
  // Mode configurations
  const modeConfig = {
    code_fixer: {
      name: 'Code Fixer',
      icon: faWrench,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: '#f59e0b',
      emoji: '🔧',
      description: 'Debug and fix broken code'
    },
    code_completion: {
      name: 'Code Completion',
      icon: faCode,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      color: '#8b5cf6',
      emoji: '💻',
      description: 'Complete missing code segments'
    },
    output_tracing: {
      name: 'Output Tracing',
      icon: faSearchPlus,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#10b981',
      emoji: '🔍',
      description: 'Trace and predict code output'
    }
  };
  
  const config = modeConfig[mode];
  const accuracy = stats?.accuracy?.[mode] || 0;
  const hoursSpent = stats?.hours_spent?.[mode] || 0;
  const completed = stats?.mode_stats?.[mode]?.completed || 0;
  const attempts = stats?.mode_stats?.[mode]?.attempts || 0;
  
  // Determine mastery level
  const getMasteryLevel = (acc) => {
    if (acc >= 90) return { name: 'Master', badge: '🏆', color: '#FFD700' };
    if (acc >= 75) return { name: 'Expert', badge: '⭐', color: '#10b981' };
    if (acc >= 50) return { name: 'Intermediate', badge: '🎯', color: '#f59e0b' };
    return { name: 'Beginner', badge: '🌱', color: '#8b5cf6' };
  };
  
  const mastery = getMasteryLevel(accuracy);
  
  // Circular progress for accuracy
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (accuracy / 100) * circumference;
  
  return (
    <motion.div 
      className={styles.modeCard}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.15, type: "spring", stiffness: 150 }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {/* Background gradient */}
      <div 
        className={styles.cardBackground}
        style={{ background: config.gradient }}
      />
      
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.modeIcon} style={{ color: config.color }}>
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
          >
            {config.emoji}
          </motion.span>
        </div>
        <div className={styles.modeInfo}>
          <h4 className={styles.modeName}>{config.name}</h4>
          <p className={styles.modeDescription}>{config.description}</p>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {/* Accuracy Ring */}
        <div className={styles.statItem}>
          <div className={styles.accuracyRing}>
            <svg width="90" height="90">
              <circle
                cx="45"
                cy="45"
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="6"
              />
              <motion.circle
                cx="45"
                cy="45"
                r={radius}
                fill="none"
                stroke={config.color}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, delay: index * 0.15 + 0.5, ease: "easeOut" }}
                style={{
                  transform: "rotate(-90deg)",
                  transformOrigin: "50% 50%",
                  filter: `drop-shadow(0 0 6px ${config.color})`
                }}
              />
            </svg>
            <div className={styles.ringCenter}>
              <div className={styles.ringValue} style={{ color: config.color }}>
                {accuracy.toFixed(0)}%
              </div>
              <div className={styles.ringLabel}>Accuracy</div>
            </div>
          </div>
        </div>
        
        {/* Other Stats */}
        <div className={styles.statsColumn}>
          <div className={styles.statBox}>
            <FontAwesomeIcon icon={faTrophy} className={styles.statIcon} style={{ color: config.color }} />
            <div className={styles.statValue}>{completed}</div>
            <div className={styles.statLabel}>Completed</div>
          </div>
          
          <div className={styles.statBox}>
            <FontAwesomeIcon icon={faClock} className={styles.statIcon} style={{ color: config.color }} />
            <div className={styles.statValue}>{hoursSpent.toFixed(1)}h</div>
            <div className={styles.statLabel}>Time Spent</div>
          </div>
          
          <div className={styles.statBox}>
            <FontAwesomeIcon icon={faBullseye} className={styles.statIcon} style={{ color: config.color }} />
            <div className={styles.statValue}>{attempts}</div>
            <div className={styles.statLabel}>Attempts</div>
          </div>
        </div>
      </div>
      
      {/* Mastery Badge */}
      <motion.div 
        className={styles.masteryBadge}
        style={{ 
          background: `linear-gradient(135deg, ${mastery.color}, ${mastery.color}dd)`,
          boxShadow: `0 4px 12px ${mastery.color}55`
        }}
        whileHover={{ scale: 1.1 }}
        animate={accuracy >= 90 ? {
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className={styles.masteryIcon}>{mastery.badge}</span>
        <span className={styles.masteryText}>{mastery.name}</span>
      </motion.div>
      
      {/* Particles for high accuracy */}
      {accuracy >= 75 && (
        <div className={styles.particles}>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className={styles.particle}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 20}%`,
                backgroundColor: config.color
              }}
              animate={{
                y: [-10, -30, -10],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.6
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

const ChallengeModeCards = ({ stats }) => {
  const modes = ['code_fixer', 'code_completion', 'output_tracing'];
  
  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.sectionHeader}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className={styles.title}>
          <FontAwesomeIcon icon={faTrophy} /> Challenge Modes Performance
        </h3>
        <p className={styles.subtitle}>Track your progress across different challenge types</p>
      </motion.div>
      
      <div className={styles.cardsGrid}>
        {modes.map((mode, index) => (
          <ModeCard 
            key={mode}
            mode={mode}
            stats={stats}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default ChallengeModeCards;

