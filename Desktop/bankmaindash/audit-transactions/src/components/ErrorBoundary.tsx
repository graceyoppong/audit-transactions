'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center space-y-6 p-8">
            <div className="flex justify-center">
              <AlertTriangle className="h-16 w-16 text-red-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Something went wrong
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                We're having trouble connecting to our services.
              </p>
              {this.state.error && (
                <details className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
                  <summary className="cursor-pointer font-medium">
                    Error details
                  </summary>
                  <pre className="mt-2 text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Reload page
              </Button>
              <Button
                variant="outline"
                onClick={() => this.setState({ hasError: false })}
              >
                Try again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
