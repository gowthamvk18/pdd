import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
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
        <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-4 text-foreground">Something went wrong</h1>
          <p className="text-foreground/60 max-w-md mb-12 text-lg">
            An unexpected error occurred. We've been notified and are looking into it.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-12 py-4 bg-primary text-white rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95"
          >
            <RotateCcw className="w-5 h-5" /> Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
