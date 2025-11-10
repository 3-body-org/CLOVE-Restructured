import { useState, useRef, useEffect } from "react";
import { useInView } from "framer-motion";

/**
 * Custom hook for scroll-triggered animations with professional configuration
 * @param {Object} options - Configuration options
 * @param {number} options.amount - Threshold for triggering animation (0-1)
 * @param {boolean} options.once - Whether animation should only run once
 * @param {number} options.threshold - Custom threshold value
 * @param {string} options.rootMargin - Root margin for intersection observer
 * @returns {Object} Animation state and refs
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

  // Determine if animation should be visible
  const shouldAnimate = once ? hasAnimated || isInView : isInView;

  return {
    ref,
    isInView,
    shouldAnimate,
    hasAnimated,
  };
};

/**
 * Hook for staggered animations (multiple items with delays)
 * @param {Object} options - Configuration options
 * @param {number} options.itemCount - Number of items to animate
 * @param {number} options.staggerDelay - Delay between each item animation
 * @param {number} options.baseDelay - Initial delay before first item
 * @returns {Object} Staggered animation configuration
 */
export const useStaggeredAnimation = ({
  itemCount = 3,
  staggerDelay = 0.1,
  baseDelay = 0,
} = {}) => {
  const [visibleItems, setVisibleItems] = useState(new Set());
  
  useEffect(() => {
    // Initialize all items as hidden
    setVisibleItems(new Set(Array.from({ length: itemCount }, (_, i) => i)));
  }, [itemCount]);

  const markItemVisible = (index) => {
    setVisibleItems(prev => new Set([...prev, index]));
  };

  const getItemAnimation = (index) => {
    const delay = visibleItems.has(index) 
      ? baseDelay + (index * staggerDelay)
      : 0;
    
    return {
      initial: "hidden",
      animate: "visible",
      transition: { delay }
    };
  };

  return {
    markItemVisible,
    getItemAnimation,
    staggerDelay,
    baseDelay,
  };
};