import React from "react";
import styles from "./styles/ErrorBoundary.module.scss";
import errorReporter from "./errorReporting";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Report error with context
    errorReporter.captureComponentError(error, this.props.componentName || 'Unknown', {
      errorId,
      errorInfo: errorInfo.componentStack
    });

    this.setState({
      error: error,
      errorInfo: errorInfo,
      errorId: errorId
    });
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleReportError = () => {
    // In a real app, this would open a support ticket or contact form
    const errorDetails = {
      errorId: this.state.errorId,
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    // Copy error details to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        alert('Error details copied to clipboard. Please send this to support.');
      })
      .catch(() => {
        alert('Please contact support with error ID: ' + this.state.errorId);
      });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer}>
          <h2>Something went wrong</h2>
          <p>We're sorry, but something unexpected happened. Please try again.</p>
          
          {this.state.errorId && (
            <p className={styles.errorId}>
              Error ID: <code>{this.state.errorId}</code>
            </p>
          )}
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ margin: '20px 0', textAlign: 'left', maxWidth: '600px' }}>
              <summary style={{ cursor: 'pointer', color: '#a78bfa' }}>
                Error Details (Development Only)
              </summary>
              <pre style={{ 
                background: '#2d2d2d', 
                padding: '15px', 
                borderRadius: '4px', 
                overflow: 'auto',
                fontSize: '12px',
                color: '#e5e5e5'
              }}>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          
          <div className={styles.buttonGroup}>
            <button
              className={styles.tryAgainButton}
              onClick={this.handleRetry}
            >
              Try Again
            </button>
            <button
              className={styles.reloadButton}
              onClick={this.handleReload}
            >
              Reload Page
            </button>
            <button
              className={styles.reportButton}
              onClick={this.handleReportError}
            >
              Report Issue
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 