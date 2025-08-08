/**
 * @file RuneBackground.jsx
 * @description A React component that renders a full-page animated background
 * of glowing, floating runes for the 'wizard' theme.
 */

import React, { useMemo, useEffect } from 'react';
import styles from 'features/mydeck/themes/wizardTheme.module.scss';

// An array of Elder Futhark rune characters to be displayed.
const RUNE_CHARS = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛟ', 'ᛞ'];

/**
 * Generate a random style for a rune.
 * @returns {Object} CSS style object for a rune.
 */
function getRuneStyle() {
  return {
        left: `${Math.random() * 100}vw`,
        fontSize: `${Math.random() * 1.5 + 1}rem`,
        animationDelay: `${Math.random() * -25}s`,
        animationDuration: `${Math.random() * 15 + 20}s`,
      };
}

/**
 * RuneBackground
 * Renders a full-page animated rune effect for the wizard theme.
 * @param {Object} props
 * @param {number} [props.numRunes=40] - Number of runes to render.
 */
const RuneBackground = ({ numRunes = 40 }) => {
  const runes = useMemo(
    () =>
      Array.from({ length: numRunes }).map((_, i) => {
        const style = getRuneStyle();
        const char = RUNE_CHARS[Math.floor(Math.random() * RUNE_CHARS.length)];
        return (
          <span key={i} className={styles.rune} style={style}>
            {char}
          </span>
        );
      }),
    [numRunes]
  );

  return (
    <div className={styles.runeContainer} aria-hidden="true">
      {runes}
    </div>
  );
};

export default RuneBackground;
