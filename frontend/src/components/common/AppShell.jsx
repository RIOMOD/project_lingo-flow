import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { navigationByRole, roleMeta, roleSwitches } from "../../config/navigation";
import { isNavigationItemActive, resolveNavigationSection, resolvePageContext } from "../../config/pageContext";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/Navbar.css"; // Import the modern navbar/sidebar styles

function initials(name = "Học viên") {
  return name.split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0]).join("").toUpperCase();
}

export default function AppShell({ roleKey }) {
  const role = roleMeta[roleKey];
  const sections = navigationByRole[roleKey];
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentPage = resolvePageContext(location.pathname)?.config;
  const currentSection = resolveNavigationSection(roleKey, location.pathname);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState(() => Object.fromEntries(sections.map((section) => [section.title, true])));
  const isStudent = roleKey === "student";
  const showDevSwitch = import.meta.env.DEV && !isStudent;

  useEffect(() => setIsSidebarOpen(false), [location.pathname]);

  const accountName = user?.fullName || user?.name || "Học viên";
  const pageTitle = currentPage?.title ?? role.title;
  const breadcrumb = useMemo(() => currentSection?.title ?? role.label, [currentSection, role.label]);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  function submitSearch(event) {
    event.preventDefault();
    const term = new FormData(event.currentTarget).get("search")?.trim();
    navigate(term ? `/courses?search=${encodeURIComponent(term)}` : "/courses");
  }

  return (
    <div className={`app-shell is-modern ${isCollapsed ? "is-sidebar-collapsed" : ""}`} style={{ "--role-accent": role.accent, "--role-accent-soft": `${role.accent}18`, "--role-accent-border": `${role.accent}40` }}>
      <button type="button" className="app-mobile-trigger" onClick={() => setIsSidebarOpen((open) => !open)} aria-expanded={isSidebarOpen} aria-label={isSidebarOpen ? "Đóng menu" : "Mở menu"}>
        <span aria-hidden="true">{isSidebarOpen ? "✕" : "☰"}</span>
      </button>
      <button type="button" className={`app-sidebar-overlay ${isSidebarOpen ? "is-visible" : ""}`} onClick={() => setIsSidebarOpen(false)} aria-hidden={!isSidebarOpen} tabIndex={isSidebarOpen ? 0 : -1} />

      <aside className={`app-sidebar ${isSidebarOpen ? "is-open" : ""}`}>
        <div className="app-sidebar-head">
          <Link to={role.homePath} className="app-brand-title" aria-label="Lingo Flow">
            <span className="app-brand-mark">LF</span><span className="app-label">Lingo Flow</span>
          </Link>
          <button className="app-collapse-button" type="button" onClick={() => setIsCollapsed((value) => !value)} aria-label={isCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}>
            <span aria-hidden="true">{isCollapsed ? "›" : "‹"}</span>
          </button>
        </div>

        <nav className="app-navigation" aria-label="Điều hướng chính">
          {sections.map((section) => {
            const isOpen = openGroups[section.title] !== false;
            return (
              <section key={section.title} className="app-nav-section">
                <button type="button" className="app-nav-group" onClick={() => setOpenGroups((groups) => ({ ...groups, [section.title]: !isOpen }))} aria-expanded={isOpen} title={section.title}>
                  <span className="app-nav-icon" aria-hidden="true">{section.icon || "📂"}</span>
                  <span className="app-label">{section.title}</span>
                  <span className="app-group-chevron app-label" aria-hidden="true">{isOpen ? "⌃" : "⌄"}</span>
                </button>
                {isOpen && <div className="app-nav-list">
                  {section.items.map((item) => <NavLink key={`${section.title}-${item.to}-${item.label}`} to={item.to} title={item.label} className={`app-nav-item ${isNavigationItemActive(item, location.pathname) ? "is-active" : ""}`}>
                    <span className="app-nav-icon" aria-hidden="true">{item.icon || "📄"}</span><span className="app-label">{item.label}</span>
                  </NavLink>)}
                </div>}
              </section>
            );
          })}
        </nav>

        <div className="app-sidebar-footer">
          <div className="app-account-card">
            <span className="app-avatar">{initials(accountName)}</span>
            <div className="app-account-copy app-label"><strong>{accountName}</strong><Link to="/student/profile">Hồ sơ · Cài đặt</Link></div>
            <button className="app-logout app-label" onClick={handleLogout} type="button" aria-label="Đăng xuất" title="Đăng xuất">🚪</button>
          </div>
          {showDevSwitch && <div className="app-dev-switch"><p className="app-sidebar-caption">Development roles</p><div className="app-switch-pills">{roleSwitches.map((item) => <Link key={item.to} to={item.to} className="app-switch-pill">{item.label}</Link>)}</div></div>}
        </div>
      </aside>

      <div className="app-content">
        <header className="app-topbar">
          <div className="app-topbar-copy"><span className="app-eyebrow">{breadcrumb}</span><h1 className="app-topbar-title">{pageTitle}</h1></div>
          {isStudent && <div className="app-header-actions">
            <form className="app-search" onSubmit={submitSearch}>
              <label className="sr-only" htmlFor="app-search-input">Tìm khóa học</label>
              <button type="submit" aria-label="Tìm kiếm">🔍</button>
              <input id="app-search-input" name="search" placeholder="Tìm khóa học..." />
            </form>
            <Link className="app-icon-button" to="/student/cart" aria-label="Giỏ hàng">🛒</Link>
            <button className="app-icon-button" type="button" aria-label="Thông báo">🔔</button>
            <details className="app-account-menu">
              <summary aria-label="Mở menu tài khoản"><span className="app-avatar">{initials(accountName)}</span></summary>
              <div>
                <strong>{accountName}</strong><Link to="/student/profile">Hồ sơ và cài đặt</Link><Link to="/student/orders">Lịch sử mua hàng</Link><button type="button" onClick={handleLogout}>Đăng xuất</button>
              </div>
            </details>
          </div>}
        </header>
        <main className="app-main"><Outlet /></main>
      </div>
    </div>
  );
}
