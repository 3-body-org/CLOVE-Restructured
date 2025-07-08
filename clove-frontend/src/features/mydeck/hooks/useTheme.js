import { useContext } from "react";
import ThemeContext from "contexts/ThemeContext";

/**
 * Custom hook to manage theme switching and application state
 *
 * @example
 * // Basic usage
 * const { currentTheme, setTheme, isSpaceTheme } = useTheme();
 *
 * // In your component
 * <div className={`container ${isSpaceTheme ? 'space-theme' : ''}`}>
 *   <button onClick={() => setTheme('wizard')}>Switch to Wizard Theme</button>
 * </div>
 *
 * @returns {Object} Theme state and methods
 * @property {string} currentTheme - The currently active theme name ('space', 'wizard', or 'detective')
 * @property {Function} setTheme - Function to change the current theme
 * @property {boolean} isSpaceTheme - Helper boolean indicating if current theme is 'space'
 */
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default useTheme;
