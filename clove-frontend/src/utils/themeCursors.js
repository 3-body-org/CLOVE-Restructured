/**
 * Theme-based cursor utilities
 * Provides cursor SVG data URIs for wizard, detective, and space themes
 */

// Wizard theme - Wand cursor with magical glow
const WIZARD_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40' width='40' height='40'%3E%3Cdefs%3E%3ClinearGradient id='woodGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%238B4513'/%3E%3Cstop offset='30%25' stop-color='%23A0522D'/%3E%3Cstop offset='60%25' stop-color='%23CD853F'/%3E%3Cstop offset='100%25' stop-color='%23D2691E'/%3E%3C/linearGradient%3E%3ClinearGradient id='woodGrain' x1='0%25' y1='0%25' x2='100%25' y2='0%25'%3E%3Cstop offset='0%25' stop-color='%23A0522D' stop-opacity='0.6'/%3E%3Cstop offset='50%25' stop-color='%23CD853F' stop-opacity='0.3'/%3E%3Cstop offset='100%25' stop-color='%23A0522D' stop-opacity='0.6'/%3E%3C/linearGradient%3E%3CradialGradient id='magicGlow' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0%25' stop-color='%23FBBF24' stop-opacity='1'/%3E%3Cstop offset='40%25' stop-color='%23F59E0B' stop-opacity='0.9'/%3E%3Cstop offset='70%25' stop-color='%23FBBF24' stop-opacity='0.6'/%3E%3Cstop offset='100%25' stop-color='%23FBBF24' stop-opacity='0'/%3E%3C/radialGradient%3E%3Cfilter id='wandShadow'%3E%3CfeGaussianBlur stdDeviation='0.5' result='coloredBlur'/%3E%3CfeMerge%3E%3CfeMergeNode in='coloredBlur'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3Cfilter id='magicGlowFilter'%3E%3CfeGaussianBlur stdDeviation='3' result='coloredBlur'/%3E%3CfeMerge%3E%3CfeMergeNode in='coloredBlur'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3Cfilter id='magicGlowOuter'%3E%3CfeGaussianBlur stdDeviation='5' result='coloredBlur'/%3E%3CfeMerge%3E%3CfeMergeNode in='coloredBlur'/%3E%3C/feMerge%3E%3C/filter%3E%3Cfilter id='particleGlow'%3E%3CfeGaussianBlur stdDeviation='1.5' result='coloredBlur'/%3E%3CfeMerge%3E%3CfeMergeNode in='coloredBlur'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Cg transform='rotate(-20 20 20)'%3E%3Cpath d='M20 4 L20 32' stroke='url(%23woodGrad)' stroke-width='2.5' fill='none' filter='url(%23wandShadow)'/%3E%3Crect x='18.5' y='4' width='3' height='28' fill='url(%23woodGrad)'/%3E%3Cpath d='M18.5 4 L21.5 4 M18.5 8 L21.5 8 M18.5 12 L21.5 12 M18.5 16 L21.5 16 M18.5 20 L21.5 20 M18.5 24 L21.5 24 M18.5 28 L21.5 28' stroke='url(%23woodGrain)' stroke-width='0.5' opacity='0.4'/%3E%3C/g%3E%3Cg transform='rotate(-20 20 20)'%3E%3Ccircle cx='20' cy='4' r='6' fill='url(%23magicGlow)' filter='url(%23magicGlowOuter)' opacity='0.8'/%3E%3Ccircle cx='20' cy='4' r='5' fill='url(%23magicGlow)' filter='url(%23magicGlowFilter)' opacity='0.95'/%3E%3Ccircle cx='20' cy='4' r='3.5' fill='%23FBBF24' opacity='0.98'/%3E%3Ccircle cx='20' cy='4' r='2.5' fill='%23F59E0B' opacity='0.95'/%3E%3Ccircle cx='20' cy='4' r='1.5' fill='%23ffffff' opacity='0.9'/%3E%3Ccircle cx='18.5' cy='2.5' r='1.2' fill='%23F59E0B' opacity='0.8' filter='url(%23particleGlow)'/%3E%3Ccircle cx='21.5' cy='2.5' r='1' fill='%23FBBF24' opacity='0.85' filter='url(%23particleGlow)'/%3E%3Ccircle cx='19' cy='6' r='1.1' fill='%23ffffff' opacity='0.7' filter='url(%23particleGlow)'/%3E%3Ccircle cx='21' cy='6' r='0.9' fill='%23F59E0B' opacity='0.75' filter='url(%23particleGlow)'/%3E%3Ccircle cx='18' cy='5.5' r='0.8' fill='%23FBBF24' opacity='0.7' filter='url(%23particleGlow)'/%3E%3Ccircle cx='22' cy='5.5' r='0.8' fill='%23ffffff' opacity='0.65' filter='url(%23particleGlow)'/%3E%3C/g%3E%3C/svg%3E") 20 20, pointer`;

