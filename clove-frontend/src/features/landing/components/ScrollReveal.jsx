import React from "react";
import { motion } from "framer-motion";
import { useScrollAnimation, fadeInUp, scaleIn, staggerContainer, staggerItem } from "../hooks/animationSystem";

/**
 * Professional scroll-triggered animation component
 * Replaces the basic AnimateOnScroll with configurable, reusable animations
 */
const ScrollReveal = ({
  children,
  animation = "fadeInUp", // fadeInUp | scaleIn | staggerContainer | staggerItem
  delay = 0,
  duration = 0.6,
  className = "",
  amount = 0.2,
  once = true,
  threshold = 0.1,
  rootMargin = "0px 0px -50px 0px",
  custom = 0, // for custom animations that accept a custom parameter
  ...props
}) => {
  const { ref, shouldAnimate } = useScrollAnimation({
    amount,
    once,
    threshold,
    rootMargin
  });

  // Get animation variant based on type
  const getAnimationVariant = () => {
    switch (animation) {
      case "fadeInUp":
        return {
          hidden: fadeInUp.hidden,
          visible: {
            ...fadeInUp.visible,
            transition: { ...fadeInUp.visible.transition, delay: delay || 0 }
          }
        };
      
      case "scaleIn":
        return {
          hidden: scaleIn.hidden,
          visible: (customValue) => ({
            ...scaleIn.visible(customValue),
            transition: { 
              ...scaleIn.visible(customValue).transition, 
              delay: delay || 0 
            }
          })
        };
      
      case "staggerContainer":
        return {
          hidden: staggerContainer.hidden,
          visible: {
            ...staggerContainer.visible,
            transition: { 
              ...staggerContainer.visible.transition, 
              delayChildren: delay || 0 
            }
          }
        };
      
      case "staggerItem":
        return {
          hidden: staggerItem.hidden,
          visible: {
            ...staggerItem.visible,
            transition: { 
              ...staggerItem.visible.transition, 
              delay: delay || 0 
            }
          }
        };
      
      default:
        return {
          hidden: fadeInUp.hidden,
          visible: {
            ...fadeInUp.visible,
            transition: { ...fadeInUp.visible.transition, delay: delay || 0 }
          }
        };
    }
  };

  const variants = getAnimationVariant();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={shouldAnimate ? "visible" : "hidden"}
      variants={variants}
      custom={custom}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Specialized component for staggered animations
 */
export const ScrollRevealStagger = ({
  children,
  delay = 0,
  staggerDelay = 0.2,
  className = "",
  amount = 0.2,
  once = true,
  ...props
}) => {
  const { ref, shouldAnimate } = useScrollAnimation({
    amount,
    once,
    rootMargin: "0px 0px -50px 0px"
  });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={shouldAnimate ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay
          }
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Individual item for staggered containers
 */
export const ScrollRevealItem = ({
  children,
  animation = "fadeInUp", // Individual animation for each item
  className = "",
  ...props
}) => {
  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      className={className}
      variants={itemVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;