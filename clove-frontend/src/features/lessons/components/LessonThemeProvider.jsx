import React from 'react';
import { useParams } from 'react-router-dom';
import { useMemo, useEffect } from 'react';
import { subtopicContent } from '../../mydeck/content/subtopicContent';
// Import theme modules
import wizardTheme from '../themes/wizardTheme.module.scss';
import detectiveTheme from '../themes/detectiveTheme.module.scss';
import spaceTheme from '../themes/spaceTheme.module.scss';
// Import background components
import SpaceBackground from '../../mydeck/components/SpaceBackground';
import RainfallBackground from '../../mydeck/components/RainfallBackground';

/**
 * Lesson Theme Provider Component
 * Applies theme styles to lesson components
 */
const LessonThemeProvider = ({ children, className = '', style = {} }) => {
  const { topicId } = useParams();

  // Get theme from topic ID automatically
  const topicTheme = useMemo(() => {
    if (topicId) {
      const numericTopicId = parseInt(topicId);
      const topic = subtopicContent[numericTopicId];
      return topic ? topic.theme : 'space';
    }
    return 'space'; // Default to space theme
  }, [topicId]);

  // Theme mapping
  const themeMap = useMemo(() => ({
    wizard: wizardTheme,
    detective: detectiveTheme,
    space: spaceTheme
  }), []);

  // Get current theme data
  const currentThemeData = useMemo(() => {
    return themeMap[topicTheme] || spaceTheme;
  }, [topicTheme, themeMap]);

  // Get theme-specific styles
  const getThemeStyles = () => {
    const themeStyles = {};
    
    // Extract variables from the theme module
    Object.keys(currentThemeData).forEach(key => {
      if (key !== 'default' && typeof currentThemeData[key] === 'string') {
        themeStyles[`--${key}`] = currentThemeData[key];
    }
    });

    return themeStyles;
  };

  const themeStyles = getThemeStyles();

  // Combine theme styles with any additional styles
  const combinedStyles = {
    ...themeStyles,
    ...style
  };

  // Add theme class to body for global theme application
  useEffect(() => {
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
      className={`lesson-theme-provider theme-${topicTheme} ${className}`}
      style={combinedStyles}
    >
      {/* Animated Backgrounds - ONLY for detective and space */}
      {topicTheme === 'space' && <SpaceBackground />}
      {topicTheme === 'detective' && <RainfallBackground />}
      {/* NO background for wizard theme - keep it clean */}
      {children}
    </div>
  );
};

export default LessonThemeProvider; 