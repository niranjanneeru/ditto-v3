import React, { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

// Functional Error Fallback component
const ErrorFallback: React.FC<{ error: Error | null }> = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
    <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
        Something went wrong
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        {error?.message || "An unexpected error occurred"}
      </p>
      <button onClick={() => window.location.reload()} className="btn btn-primary">
        Reload Page
      </button>
    </div>
  </div>
);

// Class-based error boundary (required by React)
class ErrorBoundaryClass extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Functional wrapper component
export const ErrorBoundary: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback }) => (
  <ErrorBoundaryClass fallback={fallback}>{children}</ErrorBoundaryClass>
);
