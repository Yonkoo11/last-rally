import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#050508',
          color: '#FAFAFA',
          fontFamily: "'Space Grotesk', sans-serif",
          gap: '16px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', color: '#EF4444' }}>!</div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Something went wrong</h1>
          <p style={{ fontSize: '14px', color: '#71717A', maxWidth: '400px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={this.handleReset}
            style={{
              marginTop: '8px',
              padding: '10px 24px',
              background: 'rgba(0, 255, 170, 0.15)',
              border: '1px solid rgba(0, 255, 170, 0.3)',
              borderRadius: '8px',
              color: '#00FFAA',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
