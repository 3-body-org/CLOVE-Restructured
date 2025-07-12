import React, { useMemo } from "react";
import styles from "../styles/ThemeBackground.module.scss";

const NUM_STARS = 200;
const NUM_RUNES = 40;
const NUM_DROPS = 100;
const RUNE_CHARS = [
  'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛟ', 'ᛞ'
];

const ThemeBackground = ({ theme }) => {
  const stars = useMemo(() => (
    Array.from({ length: NUM_STARS }).map((_, i) => {
      const size = Math.random() * 2 + 1;
      const style = {
        left: `${Math.random() * 100}vw`,
        top: `${Math.random() * 100}vh`,
        width: `${size}px`,
        height: `${size}px`,
        opacity: Math.random() * 0.7 + 0.3,
        animationDelay: `${Math.random() * -5}s`,
        animationDuration: `${2 + Math.random() * 4}s`,
      };
      return <div key={i} className={styles.star} style={style}></div>;
    })
  ), []);

  const runes = useMemo(() => (
    Array.from({ length: NUM_RUNES }).map((_, i) => {
      const style = {
        left: `${Math.random() * 100}vw`,
        fontSize: `${Math.random() * 1.5 + 1}rem`,
        animationDelay: `${Math.random() * -25}s`,
        animationDuration: `${Math.random() * 15 + 20}s`,
      };
      const char = RUNE_CHARS[Math.floor(Math.random() * RUNE_CHARS.length)];
      return <span key={i} className={styles.rune} style={style}>{char}</span>;
    })
  ), []);

  const drops = useMemo(() => (
    Array.from({ length: NUM_DROPS }).map((_, i) => {
      const style = {
        left: `${Math.random() * 100}vw`,
        animationDelay: `${Math.random() * -20}s`,
        animationDuration: `${0.5 + Math.random() * 0.5}s`,
      };
      return <div key={i} className={styles.drop} style={style}></div>;
    })
  ), []);

  return (
    <div className={styles.themeContainer} aria-hidden="true">
      {theme === "space" && stars}
      {theme === "wizard" && runes}
      {theme === "detective" && drops}
    </div>
  );
};

export default ThemeBackground; 