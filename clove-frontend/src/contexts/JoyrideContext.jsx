import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const JoyrideContext = createContext(null);

const STORAGE_KEY = 'joyride_completed';

export const JoyrideProvider = ({ children }) => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationTimerRef = useRef(null); // Store navigation timer to clear it if needed
  // These hooks require Router context - must be inside Router
  const navigate = useNavigate();
  const location = useLocation();

  // Check if joyride was completed before
  const isCompleted = () => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  };

  // Start the tour
  const startTour = useCallback(() => {
    setStepIndex(0);
    setRun(true);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Stop the tour
  const stopTour = useCallback(() => {
    setRun(false);
    setStepIndex(0);
    setIsNavigating(false); // Clear navigation state when stopping tour
    // Clear any pending navigation timers
    if (navigationTimerRef.current) {
      clearTimeout(navigationTimerRef.current);
      navigationTimerRef.current = null;
    }
  }, []);

  // Reset tour (mark as not completed)
  const resetTour = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    startTour();
  }, [startTour]);

  // Complete the tour
  const completeTour = useCallback(() => {
    setRun(false);
    setStepIndex(0);
    setIsNavigating(false); // Clear navigation state when completing tour
    // Clear any pending navigation timers
    if (navigationTimerRef.current) {
      clearTimeout(navigationTimerRef.current);
      navigationTimerRef.current = null;
    }
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  // Navigate to a specific route
  // Only works when tour is running - prevents navigation after tour is stopped
  const navigateToRoute = useCallback((route) => {
    // Don't navigate if tour is not running
    if (!run) {
      return;
    }
    
    if (location.pathname !== route) {
      // Clear any existing navigation timer
      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }
      
      setIsNavigating(true);
      navigate(route);
      // Wait a bit for page to load, then clear navigation state
      navigationTimerRef.current = setTimeout(() => {
        setIsNavigating(false);
        navigationTimerRef.current = null;
      }, 500);
    }
  }, [navigate, location.pathname, run]);

  const value = {
    run,
    stepIndex,
    setStepIndex,
    startTour,
    stopTour,
    resetTour,
    completeTour,
    isCompleted,
    isNavigating,
    navigateToRoute,
  };

  return (
    <JoyrideContext.Provider value={value}>
      {children}
    </JoyrideContext.Provider>
  );
};

export const useJoyride = () => {
  const context = useContext(JoyrideContext);
  if (!context) {
    throw new Error('useJoyride must be used within a JoyrideProvider');
  }
  return context;
};

// Safe hook that returns null if context is not available (for optional usage)
export const useJoyrideSafe = () => {
  const context = useContext(JoyrideContext);
  return context; // Returns null if not available, instead of throwing
};

