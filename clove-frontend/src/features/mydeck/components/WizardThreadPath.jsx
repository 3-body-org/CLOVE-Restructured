/**
 * @file WizardThreadPath.jsx
 * @description Renders the animated thread path between wizard subtopic nodes using themed SVGs.
 */

import PropTypes from 'prop-types';
import path1 from 'assets/icons/wizard/icon-path1.svg';
import path2 from 'assets/icons/wizard/icon-path2.svg';
import path3 from 'assets/icons/wizard/icon-path3.svg';

const PATHS = [path1, path2, path3];
const SVG_NATURAL_WIDTH = 80; // px
const SVG_NATURAL_HEIGHT = 971; // px
const PATH_SCALE_FACTOR = 1.3;
const GLOW_FILTER = '0 0 32px 8px #f5d782, 0 0 64px 16px #3fbabf'; // gold and teal glow

/**
 * Calculate the angle (in degrees) between two points.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number}
 */
function getAngle(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
}

/**
 * Calculate the distance between two points.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number}
 */
function getDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * WizardThreadPath
 * Renders the thread path between wizard subtopic nodes.
 * @param {Object} props
 * @param {Array<{x: number, y: number}>} props.centers - Array of node center points.
 * @param {Array<boolean>} [props.lockedStates=[]] - Array indicating if the next node is locked.
 */
const WizardThreadPath = ({ centers, lockedStates = [] }) => {
  if (!centers || centers.length < 2) return null;

  return (
    <>
      {centers.slice(0, -1).map((start, i) => {
        const end = centers[i + 1];
        if (!end) return null;
        const pathImg = PATHS[i] || PATHS[PATHS.length - 1];
        const angle = getAngle(start.x, start.y, end.x, end.y);
        const distance = getDistance(start.x, start.y, end.x, end.y);
        const centerX = (start.x + end.x) / 2;
        const centerY = (start.y + end.y) / 2;
        const scale = (distance / SVG_NATURAL_HEIGHT) * PATH_SCALE_FACTOR;
        const width = SVG_NATURAL_WIDTH * scale;
        const height = distance * PATH_SCALE_FACTOR;
        const isLocked = lockedStates[i + 1];
        const filter = isLocked ? 'grayscale(1)' : `drop-shadow(${GLOW_FILTER})`;
        return (
          <img
            key={i}
            src={pathImg}
            alt={`wizard-path-segment-${i}`}
            style={{
              position: 'absolute',
              left: centerX - width / 2,
              top: centerY - height / 2,
              width,
              height,
              transform: `rotate(${angle - 90}deg)`,
              filter,
            }}
            draggable={false}
            aria-hidden="true"
          />
        );
      })}
    </>
  );
};

WizardThreadPath.propTypes = {
  centers: PropTypes.arrayOf(
    PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    })
  ).isRequired,
  lockedStates: PropTypes.arrayOf(PropTypes.bool),
};

export default WizardThreadPath; 