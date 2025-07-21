/**
 * @file useTheme.js
 * @description Custom hook to manage theme switching and application state for MyDeck.
 */

import { useContext } from "react";
import ThemeContext from "contexts/ThemeContext";

/**
 * @typedef {Object} ThemeContextValue
 * @property {string} currentTheme - The currently active theme name ('space', 'wizard', or 'detective')
 * @property {Function} setTheme - Function to change the current theme
 * @property {boolean} isSpaceTheme - Helper boolean indicating if current theme is 'space'
 */

/**
 * Custom hook to access theme state and methods.
 * @returns {ThemeContextValue}
 */
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default useTheme;
