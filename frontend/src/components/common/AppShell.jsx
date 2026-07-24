import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { navigationByRole, roleMeta, roleSwitches } from "../../config/navigation";
import { isNavigationItemActive, resolveNavigationSection, resolvePageContext } from "../../config/pageContext";
import { useAuth } from "../../hooks/useAuth";
import ErrorBoundary from "./ErrorBoundary";
import "../../styles/Navbar.css";
import {
  IconBell,
  IconCart,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconLogOut,
  IconMoon,
  IconSearch,
  IconSun,
  renderNavIcon,
} from "./SidebarIcons";

function initials(name = "Học viên") {
  return name.split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0]).join("").toUpperCase();
}

export default function AppShell({ roleKey = "student" }) {
  const role = roleMeta[roleKey] || roleMeta.student;
  const sections = navigationByRole[roleKey] || navigationByRole.student || [];
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

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

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
        {/* Untitled UI Top Banner Header */}
        <div className="app-sidebar-header-banner">
          <Link to={role.homePath} className="app-brand-card">
            <span className="app-brand-logo-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </span>
            <div className="app-brand-info app-label">
              <strong>Lingo Flow</strong>
              <small>{user?.email || "student@example.com"}</small>
            </div>
          </Link>
          <button
            className="app-collapse-button"
            type="button"
            onClick={() => setIsCollapsed((value) => !value)}
            aria-label={isCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
            title={isCollapsed ? "Mở rộng" : "Thu gọn"}
          >
            <span aria-hidden="true">{isCollapsed ? <IconChevronRight /> : <IconChevronLeft />}</span>
          </button>
        </div>

        {/* Untitled UI Workspace Bar */}
        <div className="app-sidebar-workspace-bar app-label">
          <span>{role.title || "Lingo Flow Admins"}</span>
          <button className="app-workspace-add-btn" type="button">+ Create team</button>
        </div>

        {/* Untitled UI Sidebar Search Box */}
        <div className="app-sidebar-search-box app-label">
          <IconSearch className="app-sidebar-search-icon" />
          <input placeholder="Search..." name="sidebar-search" />
        </div>

        <nav className="app-navigation" aria-label="Điều hướng chính">
          {sections.map((section) => {
            const isOpen = openGroups[section.title] !== false;
            const hasActiveChild = section.items.some((item) => isNavigationItemActive(item, location.pathname));

            return (
              <section key={section.title} className="app-nav-section">
                <button
                  type="button"
                  className={`app-nav-group ${hasActiveChild ? "is-parent-active" : ""}`}
                  onClick={() => setOpenGroups((groups) => ({ ...groups, [section.title]: !isOpen }))}
                  aria-expanded={isOpen}
                  title={section.title}
                >
                  <span className="app-nav-icon" aria-hidden="true">{renderNavIcon(section.title)}</span>
                  <span className="app-label">{section.title}</span>
                  <span className="app-group-chevron app-label" aria-hidden="true">
                    {isOpen ? <IconChevronUp /> : <IconChevronDown />}
                  </span>
                </button>
                {isOpen && (
                  <div className="app-nav-list">
                    {section.items.map((item) => {
                      const active = isNavigationItemActive(item, location.pathname);
                      return (
                        <NavLink
                          key={`${section.title}-${item.to}-${item.label}`}
                          to={item.to}
                          title={item.label}
                          className={`app-nav-item ${active ? "is-active" : ""}`}
                        >
                          <span className="app-nav-icon" aria-hidden="true">
                            {active ? <span className="app-active-dot">•</span> : renderNavIcon(item.label)}
                          </span>
                          <span className="app-label">{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </nav>

        <div className="app-sidebar-footer">
          <div className="app-account-card">
            <span className="app-avatar">{initials(accountName)}</span>
            <div className="app-account-copy app-label">
              <strong>{accountName}</strong>
              <div className="app-account-links">
                <Link to="/student/profile">Hồ sơ</Link> · <Link to="/student/settings">Cài đặt</Link>
              </div>
            </div>
            <button className="app-logout" onClick={handleLogout} type="button" aria-label="Đăng xuất" title="Đăng xuất">
              <IconLogOut />
            </button>
          </div>
          {showDevSwitch && (
            <div className="app-dev-switch">
              <p className="app-sidebar-caption">Development roles</p>
              <div className="app-switch-pills">
                {roleSwitches.map((item) => <Link key={item.to} to={item.to} className="app-switch-pill">{item.label}</Link>)}
              </div>
            </div>
          )}
        </div>
      </aside>

      <div className="app-content">
        <header className="app-topbar">
          <div className="app-topbar-copy">
            <span className="app-eyebrow">{breadcrumb}</span>
            <h1 className="app-topbar-title">{pageTitle}</h1>
          </div>
          {isStudent && (
            <div className="app-header-actions">
              <form className="app-search" onSubmit={submitSearch}>
                <label className="sr-only" htmlFor="app-search-input">Tìm khóa học</label>
                <button type="submit" aria-label="Tìm kiếm">
                  <IconSearch />
                </button>
                <input id="app-search-input" name="search" placeholder="Tìm kiếm khóa học..." />
                <kbd className="app-search-kbd">⌘K</kbd>
              </form>
              <button
                className="app-icon-button"
                type="button"
                onClick={toggleTheme}
                aria-label="Đổi chủ đề sáng tối"
                title={`Chuyển sang giao diện ${theme === "light" ? "Tối" : "Sáng"}`}
              >
                {theme === "light" ? <IconMoon /> : <IconSun />}
              </button>
              <Link className="app-icon-button app-badge-button" to="/student/cart" aria-label="Giỏ hàng" title="Giỏ hàng">
                <IconCart />
                <span className="app-badge-dot">2</span>
              </Link>
              <button className="app-icon-button app-badge-button" type="button" aria-label="Thông báo" title="Thông báo">
                <IconBell />
                <span className="app-badge-pulse" />
              </button>
              <details className="app-account-menu">
                <summary aria-label="Mở menu tài khoản">
                  <span className="app-avatar">{initials(accountName)}</span>
                </summary>
                <div className="app-menu-dropdown">
                  <div className="app-menu-header">
                    <strong>{accountName}</strong>
                    <small>{user?.email || "student@example.com"}</small>
                  </div>
                  <div className="app-menu-divider" />
                  <Link to="/student/profile" className="app-menu-item">
                    <span>👤 Hồ sơ cá nhân</span>
                    <kbd className="app-kbd">⌘P</kbd>
                  </Link>
                  <Link to="/student/settings" className="app-menu-item">
                    <span>⚙️ Cài đặt tài khoản</span>
                    <kbd className="app-kbd">⌘S</kbd>
                  </Link>
                  <Link to="/student/orders" className="app-menu-item">
                    <span>🛒 Lịch sử mua hàng</span>
                  </Link>
                  <div className="app-menu-divider" />
                  <button type="button" className="app-menu-item is-logout" onClick={handleLogout}>
                    <span>🚪 Đăng xuất</span>
                    <kbd className="app-kbd">⌥Q</kbd>
                  </button>
                </div>
              </details>
            </div>
          )}
        </header>
        <main className="app-main">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
