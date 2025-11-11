/**
 * Step validation utilities for Joyride tour
 * Validates that step targets exist before tour starts
 */

import { queryElement, waitForElement } from './elementUtils';

/**
 * Validate a single step's target element
 * @param {Object} step - Step configuration object
 * @param {string} step.target - CSS selector for the target element
 * @param {boolean} waitForElement - Whether to wait for element to appear (default: false)
 * @param {number} waitTimeout - Timeout in ms if waiting (default: 2000)
 * @returns {Promise<{valid: boolean, element: Element|null, error: string|null}>}
 */
export const validateStep = async (step, { waitForElement: shouldWait = false, waitTimeout = 2000 } = {}) => {
  if (!step || !step.target) {
    return {
      valid: false,
      element: null,
      error: 'Step missing target selector',
    };
  }

  try {
    let element = queryElement(step.target);

    // If element not found and we should wait, try waiting
    if (!element && shouldWait) {
      try {
        element = await waitForElement(step.target, { timeout: waitTimeout });
      } catch (error) {
        return {
          valid: false,
          element: null,
          error: `Element not found: ${step.target}`,
        };
      }
    }

    if (!element) {
      return {
        valid: false,
        element: null,
        error: `Element not found: ${step.target}`,
      };
    }

    return {
      valid: true,
      element,
      error: null,
    };
  } catch (error) {
    return {
      valid: false,
      element: null,
      error: `Validation error: ${error.message}`,
    };
  }
};

/**
 * Validate all steps in a tour
 * @param {Array<Object>} steps - Array of step configuration objects
 * @param {Object} options - Validation options
 * @param {boolean} options.waitForElements - Whether to wait for missing elements (default: false)
 * @param {number} options.waitTimeout - Timeout per element if waiting (default: 2000)
 * @param {boolean} options.strict - If true, fail validation if any step is invalid (default: true)
 * @returns {Promise<{valid: boolean, results: Array, invalidSteps: Array, errors: Array}>}
 */
export const validateSteps = async (
  steps,
  {
    waitForElements = false,
    waitTimeout = 2000,
    strict = true,
  } = {}
) => {
  if (!Array.isArray(steps) || steps.length === 0) {
    return {
      valid: false,
      results: [],
      invalidSteps: [],
      errors: ['No steps provided'],
    };
  }

  const results = await Promise.all(
    steps.map((step, index) =>
      validateStep(step, { waitForElement: waitForElements, waitTimeout }).then((result) => ({
        index,
        step,
        ...result,
      }))
    )
  );

  const invalidSteps = results.filter((r) => !r.valid);
  const errors = invalidSteps.map((r) => `Step ${r.index}: ${r.error}`);

  return {
    valid: strict ? invalidSteps.length === 0 : true,
    results,
    invalidSteps,
    errors,
  };
};

/**
 * Get steps that are valid (have existing targets)
 * @param {Array<Object>} steps - Array of step configuration objects
 * @param {Object} options - Validation options (same as validateSteps)
 * @returns {Promise<Array<Object>>} - Array of valid steps
 */
export const getValidSteps = async (steps, options = {}) => {
  const validation = await validateSteps(steps, { ...options, strict: false });
  return validation.results
    .filter((r) => r.valid)
    .map((r) => r.step);
};

/**
 * Check if a step's route matches the current route
 * @param {Object} step - Step configuration object
 * @param {string} currentRoute - Current route pathname
 * @returns {boolean} - True if route matches or step has no route requirement
 */
export const isStepRouteValid = (step, currentRoute) => {
  if (!step.route) {
    return true; // Step doesn't require a specific route
  }
  return step.route === currentRoute;
};

