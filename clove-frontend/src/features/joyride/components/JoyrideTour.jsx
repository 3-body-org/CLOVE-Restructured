import React, { useState, useEffect, useCallback, useRef } from 'react';
import Joyride from 'react-joyride';
import { useLocation, useNavigate } from 'react-router-dom';
import { useJoyride } from 'contexts/JoyrideContext';
import { tourSteps } from '../config/tourSteps';
import { joyrideStyles, floaterProps } from '../config/tourStyles';
import { LOCALE, TOUR_CONFIG, TIMEOUTS, STEP_TARGETS } from '../config/tourConstants';
import { useTourState } from '../hooks/useTourState';
import { useElementObserver } from '../hooks/useElementObserver';
import { queryElement } from '../utils/elementUtils';
import CompletionModal from './CompletionModal';

/**
 * Main Joyride tour component
 * Handles tour execution, navigation, and step progression
 */
const JoyrideTour = () => {
  const joyrideContext = useJoyride();
  const location = useLocation();
  const navigate = useNavigate();
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  // Ref to track if tour was skipped to prevent navigation
  const wasSkippedRef = useRef(false);
  // Ref to track navigation cancellation
  const navigationCancelledRef = useRef(false);

  // Use custom hook for tour state management
  const tourState = useTourState(joyrideContext, tourSteps);
  const { currentStep, isCurrentStepLast, goToNextStep, finishTour, isRunning } = tourState;

  // Reset flags when tour starts or stops
  useEffect(() => {
    if (isRunning) {
      wasSkippedRef.current = false;
      navigationCancelledRef.current = false;
    } else {
      // When tour stops, cancel any pending navigation
      navigationCancelledRef.current = true;
    }
  }, [isRunning]);

  // Observe current step's target element
  const { element: targetElement, isReady: elementReady, error: elementError } = useElementObserver(
    currentStep?.target,
    isRunning && currentStep !== null,
    { timeout: TIMEOUTS.ELEMENT_WAIT }
  );

  // Handle realm expansion for progress page steps
  useEffect(() => {
    if (!isRunning || !currentStep) return;

    // Check if this step requires realm expansion
    if (currentStep.requiresExpansion && currentStep.target === STEP_TARGETS.REALM_DETAILS) {
      const expandRealm = () => {
        const learningRealms = queryElement(STEP_TARGETS.LEARNING_REALMS);
        if (learningRealms) {
          // Find the expand button and click it if not already expanded
          const expandButton = learningRealms.querySelector('button[class*="realmExpandButton"]');
          if (expandButton) {
            // Check if already expanded (look for chevron-up icon)
            const isExpanded = expandButton.querySelector('svg[data-icon="chevron-up"]');
            if (!isExpanded) {
              expandButton.click();
            }
          }
        }
      };

      // Try to expand after a short delay to ensure DOM is ready
      const timer = setTimeout(expandRealm, 300);
      return () => clearTimeout(timer);
    }
  }, [isRunning, currentStep]);

  // Handle Joyride callback events
  const handleJoyrideCallback = useCallback(
    (data) => {
      const { action, index, status, type } = data;

      // Handle tour completion or skip
      if (status === 'finished' || status === 'skipped') {
        if (status === 'finished') {
          finishTour();
          // Show completion modal after a short delay
          setTimeout(() => {
            setShowCompletionModal(true);
          }, TIMEOUTS.COMPLETION_DELAY);
        } else {
          // Tour was skipped - cancel navigation and stop immediately
          wasSkippedRef.current = true;
          navigationCancelledRef.current = true;
          // Stop the tour - this will set isRunning to false
          joyrideContext.stopTour();
          // Ensure Joyride component also stops
          // The run prop will be set to false by stopTour()
        }
        return;
      }

      // Handle tour start
      if (type === 'tour:start') {
        // Navigate to first step's route if needed (only once when tour starts)
        const firstStep = tourSteps[0];
        if (
          firstStep?.route &&
          location.pathname !== firstStep.route &&
          !wasSkippedRef.current &&
          !navigationCancelledRef.current
        ) {
          navigate(firstStep.route, { replace: true });
        }
        return;
      }

      // Handle step before (before step is shown)
      if (type === 'step:before') {
        // Navigate to step's route if needed (only when step is about to be shown)
        const step = tourSteps[index];
        if (
          step?.route &&
          location.pathname !== step.route &&
          !wasSkippedRef.current &&
          !navigationCancelledRef.current
        ) {
          navigate(step.route, { replace: true });
        }
        return;
      }

      // Handle step after (after step interaction)
      if (type === 'step:after') {
        // Don't process if tour was skipped or navigation is cancelled
        if (wasSkippedRef.current || navigationCancelledRef.current) {
          return;
        }

        if (action === 'next') {
          const currentStepData = tourSteps[index];

          // Check if this step has a nextRoute (auto-navigation)
          if (currentStepData?.nextRoute) {
            // Navigate to nextRoute immediately
            if (
              isRunning &&
              !wasSkippedRef.current &&
              !navigationCancelledRef.current
            ) {
              navigate(currentStepData.nextRoute, { replace: true });
            }

            // If it's the last step, show completion modal
            if (currentStepData.isLastStep) {
              setTimeout(() => {
                finishTour();
                setShowCompletionModal(true);
              }, TIMEOUTS.COMPLETION_DELAY);
              return;
            }

            // Wait for next step's element to exist before advancing
            // This ensures the page has finished rendering after navigation
            const nextStep = tourSteps[index + 1];
            if (nextStep?.target) {
              const startTime = Date.now();
              const timeout = TIMEOUTS.ELEMENT_WAIT;
              
              const checkElement = () => {
                // Check if element exists
                const element = document.querySelector(nextStep.target);
                
                if (element) {
                  // Element found, safe to advance
                  goToNextStep();
                } else {
                  // Check timeout
                  if (Date.now() - startTime > timeout) {
                    // Timeout reached, advance anyway to prevent blocking
                    goToNextStep();
                  } else {
                    // Keep checking on next animation frame
                    requestAnimationFrame(checkElement);
                  }
                }
              };
              
              // Start checking on next animation frame
              requestAnimationFrame(checkElement);
            } else {
              // No target for next step, advance immediately
              goToNextStep();
            }
            return;
          }

          // Normal step progression
          if (index < tourSteps.length - 1) {
            goToNextStep();
          } else {
            // Last step completed
            finishTour();
            setTimeout(() => {
              setShowCompletionModal(true);
            }, TIMEOUTS.COMPLETION_DELAY);
          }
        } else if (action === 'prev') {
          // Handle back button
          if (index > 0) {
            tourState.goToPreviousStep();
          }
        }
        return;
      }

      // Handle tour end
      if (type === 'tour:end') {
        // Tour has ended
        return;
      }
    },
    [finishTour, goToNextStep, location.pathname, joyrideContext, tourState, navigate]
  );

  // Handle completion modal close
  const handleCloseCompletionModal = useCallback(() => {
    setShowCompletionModal(false);
    joyrideContext.stopTour();
  }, [joyrideContext]);

  // Don't render Joyride if tour is not running
  if (!isRunning) {
    return showCompletionModal ? (
      <CompletionModal onClose={handleCloseCompletionModal} />
    ) : null;
  }

  return (
    <>
      <Joyride
        steps={tourSteps}
        run={isRunning}
        stepIndex={joyrideContext.stepIndex}
        continuous={TOUR_CONFIG.CONTINUOUS}
        showProgress={TOUR_CONFIG.SHOW_PROGRESS}
        showSkipButton={TOUR_CONFIG.SHOW_SKIP_BUTTON}
        disableOverlayClose={TOUR_CONFIG.DISABLE_OVERLAY_CLOSE}
        disableScrolling={TOUR_CONFIG.DISABLE_SCROLLING}
        spotlightClicks={TOUR_CONFIG.SPOTLIGHT_CLICKS}
        spotlightPadding={TOUR_CONFIG.SPOTLIGHT_PADDING}
        floaterProps={floaterProps}
        callback={handleJoyrideCallback}
        styles={joyrideStyles}
        locale={LOCALE}
      />

      {showCompletionModal && (
        <CompletionModal onClose={handleCloseCompletionModal} />
      )}
    </>
  );
};

export default JoyrideTour;

