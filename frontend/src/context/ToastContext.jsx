import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { notify } from "../services/notificationService";

const ToastContext = createContext(null);

// Smart classifier: map a toast message to the right notification helper
function autoNotify(message, type) {
  if (!message) return;
  const m = message.toLowerCase();

  // Errors always go to error notification
  if (type === "error") {
    notify.error(message);
    return;
  }

  // Payment events
  if (m.includes("thanh toán") || m.includes("đơn hàng") || m.includes("payment") || m.includes("order")) {
    notify.payment(message);
    return;
  }

  // Test / exam results
  if (m.includes("bài kiểm tra") || m.includes("thi thử") || m.includes("kết quả") || m.includes("điểm")) {
    notify.test(message);
    return;
  }

  // Vocabulary session
  if (m.includes("từ vựng") || m.includes("vocab") || m.includes("ôn tập")) {
    notify.vocab(message);
    return;
  }

  // Grammar exercises
  if (m.includes("ngữ pháp") || m.includes("grammar")) {
    notify.grammar(message);
    return;
  }

  // Writing correction
  if (m.includes("writing") || m.includes("bài viết") || m.includes("chấm")) {
    notify.writing(message);
    return;
  }

  // Learning progress / lesson
  if (m.includes("bài học") || m.includes("hoàn thành") || m.includes("tiến độ") || m.includes("lesson") || m.includes("chương")) {
    notify.progress(message);
    return;
  }

  // Achievement / leaderboard
  if (m.includes("top") || m.includes("xếp hạng") || m.includes("exp") || m.includes("hạng")) {
    notify.achievement(message);
    return;
  }

  // Course enrollment
  if (m.includes("khóa học") || m.includes("đăng ký") || m.includes("course")) {
    notify.course(message);
    return;
  }

  // Registration / account
  if (m.includes("tài khoản") || m.includes("đăng nhập") || m.includes("mật khẩu")) {
    notify.system(message);
    return;
  }

  // Generic success/info
  if (type === "success" || type === "info") {
    notify.system(message);
  }
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback((message, type = "success") => {
    if (!message) return;
    setToasts((items) => {
      // Deduplicate identical messages
      const exists = items.some((item) => item.message === message && item.type === type);
      if (exists) return items;

      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      window.setTimeout(() => removeToast(id), 4500);

      // Auto push to NotificationDropdown with smart type detection
      autoNotify(message, type);

      const next = [...items, { id, message, type }];
      return next.slice(-3); // max 3 toasts visible at once
    });
  }, [removeToast]);

  const value = useMemo(() => ({
    showToast,
    success: (message) => showToast(message, "success"),
    error: (message) => showToast(message, "error"),
    info: (message) => showToast(message, "info"),
  }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <button
            type="button"
            key={toast.id}
            className={`toast toast-${toast.type}`}
            onClick={() => removeToast(toast.id)}
          >
            <span className="toast-icon">
              {toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "ℹ️"}
            </span>
            {toast.message}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
