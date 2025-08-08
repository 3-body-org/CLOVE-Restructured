// Import all theme styles to ensure they're included in the bundle
import "../themes/spaceTheme.module.scss";
import "../themes/wizardTheme.module.scss";
import "../themes/detectiveTheme.module.scss";

// Export theme names as constants
export const THEMES = {
  SPACE: "space",
  WIZARD: "wizard",
  DETECTIVE: "detective",
};

// Default theme
export const DEFAULT_THEME = THEMES.SPACE;
