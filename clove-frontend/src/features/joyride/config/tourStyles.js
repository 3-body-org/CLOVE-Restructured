/**
 * Centralized styling configuration for Joyride tour
 * Extracted from inline styles for better maintainability
 */

import { COLORS, Z_INDEX } from './tourConstants';

/**
 * Joyride styles configuration
 * @see https://github.com/gilbarbara/react-joyride#styling
 */
export const joyrideStyles = {
  options: {
    primaryColor: COLORS.PRIMARY,
    textColor: COLORS.TEXT,
    backgroundColor: COLORS.BACKGROUND,
    overlayColor: COLORS.OVERLAY,
    arrowColor: COLORS.ARROW,
    zIndex: Z_INDEX.JOYRIDE,
  },
  tooltip: {
    borderRadius: 12,
    padding: 20,
  },
  tooltipContainer: {
    textAlign: 'left',
  },
  buttonNext: {
    backgroundColor: COLORS.PRIMARY,
    fontSize: '14px',
    fontWeight: 600,
    padding: '10px 20px',
    borderRadius: '8px',
    outline: 'none',
  },
  buttonBack: {
    color: COLORS.TEXT,
    marginRight: '10px',
    fontSize: '14px',
  },
  buttonSkip: {
    color: COLORS.BUTTON_SKIP,
    fontSize: '14px',
  },
};

/**
 * Floater props for customizing tooltip appearance
 * @see https://github.com/gilbarbara/react-joyride#floaterprops
 */
export const floaterProps = {
  disableAnimation: false,
  styles: {
    arrow: {
      length: 8,
      spread: 8,
    },
  },
};

