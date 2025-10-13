import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { config } from '../../utils/config';

interface FeatureErrorBoundaryProps {
  children: React.ReactNode;
  featureName: string;
  fallbackMessage?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

interface FeatureErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  retryCount: number;
}

export class FeatureErrorBoundary extends React.Component<
  FeatureErrorBoundaryProps,
  FeatureErrorBoundaryState
> {
  private maxRetries = 3;

  constructor(props: FeatureErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<FeatureErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    import('../../utils/errorReporting').then(({ errorReporter }) => {
      errorReporter.reportError(error, {
        component: errorInfo.componentStack?.split('\n')[1]?.trim(),
        action: `${this.props.featureName}: Feature Component Error`,
        severity: 'medium',
        tags: ['react', 'feature', this.props.featureName.toLowerCase(), `retry-${this.state.retryCount}`],
      });
    });
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState((prevState) => ({
        hasError: false,
        error: undefined,
        retryCount: prevState.retryCount + 1,
      }));
      
      if (this.props.onRetry) {
        this.props.onRetry();
      }
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white border border-red-200 rounded-lg p-6 m-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {this.props.featureName} Error
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {this.props.fallbackMessage || 
                  `Something went wrong with the ${this.props.featureName} feature. This doesn't affect other parts of the application.`}
              </p>

              {config.environment === 'development' && this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Bug className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-red-700">Debug Info</span>
                  </div>
                  <p className="text-xs text-red-700 font-mono break-all">
                    {this.state.error.message}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Retry count: {this.state.retryCount}/{this.maxRetries}
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                {(this.props.showRetry !== false && this.state.retryCount < this.maxRetries) && (
                  <button
                    onClick={this.handleRetry}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Try Again
                  </button>
                )}
                <button
                  onClick={() => window.location.href = '/'}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Home className="h-4 w-4 mr-1" />
                  Go to Dashboard
                </button>
              </div>

              {this.state.retryCount >= this.maxRetries && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    This feature appears to be having persistent issues. Please try refreshing the page or contact support if the problem continues.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default FeatureErrorBoundary;
