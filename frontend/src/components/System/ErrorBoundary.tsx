import React from 'react';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: any };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error('ErrorBoundary caught error:', error, info);
    console.error('Error stack:', error?.stack);
    console.error('Component stack:', info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
          <h1 style={{ margin: 0, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ margin: 0, marginBottom: 16 }}>Try reloading the page.</p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
              <summary>Error Details</summary>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: '8px 16px', 
              background: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4, 
              cursor: 'pointer' 
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

