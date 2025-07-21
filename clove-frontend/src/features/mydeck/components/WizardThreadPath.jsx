import React from 'react';
import path1 from 'assets/icons/wizard/icon-path1.svg';
import path2 from 'assets/icons/wizard/icon-path2.svg';
import path3 from 'assets/icons/wizard/icon-path3.svg';

const PATHS = [path1, path2, path3];
const NATURAL_WIDTH = 80; // px, adjust to your SVG's natural width
const NATURAL_HEIGHT = 971; // px, adjust to your SVG's natural height
const GLOW = '0 0 32px 8px #f5d782, 0 0 64px 16px #3fbabf'; // gold and teal glow

function getAngle(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
}

function getDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

const WizardThreadPath = ({ centers, lockedStates = [] }) => {
  if (!centers || centers.length < 2) return null;

  return (
    <>
      {centers.slice(0, -1).map((pt, i) => {
        const next = centers[i + 1];
        if (!next) return null;
        const pathImg = PATHS[i] || PATHS[PATHS.length - 1];
        const angle = getAngle(pt.x, pt.y, next.x, next.y);
        const distance = getDistance(pt.x, pt.y, next.x, next.y);
        const centerX = (pt.x + next.x) / 2;
        const centerY = (pt.y + next.y) / 2;
        const scale = (distance / NATURAL_HEIGHT) * 1.3;
        const width = NATURAL_WIDTH * scale;
        const height = distance * 1.3;
        // If the next node is locked, grey out the path
        const isLocked = lockedStates[i + 1];
        const filter = isLocked ? 'grayscale(1)' : `drop-shadow(${GLOW})`;
        return (
          <img
            key={i}
            src={pathImg}
            alt={`wizard-path-segment-${i}`}
            style={{
              position: 'absolute',
              left: centerX - width / 2,
              top: centerY - height / 2,
              width: width,
              height: height,
              transform: `rotate(${angle - 90}deg)`,
              filter
            }}
            draggable={false}
            aria-hidden="true"
          />
        );
      })}
    </>
  );
};

export default WizardThreadPath; 