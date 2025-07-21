import React from 'react';
import { useChallengeTheme } from '../hooks/useChallengeTheme';

/**
 * Challenge Theme Provider Component
 * Applies theme styles to challenge components
 */
const ChallengeThemeProvider = ({ children, className = '', style = {} }) => {
  const { getThemeStyles, currentTheme, topicTheme } = useChallengeTheme();

  // Get theme-specific styles
  const themeStyles = getThemeStyles();

  // Combine theme styles with any additional styles
  const combinedStyles = {
    ...themeStyles,
    ...style
  };

  // Add theme class to body for global theme application
  React.useEffect(() => {
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('theme-space', 'theme-wizard', 'theme-detective');
    
    // Add current theme class based on topic
    body.classList.add(`theme-${topicTheme}`);
    
    // Cleanup on unmount
    return () => {
      body.classList.remove(`theme-${topicTheme}`);
    };
  }, [topicTheme]);

  return (
    <div 
      className={`challenge-theme-provider theme-${topicTheme} ${className}`}
      style={combinedStyles}
    >
      {children}
    </div>
  );
};

export default ChallengeThemeProvider; 