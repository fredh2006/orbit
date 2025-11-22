'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import dynamic from 'next/dynamic';

const NetworkVisualization = dynamic(() => import('./NetworkVisualization'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full">
      <div className="text-white text-2xl">Loading network...</div>
    </div>
  ),
});

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
          <div className="text-white text-center p-8">
            <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
            <p className="text-xl mb-4">Error: {this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function NetworkPage() {
  return (
    <main className="relative w-full h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 overflow-hidden">
      <ErrorBoundary>
        <NetworkVisualization />
      </ErrorBoundary>
    </main>
  );
}
