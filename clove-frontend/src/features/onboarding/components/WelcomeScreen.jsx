import React from 'react';
import { motion } from 'framer-motion';
import CosmicBackground from './CosmicBackground';
import '../styles/WelcomeScreen.scss';

const WelcomeScreen = ({ onNext }) => {
  return (
    <motion.div 
      className="welcome-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <CosmicBackground />
      
      <div className="story-content">
        <motion.div
          className="welcome-header"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h1 className="welcome-title">
            Welcome, Code Traveler! 🌟
          </h1>
          <div className="title-decoration">
            <div className="magic-sparkles">✨</div>
          </div>
        </motion.div>
        
        <motion.div
          className="story-text"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="story-paragraph">
            <p>
              In a world where <span className="highlight">code is magic</span>, 
              <span className="highlight"> logic is power</span>, and 
              <span className="highlight"> bugs are mysteries</span> to solve, 
              you are about to embark on an epic journey through three legendary realms.
            </p>
          </div>
          
          <div className="story-paragraph">
            <p>
              Each realm holds <span className="highlight">ancient knowledge</span> and 
              <span className="highlight"> powerful challenges</span> that will transform you 
              from a curious traveler into a <span className="highlight">master programmer</span>.
            </p>
          </div>
          
          <div className="story-paragraph">
            <p>
              Are you ready to begin your <span className="highlight">legendary quest</span>?
            </p>
          </div>
        </motion.div>
        
        <motion.div
          className="welcome-actions"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.button
            className="begin-journey-btn"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(255, 215, 0, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
          >
            <span className="btn-text">Begin Your Journey</span>
            <span className="btn-icon">🚀</span>
            <div className="btn-glow"></div>
          </motion.button>
          
          <div className="welcome-hint">
            <p>✨ Your adventure awaits in the realms of code magic</p>
          </div>
        </motion.div>
      </div>
      
    </motion.div>
  );
};

export default WelcomeScreen;
