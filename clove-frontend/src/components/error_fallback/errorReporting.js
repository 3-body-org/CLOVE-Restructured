// Centralized error reporting utility
class ErrorReporter {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  // Report errors to console in development, external service in production
  captureException(error, context = {}) {
    if (this.isDevelopment) {
      console.error('🚨 Error Captured:', {
        error: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
      });
    }

    if (this.isProduction) {
      // TODO: Integrate with error reporting service (Sentry, LogRocket, etc.)
      // Example: Sentry.captureException(error, { extra: context });
      console.error('Production Error:', error.message, context);
    }
  }

  // Report API errors with additional context
  captureApiError(error, endpoint, requestData = {}) {
    this.captureException(error, {
      type: 'API_ERROR',
      endpoint,
      requestData,
      status: error.status,
      statusText: error.statusText
    });
  }

  // Report authentication errors
  captureAuthError(error, action) {
    this.captureException(error, {
      type: 'AUTH_ERROR',
      action,
      timestamp: new Date().toISOString()
    });
  }

  // Report navigation errors
  captureNavigationError(error, route) {
    this.captureException(error, {
      type: 'NAVIGATION_ERROR',
      route,
      timestamp: new Date().toISOString()
    });
  }

  // Report component errors
  captureComponentError(error, componentName, props = {}) {
    this.captureException(error, {
      type: 'COMPONENT_ERROR',
      componentName,
      props: Object.keys(props), // Don't log sensitive data
      timestamp: new Date().toISOString()
    });
  }
}

// Create singleton instance
const errorReporter = new ErrorReporter();

export default errorReporter; 