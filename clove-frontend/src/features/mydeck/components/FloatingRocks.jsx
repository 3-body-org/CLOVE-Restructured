import { useState, useEffect, useRef } from 'react';
import { getThemeConfig } from '../themes/themeConfig';

/**
 * Calculate the center of a DOM node relative to a container.
 * @param {object} ref - React ref to the node
 * @param {object} containerRef - React ref to the container
 * @returns {{x: number, y: number}}
 */
function getCenter(ref, containerRef) {
  if (!ref?.current || !containerRef?.current) return { x: 0, y: 0 };
  const nodeRect = ref.current.getBoundingClientRect();
  const containerRect = containerRef.current.getBoundingClientRect();
  return {
    x: nodeRect.left - containerRect.left + nodeRect.width / 2,
    y: nodeRect.top - containerRect.top + nodeRect.height / 2,
  };
}

/**
 * Quadratic Bezier interpolation.
 * @param {number} t - Parameter (0-1)
 * @param {number} x0 - Start x
 * @param {number} y0 - Start y
 * @param {number} x1 - Control x
 * @param {number} y1 - Control y
 * @param {number} x2 - End x
 * @param {number} y2 - End y
 * @returns {{x: number, y: number}}
 */
function bezier(t, x0, y0, x1, y1, x2, y2) {
  return {
    x: (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * x1 + t * t * x2,
    y: (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2,
  };
}

/**
 * FloatingRocks
 * Renders animated floating elements (rocks) along a bezier curve between two points.
 * Supports theme-based configuration, drift, mouse attraction, and progress-based glow.
 */
const FloatingRocks = ({ 
  fromRef, 
  toRef, 
  filled, 
  progress, 
  theme = 'space',
  svgContainerRef 
}) => {
  const [points, setPoints] = useState([]);
  const driftState = useRef([]);
  const [animTime, setAnimTime] = useState(0);
  const [mouse, setMouse] = useState({ x: null, y: null });

  // Theme config
  const themeConfig = getThemeConfig(theme);
  const {
    images: rockImages,
    numElements,
    safeZone,
    waveAmplitude,
    waveFrequency,
    driftRange,
    mouseAttractRadius,
    mouseAttractStrength,
    glowColor,
    glowIntensity
  } = themeConfig.floatingElements;

  if (!rockImages || rockImages.length === 0) return null;

  // Animation frame for time
  useEffect(() => {
    let frame;
    function animate() {
      setAnimTime(t => t + 0.016);
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Mouse tracking for interactive drift
  useEffect(() => {
    function handleMove(e) {
      if (!svgContainerRef?.current) return;
      const rect = svgContainerRef.current.getBoundingClientRect();
      setMouse({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    function handleLeave() {
      setMouse({ x: null, y: null });
    }
    const svg = svgContainerRef?.current;
    if (svg) {
      svg.addEventListener('mousemove', handleMove);
      svg.addEventListener('mouseleave', handleLeave);
    }
    return () => {
      if (svg) {
        svg.removeEventListener('mousemove', handleMove);
        svg.removeEventListener('mouseleave', handleLeave);
      }
    };
  }, [svgContainerRef]);

  // Main effect: calculate rock positions and animate
  useEffect(() => {
    function updatePoints() {
      if (!fromRef?.current || !toRef?.current) return;
      const start = getCenter(fromRef, svgContainerRef);
      const end = getCenter(toRef, svgContainerRef);
      const rocks = [];
      // Deterministic curve strength per path
      const hash = Math.abs(
        Math.floor(start.x * 13 + start.y * 17 + end.x * 19 + end.y * 23)
      );
      const curveStrength = (hash % 25) / 100 - 0.12;
      // Bezier control point
      const cx = (start.x + end.x) / 2 + (end.y - start.y) * curveStrength;
      const cy = (start.y + end.y) / 2 - (end.x - start.x) * curveStrength;
      // Initialize drift state
      if (driftState.current.length !== numElements) {
        driftState.current = Array(numElements).fill().map(() => ({
          current: { x: 0, y: 0 },
          target: { x: 0, y: 0 },
          lastUpdate: 0,
          interval: 5 + Math.random() * 3
        }));
      }
      for (let i = 0; i < numElements; i++) {
        const t = i / (numElements - 1);
        const { x, y } = bezier(t, start.x, start.y, cx, cy, end.x, end.y);
        // Tangent for perpendicular offset
        const dx = 2 * (1 - t) * (cx - start.x) + 2 * t * (end.x - cx);
        const dy = 2 * (1 - t) * (cy - start.y) + 2 * t * (end.y - cy);
        const len = Math.hypot(dx, dy) || 1;
        const px = -dy / len;
        const py = dx / len;
        // Wavy offset
        const offset = Math.sin(t * Math.PI * waveFrequency) * waveAmplitude;
        let wx = x + px * offset;
        let wy = y + py * offset;
        // Drift
        const drift = driftState.current[i];
        if (animTime - drift.lastUpdate > drift.interval) {
          drift.target = {
            x: (Math.random() - 0.5) * driftRange,
            y: (Math.random() - 0.5) * driftRange
          };
          drift.lastUpdate = animTime;
          drift.interval = 5 + Math.random() * 3;
        }
        drift.current.x += (drift.target.x - drift.current.x) * 0.03;
        drift.current.y += (drift.target.y - drift.current.y) * 0.03;
        wx += drift.current.x;
        wy += drift.current.y;
        // Mouse attract
        if (mouse.x !== null && mouse.y !== null) {
          const dist = Math.hypot(wx - mouse.x, wy - mouse.y);
          if (dist < mouseAttractRadius) {
            const attractStrength = (mouseAttractRadius - dist) / mouseAttractRadius * mouseAttractStrength;
            wx += (mouse.x - wx) / dist * attractStrength;
            wy += (mouse.y - wy) / dist * attractStrength;
          }
        }
        // Skip elements inside the safe zone
        const distToStart = Math.hypot(wx - start.x, wy - start.y);
        const distToEnd = Math.hypot(wx - end.x, wy - end.y);
        if (distToStart < safeZone || distToEnd < safeZone) continue;
        const imgIdx = i % rockImages.length;
        const rotation = (i * 47) % 360;
        const scale = 0.9 + ((i * 31) % 7) / 10;
        rocks.push({ x: wx, y: wy, t, imgIdx, rotation, scale });
      }
      setPoints(rocks);
    }
    updatePoints();
    window.addEventListener('resize', updatePoints);
    let observer;
    if (svgContainerRef?.current && window.ResizeObserver) {
      observer = new window.ResizeObserver(updatePoints);
      observer.observe(svgContainerRef.current);
    }
    return () => {
      window.removeEventListener('resize', updatePoints);
      if (observer && svgContainerRef?.current) observer.disconnect();
    };
  }, [fromRef, toRef, animTime, mouse, themeConfig, numElements, safeZone, waveAmplitude, waveFrequency, driftRange, mouseAttractRadius, mouseAttractStrength, rockImages, svgContainerRef]);

  // Progress-based glowing logic
  const numRocks = points.length;
  const glowingRocks = Math.round((progress ?? 0) * numRocks);
  
  return (
    <g>
      {points.map((pt, i) => (
        <image
          key={i}
          href={rockImages[pt.imgIdx]}
          x={pt.x - 16 * pt.scale}
          y={pt.y - 16 * pt.scale}
          width={32 * pt.scale}
          height={32 * pt.scale}
          style={{
            opacity: filled ? 1 : 0.7,
            filter: filled && i < glowingRocks ? `drop-shadow(${glowIntensity} ${glowColor})` : 'grayscale(1)',
            transition: 'filter 0.3s, opacity 0.3s',
          }}
          transform={`rotate(${pt.rotation}, ${pt.x}, ${pt.y})`}
        />
      ))}
    </g>
  );
};

export default FloatingRocks; 