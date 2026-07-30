import { useEffect } from "react";

export default function ConfirmModal({
  open,
  title = "Xác nhận hành động",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  variant = "primary",
  icon = "📝",
  onConfirm,
  onCancel
}) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const buttonGradients = {
    primary: "linear-gradient(135deg, #0d9488, #059669)",
    danger: "linear-gradient(135deg, #ef4444, #dc2626)",
    warning: "linear-gradient(135deg, #f59e0b, #d97706)"
  };

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "1rem"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "420px",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          border: "1px solid #e2e8f0"
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            borderBottom: "1px solid #f1f5f9",
            background: "#f8fafc"
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "#e0f2fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
              flexShrink: 0
            }}
          >
            {icon}
          </div>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", flex: 1 }}>
            {title}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              fontSize: "1.2rem",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "6px"
            }}
          >
            ✕
          </button>
        </div>

        {/* Message Content */}
        <div style={{ padding: "1.5rem", color: "#334155", fontSize: "0.95rem", lineHeight: "1.5" }}>
          {message}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: "1rem 1.5rem",
            background: "#f8fafc",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "0.75rem"
          }}
        >
          {cancelText && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: "0.65rem 1.25rem",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#475569",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: "0.65rem 1.35rem",
              borderRadius: "10px",
              border: "none",
              background: buttonGradients[variant] || buttonGradients.primary,
              color: "#ffffff",
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(13, 148, 136, 0.25)",
              transition: "all 0.15s ease"
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
