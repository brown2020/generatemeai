import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage?: string;
  errorStack?: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message,
      errorStack: error.stack,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // TODO: Send to error reporting service (e.g., Sentry) in production
    // if (process.env.NODE_ENV === 'production') {
    //   reportError({ error, errorInfo });
    // }
  }

  handleTryAgain = () => {
    window.location.reload();
  };

  renderErrorDetails() {
    const { errorMessage, errorStack } = this.state;

    // Only show detailed error info in development
    if (process.env.NODE_ENV !== "development") {
      return null;
    }

    return (
      <div className="mt-4 text-sm opacity-75">
        <p className="font-semibold">Error Message:</p>
        <p className="mb-2">{errorMessage}</p>
        <p className="font-semibold">Stack Trace:</p>
        <pre className="text-xs overflow-auto max-h-48 bg-black/20 p-2 rounded">
          {errorStack}
        </pre>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col gap-5 p-5 h-full bg-[#333b51] text-white">
          <h2 className="text-xl">
            Oops, there is an error! It could be related to your internet
            service. Try reloading.
          </h2>
          <button
            className="btn btn-primary mr-auto px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            type="button"
            onClick={this.handleTryAgain}
          >
            Reload App
          </button>
          {this.renderErrorDetails()}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
