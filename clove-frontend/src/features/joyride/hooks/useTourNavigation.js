/**
 * Custom hook for handling tour navigation between routes
 * Manages route changes and ensures elements are ready before advancing steps
 */

import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { waitForElement } from '../utils/elementUtils';
import { TIMEOUTS } from '../config/tourConstants';

/**
 * Hook to handle navigation for tour steps
 * @param {Object} step - Current step configuration
 * @param {boolean} tourRunning - Whether tour is currently running
 * @param {Function} onNavigationComplete - Callback when navigation is complete
 * @returns {{isNavigating: boolean, navigationError: Error|null}}
 */
export const useTourNavigation = (step, tourRunning, onNavigationComplete) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationError, setNavigationError] = useState(null);
  const navigationRef = useRef(null);

  useEffect(() => {
    if (!tourRunning || !step) {
      setIsNavigating(false);
      setNavigationError(null);
      return;
    }

    const currentRoute = step.route;
    
    // If we're already on the correct route, check if element is ready
    if (currentRoute && location.pathname === currentRoute) {
      // Element should be ready, navigation complete
      if (onNavigationComplete) {
        onNavigationComplete();
      }
      return;
    }

    // If we need to navigate
    if (currentRoute && location.pathname !== currentRoute) {
      setIsNavigating(true);
      setNavigationError(null);

      // Navigate to the required route
      navigate(currentRoute, { replace: true });

      // Wait for element to appear after navigation
      const waitForTarget = async () => {
        try {
          await waitForElement(step.target, { timeout: TIMEOUTS.ELEMENT_WAIT });
          setIsNavigating(false);
          if (onNavigationComplete) {
            onNavigationComplete();
          }
        } catch (error) {
          setIsNavigating(false);
          setNavigationError(error);
          // Still call completion callback to prevent blocking
          if (onNavigationComplete) {
            onNavigationComplete();
          }
        }
      };

      // Small delay to allow navigation to start
      navigationRef.current = setTimeout(() => {
        waitForTarget();
      }, 100);

      return () => {
        if (navigationRef.current) {
          clearTimeout(navigationRef.current);
          navigationRef.current = null;
        }
      };
    }
  }, [tourRunning, step, location.pathname, navigate, onNavigationComplete]);

  return { isNavigating, navigationError };
};

