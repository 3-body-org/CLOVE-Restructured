/**
 * @file RainfallBackground.jsx
 * @description A React component that renders a full-page animated background
 * of falling rain for the 'detective' theme.
 */

import React, { useMemo } from 'react';
import styles from 'features/mydeck/styles/RainfallBackground.module.scss';

// The total number of raindrop elements to render for the effect.
const NUM_DROPS = 100;

/**
 * Renders a container with multiple randomly generated raindrop elements.
 * The drops are animated via CSS to create a continuous falling effect.
 * `useMemo` is used to ensure the drop properties are only calculated once.
 */
const RainfallBackground = () => {
  // Debug logging
  React.useEffect(() => {
    console.log('RainfallBackground: Component mounted');
    return () => {
      console.log('RainfallBackground: Component unmounted');
    };
  }, []);

  const drops = useMemo(() => {
    return Array.from({ length: NUM_DROPS }).map((_, i) => {
      const style = {
        left: `${Math.random() * 100}vw`,
        animationDelay: `${Math.random() * -20}s`,
        animationDuration: `${0.5 + Math.random() * 0.5}s`,
      };
      return <div key={i} className={styles.drop} style={style}></div>;
    });
  }, []);

  return <div className={styles.rainContainer} aria-hidden="true">{drops}</div>;
};

export default RainfallBackground;
