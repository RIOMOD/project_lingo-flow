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
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="confirm-modal-header">
          <div className="confirm-modal-icon">{icon}</div>
          <h3 className="confirm-modal-title">{title}</h3>
          <button type="button" className="confirm-modal-close" onClick={onCancel}>✕</button>
        </div>

        {/* Message Content */}
        <div className="confirm-modal-body">{message}</div>

        {/* Footer Actions */}
        <div className="confirm-modal-footer">
          {cancelText && (
            <button type="button" className="confirm-modal-btn-cancel" onClick={onCancel}>
              {cancelText}
            </button>
          )}

          <button
            type="button"
            className="confirm-modal-btn-confirm"
            onClick={onConfirm}
            style={{ background: buttonGradients[variant] || buttonGradients.primary }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
