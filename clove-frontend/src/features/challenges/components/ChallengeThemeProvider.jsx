import React from 'react';
import { useChallengeTheme } from '../hooks/useChallengeTheme';

const ChallengeThemeProvider = ({ children, className = '', style = {} }) => {
  const { getThemeStyles, currentTheme, topicTheme } = useChallengeTheme();

  const themeStyles = getThemeStyles();

  const combinedStyles = {
    ...themeStyles,
    ...style
  };

  React.useLayoutEffect(() => {
    const body = document.body;
    
    body.classList.remove('theme-space', 'theme-wizard', 'theme-detective');
    
    body.classList.add(`theme-${topicTheme}`);
    
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