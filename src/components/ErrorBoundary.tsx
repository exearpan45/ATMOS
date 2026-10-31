import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ATMOS interface error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <section className="max-w-md w-full rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center space-y-3">
            <h1 className="text-xl font-bold">ATMOS needs a refresh</h1>
            <p className="text-sm text-slate-400">A display component ran into an unexpected problem. Your saved cities and preferences remain in your browser.</p>
            <button onClick={() => window.location.reload()} className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-sm font-semibold text-white">Reload ATMOS</button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}
