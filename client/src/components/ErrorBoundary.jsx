import React, { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, fontFamily: "Prompt, system-ui, sans-serif", background: "#fcf4ee", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ maxWidth: 650, width: "100%", background: "#fff", padding: 32, borderRadius: 20, boxShadow: "0 10px 30px rgba(0, 70, 167, 0.1)", border: "1px solid #fed7aa" }}>
            <div style={{ display: "inline-flex", padding: "6px 12px", background: "#fee2e2", color: "#b91c1c", borderRadius: 8, fontSize: 13, fontWeight: "bold", marginBottom: 12 }}>
              ⚠️ Runtime Error Detected
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0046a7", margin: "0 0 10px" }}>
              เกิดข้อผิดพลาดในการแสดงผลหน้าเว็บ
            </h1>
            <p style={{ fontSize: 14, color: "#495f8f", margin: "0 0 16px", lineHeight: 1.5 }}>
              React ตรวจพบข้อผิดพลาดขณะเรนเดอร์ Component ทำให้หน้าจอเป็นสีขาว:
            </p>
            <div style={{ padding: 14, background: "#fef2f2", borderRadius: 12, border: "1px solid #fca5a5", color: "#991b1b", fontSize: 13, fontWeight: 600, wordBreak: "break-word" }}>
              {this.state.error?.toString()}
            </div>
            {this.state.errorInfo?.componentStack && (
              <pre style={{ marginTop: 12, padding: 12, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 11, color: "#475569", overflowX: "auto", maxHeight: 180 }}>
                {this.state.errorInfo.componentStack}
              </pre>
            )}
            <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{ padding: "10px 20px", background: "#0046a7", color: "#fff", border: "none", borderRadius: 12, fontWeight: "bold", cursor: "pointer", fontSize: 14 }}
              >
                รีโหลดหน้าเว็บ
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                style={{ padding: "10px 20px", background: "#fff", color: "#495f8f", border: "1px solid #cbd5e1", borderRadius: 12, fontWeight: "bold", cursor: "pointer", fontSize: 14 }}
              >
                ล้าง Cache / LocalStorage แล้วลองใหม่
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
