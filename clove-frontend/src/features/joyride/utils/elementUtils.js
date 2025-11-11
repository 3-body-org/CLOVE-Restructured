/**
 * DOM element utilities for Joyride tour
 * Uses MutationObserver for reliable element detection instead of setTimeout polling
 */

/**
 * Check if an element exists in the DOM
 * @param {string} selector - CSS selector string
 * @returns {Element|null} - The element if found, null otherwise
 */
export const queryElement = (selector) => {
  try {
    return document.querySelector(selector);
  } catch (error) {
    console.warn(`Invalid selector: ${selector}`, error);
    return null;
  }
};

/**
 * Wait for an element to appear in the DOM using MutationObserver
 * @param {string} selector - CSS selector string
 * @param {Object} options - Configuration options
 * @param {number} options.timeout - Maximum time to wait in milliseconds (default: 5000)
 * @param {Element} options.root - Root element to observe (default: document.body)
 * @param {boolean} options.observeSubtree - Whether to observe subtree changes (default: true)
 * @returns {Promise<Element>} - Promise that resolves with the element when found
 */
export const waitForElement = (
  selector,
  {
    timeout = 5000,
    root = document.body,
    observeSubtree = true,
  } = {}
) => {
  return new Promise((resolve, reject) => {
    // Check if element already exists
    const existingElement = queryElement(selector);
    if (existingElement) {
      resolve(existingElement);
      return;
    }

    // Set up timeout
    const timeoutId = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element not found: ${selector} (timeout after ${timeout}ms)`));
    }, timeout);

    // Create MutationObserver to watch for DOM changes
    const observer = new MutationObserver((mutations, obs) => {
      const element = queryElement(selector);
      if (element) {
        clearTimeout(timeoutId);
        obs.disconnect();
        resolve(element);
      }
    });

    // Start observing
    observer.observe(root, {
      childList: true,
      subtree: observeSubtree,
      attributes: false,
      characterData: false,
    });
  });
};

/**
 * Wait for multiple elements to appear in the DOM
 * @param {string[]} selectors - Array of CSS selector strings
 * @param {Object} options - Configuration options (same as waitForElement)
 * @returns {Promise<Element[]>} - Promise that resolves with array of elements when all found
 */
export const waitForElements = (selectors, options = {}) => {
  return Promise.all(selectors.map((selector) => waitForElement(selector, options)));
};

/**
 * Check if an element is visible (not hidden by CSS)
 * @param {Element} element - DOM element to check
 * @returns {boolean} - True if element is visible
 */
export const isElementVisible = (element) => {
  if (!element) return false;

  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.offsetWidth > 0 &&
    element.offsetHeight > 0
  );
};

/**
 * Wait for an element to be visible (not just present in DOM)
 * @param {string} selector - CSS selector string
 * @param {Object} options - Configuration options (same as waitForElement)
 * @returns {Promise<Element>} - Promise that resolves when element is visible
 */
export const waitForVisibleElement = (selector, options = {}) => {
  return waitForElement(selector, options).then((element) => {
    if (isElementVisible(element)) {
      return element;
    }

    // If not visible, wait a bit and check again
    return new Promise((resolve, reject) => {
      const timeout = options.timeout || 5000;
      const startTime = Date.now();
      const checkInterval = 100;

      const checkVisibility = () => {
        if (isElementVisible(element)) {
          resolve(element);
          return;
        }

        if (Date.now() - startTime > timeout) {
          reject(new Error(`Element not visible: ${selector} (timeout after ${timeout}ms)`));
          return;
        }

        setTimeout(checkVisibility, checkInterval);
      };

      checkVisibility();
    });
  });
};

