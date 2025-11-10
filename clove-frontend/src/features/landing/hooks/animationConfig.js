/**
 * Minimal, essential animation configuration for landing page
 * Only includes what's actually used by Features.jsx, Team.jsx, and Footer.jsx
 */

// Configuration constants
export const ANIMATION_CONFIG = {
  DURATION: 0.6,
  EASING: "easeOut",
  STAGGER: 0.2,
  DELAY: 0.1,
};

// ESSENTIAL ANIMATION VARIANTS (no extras)

// 1. Fade in up - for headers, text, simple content
export const fadeInUp = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: ANIMATION_CONFIG.DURATION, ease: ANIMATION_CONFIG.EASING }
  }
};

// 2. Scale in with fade - for cards, member profiles
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

// 3. Stagger container - for parent containers with staggered children
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

// 4. Stagger item - for individual items in containers
export const staggerItem = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: ANIMATION_CONFIG.DURATION, ease: ANIMATION_CONFIG.EASING }
  }
};

// 5. ScaleX animation - for lines/separators (Footer.jsx)
export const scaleX = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: ANIMATION_CONFIG.DURATION + 0.2, ease: ANIMATION_CONFIG.EASING }
  }
};

// 6. Hover effects for cards
export const hoverCard = {
  hover: {
    y: -8,
    scale: 1.02,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  }
};

// 7. Hover effects for team member images
export const hoverImage = {
  hover: {
    scale: 1.05,
    transition: { duration: 0.3 }
  }
};

// 8. Hover effects for social icons
export const hoverIcon = {
  hover: {
    scale: 1.2,
    y: -3,
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.9,
    transition: { duration: 0.1 }
  }
};

// COMPONENT-SPECIFIC CONFIGURATIONS

// For Features.jsx - matches original patterns
export const featureConfig = {
  container: {
    initial: "hidden",
    animate: "visible",
    variants: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: ANIMATION_CONFIG.STAGGER,
          delayChildren: ANIMATION_CONFIG.DELAY
        }
      }
    }
  },
  titleItem: fadeInUp,
  card: {
    initial: "hidden",
    animate: "visible",
    variants: {
      hidden: { y: 60, opacity: 0, scale: 0.9 },
      visible: (custom) => ({
        y: 0,
        opacity: 1,
        scale: 1,
        transition: {
          duration: ANIMATION_CONFIG.DURATION,
          delay: custom * 0.15,
          ease: ANIMATION_CONFIG.EASING
        }
      })
    },
    whileHover: hoverCard.hover
  }
};

// For Team.jsx - matches original patterns
export const teamConfig = {
  header: {
    initial: "hidden",
    animate: "visible",
    variants: fadeInUp
  },
  member: {
    initial: "hidden",
    animate: "visible",
    variants: {
      hidden: { y: 60, opacity: 0, scale: 0.9 },
      visible: (custom) => ({
        y: 0,
        opacity: 1,
        scale: 1,
        transition: {
          duration: ANIMATION_CONFIG.DURATION,
          delay: custom * 0.2,
          ease: ANIMATION_CONFIG.EASING
        }
      })
    },
    whileHover: { y: -10 }
  },
  image: {
    whileHover: hoverImage.hover
  },
  icon: {
    whileHover: hoverIcon.hover,
    whileTap: hoverIcon.tap
  }
};

// For Footer.jsx - matches original patterns
export const footerConfig = {
  line: {
    initial: { scaleX: 0 },
    animate: (isInView) => ({
      scaleX: isInView ? 1 : 0,
      transition: { duration: 0.8, ease: ANIMATION_CONFIG.EASING }
    })
  },
  column: {
    initial: "hidden",
    animate: "visible",
    variants: {
      hidden: { y: 30, opacity: 0 },
      visible: (custom) => ({
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.5,
          delay: custom * 0.1,
          ease: ANIMATION_CONFIG.EASING
        }
      })
    }
  },
  bottomContainer: {
    initial: { y: 20, opacity: 0 },
    animate: (isInView) => ({
      y: isInView ? 0 : 20,
      opacity: isInView ? 1 : 0,
      transition: { duration: 0.6, delay: 0.7 }
    })
  }
};

export default {
  ANIMATION_CONFIG,
  fadeInUp,
  scaleIn,
  staggerContainer,
  staggerItem,
  scaleX,
  hoverCard,
  hoverImage,
  hoverIcon,
  featureConfig,
  teamConfig,
  footerConfig
};