import { ANIMATION_DURATIONS } from '../content/animationConfig';

/**
 * Creates a ripple effect on a card element
 * @param {HTMLElement} card - The card element to apply ripple to
 * @param {MouseEvent} event - The click event
 * @param {string} hexColor - The hex color for the ripple (e.g., '#6EE7B7')
 */
export const createRippleEffect = (card, event, hexColor) => {
  const ripple = document.createElement('span');
  const rect = card.getBoundingClientRect();
  
  // Calculate click position relative to card
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // Convert hex to rgba for theme color
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Set ripple properties
  ripple.className = 'ripple-effect';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.background = `rgba(${r}, ${g}, ${b}, 0.6)`;
  
  // Add to card
  card.appendChild(ripple);
  
  // Remove after animation
  setTimeout(() => {
    ripple.remove();
  }, ANIMATION_DURATIONS.RIPPLE);
};

