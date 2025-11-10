import React, { useEffect, useState } from 'react';
import Joyride from 'react-joyride';
import { useLocation, useNavigate } from 'react-router-dom';
import { useJoyride } from 'contexts/JoyrideContext';
import { tourSteps } from './tourSteps';
import CompletionModal from './components/CompletionModal';
import styles from './styles/JoyrideTour.module.scss';

const JoyrideTour = () => {
  const {
    run,
    stepIndex,
    setStepIndex,
    startTour,
    stopTour,
    completeTour,
    isNavigating,
    navigateToRoute,
  } = useJoyride();
  
  const location = useLocation();
  const navigate = useNavigate(); // Use React Router's navigate directly for completion
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);

  // Get current step based on stepIndex
  useEffect(() => {
    if (run && stepIndex < tourSteps.length) {
      setCurrentStep(tourSteps[stepIndex]);
    } else if (!run) {
      // Clear current step when tour is not running to prevent navigation interference
      setCurrentStep(null);
    }
  }, [run, stepIndex]);

  // Handle navigation when step requires route change
  // Skip auto-navigation for nav link steps - user should click them
  // Only run if tour is active
  useEffect(() => {
    // Don't interfere with navigation when tour is not running or currentStep is null
    if (!run || !currentStep) return;
    
    if (currentStep.route && location.pathname !== currentStep.route && !isNavigating) {
      // Don't auto-navigate if this is a nav link step - let user click it
      if (currentStep.target === '[data-joyride="my-deck-nav-link"]' || 
          currentStep.target === '[data-joyride="progress-nav-link"]') {
        return;
      }
      navigateToRoute(currentStep.route);
    }
  }, [run, currentStep, location.pathname, navigateToRoute, isNavigating]);
  
  // Detect when user navigates to My Deck page after clicking the link
  // Only advance if we're currently on the My Deck nav link step (step 10, index 9)
  useEffect(() => {
    if (!run) return; // Don't interfere when tour is not running
    
    // Only trigger if:
    // 1. Tour is running
    // 2. We're on step 10 (index 9) - the My Deck nav link step
    // 3. Current step target matches the My Deck nav link
    // 4. User has navigated to /my-deck
    if (stepIndex === 9 && 
        currentStep?.target === '[data-joyride="my-deck-nav-link"]' && 
        location.pathname === '/my-deck') {
      // User clicked the link and navigated, move to next step (step 11 - first topic card)
      // Use a longer delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        // Double-check we're still on the right step and tour is still running
        if (stepIndex === 9 && run) {
          setStepIndex(10); // Move to step 11 (index 10)
        }
      }, 1000); // Wait for page to fully load
      
      return () => clearTimeout(timer);
    }
  }, [run, stepIndex, currentStep, location.pathname, setStepIndex]);
  
  // Detect when user navigates to Progress page after clicking the link
  // Only advance if we're currently on the Progress nav link step (step 14, index 13)
  useEffect(() => {
    if (!run) return; // Don't interfere when tour is not running
    
    // Only trigger if:
    // 1. Tour is running
    // 2. We're on step 14 (index 13) - the Progress nav link step
    // 3. Current step target matches the Progress nav link
    // 4. User has navigated to /progress
    if (stepIndex === 13 && 
        currentStep?.target === '[data-joyride="progress-nav-link"]' && 
        location.pathname === '/progress') {
      // User clicked the link and navigated, move to next step (step 15 - activity feed)
      // Use a longer delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        // Double-check we're still on the right step and tour is still running
        if (stepIndex === 13 && run) {
          setStepIndex(14); // Move to step 15 (index 14)
        }
      }, 1000); // Wait for page to fully load
      
      return () => clearTimeout(timer);
    }
  }, [run, stepIndex, currentStep, location.pathname, setStepIndex]);
  
  // Auto-expand first realm on Progress page for realm-details step
  useEffect(() => {
    if (!run) return; // Don't interfere when tour is not running
    
    if (currentStep?.target === '[data-joyride="realm-details"]' && location.pathname === '/progress') {
      // Wait a bit for page to load, then expand first realm
      const timer = setTimeout(() => {
        const firstRealm = document.querySelector('[data-joyride="learning-realms"]');
        if (firstRealm) {
          // Find the expand button and click it
          const expandButton = firstRealm.querySelector('button[class*="realmExpandButton"]');
          if (expandButton && !expandButton.querySelector('svg[data-icon="chevron-up"]')) {
            expandButton.click();
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [run, currentStep, location.pathname]);

  // Wait for element to be available before showing step
  useEffect(() => {
    if (!run) return; // Don't interfere when tour is not running
    
    if (currentStep && !isNavigating) {
      // Don't skip nav link steps - user needs to click them
      if (currentStep.target === '[data-joyride="my-deck-nav-link"]' || 
          currentStep.target === '[data-joyride="progress-nav-link"]') {
        return;
      }
      
      // Don't skip steps that require being on a specific page - wait for navigation
      // Step 11 (index 10) is the first topic card which requires being on /my-deck
      if (stepIndex === 10 && location.pathname !== '/my-deck') {
        // We're trying to show step 11 but we're not on /my-deck yet
        // This means user hasn't clicked the My Deck link yet, so don't skip
        return;
      }
      
      // Step 15 (index 14) is the activity feed which requires being on /progress
      if (stepIndex === 14 && location.pathname !== '/progress') {
        // We're trying to show step 15 but we're not on /progress yet
        // This means user hasn't clicked the Progress link yet, so don't skip
        return;
      }
      
      const checkElement = () => {
        const element = document.querySelector(currentStep.target);
        if (element) {
          // Element is available, tour can proceed
          return true;
        }
        return false;
      };

      // Check immediately
      if (checkElement()) {
        return;
      }

      // If not found, wait a bit and check again
      // Give more time for My Deck and Progress page steps since they need the page to load
      const waitTime = (stepIndex >= 10 && stepIndex <= 12) || (stepIndex >= 14 && stepIndex <= 17) ? 2000 : 1000;
      const timeout = setTimeout(() => {
        if (!checkElement()) {
          // Element still not found, skip to next step (but not for nav link steps or steps waiting for navigation)
          if (stepIndex < tourSteps.length - 1 && 
              currentStep.target !== '[data-joyride="my-deck-nav-link"]' &&
              currentStep.target !== '[data-joyride="progress-nav-link"]' &&
              !(stepIndex === 10 && location.pathname !== '/my-deck') &&
              !(stepIndex === 14 && location.pathname !== '/progress')) {
            setStepIndex(stepIndex + 1);
          }
        }
      }, waitTime);

      return () => clearTimeout(timeout);
    }
  }, [run, currentStep, isNavigating, stepIndex, setStepIndex, location.pathname]);

  // Cleanup function to remove inline styles from sidebar elements
  const cleanupSidebarStyles = () => {
    
    // Find sidebar nav element
    const sidebarNav = document.querySelector('[data-joyride="sidebar-nav"]');
    if (sidebarNav && sidebarNav instanceof HTMLElement) {
      // Remove any inline styles that might affect height or display
      sidebarNav.style.removeProperty('height');
      sidebarNav.style.removeProperty('max-height');
      sidebarNav.style.removeProperty('min-height');
      sidebarNav.style.removeProperty('display');
      sidebarNav.style.removeProperty('position');
      sidebarNav.style.removeProperty('z-index');
      sidebarNav.style.removeProperty('overflow');
    }
    
    // Find sidebar container - walk up the DOM tree to find the actual sidebar
    let sidebar = null;
    if (sidebarNav) {
      let parent = sidebarNav.parentElement;
      // Walk up to find sidebar (should be within 3-4 levels)
      let depth = 0;
      while (parent && depth < 5) {
        const classList = Array.from(parent.classList || []);
        if (classList.some(cls => cls.toLowerCase().includes('sidebar'))) {
          sidebar = parent;
          break;
        }
        parent = parent.parentElement;
        depth++;
      }
    }
    
    // If not found by walking up, try direct queries
    if (!sidebar) {
      const sidebarSelectors = [
        '[class*="sidebar"]',
        '[class*="Sidebar"]',
        'aside',
      ];
      
      for (const selector of sidebarSelectors) {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          if (el.contains(sidebarNav)) {
            sidebar = el;
            break;
          }
        }
        if (sidebar) break;
      }
    }
    
    if (sidebar && sidebar instanceof HTMLElement) {
      // Remove any inline styles that might affect height
      sidebar.style.removeProperty('height');
      sidebar.style.removeProperty('max-height');
      sidebar.style.removeProperty('min-height');
      sidebar.style.removeProperty('display');
      sidebar.style.removeProperty('position');
      sidebar.style.removeProperty('overflow');
      
      // Force sidebar to full height by explicitly setting it
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        const computed = window.getComputedStyle(sidebar);
        const rect = sidebar.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // If sidebar height is less than viewport, force it to 100vh
        if (rect.height < viewportHeight * 0.9) {
          // Force a reflow and ensure height is restored
          sidebar.style.height = '100vh';
          sidebar.style.minHeight = '100vh';
        }
      });
    }
    
    // Also check sidebarContainer
    const sidebarContainer = document.querySelector('[class*="sidebarContainer"]');
    if (sidebarContainer && sidebarContainer instanceof HTMLElement) {
      sidebarContainer.style.removeProperty('height');
      sidebarContainer.style.removeProperty('max-height');
      sidebarContainer.style.removeProperty('min-height');
      sidebarContainer.style.removeProperty('display');
      sidebarContainer.style.removeProperty('position');
      
      // Force sidebarContainer to full height
      requestAnimationFrame(() => {
        const computed = window.getComputedStyle(sidebarContainer);
        const rect = sidebarContainer.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        if (rect.height < viewportHeight * 0.9) {
          sidebarContainer.style.minHeight = '100vh';
          sidebarContainer.style.height = 'auto';
        }
      });
    }
    
    // Also check for any react-joyride wrapper elements that might be affecting layout
    const joyrideWrappers = document.querySelectorAll('[class*="__floater"], [class*="react-joyride"], [class*="reactour"]');
    joyrideWrappers.forEach(wrapper => {
      if (wrapper instanceof HTMLElement) {
        // Only remove height-related styles from wrappers that might be affecting sidebar
        const rect = wrapper.getBoundingClientRect();
        const sidebarRect = sidebar?.getBoundingClientRect();
        if (sidebarRect && (
          Math.abs(rect.top - sidebarRect.top) < 100 ||
          Math.abs(rect.left - sidebarRect.left) < 100
        )) {
          wrapper.style.removeProperty('height');
          wrapper.style.removeProperty('max-height');
          wrapper.style.removeProperty('min-height');
        }
      }
    });
    
    // Force a reflow to ensure styles are applied
    if (sidebar) {
      void sidebar.offsetHeight; // Force reflow
    }
    if (sidebarContainer) {
      void sidebarContainer.offsetHeight; // Force reflow
    }
  };

  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data;
    const currentStepData = tourSteps[index];

    if (status === 'finished' || status === 'skipped') {
      // Clean up immediately when tour ends or is skipped
      cleanupSidebarStyles();
      
      if (status === 'finished') {
        // Stop the tour first to prevent any navigation interference
        stopTour();
        // Show completion modal
        setShowCompletionModal(true);
        completeTour();
      } else {
        // Tour was skipped - just stop it, don't navigate anywhere
        stopTour();
        // Clear current step immediately to prevent any navigation
        setCurrentStep(null);
      }
      
      // Clean up again after delays to catch any async style additions and ensure restoration
      setTimeout(cleanupSidebarStyles, 100);
      setTimeout(cleanupSidebarStyles, 500);
      setTimeout(cleanupSidebarStyles, 1000);
    } else if (type === 'step:after' && action === 'next') {
      // For nav link steps, don't advance until user clicks the link
      if (currentStepData?.target === '[data-joyride="my-deck-nav-link"]' ||
          currentStepData?.target === '[data-joyride="progress-nav-link"]') {
        // Don't advance - wait for user to click the link
        // The navigation detection useEffect will handle advancing
        return;
      }
      
      // Move to next step
      if (index < tourSteps.length - 1) {
        setStepIndex(index + 1);
      } else {
        // Last step completed
        // Clean up immediately
        cleanupSidebarStyles();
        // Stop the tour first to prevent any navigation interference
        stopTour();
        setShowCompletionModal(true);
        completeTour();
        // Clean up again after delays
        setTimeout(cleanupSidebarStyles, 100);
        setTimeout(cleanupSidebarStyles, 500);
        setTimeout(cleanupSidebarStyles, 1000);
      }
    } else if (type === 'step:after' && action === 'prev') {
      setStepIndex(index - 1);
    }
  };

  // MutationObserver to track style attribute changes on sidebar elements
  useEffect(() => {
    const sidebarNav = document.querySelector('[data-joyride="sidebar-nav"]');
    const sidebarElement = document.querySelector('[class*="sidebar"]');
    const sidebarContainer = document.querySelector('[class*="sidebarContainer"]');
    
    const elementsToObserve = [sidebarNav, sidebarElement, sidebarContainer].filter(Boolean);
    
    if (elementsToObserve.length === 0) return;

    // Properties that should not be modified on sidebar elements
    const protectedProperties = ['height', 'max-height', 'min-height', 'display', 'position'];
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const target = mutation.target;
          const targetName = target.getAttribute('data-joyride') || 
                            Array.from(target.classList || []).find(cls => cls.includes('sidebar')) || 
                            target.tagName;
          
          // Check if any protected properties were modified
          const style = target.style;
          const problematicProps = protectedProperties.filter(prop => {
            const camelProp = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            return style[camelProp] || style.getPropertyValue(prop);
          });
          
          if (problematicProps.length > 0) {
            // If tour is not running, immediately revert problematic changes
            if (!run) {
              problematicProps.forEach(prop => {
                style.removeProperty(prop);
              });
            }
          }
        }
      });
    });

    // Observe all sidebar-related elements
    elementsToObserve.forEach((element) => {
      observer.observe(element, {
        attributes: true,
        attributeFilter: ['style'],
        attributeOldValue: true,
        subtree: false,
      });
    });

    return () => {
      observer.disconnect();
    };
  }, [run]);


  // Cleanup inline styles that react-joyride might add to sidebar elements
  useEffect(() => {
    if (!run) {
      // Tour is not running, clean up any inline styles on sidebar elements
      cleanupSidebarStyles();
      // Clean up again after delays to catch any async additions
      const timeout1 = setTimeout(cleanupSidebarStyles, 100);
      const timeout2 = setTimeout(cleanupSidebarStyles, 500);
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    } else {
      // Also clean up during the tour when step changes (if not targeting sidebar nav)
      // This prevents styles from accumulating
      if (currentStep && currentStep.target !== '[data-joyride="sidebar-nav"]') {
        // Clean up sidebar styles when moving away from sidebar step
        const prevStep = stepIndex > 0 ? tourSteps[stepIndex - 1] : null;
        if (prevStep?.target === '[data-joyride="sidebar-nav"]') {
          cleanupSidebarStyles();
        }
      }
    }
  }, [run, stepIndex, currentStep]);

  const handleCloseCompletionModal = () => {
    setShowCompletionModal(false);
    // Stop the tour completely and clear any navigation state
    stopTour();
    // Use React Router's navigate directly to avoid any joyride interference
    setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 100);
  };

  return (
    <>
      <Joyride
        steps={tourSteps}
        run={run}
        stepIndex={stepIndex}
        continuous
        showProgress
        showSkipButton
        disableOverlayClose
        disableScrolling={false}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#8b5cf6',
            textColor: '#ffffff',
            backgroundColor: '#1a1a2e',
            overlayColor: 'rgba(0, 0, 0, 0.7)',
            arrowColor: '#8b5cf6',
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: 12,
            padding: 20,
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          buttonNext: {
            backgroundColor: '#8b5cf6',
            fontSize: '14px',
            fontWeight: 600,
            padding: '10px 20px',
            borderRadius: '8px',
            outline: 'none',
          },
          buttonBack: {
            color: '#ffffff',
            marginRight: '10px',
            fontSize: '14px',
          },
          buttonSkip: {
            color: '#a0a0a0',
            fontSize: '14px',
          },
        }}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip Tour',
        }}
      />
      
      {showCompletionModal && (
        <CompletionModal
          onClose={handleCloseCompletionModal}
        />
      )}
    </>
  );
};

export default JoyrideTour;

