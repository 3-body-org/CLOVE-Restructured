import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import styles from "features/landing/styles/ScrollIndicator.module.scss";

export default function ScrollIndicator() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasReachedFeatures, setHasReachedFeatures] = useState(false);
  const [hasReachedTeam, setHasReachedTeam] = useState(false);
  const [hasReachedFooter, setHasReachedFooter] = useState(false);
  const [timer, setTimer] = useState(null);



  useEffect(() => {
    // Show scroll indicator after 15 seconds
    const initialTimer = setTimeout(() => {
      const currentScrollY = window.scrollY;
      if (!hasReachedFeatures && !hasReachedTeam && !hasReachedFooter && currentScrollY < 1500) {
        setIsVisible(true);
      }
    }, 15000); // 15 seconds

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      

      
      // Try multiple selectors to find the sections
      const featuresSection = document.querySelector('[class*="featuresSection"]') || 
                             document.querySelector('section:nth-of-type(2)') ||
                             document.querySelector('.featuresSection');
      const teamSection = document.querySelector('[class*="teamSection"]') || 
                         document.querySelector('section:nth-of-type(3)') ||
                         document.querySelector('.teamSection');
      const footerSection = document.querySelector('[class*="footerSection"]') || 
                           document.querySelector('footer') ||
                           document.querySelector('.footerSection');
      

      
      // Check if we're in any of the sections that should hide the indicator
      if (featuresSection) {
        const featuresTop = featuresSection.offsetTop;
        if (scrollY >= featuresTop - windowHeight * 0.8) {
          if (!hasReachedFeatures) {
            setHasReachedFeatures(true);
            setIsVisible(false);
            
            // Set timer to show again after 10 seconds
            const newTimer = setTimeout(() => {
              if (!hasReachedTeam && !hasReachedFooter) {
                setIsVisible(true);
              }
            }, 10000);
            
            setTimer(newTimer);
          }
        }
      }
      
      if (teamSection) {
        const teamTop = teamSection.offsetTop;
        if (scrollY >= teamTop - windowHeight * 0.5) {
          if (!hasReachedTeam) {
            setHasReachedTeam(true);
            setIsVisible(false);
            if (timer) {
              clearTimeout(timer);
            }
          }
        }
      }
      
      if (footerSection) {
        const footerTop = footerSection.offsetTop;
        if (scrollY >= footerTop - windowHeight * 0.5) {
          if (!hasReachedFooter) {
            setHasReachedFooter(true);
            setIsVisible(false);
            if (timer) {
              clearTimeout(timer);
            }
          }
        }
      }
      
      // Force hide if we're past a certain scroll point (footer area)
      if (scrollY > 1500) {
        setIsVisible(false);
        if (timer) {
          clearTimeout(timer);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timer) {
        clearTimeout(timer);
      }
      clearTimeout(initialTimer);
    };
  }, []);

  const scrollToFeatures = () => {
    const featuresSection = document.querySelector('[class*="featuresSection"]');
    if (featuresSection) {
      featuresSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Force hide if we're in footer area
  const scrollY = window.scrollY;
  if (scrollY > 1500) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.scrollIndicator} onClick={scrollToFeatures}>
      <div className={styles.scrollText}>Scroll to explore</div>
      <div className={styles.scrollArrow}>
        <FontAwesomeIcon icon={faChevronDown} />
      </div>

    </div>
  );
} 