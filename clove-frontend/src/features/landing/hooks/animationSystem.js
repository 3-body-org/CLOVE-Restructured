import { useState, useRef, useEffect } from "react";
import { useInView } from "framer-motion";

/**
 * Custom hook for scroll-triggered animations with professional configuration
 */
export const useScrollAnimation = ({
  amount = 0.2,
  once = true,
  threshold = 0.1,
  rootMargin = "0px 0px -50px 0px",
} = {}) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  const isInView = useInView(ref, {
    amount,
    once,
    threshold,
    rootMargin
  });

  useEffect(() => {
    if (isInView && once) {
      setHasAnimated(true);
    }
  }, [isInView, once]);

  const shouldAnimate = once ? hasAnimated || isInView : isInView;

  return {
    ref,
    isInView,
    shouldAnimate,
    hasAnimated,
  };
};

/**
 * Animation configuration constants
 */
export const ANIMATION_CONFIG = {
  DURATION: 0.6,
  EASING: "easeOut",
  STAGGER: 0.2,
  DELAY: 0.1,
};

/**
 * Essential animation variants
 */
export const fadeInUp = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: ANIMATION_CONFIG.DURATION, ease: ANIMATION_CONFIG.EASING }
  }
};

export const scaleIn = {
  hidden: { y: 60, opacity: 0, scale: 0.9 },
  visible: (custom) => ({
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_CONFIG.DURATION,
      delay: custom * ANIMATION_CONFIG.STAGGER,
      ease: ANIMATION_CONFIG.EASING
    }
  })
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: ANIMATION_CONFIG.STAGGER,
      delayChildren: ANIMATION_CONFIG.DELAY
    }
  }
};

export const staggerItem = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: ANIMATION_CONFIG.DURATION, ease: ANIMATION_CONFIG.EASING }
  }
};

export const scaleX = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: ANIMATION_CONFIG.DURATION + 0.2, ease: ANIMATION_CONFIG.EASING }
  }
};