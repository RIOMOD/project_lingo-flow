import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";
import { clearTokens, getAccessToken } from "../services/tokenStorage";

export const AuthContext = createContext(null);

const roleHome = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/student",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Full-screen lock overlay state
  const [accountLocked, setAccountLocked] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Fallback safety timer: Ensure initializing NEVER stays true for more than 2 seconds
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setInitializing(false);
    }, 2000);
    return () => clearTimeout(safetyTimer);
  }, []);

  const loadCurrentUser = useCallback(async () => {
    if (!getAccessToken()) {
      setInitializing(false);
      return null;
    }

    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser?.status === "LOCKED") {
        clearTokens();
        setUser(null);
        triggerAccountLock();
        return null;
      }
      setUser(currentUser);
      setAuthError(null);
      return currentUser;
    } catch (error) {
      clearTokens();
      setUser(null);
      const msg = (error?.message || "").toLowerCase();
      if (error?.status === 403 || msg.includes("account is locked") || msg.includes("tài khoản đã bị khóa")) {
        triggerAccountLock();
      } else {
        setAuthError(error?.message);
      }
      return null;
    } finally {
      setInitializing(false);
    }
  }, []);

  function triggerAccountLock() {
    setAccountLocked(true);
  }

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  // Periodic heartbeat poll every 6 seconds to detect online admin lock
  useEffect(() => {
    if (!user || accountLocked) return;

    const interval = setInterval(async () => {
      if (!getAccessToken()) return;
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser?.status === "LOCKED") {
          clearTokens();
          setUser(null);
          triggerAccountLock();
        }
      } catch (err) {
        const msg = (err?.message || "").toLowerCase();
        if (err?.status === 403 || msg.includes("account is locked") || msg.includes("tài khoản đã bị khóa")) {
          clearTokens();
          setUser(null);
          triggerAccountLock();
        }
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [user, accountLocked]);

  // Listen to window account_locked event from apiClient
  useEffect(() => {
    function handleLockedEvent(e) {
      const msg = (e?.detail?.message || "").toLowerCase();
      if (msg.includes("locked") || msg.includes("khóa")) {
        clearTokens();
        setUser(null);
        triggerAccountLock();
      }
    }
    window.addEventListener("account_locked", handleLockedEvent);
    return () => window.removeEventListener("account_locked", handleLockedEvent);
  }, []);

  // Handle countdown and auto-logout redirect when locked
  useEffect(() => {
    if (!accountLocked) return;

    clearTokens();
    setUser(null);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "/login";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [accountLocked]);

  const login = useCallback(async (payload) => {
    const data = await authService.login(payload);
    setUser(data.user);
    setAuthError(null);
    setAccountLocked(false);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authService.registerStudent(payload);
    setUser(data.user);
    setAuthError(null);
    setAccountLocked(false);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setAccountLocked(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      authError,
      accountLocked,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      reloadUser: loadCurrentUser,
      getRoleHome: (role = user?.role) => roleHome[role] ?? "/",
    }),
    [authError, initializing, loadCurrentUser, login, logout, register, user, accountLocked],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}

      {/* FULL SCREEN ACCOUNT LOCKED MODAL OVERLAY */}
      {accountLocked && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            background: "rgba(15, 23, 42, 0.96)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            textAlign: "center",
            padding: "24px",
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <div
            style={{
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "24px",
              padding: "40px 32px",
              maxWidth: "520px",
              width: "90%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "4rem",
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                background: "#ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
                boxShadow: "0 0 30px rgba(239, 68, 68, 0.5)",
              }}
            >
              🔒
            </div>

            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: 800,
                color: "#fca5a5",
                margin: "0 0 12px 0",
                letterSpacing: "-0.5px",
              }}
            >
              TÀI KHOẢN CỦA BẠN ĐÃ BỊ KHÓA!
            </h2>

            <p
              style={{
                fontSize: "1rem",
                color: "#cbd5e1",
                lineHeight: 1.6,
                margin: "0 0 24px 0",
              }}
            >
              Quản trị viên hệ thống vừa tiến hành tạm dừng hoặc khóa quyền truy cập đối với tài khoản này.
              <br />
              Hệ thống đang tiến hành bảo mật và tự động đăng xuất.
            </p>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                borderRadius: "12px",
                padding: "10px 20px",
                fontSize: "0.9rem",
                color: "#94a3b8",
                marginBottom: "24px",
              }}
            >
              🔄 Tự động chuyển về trang Đăng nhập sau: <strong style={{ color: "#ef4444", fontSize: "1.1rem" }}>{countdown}s</strong>
            </div>

            <button
              type="button"
              onClick={() => {
                window.location.href = "/login";
              }}
              style={{
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "9999px",
                padding: "12px 36px",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.4)",
                transition: "all 0.2s ease",
              }}
            >
              🚪 Đăng Xuất Ngay
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}
