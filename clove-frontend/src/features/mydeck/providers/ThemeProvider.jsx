/**
 * @file ThemeProvider.jsx
 * @description Provides theme context and manages theme switching for MyDeck.
 */

import React, { useState, useEffect, useCallback, useLayoutEffect } from "react";
import PropTypes from "prop-types";
import ThemeContext from "contexts/ThemeContext";
import { THEMES, DEFAULT_THEME } from "features/mydeck/styles";

const THEME_PREFIX = "theme-";
const THEME_STORAGE_KEY = "clove_theme";

// List of valid theme names
const VALID_THEMES = Object.values(THEMES);

/**
 * Validate a theme name, falling back to default if invalid.
 * @param {string} theme
 * @returns {string}
 */
const validateTheme = (theme) => {
  return VALID_THEMES.includes(theme) ? theme : DEFAULT_THEME;
};

/**
 * ThemeProvider
 * Provides theme context and manages theme switching for MyDeck.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() =>
    validateTheme(localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME)
  );

  /**
   * Apply the theme to the document body and persist in localStorage.
   * @param {string} themeName
   */
  const applyTheme = useCallback((themeName) => {
    if (!themeName) return;
    document.body.classList.forEach((className) => {
      if (className.startsWith(THEME_PREFIX)) {
        document.body.classList.remove(className);
      }
    });
    document.body.classList.add(`${THEME_PREFIX}${themeName}`);
    localStorage.setItem(THEME_STORAGE_KEY, themeName);
  }, []);

  /**
   * Set the current theme, validating and applying it.
   * @param {string} themeName
   */
  const setTheme = useCallback(
    (themeName) => {
      const validatedTheme = validateTheme(themeName);
      if (validatedTheme !== currentTheme) {
        setCurrentTheme(validatedTheme);
        applyTheme(validatedTheme);
      }
    },
    [currentTheme, applyTheme]
  );

  // Initialize theme on mount and when currentTheme changes (before first paint)
  useLayoutEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme, applyTheme]);

  const isSpaceTheme = currentTheme === THEMES.SPACE;

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, isSpaceTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ThemeProvider;
