import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { demoPaths } from "../config/navigation";
import { isNavigationItemActive } from "../config/pageContext";

export default function GuestLayout() {
  const location = useLocation();
  const guestNavItems = [
    { label: "Trang chủ", to: demoPaths.home },
    { label: "Khóa học", to: demoPaths.guestCourseList },
    { label: "Giới thiệu", to: demoPaths.about },
    { label: "Liên hệ", to: demoPaths.contact },
  ];

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

          <div className="guest-auth-actions">
            <Link className="guest-login-link" to={demoPaths.login}>Đăng nhập</Link>
            <Link className="guest-register-link" to={demoPaths.register}>Bắt đầu học</Link>
          </div>
        </div>
      </header>

      <main className="guest-main">
        <Outlet />
      </main>

      <footer className="guest-footer">
        <div className="guest-footer-inner">
          <span>LingoSmart - Học tiếng Anh thông minh với khóa học, tiến độ và AI.</span>
          <span>Guest có thể xem catalog và học thử bài preview.</span>
        </div>
      </footer>
    </div>
  );
}
