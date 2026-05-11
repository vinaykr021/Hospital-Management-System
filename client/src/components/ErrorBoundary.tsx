import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FaExclamationTriangle, FaRefresh } from 'react-icons/fa';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-center">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-md border border-red-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaExclamationTriangle className="text-4xl text-red-500" />
            </div>
            <h1 className="text-3xl font-black text-gray-800 mb-4 tracking-tighter">Something went wrong</h1>
            <p className="text-gray-500 font-medium mb-8">
              The application encountered an unexpected error. Don't worry, your data is safe.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center"
            >
              <span className="mr-2">Reload Page</span>
            </button>
            <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-[10px] text-gray-300 uppercase font-bold tracking-widest leading-relaxed">
                    Error Detail: {this.state.error?.message}
                </p>
            </div>
          </div>
        </div>
      );
    }

    return this.children;
  }
}

export default ErrorBoundary;
