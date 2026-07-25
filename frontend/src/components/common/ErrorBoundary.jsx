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
    console.error("Uncaught React Error:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "3rem 1.5rem", maxWidth: "600px", margin: "4rem auto", textAlign: "center", background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
          <h2 style={{ fontSize: "1.5rem", color: "#0f172a", marginBottom: "0.5rem" }}>Đã xảy ra lỗi không mong muốn</h2>
          <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
            Hệ thống tạm thời không thể hiển thị nội dung này. Vui lòng thử tải lại trang hoặc kiểm tra lại đường dẫn.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            style={{ padding: "0.75rem 1.5rem", background: "#0d9488", color: "#ffffff", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}
          >
            🔄 Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
