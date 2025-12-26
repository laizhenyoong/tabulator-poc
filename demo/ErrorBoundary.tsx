import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console and call optional error handler
    console.error('Error caught by boundary:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <h2>🚨 Something went wrong</h2>
          <p>
            The Advanced Data Table encountered an unexpected error. This could be due to:
          </p>
          <ul>
            <li>Invalid data format or structure</li>
            <li>Configuration issues</li>
            <li>Browser compatibility problems</li>
            <li>Network connectivity issues</li>
          </ul>
          
          <div style={{ marginTop: '16px' }}>
            <button 
              onClick={this.handleReset}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
          </div>

          {this.state.error && (
            <details style={{ marginTop: '16px' }}>
              <summary>Technical Details</summary>
              <div style={{ marginTop: '8px' }}>
                <strong>Error:</strong> {this.state.error.message}
              </div>
              {this.state.errorInfo && (
                <div style={{ marginTop: '8px' }}>
                  <strong>Component Stack:</strong>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </div>
              )}
              {this.state.error.stack && (
                <div style={{ marginTop: '8px' }}>
                  <strong>Stack Trace:</strong>
                  <pre>{this.state.error.stack}</pre>
                </div>
              )}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;