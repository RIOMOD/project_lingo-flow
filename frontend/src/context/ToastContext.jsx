import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback((message, type = "success") => {
    if (!message) return;
    setToasts((items) => {
      // 1. Deduplicate identical messages to prevent toast spam
      const exists = items.some((item) => item.message === message && item.type === type);
      if (exists) return items;

      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      window.setTimeout(() => removeToast(id), 3000);

      // 2. Keep maximum 2 toasts visible at a time
      const next = [...items, { id, message, type }];
      return next.slice(-2);
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
