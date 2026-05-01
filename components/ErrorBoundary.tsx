"use client";

import { Component, type ReactNode } from "react";
import { logError } from "../lib/logError";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    logError({
      type: "react_boundary",
      message: error.message,
      stack: error.stack,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16, padding: 24 }}>
          <div style={{ fontSize: 32 }}>⚠️</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#333" }}>予期しないエラーが発生しました</div>
          <div style={{ fontSize: 13, color: "#888" }}>ページを再読み込みしてください</div>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 8, padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            再読み込み
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
