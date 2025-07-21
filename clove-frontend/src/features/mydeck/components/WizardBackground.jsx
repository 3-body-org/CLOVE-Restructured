/**
 * @file WizardBackground.jsx
 * @description A React component that renders a full-page wizard-themed background
 * with SVG spell book imagery for the 'wizard' theme.
 */

import React from 'react';
import wizardBg from 'assets/images/wizard/illustration-wizard-background.svg';

const WizardBackground = () => {
  return (
    <img
      src={wizardBg}
      alt="Wizard Spell Book Background"
      style={{
        position: 'absolute', 
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: -1,
        pointerEvents: 'none',
        userSelect: 'none',
        filter: 'blur(4px)',
      }}
      draggable={false}
    />
  );
};

export default WizardBackground; 