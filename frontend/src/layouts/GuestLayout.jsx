import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { demoPaths } from "../config/navigation";
import { isNavigationItemActive } from "../config/pageContext";
import { useAuth } from "../hooks/useAuth";

export default function GuestLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const guestNavItems = [
    { label: "Trang chủ", to: demoPaths.home },
    { label: "Khóa học", to: demoPaths.guestCourseList },
    ...(user ? [{ label: "Góc học tập", to: user.role === "ADMIN" ? "/admin" : user.role === "TEACHER" ? "/teacher" : "/student" }] : []),
    { label: "Giới thiệu", to: demoPaths.about },
    { label: "Liên hệ", to: demoPaths.contact },
  ];

  const dashboardPath = user ? (user.role === "ADMIN" ? "/admin" : user.role === "TEACHER" ? "/teacher" : "/student") : "/login";

  return (
    <div className="guest-layout">
      <header className="guest-header">
        <div className="guest-header-inner">
          <Link to={demoPaths.home} className="guest-brand" aria-label="LingoSmart home">
            <span className="guest-logo-mark">LS</span>
            <span className="guest-brand-copy">
              <span className="guest-brand-title">LingoSmart</span>
              <span className="guest-brand-text">AI English Learning</span>
            </span>
          </Link>

          <nav className="guest-nav">
            {guestNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={`guest-nav-link ${
                  isNavigationItemActive(item, location.pathname)
                    ? "is-active"
                    : ""
                }`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="guest-auth-actions" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Link
                  to={dashboardPath}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    padding: "0.45rem 0.9rem", borderRadius: "999px", background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                    color: "#ffffff", textDecoration: "none", fontWeight: 700, fontSize: "0.85rem", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)"
                  }}
                >
                  <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(255, 255, 255, 0.3)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800 }}>
                    {(user.fullName || user.name || "U")[0].toUpperCase()}
                  </span>
                  <span>{user.fullName || user.name || "Góc học tập"}</span>
                </Link>
                <button
                  type="button"
                  onClick={async () => { await logout(); navigate("/login"); }}
                  style={{ padding: "0.45rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#64748b", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <>
                <Link className="guest-login-link" to={demoPaths.login}>Đăng nhập</Link>
                <Link className="guest-register-link" to={demoPaths.register}>Bắt đầu học</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="guest-main">
        <Outlet />
      </main>

      <footer className="guest-footer">
        <div className="guest-footer-inner">
          <span>LingoSmart - Học tiếng Anh thông minh với khóa học, tiến độ và AI.</span>
          <span>{user ? `Tài khoản đang đăng nhập: ${user.fullName || user.email}` : "Guest có thể xem catalog và học thử bài preview."}</span>
        </div>
      </footer>
    </div>
  );
}
