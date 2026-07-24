import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error("ErrorBoundary caught an error:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleClearData = () => {
    try {
      indexedDB.deleteDatabase("cardtalk-db");
    } catch {}
    try {
      localStorage.clear();
    } catch {}
    location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center" style={{ background: "var(--bg)", color: "var(--text)" }}>
          <div className="text-5xl">😵</div>
          <h2 className="text-lg font-bold">出了点问题</h2>
          <p className="max-w-md text-sm opacity-70">
            {this.state.error?.message || "应用遇到了错误"}
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="rounded-full px-4 py-2 text-sm font-medium transition hover:opacity-80"
              style={{ background: "var(--accent)", color: "var(--card)" }}
            >
              重新加载
            </button>
            <button
              onClick={this.handleClearData}
              className="rounded-full border px-4 py-2 text-sm font-medium transition hover:opacity-80"
              style={{ borderColor: "var(--card-border)", color: "var(--text-soft)" }}
            >
              清除数据重置
            </button>
          </div>
          <button
            onClick={() => {
              const text = this.state.error?.stack || this.state.error?.message || "";
              navigator.clipboard?.writeText(String(text));
            }}
            className="mt-2 text-xs opacity-50 hover:opacity-80"
          >
            复制错误信息
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
