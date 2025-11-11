/**
 * Custom hook for observing DOM elements using MutationObserver
 * Replaces setTimeout-based polling with reliable element detection
 */

import { useEffect, useState, useRef } from 'react';
import { waitForElement, queryElement } from '../utils/elementUtils';
import { TIMEOUTS } from '../config/tourConstants';

/**
 * Hook to observe when a target element appears in the DOM
 * @param {string} selector - CSS selector for the target element
 * @param {boolean} enabled - Whether observation is enabled
 * @param {Object} options - Options for element waiting
 * @returns {{element: Element|null, isReady: boolean, error: Error|null}}
 */
export const useElementObserver = (selector, enabled = true, options = {}) => {
  const [element, setElement] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const observerRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!enabled || !selector) {
      setIsReady(false);
      setElement(null);
      setError(null);
      return;
    }

    // Check if element already exists
    const existingElement = queryElement(selector);
    if (existingElement) {
      setElement(existingElement);
      setIsReady(true);
      setError(null);
      return;
    }

    // Set up timeout
    const timeout = options.timeout || TIMEOUTS.ELEMENT_WAIT;
    timeoutRef.current = setTimeout(() => {
      setError(new Error(`Element not found: ${selector} (timeout after ${timeout}ms)`));
      setIsReady(true); // Mark as ready even if not found (to prevent infinite waiting)
    }, timeout);

    // Wait for element using MutationObserver
    waitForElement(selector, { timeout, ...options })
      .then((el) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setElement(el);
        setIsReady(true);
        setError(null);
      })
      .catch((err) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setError(err);
        setIsReady(true); // Mark as ready to prevent infinite waiting
      });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [selector, enabled, options.timeout]);

  return { element, isReady, error };
};

/**
 * Hook to observe multiple elements
 * @param {string[]} selectors - Array of CSS selectors
 * @param {boolean} enabled - Whether observation is enabled
 * @param {Object} options - Options for element waiting
 * @returns {{elements: Array<Element|null>, allReady: boolean, errors: Array<Error|null>}}
 */
export const useMultipleElementObserver = (selectors, enabled = true, options = {}) => {
  const [elements, setElements] = useState(selectors.map(() => null));
  const [allReady, setAllReady] = useState(false);
  const [errors, setErrors] = useState(selectors.map(() => null));

  useEffect(() => {
    if (!enabled || !selectors || selectors.length === 0) {
      setElements(selectors?.map(() => null) || []);
      setAllReady(false);
      setErrors(selectors?.map(() => null) || []);
      return;
    }

    const observers = selectors.map((selector, index) =>
      waitForElement(selector, { timeout: options.timeout || TIMEOUTS.ELEMENT_WAIT, ...options })
        .then((el) => {
          setElements((prev) => {
            const newElements = [...prev];
            newElements[index] = el;
            return newElements;
          });
          setErrors((prev) => {
            const newErrors = [...prev];
            newErrors[index] = null;
            return newErrors;
          });
        })
        .catch((err) => {
          setElements((prev) => {
            const newElements = [...prev];
            newElements[index] = null;
            return newElements;
          });
          setErrors((prev) => {
            const newErrors = [...prev];
            newErrors[index] = err;
            return newErrors;
          });
        })
    );

    Promise.allSettled(observers).then(() => {
      setAllReady(true);
    });
  }, [selectors, enabled, options.timeout]);

  return { elements, allReady, errors };
};

