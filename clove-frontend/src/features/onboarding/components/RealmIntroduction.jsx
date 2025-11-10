import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ThemeBackground from './ThemeBackground';
import { ANIMATION_DURATIONS } from '../content/animationConfig';
import '../styles/RealmIntroduction.scss';

const RealmIntroduction = ({ onNext, onBack, characterData, realmData }) => {
  const [currentDialogue, setCurrentDialogue] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [mentorAnimation, setMentorAnimation] = useState('idle');
  const [displayedText, setDisplayedText] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const getMentorDialogues = (realmId, characterClass) => {
    const classNames = {
      'syntax-sage': 'Syntax Sage',
      'logic-investigator': 'Logic Investigator', 
      'algorithm-explorer': 'Algorithm Explorer'
    };
    
    const className = classNames[characterClass] || 'Syntax Sage';
    
    const dialogues = {
      'wizard-academy': [
        "Welcome, young apprentice! I am Master Gandalf the Code Sage.",
        `You have chosen the path of the ${className} - a wise choice indeed!`,
        "In this academy, you will learn to cast spells with code and summon solutions from the digital realm.",
        "Your first lesson begins with understanding the ancient art of magic...",
        "Are you ready to begin your magical coding journey?"
      ],
      'detective-agency': [
        "Greetings, investigator. I am Inspector Sherlock of the Code Division.",
        `The city needs your help - mysterious bugs are plaguing our codebase.`,
        `As a ${className}, you'll use your analytical skills to solve complex cases.`,
        "Your first case involves tracking down a missing case in a critical platform...",
        "Ready to crack your first case, investigator?"
      ],
      'space-station': [
        "Welcome aboard, Commander. I am Captain Nova, Chief Systems Officer.",
        "The space station Alpha is your new home, and its systems need your expertise.",
        `As an ${className}, you'll maintain our ship's critical systems.`,
        "Your first mission: debug the navigation system before we lose our way in space...",
        "Are you prepared for this critical mission, Commander?"
      ]
    };
    
    return dialogues[realmId] || dialogues['wizard-academy'];
  };

  const currentDialogues = getMentorDialogues(realmData?.id, characterData?.class);

  useEffect(() => {
    if (currentDialogue < currentDialogues.length) {
      const currentText = currentDialogues[currentDialogue];
      setDisplayedText('');
      setCurrentTextIndex(0);
      setIsTyping(true);
      
      const typeInterval = setInterval(() => {
        setCurrentTextIndex(prev => {
          if (prev < currentText.length) {
            setDisplayedText(currentText.substring(0, prev + 1));
            return prev + 1;
          } else {
            setIsTyping(false);
            clearInterval(typeInterval);
            return prev;
          }
        });
      }, ANIMATION_DURATIONS.TYPEWRITER_CHAR);
      
      return () => clearInterval(typeInterval);
    }
  }, [currentDialogue]); // Remove currentDialogues from dependency array

  const handleNextDialogue = () => {
    // Trigger mentor animation
    setMentorAnimation('speaking');
    setTimeout(() => setMentorAnimation('idle'), 1000);
    
    if (currentDialogue < currentDialogues.length - 1) {
      setCurrentDialogue(currentDialogue + 1);
    } else {
      setShowTutorial(true);
    }
  };

  const handleCompleteIntroduction = () => {
    onNext({
      ...characterData,
      introductionCompleted: true,
      currentDialogue: currentDialogue,
      tutorialShown: showTutorial
    });
  };

  return (
    <motion.div 
      className={`realm-introduction ${realmData?.theme || 'wizard'}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
    >
      <div className="introduction-background">
        <ThemeBackground theme={realmData?.theme} />
      </div>
      
      <div className="introduction-content">
        {!showTutorial ? (
          <div className="mentor-dialogue">
            <motion.div
              className="mentor-avatar"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="avatar-container">
                <motion.div 
                  className="mentor-image"
                  animate={{
                    scale: mentorAnimation === 'speaking' ? 1.1 : 1,
                    rotate: mentorAnimation === 'speaking' ? [0, -5, 5, 0] : 0,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {realmData?.theme === 'wizard' && '🧙‍♂️'}
                  {realmData?.theme === 'detective' && '🕵️‍♂️'}
                  {realmData?.theme === 'space' && '👨‍🚀'}
                </motion.div>
                
                {/* Floating particles around mentor */}
                {realmData?.theme === 'wizard' && (
                  <>
                    <motion.div 
                      className="floating-particle particle-1"
                      animate={{ 
                        y: [0, -20, 0],
                        opacity: [0.3, 1, 0.3],
                        scale: [0.8, 1.2, 0.8]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        delay: 0
                      }}
                    >
                      ✨
                    </motion.div>
                    <motion.div 
                      className="floating-particle particle-2"
                      animate={{ 
                        y: [0, -15, 0],
                        opacity: [0.5, 1, 0.5],
                        scale: [1, 0.8, 1]
                      }}
                      transition={{ 
                        duration: 2.5,
                        repeat: Infinity,
                        delay: 1
                      }}
                    >
                      🔮
                    </motion.div>
                  </>
                )}
                
                {realmData?.theme === 'detective' && (
                  <>
                    <motion.div 
                      className="floating-particle particle-1"
                      animate={{ 
                        y: [0, -10, 0],
                        opacity: [0.4, 1, 0.4],
                        rotate: [0, 180, 360]
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        delay: 0
                      }}
                    >
                      🔍
                    </motion.div>
                    <motion.div 
                      className="floating-particle particle-2"
                      animate={{ 
                        y: [0, -12, 0],
                        opacity: [0.3, 0.8, 0.3],
                        x: [0, 10, 0]
                      }}
                      transition={{ 
                        duration: 3.5,
                        repeat: Infinity,
                        delay: 1.5
                      }}
                    >
                      📋
                    </motion.div>
                  </>
                )}
                
                {realmData?.theme === 'space' && (
                  <>
                    <motion.div 
                      className="floating-particle particle-1"
                      animate={{ 
                        y: [0, -25, 0],
                        opacity: [0.6, 1, 0.6],
                        scale: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: 0
                      }}
                    >
                      ⭐
                    </motion.div>
                    <motion.div 
                      className="floating-particle particle-2"
                      animate={{ 
                        y: [0, -20, 0],
                        opacity: [0.4, 0.9, 0.4],
                        rotate: [0, 360]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        delay: 1
                      }}
                    >
                      🛸
                    </motion.div>
                    <motion.div 
                      className="floating-particle particle-3"
                      animate={{ 
                        y: [0, -15, 0],
                        opacity: [0.3, 0.7, 0.3],
                        x: [0, -15, 0]
                      }}
                      transition={{ 
                        duration: 2.8,
                        repeat: Infinity,
                        delay: 0.8
                      }}
                    >
                      🚀
                    </motion.div>
                  </>
                )}
                
                <div className="mentor-name">{realmData?.mentor}</div>
              </div>
            </motion.div>
            
            <motion.div
              className="dialogue-container"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div 
                className="dialogue-bubble"
                animate={{
                  scale: isTyping ? 1.02 : 1,
                  boxShadow: isTyping ? "0 0 30px rgba(255, 255, 255, 0.2)" : "0 0 20px rgba(255, 255, 255, 0.1)"
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="dialogue-text">
                  <span className="typing-indicator">
                    {displayedText}
                    {isTyping && <span className="cursor">|</span>}
                  </span>
                </div>
              </motion.div>
              
              <div className="dialogue-actions">
                <motion.button
                  className="continue-dialogue-btn"
                  onClick={handleNextDialogue}
                  disabled={isTyping}
                  whileHover={!isTyping ? { scale: 1.05 } : {}}
                  whileTap={!isTyping ? { scale: 0.95 } : {}}
                >
                  {isTyping ? '...' : (currentDialogue < currentDialogues.length - 1 ? 'Continue' : 'Begin Tutorial')}
                </motion.button>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="tutorial-section">
            <motion.div
              className="tutorial-content"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2>Welcome to {realmData?.name}!</h2>
              <p>Here's what you can expect in your coding learning journey:</p>
              
              <div className="tutorial-steps">
                <div className="tutorial-step">
                  <div className="step-icon">💻</div>
                  <div className="step-content">
                    <h3>Code Challenges</h3>
                    <p>Solve programming problems using the Monaco code editor with feedback and explanation</p>
                  </div>
                </div>
                
                <div className="tutorial-step">
                  <div className="step-icon">🧠</div>
                  <div className="step-content">
                    <h3>AI Learning</h3>
                    <p>Our system adapts to your learning pace using Bayesian Knowledge Tracing and Reinforcement Learning</p>
                  </div>
                </div>
                
                <div className="tutorial-step">
                  <div className="step-icon">📊</div>
                  <div className="step-content">
                    <h3>Progress Tracking</h3>
                    <p>Monitor your learning journey with detailed analytics and skill assessments</p>
                  </div>
                </div>
              </div>
              
              <div className="tutorial-actions">
                <motion.button
                  className="start-adventure-btn"
                  onClick={handleCompleteIntroduction}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Your Adventure! 🚀
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
      
      <div className="introduction-footer">
        <div className="progress-dots">
          {currentDialogues.map((_, index) => (
            <div
              key={index}
              className={`progress-dot ${index <= currentDialogue ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default RealmIntroduction;
