import React from 'react';
import { useParams } from 'react-router-dom';
import { useMemo, useEffect } from 'react';
import { subtopicContent } from '../../mydeck/content/subtopicContent';
import wizardTheme from '../themes/wizardTheme.module.scss';
import detectiveTheme from '../themes/detectiveTheme.module.scss';
import spaceTheme from '../themes/spaceTheme.module.scss';
import SpaceBackground from '../../mydeck/components/SpaceBackground';
import RainfallBackground from '../../mydeck/components/RainfallBackground';

const LessonThemeProvider = ({ children, className = '', style = {} }) => {
  const { topicId } = useParams();

  const topicTheme = useMemo(() => {
    if (topicId) {
      const numericTopicId = parseInt(topicId);
      const topic = subtopicContent[numericTopicId];
      return topic ? topic.theme : 'space';
    }
    return 'space';
  }, [topicId]);

  const themeMap = useMemo(() => ({
    wizard: wizardTheme,
    detective: detectiveTheme,
    space: spaceTheme
  }), []);

  const currentThemeData = useMemo(() => {
    return themeMap[topicTheme] || spaceTheme;
  }, [topicTheme, themeMap]);

  const getThemeStyles = () => {
    const themeStyles = {};
    
    Object.keys(currentThemeData).forEach(key => {
      if (key !== 'default' && typeof currentThemeData[key] === 'string') {
        themeStyles[`--${key}`] = currentThemeData[key];
    }
    });

    return themeStyles;
  };

  const themeStyles = getThemeStyles();

  const combinedStyles = {
    ...themeStyles,
    ...style
  };

  useEffect(() => {
    const body = document.body;
    
    body.classList.remove('theme-space', 'theme-wizard', 'theme-detective');
    body.classList.add(`theme-${topicTheme}`);
    
    return () => {
      body.classList.remove(`theme-${topicTheme}`);
    };
  }, [topicTheme]);

  return (
    <div 
      className={`lesson-theme-provider theme-${topicTheme} ${className}`}
      style={combinedStyles}
    >
      {topicTheme === 'space' && <SpaceBackground />}
      {topicTheme === 'detective' && <RainfallBackground />}
      {children}
    </div>
  );
};

export default LessonThemeProvider; 