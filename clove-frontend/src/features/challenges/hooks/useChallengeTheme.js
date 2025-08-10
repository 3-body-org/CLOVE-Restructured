import { useContext, useMemo, useEffect } from 'react';
import ThemeContext from '../../../contexts/ThemeContext';
import { useParams } from 'react-router-dom';
import spaceTheme from '../themes/spaceTheme.module.scss';
import wizardTheme from '../themes/wizardTheme.module.scss';
import detectiveTheme from '../themes/detectiveTheme.module.scss';

/**
 * Custom hook for challenge theming that integrates with the mydeck theme system
 * @returns {Object} Theme object with current theme data and utility functions
 */
export const useChallengeTheme = () => {
  // Safely get context with fallback
  let contextValue;
  try {
    contextValue = useContext(ThemeContext);
  } catch (error) {
    contextValue = { currentTheme: 'space', setTheme: () => {} };
  }
  
  const { currentTheme = 'space', setTheme = () => {} } = contextValue || {};
  const { topicId } = useParams();

  // Get theme from topic ID automatically
  const topicTheme = useMemo(() => {
    if (topicId) {
      // Extract numeric topic ID from the URL parameter (format: id-slug)
      const numericTopicId = topicId ? topicId.split('-')[0] : null;
      
      // Map topic ID to theme based on a simple pattern
      // This is a fallback since we no longer have topicsData
      if (numericTopicId) {
        const topicIdNum = parseInt(numericTopicId);
        // Simple mapping: 1=wizard, 2=detective, 3=space, default=space
        if (topicIdNum === 1) return 'wizard';
        if (topicIdNum === 2) return 'detective';
        if (topicIdNum === 3) return 'space';
      }
      return 'space'; // Default fallback
    }
    return currentTheme || 'space';
  }, [topicId, currentTheme]);

  // Set theme automatically based on topic (useEffect, not useMemo!)
  useEffect(() => {
    if (topicId && topicTheme !== currentTheme && setTheme) {
      try {
        setTheme(topicTheme);
      } catch (error) {
      }
    }
  }, [topicId, topicTheme, currentTheme, setTheme]);

  // Theme mapping
  const themeMap = useMemo(() => ({
    space: spaceTheme,
    wizard: wizardTheme,
    detective: detectiveTheme
  }), []);

  // Get current theme data
  const currentThemeData = useMemo(() => {
    return themeMap[topicTheme] || spaceTheme;
  }, [topicTheme, themeMap]);

  // Get theme variables as CSS custom properties
  const themeVariables = useMemo(() => {
    const variables = {};
    
    // Extract variables from the theme module
    Object.keys(currentThemeData).forEach(key => {
      if (key !== 'default' && typeof currentThemeData[key] === 'string') {
        variables[`--${key}`] = currentThemeData[key];
      }
    });

    return variables;
  }, [currentThemeData]);

  // Get specific theme values
  const getThemeValue = (key) => {
    return currentThemeData[key] || '';
  };

  // Check if current theme is space theme
  const isSpaceTheme = topicTheme === 'space';

  // Get theme-specific styles
  const getThemeStyles = () => {
    return {
      '--primary': getThemeValue('primary'),
      '--secondary': getThemeValue('secondary'),
      '--accent': getThemeValue('accent'),
      '--bg': getThemeValue('bg'),
      '--card-bg': getThemeValue('card-bg'),
      '--text': getThemeValue('text'),
      '--code-bg': getThemeValue('code-bg'),
      '--correct': getThemeValue('correct'),
      '--wrong': getThemeValue('wrong'),
      '--pending': getThemeValue('pending'),
      '--timer': getThemeValue('timer'),
      '--hint': getThemeValue('hint'),
      '--bug': getThemeValue('bug'),
      '--font-primary': getThemeValue('font-primary'),
      '--font-heading': getThemeValue('font-heading'),
      '--font-mono': getThemeValue('font-mono'),
      '--accent-primary': getThemeValue('accent-primary'),
      '--accent-secondary': getThemeValue('accent-secondary'),
      '--glow-color': getThemeValue('glow-color'),
      '--transition-speed': getThemeValue('transition-speed'),
      '--transition-easing': getThemeValue('transition-easing')
    };
  };

  return {
    currentTheme: topicTheme,
    currentThemeData,
    themeVariables,
    getThemeValue,
    getThemeStyles,
    isSpaceTheme,
    themeMap,
    topicTheme
  };
}; 