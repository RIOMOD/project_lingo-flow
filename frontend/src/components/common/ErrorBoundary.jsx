import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught React Error Boundary:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "3rem 1.5rem", maxWidth: "600px", margin: "4rem auto", textAlign: "center", background: "#ffffff", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "3.2rem", marginBottom: "1rem" }}>⚠️</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>Đã xảy ra lỗi không mong muốn</h2>
          <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: "0.95rem", lineHeight: 1.5 }}>
            Hệ thống tạm thời không thể hiển thị nội dung này. Vui lòng tải lại trang hoặc quay về trang chủ để tiếp tục.
          </p>

          {this.state.error && (
            <details open style={{ marginBottom: "1.5rem", textAlign: "left" }}>
              <summary style={{ fontSize: "0.8rem", color: "#64748b", cursor: "pointer", fontWeight: 600 }}>🔍 Chi tiết lỗi hệ thống</summary>
              <pre style={{ margin: "8px 0 0 0", padding: "10px", background: "#f8fafc", color: "#dc2626", fontSize: "0.78rem", borderRadius: "8px", overflowX: "auto", border: "1px solid #fee2e2", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {this.state.error.stack || this.state.error.toString()}
              </pre>
            </details>
          )}

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={this.handleReload}
              style={{ padding: "0.75rem 1.5rem", background: "linear-gradient(135deg, #0d9488, #0f766e)", color: "#ffffff", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 14px rgba(13,148,136,0.3)" }}
            >
              🔄 Tải lại trang
            </button>
            <button
              type="button"
              onClick={this.handleHome}
              style={{ padding: "0.75rem 1.5rem", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", borderRadius: "12px", fontWeight: "600", cursor: "pointer" }}
            >
              🏠 Quay về Trang chủ
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