// Detective theme - Magnifying glass cursor
const DETECTIVE_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36' width='36' height='36'%3E%3Cdefs%3E%3ClinearGradient id='glassGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23ffffff' stop-opacity='0.4'/%3E%3Cstop offset='30%25' stop-color='%23fbbf24' stop-opacity='0.2'/%3E%3Cstop offset='70%25' stop-color='%23fbbf24' stop-opacity='0.15'/%3E%3Cstop offset='100%25' stop-color='%23ffffff' stop-opacity='0.3'/%3E%3C/linearGradient%3E%3ClinearGradient id='glassHighlight' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23ffffff' stop-opacity='0.6'/%3E%3Cstop offset='50%25' stop-color='%23ffffff' stop-opacity='0.2'/%3E%3Cstop offset='100%25' stop-color='%23ffffff' stop-opacity='0'/%3E%3C/linearGradient%3E%3Cfilter id='magGlassGlow'%3E%3CfeGaussianBlur stdDeviation='1' result='coloredBlur'/%3E%3CfeMerge%3E%3CfeMergeNode in='coloredBlur'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Ccircle cx='18' cy='18' r='9' fill='url(%23glassGrad)' stroke='%23fbbf24' stroke-width='2.5' filter='url(%23magGlassGlow)'/%3E%3Ccircle cx='18' cy='18' r='9' fill='url(%23glassHighlight)'/%3E%3Ccircle cx='18' cy='18' r='3.5' fill='%23fbbf24' opacity='0.25'/%3E%3Cline x1='22' y1='22' x2='28' y2='28' stroke='%23fbbf24' stroke-width='2.5' stroke-linecap='round' filter='url(%23magGlassGlow)'/%3E%3C/svg%3E") 18 18, pointer`;

// Space theme - Star cursor
const SPACE_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40' width='40' height='40'%3E%3Cdefs%3E%3CradialGradient id='starGrad' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0%25' stop-color='%23ffffff' stop-opacity='1'/%3E%3Cstop offset='50%25' stop-color='%238b5cf6' stop-opacity='0.9'/%3E%3Cstop offset='100%25' stop-color='%236366f1' stop-opacity='0.7'/%3E%3C/radialGradient%3E%3Cfilter id='starGlow'%3E%3CfeGaussianBlur stdDeviation='3' result='coloredBlur'/%3E%3CfeMerge%3E%3CfeMergeNode in='coloredBlur'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3Cfilter id='starGlowOuter'%3E%3CfeGaussianBlur stdDeviation='6' result='coloredBlur'/%3E%3CfeMerge%3E%3CfeMergeNode in='coloredBlur'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Ccircle cx='20' cy='20' r='8' fill='%238b5cf6' opacity='0.4' filter='url(%23starGlowOuter)'/%3E%3Ccircle cx='20' cy='20' r='6.5' fill='url(%23starGrad)' filter='url(%23starGlow)'/%3E%3Ccircle cx='20' cy='20' r='4' fill='%23ffffff' opacity='0.95'/%3E%3Ccircle cx='20' cy='20' r='2' fill='%23ffffff' opacity='1'/%3E%3Ccircle cx='15' cy='15' r='1.2' fill='%23a78bfa' opacity='0.8' filter='url(%23starGlow)'/%3E%3Ccircle cx='25' cy='12' r='1' fill='%23ffffff' opacity='0.7' filter='url(%23starGlow)'/%3E%3Ccircle cx='28' cy='25' r='1.5' fill='%238b5cf6' opacity='0.6' filter='url(%23starGlow)'/%3E%3Ccircle cx='12' cy='25' r='1' fill='%23a78bfa' opacity='0.7' filter='url(%23starGlow)'/%3E%3C/svg%3E") 20 20, pointer`;

/**
 * Get cursor style based on theme
 * @param {string} theme - Theme name ('wizard', 'detective', or 'space')
 * @returns {string} Cursor CSS value
 */
export const getThemeCursor = (theme) => {
  switch (theme?.toLowerCase()) {
    case 'wizard':
      return WIZARD_CURSOR;
    case 'detective':
      return DETECTIVE_CURSOR;
    case 'space':
      return SPACE_CURSOR;
    default:
      return SPACE_CURSOR; // Default to space cursor
  }
};

/**
 * Get theme-specific icon/emoji
 * @param {string} theme - Theme name ('wizard', 'detective', or 'space')
 * @returns {string} Icon emoji
 */
export const getThemeIcon = (theme) => {
  switch (theme?.toLowerCase()) {
    case 'wizard':
      return '🪄'; // Magic wand
    case 'detective':
      return '🔍'; // Magnifying glass
    case 'space':
      return '⭐'; // Star
    default:
      return '⭐'; // Default to star
  }
};

