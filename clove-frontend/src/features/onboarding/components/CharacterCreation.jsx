import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import CosmicBackground from './CosmicBackground';
import { createRippleEffect } from '../utils/rippleEffect';
import { travelerClasses } from '../content/travelerClasses';
import '../styles/CharacterCreation.scss';

const CharacterCreation = ({ onNext, onBack, characterData }) => {
  const { user } = useAuth();
  const [travelerName, setTravelerName] = useState(characterData?.name || '');
  const [travelerClass, setTravelerClass] = useState(characterData?.class || null);
  const [hoveredClass, setHoveredClass] = useState(null);
  
  // Set default username as placeholder when component mounts (only once)
  useEffect(() => {
    if (user?.username && travelerName === '') {
      setTravelerName(user.username);
    }
  }, [user?.username]); // Remove travelerName from dependencies
  
  // Update state when characterData changes (when going back)
  useEffect(() => {
    if (characterData?.name) {
      setTravelerName(characterData.name);
    }
    if (characterData?.class) {
      setTravelerClass(characterData.class);
    }
  }, [characterData]);

  const handleClassSelect = (cls, event) => {
    setTravelerClass(cls.id);
    createRippleEffect(event.currentTarget, event, cls.color);
  };

  const handleContinue = () => {
    if (travelerName.trim() && travelerClass) {
      const classData = travelerClasses.find(cls => cls.id === travelerClass);
      onNext({
        name: travelerName.trim(),
        class: travelerClass,
        classData: classData
      });
    }
  };

  return (
    <motion.div 
      className="character-creation"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
    >
      <CosmicBackground />
      
      <div className="creation-content">
        <motion.div
          className="creation-header"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
            <h2>Who Are You?</h2>
            <p>Select the type that best describes your personality and approach to coding</p>
        </motion.div>
        
        <div className="creation-form">
          <motion.div
            className="name-input-section"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="input-group">
              <label htmlFor="traveler-name">
                <div className="label-main">
                  <span className="label-icon">✍️</span>
                  What shall we call you, traveler?
                </div>
                {user?.username && (
                  <span className="label-hint">(This will become your username)</span>
                )}
              </label>
              <div className="input-container">
                <input
                  id="traveler-name"
                  type="text"
                  value={travelerName}
                  onChange={(e) => setTravelerName(e.target.value)}
                  placeholder={user?.username && "Enter your traveler name..."}
                  maxLength={20}
                  className={travelerName.trim() ? 'has-value' : ''}
                  autoFocus
                  onFocus={(e) => {
                    // If the field contains the default username, select all text for easy editing
                    if (travelerName === user?.username) {
                      e.target.select();
                    }
                  }}
                />
                <div className="input-glow"></div>
              </div>
              {travelerName.trim() && (
                <motion.div
                  className="name-preview"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <span>Welcome, <strong>{travelerName.trim()}</strong>! ✨</span>
                </motion.div>
              )}
            </div>
          </motion.div>
          
          <motion.div
            className="class-selection-section"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3>
              <span className="section-icon">⚔️</span>
              What Best Describes You?
            </h3>
            <p className="section-description">
              Select the personality type that resonates most with your approach to coding
            </p>
            
            <div className="class-cards">
              {travelerClasses.map((cls, index) => {
                const isHovered = hoveredClass === cls.id;
                const isSelected = travelerClass === cls.id;
                const isOtherHovered = hoveredClass && hoveredClass !== cls.id;
                
                return (
                  <motion.div
                    key={cls.id}
                    className={`class-card ${isSelected ? 'selected' : ''}`}
                    style={{ '--class-color': cls.color, '--class-bg': cls.bgGradient }}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ 
                      y: 0, 
                      opacity: 1,
                      scale: isOtherHovered ? 0.9 : 1,
                      x: isOtherHovered ? (index < travelerClasses.findIndex(c => c.id === hoveredClass) ? -20 : 20) : 0,
                      transition: { 
                        duration: 0.15,
                        ease: "easeOut"
                      }
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => handleClassSelect(cls, e)}
                    onMouseEnter={() => setHoveredClass(cls.id)}
                    onMouseLeave={() => setHoveredClass(null)}
                  >
                  <div className="class-card-background"></div>
                  
                  <div className="class-header">
                    <div className="class-icon">{cls.icon}</div>
                    <h4 className="class-name">{cls.name}</h4>
                  </div>
                  
                  <p className="class-description">{cls.description}</p>
                  
                  <div className="class-abilities">
                    <h5>Key Strengths:</h5>
                    <div className="abilities-list">
                      {cls.abilities.map((ability, abilityIndex) => (
                        <span
                          key={abilityIndex}
                          className="ability-tag"
                        >
                          {ability}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                    <div className="class-selector">
                      <div className="selector-ring"></div>
                      <div className="selector-check">✓</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
        
        <motion.div
          className="creation-actions"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.button
            className="back-btn"
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>← Back</span>
          </motion.button>
          
          <motion.button
            className={`continue-btn ${travelerName.trim() && travelerClass ? 'enabled' : 'disabled'}`}
            disabled={!travelerName.trim() || !travelerClass}
            onClick={handleContinue}
            whileHover={travelerName.trim() && travelerClass ? { scale: 1.05 } : {}}
            whileTap={travelerName.trim() && travelerClass ? { scale: 0.95 } : {}}
          >
            <span>Continue Journey</span>
            <span className="btn-arrow">→</span>
          </motion.button>
        </motion.div>
      </div>
      
    </motion.div>
  );
};

export default CharacterCreation;
