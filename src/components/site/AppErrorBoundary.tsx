import { Component, type ErrorInfo, type ReactNode } from "react";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

export default class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("NM Mart app render failed:", error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12 text-center">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <p className="text-[10px] font-bold tracking-[0.16em] text-slate-500 uppercase">NM Mart</p>
          <h1 className="mt-3 text-xl font-bold text-slate-900">Page load nahi ho paya</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Connection ya temporary loading problem ho sakti hai. Dobara try karein.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button type="button" onClick={this.handleReload} className="rounded-full bg-[#1677e8] px-4 py-2 text-xs font-semibold text-white">
              Try again
            </button>
          </div>
        </section>
      </main>
    );
  }
}