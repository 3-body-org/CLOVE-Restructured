/**
 * Custom hook for managing tour state logic
 * Centralizes tour state management and step progression
 */

import { useCallback, useMemo } from 'react';
import { getStep, isLastStep } from '../config/tourSteps';

/**
 * Hook to manage tour state and step progression
 * @param {Object} joyrideContext - Joyride context from useJoyride hook
 * @param {Array} steps - Array of tour steps
 * @returns {Object} Tour state management functions and computed values
 */
export const useTourState = (joyrideContext, steps) => {
  const { run, stepIndex, setStepIndex, stopTour, completeTour } = joyrideContext;

  // Get current step
  const currentStep = useMemo(() => {
    if (!run || stepIndex < 0 || stepIndex >= steps.length) {
      return null;
    }
    return steps[stepIndex];
  }, [run, stepIndex, steps]);

  // Check if current step is the last step
  const isCurrentStepLast = useMemo(() => {
    return isLastStep(stepIndex);
  }, [stepIndex]);

  // Move to next step
  const goToNextStep = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  }, [stepIndex, steps.length, setStepIndex]);

  // Move to previous step
  const goToPreviousStep = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  }, [stepIndex, setStepIndex]);

  // Jump to specific step
  const goToStep = useCallback(
    (index) => {
      if (index >= 0 && index < steps.length) {
        setStepIndex(index);
      }
    },
    [steps.length, setStepIndex]
  );

  // Skip to next step (used when element is not found)
  const skipToNext = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      // If it's the last step, complete the tour
      stopTour();
      completeTour();
    }
  }, [stepIndex, steps.length, setStepIndex, stopTour, completeTour]);

  // Complete the tour
  const finishTour = useCallback(() => {
    stopTour();
    completeTour();
  }, [stopTour, completeTour]);

  return {
    currentStep,
    isCurrentStepLast,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    skipToNext,
    finishTour,
    stepIndex,
    totalSteps: steps.length,
    isRunning: run,
  };
};

