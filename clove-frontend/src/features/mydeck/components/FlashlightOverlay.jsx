import { useEffect, useRef, useState } from 'react';
import styles from '../themes/detectiveTheme.module.scss';

/**
 * The radius of the flashlight effect in pixels.
 * @type {number}
 */
const FLASHLIGHT_RADIUS = 200;

/**
 * The color of the darkness overlay.
 * @type {string}
 */
const DARKNESS_COLOR = 'rgba(10, 10, 10, 0.92)';

/**
 * Creates a CSS radial gradient mask for the flashlight effect.
 * @param {number} x - X coordinate of the flashlight center
 * @param {number} y - Y coordinate of the flashlight center
 * @returns {string} - CSS background property value
 */
function createFlashlightMask(x, y) {
  return `radial-gradient(circle ${FLASHLIGHT_RADIUS}px at ${x}px ${y}px, transparent 0%, transparent 55%, rgba(10,10,10,0.15) 70%, rgba(10,10,10,0.4) 80%, rgba(10,10,10,0.7) 90%, ${DARKNESS_COLOR} 100%)`;
}

/**
 * FlashlightOverlay
 * Renders a full-page darkness overlay with a radial "flashlight" effect following the mouse.
 * Used for detective/noir themes.
 */
const FlashlightOverlay = () => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Get mouse position relative to the overlay's bounding box
      if (overlayRef.current) {
        const rect = overlayRef.current.getBoundingClientRect();
        setCoords({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={overlayRef}
      className={styles.flashlightOverlay}
      style={{ background: createFlashlightMask(coords.x, coords.y) }}
      aria-hidden="true"
    />
  );
};

export default FlashlightOverlay; 