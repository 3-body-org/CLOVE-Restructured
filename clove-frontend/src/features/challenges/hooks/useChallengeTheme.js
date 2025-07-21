import { useContext, useMemo, useEffect } from 'react';
import ThemeContext from '../../../contexts/ThemeContext';
import { useParams } from 'react-router-dom';
import { topicsData } from '../../mydeck/data/topics';
import spaceTheme from '../themes/spaceTheme.module.scss';
import wizardTheme from '../themes/wizardTheme.module.scss';
import detectiveTheme from '../themes/detectiveTheme.module.scss';

/**
 * Custom hook for challenge theming that integrates with the mydeck theme system
 * @returns {Object} Theme object with current theme data and utility functions
 */
export const useChallengeTheme = () => {
  const { currentTheme, setTheme } = useContext(ThemeContext);
  const { topicId } = useParams();

  // Get theme from topic ID automatically
  const topicTheme = useMemo(() => {
    if (topicId) {
      // Extract numeric topic ID from the URL parameter (format: id-slug)
      const numericTopicId = topicId ? topicId.split('-')[0] : null;
      const topic = topicsData.find(t => t.id === parseInt(numericTopicId));
      return topic ? topic.theme : 'space';
    }
    return currentTheme;
  }, [topicId, currentTheme]);

  // Set theme automatically based on topic (useEffect, not useMemo!)
  useEffect(() => {
    if (topicId && topicTheme !== currentTheme) {
      setTheme(topicTheme);
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