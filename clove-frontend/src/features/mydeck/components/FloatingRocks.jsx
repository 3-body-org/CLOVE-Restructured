import React, { useState, useEffect, useRef } from 'react';
import { getThemeConfig } from '../themes/themeConfig';

const FloatingRocks = ({ 
  fromRef, 
  toRef, 
  filled, 
  progress, 
  theme = 'space', // Default to space theme
  svgContainerRef 
}) => {
  const [points, setPoints] = useState([]);
  // For each rock, store its current and target drift offset
  const driftState = useRef([]);
  const [animTime, setAnimTime] = useState(0);
  const [mouse, setMouse] = useState({ x: null, y: null });

  // Get theme-specific configuration
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

  // Don't render if no images are configured for this theme
  if (!rockImages || rockImages.length === 0) {
    return null;
  }

  // Animate time
  useEffect(() => {
    let frame;
    function animate() {
      setAnimTime(t => t + 0.016); // ~60fps
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Mouse tracking
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

  // Helper to get center of a node relative to the SVG container
  const getCenter = (ref) => {
    if (!ref?.current || !svgContainerRef?.current) return { x: 0, y: 0 };
    const nodeRect = ref.current.getBoundingClientRect();
    const containerRect = svgContainerRef.current.getBoundingClientRect();
    return {
      x: nodeRect.left - containerRect.left + nodeRect.width / 2,
      y: nodeRect.top - containerRect.top + nodeRect.height / 2,
    };
  };

  useEffect(() => {
    function updatePoints() {
      if (!fromRef?.current || !toRef?.current) return;
      const start = getCenter(fromRef);
      const end = getCenter(toRef);
      const rocks = [];
      
      // Deterministic random curve strength and direction per path
      const hash = Math.abs(
        Math.floor(start.x * 13 + start.y * 17 + end.x * 19 + end.y * 23)
      );
      const curveStrength = (hash % 25) / 100 - 0.12; // -0.12 to +0.13
      
      // Calculate control point for the curve
      const cx = (start.x + end.x) / 2 + (end.y - start.y) * curveStrength;
      const cy = (start.y + end.y) / 2 - (end.x - start.x) * curveStrength;
      
      // Initialize drift state if needed
      if (driftState.current.length !== numElements) {
        driftState.current = Array(numElements).fill().map(() => ({
          current: { x: 0, y: 0 },
          target: { x: 0, y: 0 },
          lastUpdate: 0,
          interval: 5 + Math.random() * 3 // 5-8 seconds
        }));
      }
      
      for (let i = 0; i < numElements; i++) {
        const t = i / (numElements - 1);
        // Quadratic Bezier curve
        const x0 = start.x, y0 = start.y, x1 = cx, y1 = cy, x2 = end.x, y2 = end.y;
        const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * x1 + t * t * x2;
        const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2;
        
        // Compute tangent for perpendicular offset
        const dx = 2 * (1 - t) * (x1 - x0) + 2 * t * (x2 - x1);
        const dy = 2 * (1 - t) * (y1 - y0) + 2 * t * (y2 - y1);
        const len = Math.hypot(dx, dy) || 1;
        
        // Perpendicular direction
        const px = -dy / len;
        const py = dx / len;
        
        // Wavy offset using theme configuration
        const offset = Math.sin(t * Math.PI * waveFrequency) * waveAmplitude;
        let wx = x + px * offset;
        let wy = y + py * offset;
        
        // Occasional, subtle drift for each element
        // Update target drift every interval
        const drift = driftState.current[i];
        if (animTime - drift.lastUpdate > drift.interval) {
          drift.target = {
            x: (Math.random() - 0.5) * driftRange,
            y: (Math.random() - 0.5) * driftRange
          };
          drift.lastUpdate = animTime;
          drift.interval = 5 + Math.random() * 3; // 5-8 seconds
        }
        
        // Interpolate current toward target
        drift.current.x += (drift.target.x - drift.current.x) * 0.03;
        drift.current.y += (drift.target.y - drift.current.y) * 0.03;
        wx += drift.current.x;
        wy += drift.current.y;
        
        // Mouse attract effect using theme configuration
        if (mouse.x !== null && mouse.y !== null) {
          const dist = Math.hypot(wx - mouse.x, wy - mouse.y);
          if (dist < mouseAttractRadius) {
            const attractStrength = (mouseAttractRadius - dist) / mouseAttractRadius * mouseAttractStrength;
            wx += (mouse.x - wx) / dist * attractStrength;
            wy += (mouse.y - wy) / dist * attractStrength;
          }
        }
        
        // Skip elements inside the safe zone of either node
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
    
    // Use ResizeObserver for the SVG container
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