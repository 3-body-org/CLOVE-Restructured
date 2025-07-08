/**
 * @file RuneBackground.jsx
 * @description A React component that renders a full-page animated background
 * of glowing, floating runes for the 'wizard' theme.
 */

import React, { useMemo } from 'react';
import styles from 'features/mydeck/styles/RuneBackground.module.scss';

// An array of Elder Futhark rune characters to be displayed.
const RUNE_CHARS = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛟ', 'ᛞ'];

// The total number of rune elements to render.
const NUM_RUNES = 40;

/**
 * Renders a container with multiple randomly generated rune elements.
 * The runes are animated via CSS to float up the screen.
 * `useMemo` is used to ensure the rune properties are only calculated once.
 */
const RuneBackground = () => {
  const runes = useMemo(() => {
    return Array.from({ length: NUM_RUNES }).map((_, i) => {
      const style = {
        left: `${Math.random() * 100}vw`,
        fontSize: `${Math.random() * 1.5 + 1}rem`,
        animationDelay: `${Math.random() * -25}s`,
        animationDuration: `${Math.random() * 15 + 20}s`,
      };
      const char = RUNE_CHARS[Math.floor(Math.random() * RUNE_CHARS.length)];
      return <span key={i} className={styles.rune} style={style}>{char}</span>;
    });
  }, []);

  return <div className={styles.runeContainer} aria-hidden="true">{runes}</div>;
};

export default RuneBackground;
