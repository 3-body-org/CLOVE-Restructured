import React, { useEffect, useState, useRef } from 'react';

const LightningEffect = () => {
  const [isFlashing, setIsFlashing] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const triggerLightning = () => {
      setIsFlashing(true);
      // Flash duration: 100ms
      setTimeout(() => setIsFlashing(false), 100);
    };

    const scheduleLightning = () => {
      // Random interval between 2-4 minutes (120-240 seconds)
      const delay = Math.random() * 120000 + 120000;
      
      timeoutRef.current = setTimeout(() => {
        triggerLightning();
        scheduleLightning(); // Schedule next lightning
      }, delay);
    };

    // Start the lightning cycle
    scheduleLightning();

    return () => {
      // Cleanup timeout to prevent multiple timers
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const lightningStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: isFlashing ? 'rgba(255, 255, 255, 0.4)' : 'transparent',
    pointerEvents: 'none',
    zIndex: 9999,
    transition: isFlashing ? 'none' : 'background-color 0.3s ease-out',
    mixBlendMode: 'screen',
  };

  return <div style={lightningStyle} aria-hidden="true" />;
};

export default LightningEffect; 