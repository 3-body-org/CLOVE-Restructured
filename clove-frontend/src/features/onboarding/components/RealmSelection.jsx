import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CosmicBackground from './CosmicBackground';
import ThemeBackground from './ThemeBackground';
import { createRippleEffect } from '../utils/rippleEffect';
import { getRealms } from '../content/realms';
import '../styles/RealmSelection.scss';

// Preview Components
const WizardAcademyPreview = () => (
  <div className="wizard-preview">
    <div className="wizard-tower">🏰</div>
  </div>
);

const DetectiveAgencyPreview = () => (
  <div className="detective-preview">
    <div className="city-skyline">🏙️</div>
  </div>
);

const SpaceStationPreview = () => (
  <div className="space-preview">
    <div className="space-station">🚀</div>
  </div>
);

const RealmSelection = ({ onNext, onBack, characterData, realmData }) => {
  const [selectedRealm, setSelectedRealm] = useState(realmData || null);
  const [hoveredRealm, setHoveredRealm] = useState(null);
  
  // Update state when realmData changes (when going back)
  useEffect(() => {
    if (realmData) {
      setSelectedRealm(realmData);
    }
  }, [realmData]);
  
  // Get realms with preview components
  const realms = getRealms({
    WizardAcademyPreview: <WizardAcademyPreview />,
    DetectiveAgencyPreview: <DetectiveAgencyPreview />,
    SpaceStationPreview: <SpaceStationPreview />
  });

  const handleRealmSelect = (realm, event) => {
    setSelectedRealm(realm);
    createRippleEffect(event.currentTarget, event, realm.color);
  };

  const handleContinue = () => {
    if (selectedRealm) {
      onNext({
        ...characterData,
        selectedRealm: selectedRealm.id,
        realmData: selectedRealm
      });
    }
  };

  return (
    <motion.div 
      className="realm-selection"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
    >
      <div className="backgrounds-container">
        <AnimatePresence mode="wait">
          {selectedRealm?.theme && (
            <motion.div
              key={`${selectedRealm.theme}-bg`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ThemeBackground theme={selectedRealm.theme} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {!selectedRealm && <CosmicBackground />}
      </div>
      
      <div className="selection-content">
        <motion.div
          className="selection-header"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2>Where Would You Like to Start?</h2>
          <p>Pick your starting adventure - you can explore all realms later!</p>
          <div 
            className="character-greeting"
            style={{
              background: `${characterData?.classData?.color || '#ffd700'}15`,
              borderColor: `${characterData?.classData?.color || '#ffd700'}4D`
            }}
          >
            <span className="greeting-text">
              Welcome, <strong>{characterData?.name || 'Traveler'}</strong> the <strong>{characterData?.classData?.name || 'Adventurer'}</strong>! 
            </span>
            <span className="greeting-icon">✨</span>
          </div>
        </motion.div>
        
        <div className="realm-cards">
          {realms.map((realm, index) => {
            const isHovered = hoveredRealm === realm.id;
            const isSelected = selectedRealm?.id === realm.id;
            const isOtherHovered = hoveredRealm && hoveredRealm !== realm.id;
            
            return (
              <motion.div
                key={realm.id}
                className={`realm-card ${realm.theme} ${isSelected ? 'selected' : ''}`}
                style={{ '--realm-color': realm.color, '--realm-bg': realm.bgGradient }}
                initial={{ y: 50, opacity: 0 }}
                 animate={{ 
                   y: 0, 
                   opacity: 1,
                   scale: isSelected ? 1.05 : isHovered ? 1.05 : isOtherHovered ? 0.95 : 1,
                   x: isHovered ? 0 : isOtherHovered ? (index < realms.findIndex(r => r.id === hoveredRealm) ? -15 : 15) : 0,
                   zIndex: isSelected ? 10 : isHovered ? 10 : 1,
                   transition: { 
                     duration: 0.2,
                     ease: "easeOut"
                   }
                 }}
                 whileHover={{ 
                   scale: isSelected ? 1.05 : 1.05,
                   y: isSelected ? 0 : -8,
                   transition: { duration: 0.2, ease: "easeOut" }
                 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => handleRealmSelect(realm, e)}
                onMouseEnter={() => setHoveredRealm(realm.id)}
                onMouseLeave={() => setHoveredRealm(null)}
              >
              <div className="realm-card-background"></div>
              
              <div className="realm-preview">
                {realm.preview}
              </div>
              
              <div className="realm-info">
                <div className="realm-header">
                  <h3 className="realm-name">{realm.name}</h3>
                  {/* <div className="difficulty-badge difficulty-{realm.difficulty.toLowerCase()}">
                    {realm.difficulty}
                  </div> */}
                </div>
                
                <p className="realm-description">{realm.description}</p>
                
                <div className="realm-story">
                  <p>{realm.story}</p>
                </div>
                
                <div className="realm-details">
                  <div className="mentor-info">
                    <span className="detail-label">Mentor:</span>
                    <span className="detail-value">{realm.mentor}</span>
                  </div>
                  
                  <div className="features-list">
                    <span className="detail-label">Features:</span>
                    <div className="features-tags">
                      {realm.features.map((feature, featureIndex) => (
                        <motion.span
                          key={featureIndex}
                          className="feature-tag"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.6 + index * 0.1 + featureIndex * 0.05 }}
                        >
                          {feature}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="realm-selector">
                <div className="selector-ring"></div>
                <div className="selector-check">✓</div>
              </div>
              </motion.div>
            );
          })}
        </div>
        
        <motion.div
          className="selection-actions"
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
            className={`continue-btn ${selectedRealm ? 'enabled' : 'disabled'}`}
            disabled={!selectedRealm}
            onClick={handleContinue}
            whileHover={selectedRealm ? { scale: 1.05 } : {}}
            whileTap={selectedRealm ? { scale: 0.95 } : {}}
          >
            <span>Begin Adventure</span>
            <span className="btn-icon">🚀</span>
          </motion.button>
        </motion.div>
      </div>
      
    </motion.div>
  );
};

export default RealmSelection;
