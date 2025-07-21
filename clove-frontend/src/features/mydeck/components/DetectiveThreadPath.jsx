import React, { useEffect, useState, useRef } from 'react';
import pinSvg from 'assets/icons/noir/icon-pin.svg'; // Pin SVG for detective theme

// Helper to get the center of a node
function getCenter(ref, containerRef) {
  if (!ref?.current || !containerRef?.current) return { x: 0, y: 0 };
  const nodeRect = ref.current.getBoundingClientRect();
  const containerRect = containerRef.current.getBoundingClientRect();
  return {
    x: nodeRect.left - containerRect.left + nodeRect.width / 2,
    y: nodeRect.top - containerRect.top + nodeRect.height / 2,
  };
}

const PIN_RADIUS = 10;
const PIN_COLOR = '#e53935';
const THREAD_COLOR = '#5a120a'; // darker red to match screenshot
const THREAD_WIDTH = 5; // increased from 3
const WIGGLE_RANGE = 20; // px
const WIGGLE_MAX = 8; // px, subtle
const WIGGLE_DECAY = 0.15; // decay per frame
const WIGGLE_FREQ = 2.5; // Hz

function distanceToSegment(px, py, x1, y1, x2, y2) {
  // Returns the distance from point (px,py) to the segment (x1,y1)-(x2,y2)
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

const DetectiveThreadPath = ({ nodeRefs, svgContainerRef, nodeOrder }) => {
  const [centers, setCenters] = useState([]);
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });
  const [wiggle, setWiggle] = useState([]); // amplitude per segment
  const mousePos = useRef({ x: null, y: null });
  const animRef = useRef();

  // Update node centers and SVG size on layout changes
  useEffect(() => {
    function update() {
      if (!svgContainerRef?.current) return;
      const containerRect = svgContainerRef.current.getBoundingClientRect();
      setSvgSize({ width: containerRect.width, height: containerRect.height });
      setCenters(
        nodeOrder.map(key => getCenter(nodeRefs[key], svgContainerRef))
      );
    }
    update();
    window.addEventListener('resize', update);
    let observer;
    if (svgContainerRef?.current && window.ResizeObserver) {
      observer = new window.ResizeObserver(update);
      observer.observe(svgContainerRef.current);
    }
    return () => {
      window.removeEventListener('resize', update);
      if (observer && svgContainerRef.current) observer.disconnect();
    };
  }, [nodeRefs, svgContainerRef, nodeOrder]);

  // Mouse tracking
  useEffect(() => {
    function handleMove(e) {
      if (!svgContainerRef?.current) return;
      const rect = svgContainerRef.current.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
    function handleLeave() {
      mousePos.current = { x: null, y: null };
    }
    const el = svgContainerRef?.current;
    if (el) {
      el.addEventListener('mousemove', handleMove);
      el.addEventListener('mouseleave', handleLeave);
    }
    return () => {
      if (el) {
        el.removeEventListener('mousemove', handleMove);
        el.removeEventListener('mouseleave', handleLeave);
      }
    };
  }, [svgContainerRef]);

  // Wiggle animation
  useEffect(() => {
    let running = true;
    let phase = 0;
    function animate() {
      if (!running) return;
      phase += 0.12; // ~60fps, so this is about 2*PI per second
      const newWiggle = [];
      for (let i = 1; i < centers.length; i++) {
        let amp = 0;
        if (mousePos.current.x !== null && mousePos.current.y !== null) {
          // Distance from mouse to segment
          const d = distanceToSegment(
            mousePos.current.x, mousePos.current.y,
            centers[i - 1].x, centers[i - 1].y,
            centers[i].x, centers[i].y
          );
          if (d < WIGGLE_RANGE) {
            amp = WIGGLE_MAX * (1 - d / WIGGLE_RANGE);
          }
        }
        // Decay previous wiggle if no mouse
        if (wiggle[i - 1]) {
          amp = Math.max(amp, wiggle[i - 1] * (1 - WIGGLE_DECAY));
        }
        newWiggle.push(amp);
      }
      setWiggle(newWiggle);
      animRef.current = requestAnimationFrame(animate);
    }
    animRef.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line
  }, [centers]);

  // Build SVG path string connecting all centers with rope sag and wiggle
  function buildPath(points, wiggleArr) {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const midX = (prev.x + curr.x) / 2 + (Math.random() - 0.5) * 4; // up to ±2px random
      // Rope sag
      let sag = Math.abs(dx) < 40 ? 0 : Math.max(10, dist * 0.10);
      // Add wiggle if present
      let wiggleY = 0;
      if (wiggleArr && wiggleArr[i - 1]) {
        // Wiggle is sinusoidal, phase based on time and segment index
        const t = Date.now() / 300 + i * 0.7;
        wiggleY = Math.sin(t * WIGGLE_FREQ) * wiggleArr[i - 1];
      }
      const midY = (prev.y + curr.y) / 2 + sag + wiggleY;
      d += ` Q ${midX} ${midY}, ${curr.x} ${curr.y}`;
    }
    return d;
  }

  return (
    <svg
      width={svgSize.width}
      height={svgSize.height}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 20 }}
    >
      <defs>
        <linearGradient id="thread-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5a120a" />
          <stop offset="100%" stopColor="#b12a1b" />
        </linearGradient>
      </defs>
      {/* Draw the thread path as a thin, sagging, wiggling red rope */}
      {centers.length > 1 && (
        <path
          d={buildPath(centers, wiggle)}
          fill="none"
          stroke="url(#thread-gradient)"
          strokeWidth={THREAD_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {/* Draw pin SVGs at each node center, aligning the pin tip to the node center */}
      {centers.map((pt, i) => {
        // Pin SVG original size: 402x484, so aspect ratio is ~0.83
        const pinWidth = 32; // px
        const pinHeight = 38; // px (slightly taller for visual effect)
        // Align the bottom center of the pin to the node center
        const x = pt.x - pinWidth / 2;
        const y = pt.y - pinHeight + 4; // +4px fudge so the tip is at the center
        return (
          <image
            key={i}
            href={pinSvg}
            x={x}
            y={y}
            width={pinWidth}
            height={pinHeight}
            style={{ zIndex: 21 }}
            aria-label="Pin"
          />
        );
      })}
    </svg>
  );
};

export default DetectiveThreadPath; 