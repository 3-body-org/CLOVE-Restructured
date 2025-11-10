/**
 * @file SpaceBackground.jsx
 * @description A React component that renders a full-page animated background
 * of a starfield for the 'space' theme.
 */

import { useRef, useEffect } from 'react';

/**
 * Default star layers for the space theme.
 */
const DEFAULT_STAR_LAYERS = [
  { count: 400, size: 1, speed: 0.25 }, // small, fast
  { count: 200, size: 2, speed: 0.12 }, // medium
  { count: 100, size: 3, speed: 0.06 }, // big, slow
];

/**
 * Generate a random star position within the given width and height.
 * @param {number} width
 * @param {number} height
 * @returns {{x: number, y: number}}
 */
function randomStar(width, height) {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
  };
}

/**
 * SpaceBackground
 * Renders a full-page animated starfield for the space theme.
 * @param {Object} props
 * @param {Array} [props.starLayers] - Array of star layer configs (count, size, speed).
 * @param {string} [props.starColor='#FFF'] - Color of the stars.
 * @param {number} [props.starOpacity=0.7] - Opacity of the stars.
 */
const SpaceBackground = ({
  starLayers = DEFAULT_STAR_LAYERS,
  starColor = '#FFF',
  starOpacity = 0.7,
}) => {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const animationRef = useRef();

  // Initialize stars
  const initStars = (width, height) => {
    let stars = [];
    starLayers.forEach(layer => {
      for (let i = 0; i < layer.count; i++) {
        stars.push({
          ...randomStar(width, height),
          size: layer.size,
          speed: layer.speed,
        });
      }
    });
    starsRef.current = stars;
  };

  // Resize canvas and re-init stars
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth * dpr;
    // Use the full scrollable height of the document
    const height = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      window.innerHeight
    ) * dpr;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      window.innerHeight
    ) + 'px';
    initStars(width, height);
  };

  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const height = canvas.height;
    // Animate stars
    for (let star of starsRef.current) {
      star.y -= star.speed * dpr;
      if (star.y < 0) {
        star.y = height;
        star.x = Math.random() * canvas.width;
      }
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * dpr, 0, 2 * Math.PI);
      ctx.fillStyle = starColor;
      ctx.globalAlpha = starOpacity;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    resizeCanvas();
    animationRef.current = requestAnimationFrame(animate);
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
    // eslint-disable-next-line
  }, [starLayers, starColor, starOpacity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        background: 'transparent',
      }}
      aria-hidden="true"
    />
  );
};

export default SpaceBackground;
