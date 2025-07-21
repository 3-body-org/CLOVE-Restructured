import { useEffect, useRef, useCallback } from "react";

/**
 * A single particle in the particle system
 * @class
 */
class Particle {
  /**
   * Creates a new particle instance
   * @param {HTMLCanvasElement} canvas - The canvas element to render the particle on
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.size = Math.random() * 2;
    this.speedX = Math.random() * 3 - 1.5;
    this.speedY = Math.random() * 3 - 1.5;
    this.opacity = Math.random() * 0.5 + 0.1;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (
      this.x > this.canvas.width ||
      this.x < 0 ||
      this.y > this.canvas.height ||
      this.y < 0
    ) {
      this.reset();
      this.y = Math.random() * this.canvas.height;
    }
  }

  draw() {
    this.ctx.fillStyle = `rgba(168, 165, 230, ${this.opacity})`;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    this.ctx.fill();
  }
}

/**
 * Custom hook that initializes and manages a particle animation system on a canvas
 *
 * @example
 * // Basic usage in a component
 * const canvasRef = useRef(null);
 * const { currentTheme } = useTheme();
 * useParticles(canvasRef, currentTheme);
 *
 * // In your component's JSX
 * <canvas ref={canvasRef} className="particle-canvas" />
 *
 * @param {React.RefObject<HTMLCanvasElement>} canvasRef - Ref object pointing to the canvas element
 * @param {string} [theme='space'] - Current theme name, only activates for 'space' theme
 * @param {number} [particleCount=100] - Number of particles to render
 * @returns {Object} Particle system controls (currently empty, but can be extended)
 *
 * @description
 * This hook creates an animated particle system that's specifically designed for the space theme.
 * It automatically handles:
 * - Canvas resizing
 * - Animation frame management
 * - Cleanup on unmount or theme change
 * - Performance optimization
 */
export const useParticles = (
  canvasRef,
  theme = "space",
  particleCount = 100
) => {
  const animationFrameId = useRef();
  const particles = useRef([]);

  const initParticles = useCallback(() => {
    if (!canvasRef.current) return [];
    return Array(particleCount)
      .fill()
      .map(() => new Particle(canvasRef.current));
  }, [canvasRef, particleCount]);

  const animate = useCallback(() => {
    if (!canvasRef.current || !particles.current.length) return;

    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    particles.current.forEach((particle) => {
      particle.update();
      particle.draw();
    });

    animationFrameId.current = requestAnimationFrame(animate);
  }, [canvasRef]);

  const handleResize = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const { width, height } = canvas.getBoundingClientRect();

    // Only update if size actually changed
    if (canvas.width !== width || canvas.height !== height) {
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Reset particles on resize
      particles.current = initParticles();
    }
  }, [canvasRef, initParticles]);

  useEffect(() => {
    // Only initialize particles for space theme
    if (theme !== "space") {
      // Clean up any existing canvas if theme changes
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
        }
      }
      return;
    }

    if (!canvasRef.current) return;

    // Initialize particles
    particles.current = initParticles();

    // Set up initial canvas size
    handleResize();

    // Start animation
    animationFrameId.current = requestAnimationFrame(animate);

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [canvasRef, animate, handleResize, initParticles, theme]);

  return { particles };
};
