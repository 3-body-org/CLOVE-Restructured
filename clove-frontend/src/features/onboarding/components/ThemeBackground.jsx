/**
 * @file ThemeBackground.jsx
 * @description Reusable component for rendering theme-specific backgrounds.
 * Centralizes background logic to avoid duplication across components.
 */

import React from 'react';
import WizardBackground from '../../mydeck/components/WizardBackground';
import RuneBackground from '../../mydeck/components/RuneBackground';
import DetectiveBackground from '../../mydeck/components/DetectiveBackground';
import RainfallBackground from '../../mydeck/components/RainfallBackground';
import SpaceBackground from '../../mydeck/components/SpaceBackground';

const ThemeBackground = ({ theme }) => {
  if (theme === 'wizard') {
    return (
      <>
        <WizardBackground />
        <RuneBackground />
      </>
    );
  }
  
  if (theme === 'detective') {
    return (
      <>
        <DetectiveBackground />
        <RainfallBackground />
      </>
    );
  }
  
  if (theme === 'space') {
    return <SpaceBackground />;
  }
  
  return null;
};

export default ThemeBackground;

