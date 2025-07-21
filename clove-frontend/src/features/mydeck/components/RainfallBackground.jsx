/**
 * @file RainfallBackground.jsx
 * @description A React component that renders a full-page animated background
 * of falling rain for the 'detective' theme.
 */

import React, { useMemo, useEffect } from 'react';
import styles from 'features/mydeck/themes/detectiveTheme.module.scss';

/**
 * Generate a random style for a raindrop.
 * @returns {Object} CSS style object for a raindrop.
 */
function getDropStyle() {
  return {
    left: `${Math.random() * 100}vw`,
    animationDelay: `${Math.random() * -20}s`,
    animationDuration: `${0.5 + Math.random() * 0.5}s`,
  };
}

/**
 * RainfallBackground
 * Renders a full-page animated rain effect for the detective theme.
 * @param {Object} props
 * @param {number} [props.numDrops=100] - Number of raindrops to render.
 */
const RainfallBackground = ({ numDrops = 100 }) => {
  useEffect(() => {
    console.log('[RainfallBackground] Mounted');
    return () => {
      console.log('[RainfallBackground] Unmounted');
    };
  }, []);

  const drops = useMemo(
    () =>
      Array.from({ length: numDrops }).map((_, i) => (
        <div key={i} className={styles.drop} style={getDropStyle()} />
      )),
    [numDrops]
  );

  return (
    <div className={styles.rainContainer} aria-hidden="true">
      {drops}
    </div>
  );
};

export default RainfallBackground;
