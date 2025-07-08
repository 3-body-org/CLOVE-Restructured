import { useState, useEffect, useCallback } from "react";
import ThemeContext from "contexts/ThemeContext";
import { THEMES, DEFAULT_THEME } from "features/mydeck/styles";
import "features/mydeck/themes/spaceTheme.module.scss";
import "features/mydeck/themes/wizardTheme.module.scss";
import "features/mydeck/themes/detectiveTheme.module.scss";

const THEME_PREFIX = "theme-";
const THEME_STORAGE_KEY = "clove_theme";

// List of valid theme names
const VALID_THEMES = Object.values(THEMES);

// Helper function to validate theme name
const validateTheme = (theme) => {
  return VALID_THEMES.includes(theme) ? theme : DEFAULT_THEME;
};

/**
 * Theme Provider component to wrap your application with
 */
const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() =>
    validateTheme(localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME)
  );

  const applyTheme = useCallback((themeName) => {
    if (!themeName) return;

    // Remove any existing theme classes
    document.body.classList.forEach((className) => {
      if (className.startsWith(THEME_PREFIX)) {
        document.body.classList.remove(className);
      }
    });

    // Add the new theme class
    document.body.classList.add(`${THEME_PREFIX}${themeName}`);
    localStorage.setItem(THEME_STORAGE_KEY, themeName);
  }, []);

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

  // Initialize theme on mount
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme, applyTheme]);

  const isSpaceTheme = currentTheme === THEMES.SPACE;

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, isSpaceTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
