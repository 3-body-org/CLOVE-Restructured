import React, { createContext, useContext, useState, useCallback } from 'react';
import { validateSteps } from 'features/joyride/utils/stepValidator';
import { tourSteps } from 'features/joyride/config/tourSteps';
import { VALIDATION_OPTIONS } from 'features/joyride/config/tourConstants';

const JoyrideContext = createContext(null);

const STORAGE_KEY = 'joyride_completed';

export const JoyrideProvider = ({ children }) => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [validationError, setValidationError] = useState(null);

  // Check if joyride was completed before
  const isCompleted = useCallback(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  }, []);

  // Validate steps before starting tour
  const validateTourSteps = useCallback(async () => {
    try {
      const validation = await validateSteps(tourSteps, {
        waitForElements: VALIDATION_OPTIONS.WAIT_FOR_ELEMENTS,
        waitTimeout: VALIDATION_OPTIONS.WAIT_TIMEOUT,
        strict: VALIDATION_OPTIONS.STRICT,
      });

      if (!validation.valid) {
        setValidationError(validation.errors.join('; '));
        return false;
      }

      setValidationError(null);
      return true;
    } catch (error) {
      setValidationError(`Validation failed: ${error.message}`);
      return false;
    }
  }, []);

  // Start the tour with validation
  const startTour = useCallback(async () => {
    // Validate steps before starting
    const isValid = await validateTourSteps();
    
    if (!isValid) {
      console.warn('Tour validation failed:', validationError);
      // Still start the tour but log the warning
      // This allows the tour to proceed even if some elements aren't ready yet
      // The hooks will handle waiting for elements
    }

    setStepIndex(0);
    setRun(true);
    localStorage.removeItem(STORAGE_KEY);
  }, [validateTourSteps, validationError]);

  // Stop the tour
  const stopTour = useCallback(() => {
    setRun(false);
    setStepIndex(0);
    setValidationError(null);
  }, []);

  // Reset tour (mark as not completed and restart)
  const resetTour = useCallback(async () => {
    // First, ensure tour is fully stopped
    setRun(false);
    setStepIndex(0);
    setValidationError(null);
    // Clear the completion flag
    localStorage.removeItem(STORAGE_KEY);
    // Small delay to ensure state is fully reset before starting
    await new Promise((resolve) => setTimeout(resolve, 100));
    // Then start the tour
    await startTour();
  }, [startTour]);

  // Complete the tour
  const completeTour = useCallback(() => {
    setRun(false);
    setStepIndex(0);
    setValidationError(null);
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  const value = {
    run,
    stepIndex,
    setStepIndex,
    startTour,
    stopTour,
    resetTour,
    completeTour,
    isCompleted,
    validationError,
    validateTourSteps,
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

