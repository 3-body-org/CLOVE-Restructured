import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faBolt, faStar } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/EnhancedStreak.module.scss';

const StreakDay = ({ day, filled, date, isToday }) => {
  return (
    <motion.div 
      className={`${styles.day} ${filled ? styles.streakFilled : ''} ${isToday ? styles.today : ''}`}
      whileHover={{ scale: 1.1, y: -3 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25, duration: 0.3 }}
    >
      {day}
      {filled && (
        <div className={styles.dayGlow} />
      )}
      
      {/* Tooltip */}
      {date && (
        <div className={styles.tooltip}>
          {isToday ? 'Today!' : date}
        </div>
      )}
    </motion.div>
  );
};

const EnhancedStreak = ({ currentStreak = 0, loginDaysThisWeek = [], stats }) => {
  const streakDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const today = new Date().getDay(); // 0=Sunday, 1=Monday, etc
  const todayIndex = today === 0 ? 6 : today - 1; // Convert to 0=Monday
  
  // Determine streak level and icon
  const getStreakLevel = (streak) => {
    if (streak >= 30) return { 
      level: 'legendary', 
      icon: faBolt, 
      color: '#3B82F6', 
      title: '🔥🔥🔥 Legendary Streak!',
      message: "You're unstoppable! 30+ day streak!"
    };
    if (streak >= 10) return { 
      level: 'hot', 
      icon: faFire, 
      color: '#FF6B35', 
      title: '🔥🔥 On Fire!',
      message: "Amazing! Keep that momentum going!"
    };
    if (streak >= 3) return { 
      level: 'warming', 
      icon: faFire, 
      color: '#FFD93D', 
      title: '🔥 Getting Hot!',
      message: "You're building great habits!"
    };
    return { 
      level: 'starter', 
      icon: faStar, 
      color: '#8B5CF6', 
      title: '✨ Starting Strong!',
      message: "Keep logging in to build your streak!"
    };
  };
  
  const streakInfo = getStreakLevel(currentStreak);
  
  // Get dates for tooltip
  const getDayDate = (dayIndex) => {
    const date = new Date();
    const currentDay = date.getDay() === 0 ? 6 : date.getDay() - 1;
    const diff = dayIndex - currentDay;
    date.setDate(date.getDate() + diff);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return (
    <div className={styles.streakContainer}>
      {/* Streak Header with animated fire */}
      <div className={styles.streakHeader}>
        <motion.div 
          className={styles.fireIconContainer}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <FontAwesomeIcon 
            icon={streakInfo.icon} 
            className={`${styles.fireIcon} ${styles[streakInfo.level]}`}
            style={{ color: streakInfo.color }}
          />
          {currentStreak >= 3 && (
            <motion.div 
              className={styles.fireGlow}
              style={{ backgroundColor: streakInfo.color }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.3, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>
        
        <div className={styles.streakInfo}>
          <motion.div 
            className={styles.streakCount}
            key={currentStreak}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <span className={styles.streakNumber} style={{ color: streakInfo.color }}>
              {currentStreak}
            </span>
            <span className={styles.streakLabel}>Day Streak</span>
          </motion.div>
          <div className={styles.streakMessage}>{streakInfo.message}</div>
        </div>
      </div>
      
      {/* Week Calendar */}
      <div className={styles.weekCalendar}>
        <div className={styles.calendarLabel}>This Week</div>
        <div className={styles.days}>
          {streakDays.map((day, index) => (
            <StreakDay 
              key={day} 
              day={day} 
              filled={loginDaysThisWeek.includes(index)}
              date={getDayDate(index)}
              isToday={index === todayIndex}
            />
          ))}
        </div>
        
        {/* Connection Trail */}
        <svg className={styles.connectionTrail} viewBox="0 0 280 50">
          {loginDaysThisWeek.map((dayIndex, i) => {
            if (i === loginDaysThisWeek.length - 1) return null;
            const nextIndex = loginDaysThisWeek[i + 1];
            if (nextIndex - dayIndex === 1) {
              return (
                <motion.line
                  key={`${dayIndex}-${nextIndex}`}
                  x1={dayIndex * 40 + 36}
                  y1={16}
                  x2={nextIndex * 40 + 4}
                  y2={16}
                  stroke={streakInfo.color}
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                />
              );
            }
            return null;
          })}
        </svg>
      </div>
      
      {/* Streak Milestones */}
      {currentStreak > 0 && (
        <div className={styles.milestones}>
          <div className={`${styles.milestone} ${currentStreak >= 3 ? styles.achieved : ''}`}>
            <span className={styles.milestoneIcon}>🔥</span>
            <span className={styles.milestoneText}>3 Days</span>
          </div>
          <div className={`${styles.milestone} ${currentStreak >= 7 ? styles.achieved : ''}`}>
            <span className={styles.milestoneIcon}>🔥🔥</span>
            <span className={styles.milestoneText}>Week</span>
          </div>
          <div className={`${styles.milestone} ${currentStreak >= 30 ? styles.achieved : ''}`}>
            <span className={styles.milestoneIcon}>⚡</span>
            <span className={styles.milestoneText}>Month</span>
          </div>
        </div>
      )}
      
      {/* Particles for high streaks */}
      {currentStreak >= 7 && (
        <div className={styles.particles}>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className={styles.particle}
              style={{ 
                left: `${10 + i * 12}%`,
                backgroundColor: streakInfo.color
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedStreak;

