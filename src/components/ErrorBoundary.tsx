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
    console.log({ error, errorInfo });
  }

  handleTryAgain = () => {
    window.location.reload();
  };

  renderErrorDetails() {
    const { errorMessage, errorStack } = this.state;
    return (
      <div>
        <p>Error Message: {errorMessage}</p>
        <p>Error Stack:</p>
        <pre>{errorStack}</pre>
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
            className="btn btn-primary mr-auto"
            type="button"
            onClick={this.handleTryAgain}
          >
            Reload App
          </button>
          <div>
            Here is some error information you can share with the developer:
          </div>
          {this.renderErrorDetails()}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
