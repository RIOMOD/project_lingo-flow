import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { navigationByRole, roleMeta, roleSwitches } from "../../config/navigation";
import { isNavigationItemActive, resolveNavigationSection, resolvePageContext } from "../../config/pageContext";
import { useAuth } from "../../hooks/useAuth";
import { useClickOutside } from "../../hooks/useClickOutside";
import ErrorBoundary from "./ErrorBoundary";
import NotificationDropdown from "./NotificationDropdown";
import MiniChatWidget from "./MiniChatWidget";
import { getCart } from "../../services/commerceService";
import "../../styles/Navbar.css";
import {
  IconBell,
  IconBot,
  IconCart,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconCourses,
  IconLogOut,
  IconMoon,
  IconPath,
  IconProgress,
  IconSearch,
  IconSun,
  IconWriting,
  renderNavIcon,
} from "./SidebarIcons";

function initials(name = "Học viên") {
  return name.split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0]).join("").toUpperCase();
}

function getPageHeaderMeta(pathname, roleKey) {
  const path = (pathname || "").replace(/\/$/, "");

  // Student Routes
  if (path === "/student") return { title: "Tổng quan học tập", breadcrumb: "HỌC TẬP" };
  if (path === "/student/courses") return { title: "Khóa học của tôi", breadcrumb: "HỌC TẬP" };
  if (path.startsWith("/student/courses/")) return { title: "Chi tiết khóa học", breadcrumb: "HỌC TẬP" };
  if (path === "/student/path" || path === "/student/progress") return { title: "Lộ trình & Tiến độ học tập", breadcrumb: "TIẾN ĐỘ & THI ĐUA" };
  if (path === "/student/exercises") return { title: "Bài tập theo kỹ năng", breadcrumb: "HỌC TẬP" };
  if (path === "/student/tests") return { title: "Bài kiểm tra & Thi thử TOEIC", breadcrumb: "HỌC TẬP" };
  if (path === "/student/vocabulary" || path.startsWith("/student/vocabulary")) return { title: "Ôn tập Từ vựng", breadcrumb: "ÔN LUYỆN" };
  if (path === "/student/grammar") return { title: "Ngữ pháp Tiếng Anh", breadcrumb: "ÔN LUYỆN" };
  if (path === "/student/pronunciation") return { title: "Luyện phát âm AI", breadcrumb: "ÔN LUYỆN" };
  if (path === "/student/leaderboard") return { title: "Bảng xếp hạng Học viên 🔥", breadcrumb: "TIẾN ĐỘ & THI ĐUA" };
  if (path === "/student/chatbot") return { title: "Trợ lý Chatbot AI 🤖", breadcrumb: "CÔNG CỤ AI" };
  if (path === "/student/writing") return { title: "AI Chấm & Sửa bài Writing ✍️", breadcrumb: "CÔNG CỤ AI" };
  if (path === "/student/cart") return { title: "Giỏ hàng của bạn 🛒", breadcrumb: "THƯƠNG MẠI" };
  if (path === "/student/checkout") return { title: "Thanh toán khóa học 💳", breadcrumb: "THƯƠNG MẠI" };
  if (path === "/student/orders" || path.startsWith("/student/orders")) return { title: "Lịch sử đơn hàng 📦", breadcrumb: "THƯƠNG MẠI" };
  if (path === "/student/profile") return { title: "Hồ sơ cá nhân", breadcrumb: "TÀI KHOẢN" };
  if (path === "/student/settings") return { title: "Cài đặt tài khoản", breadcrumb: "TÀI KHOẢN" };
  if (path === "/student/support") return { title: "Trung tâm Hỗ trợ & Trợ giúp 🎧", breadcrumb: "TRỢ GIÚP" };

  // Teacher Routes
  if (path === "/teacher") return { title: "Tổng quan Giảng viên", breadcrumb: "GIẢNG DẠY" };
  if (path === "/teacher/courses") return { title: "Quản lý khóa học", breadcrumb: "NỘI DUNG" };
  if (path === "/teacher/courses/create") return { title: "Tạo khóa học mới", breadcrumb: "NỘI DUNG" };
  if (path.includes("/edit")) return { title: "Chỉnh sửa khóa học", breadcrumb: "NỘI DUNG" };
  if (path === "/teacher/lessons") return { title: "Lesson Builder", breadcrumb: "NỘI DUNG" };
  if (path === "/teacher/vocabulary") return { title: "Quản lý từ vựng", breadcrumb: "NỘI DUNG" };
  if (path === "/teacher/grammar") return { title: "Quản lý ngữ pháp", breadcrumb: "NỘI DUNG" };
  if (path === "/teacher/question-bank") return { title: "Ngân hàng câu hỏi", breadcrumb: "NỘI DUNG" };
  if (path === "/teacher/submission") return { title: "Gửi duyệt khóa học", breadcrumb: "NỘI DUNG" };
  if (path === "/teacher/students") return { title: "Theo dõi học viên", breadcrumb: "VẬN HÀNH" };
  if (path === "/teacher/revenue") return { title: "Báo cáo doanh thu", breadcrumb: "VẬN HÀNH" };
  if (path === "/teacher/profile") return { title: "Hồ sơ cá nhân", breadcrumb: "VẬN HÀNH" };

  // Admin Routes
  if (path === "/admin") return { title: "Tổng quan Quản trị viên", breadcrumb: "QUẢN TRỊ" };
  if (path === "/admin/users") return { title: "Quản lý người dùng", breadcrumb: "QUẢN TRỊ" };
  if (path === "/admin/teachers") return { title: "Quản lý giảng viên", breadcrumb: "QUẢN TRỊ" };
  if (path === "/admin/roles") return { title: "Phân quyền hệ thống", breadcrumb: "QUẢN TRỊ" };
  if (path === "/admin/system-activity") return { title: "Nhật ký hoạt động", breadcrumb: "QUẢN TRỊ" };
  if (path === "/admin/course-approval") return { title: "Duyệt khóa học", breadcrumb: "KHÓA HỌC" };
  if (path === "/admin/courses") return { title: "Kiểm tra Video & Sửa khóa học", breadcrumb: "KHÓA HỌC" };
  if (path === "/admin/course-publish") return { title: "Xuất bản khóa học", breadcrumb: "KHÓA HỌC" };
  if (path === "/admin/orders") return { title: "Quản lý đơn hàng", breadcrumb: "THƯƠNG MẠI" };
  if (path === "/admin/transactions") return { title: "Quản lý giao dịch", breadcrumb: "THƯƠNG MẠI" };
  if (path === "/admin/coupons") return { title: "Quản lý mã giảm giá", breadcrumb: "THƯƠNG MẠI" };
  if (path === "/admin/refunds") return { title: "Quản lý hoàn tiền", breadcrumb: "THƯƠNG MẠI" };
  if (path === "/admin/reports") return { title: "Báo cáo thống kê", breadcrumb: "THƯƠNG MẠI" };

  const roleTitles = {
    student: "Không gian học tập",
    teacher: "Trung tâm giảng dạy",
    admin: "Quản trị hệ thống",
  };
  return {
    title: roleTitles[roleKey] || "LingoFlow",
    breadcrumb: (roleKey || "HỆ THỐNG").toUpperCase(),
  };
}

function renderSectionIcon(title) {
  if (!title) return null;
  const t = title.toUpperCase();
  if (t.includes("HỌC TẬP") || t.includes("NỘI DUNG")) return <IconCourses className="w-4 h-4" />;
  if (t.includes("ÔN LUYỆN")) return <IconWriting className="w-4 h-4" />;
  if (t.includes("CÔNG CỤ AI")) return <IconBot className="w-4 h-4" />;
  if (t.includes("TIẾN ĐỘ") || t.includes("QUẢN TRỊ")) return <IconProgress className="w-4 h-4" />;
  if (t.includes("VẬN HÀNH") || t.includes("THƯƠNG MẠI") || t.includes("KHÓA HỌC")) return <IconPath className="w-4 h-4" />;
  return null;
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
  const footerAccountAction = {
    student: { label: "Settings", path: "/student/settings", title: "Cài đặt tài khoản" },
    teacher: { label: "Profile", path: "/teacher/profile", title: "Hồ sơ cá nhân" },
    admin: { label: "Roles", path: "/admin/roles", title: "Phân quyền hệ thống" },
  }[roleKey];

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [showNotif, setShowNotif] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [lessonCtx, setLessonCtx] = useState(null); // { title, chapterTitle, percent, courseId }

  const accountMenuRef = useRef(null);
  const roleDropdownRef = useRef(null);

  useClickOutside(accountMenuRef, () => setShowAccountDropdown(false));
  useClickOutside(roleDropdownRef, () => setShowRoleDropdown(false));

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!isStudent) return;

    let isMounted = true;
    const fetchCartCount = () => {
      getCart()
        .then((cartData) => {
          if (isMounted) setCartCount(cartData?.items?.length || 0);
        })
        .catch(() => {
          if (isMounted) setCartCount(0);
        });
    };

    fetchCartCount();

    window.addEventListener("cart-updated", fetchCartCount);
    return () => {
      isMounted = false;
      window.removeEventListener("cart-updated", fetchCartCount);
    };
  }, [isStudent, location.pathname]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => setIsSidebarOpen(false), [location.pathname]);

  // ── Lesson context: listen for updates from CourseLearningPage ──
  const isLearningRoute = location.pathname.startsWith("/student/learn/");
  useEffect(() => {
    if (!isLearningRoute) {
      setLessonCtx(null);
      return;
    }
    const handler = (e) => setLessonCtx(e.detail);
    window.addEventListener("lesson-context-update", handler);
    return () => window.removeEventListener("lesson-context-update", handler);
  }, [isLearningRoute]);

  const accountName = user?.fullName || user?.name || "Học viên";
  const headerMeta = useMemo(() => getPageHeaderMeta(location.pathname, roleKey), [location.pathname, roleKey]);
  const pageTitle = headerMeta.title;
  const breadcrumb = headerMeta.breadcrumb;

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
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
        {/* Untitled UI Header Card */}
        <div className="app-sidebar-top-header">
          <div className="app-brand-card">
            <button 
              type="button" 
              className="app-brand-logo-box" 
              onClick={() => setIsCollapsed((value) => !value)}
              title={isCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
              aria-label="Thu gọn/Mở rộng thanh bên"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </button>
            <div className="app-brand-info app-label">
              <Link 
                to={role.homePath} 
                className="app-brand-title"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                title="Trở về đầu trang chủ"
              >
                Lingo Flow
              </Link>
              <span className="app-brand-domain">lingoflow.com</span>
            </div>
          </div>
        </div>

        {/* Switch Bar */}
        <div className="app-sidebar-switch-wrapper app-label" ref={roleDropdownRef}>
          <button
            type="button"
            className="app-sidebar-switch-bar"
            onClick={() => setShowRoleDropdown((v) => !v)}
            title="Chuyển đổi vai trò / Không gian làm việc"
            aria-expanded={showRoleDropdown}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-9"/><path d="M14 4l3 3-3 3"/><path d="M4 17h9"/><path d="M10 20l-3-3 3-3"/></svg>
            <span>{role.label || "Workspace"}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: "auto" }}><path d="m6 9 6 6 6-6"/></svg>
          </button>

          {showRoleDropdown && (
            <div className="app-role-dropdown">
              <div className="app-role-dropdown-header">Chuyển vai trò</div>
              {roleSwitches.map((item) => {
                const isActive = item.label.toLowerCase() === roleKey;
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`app-role-dropdown-item ${isActive ? "is-active" : ""}`}
                    onClick={() => {
                      setShowRoleDropdown(false);
                      navigate(item.to);
                    }}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="app-role-check">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <nav className="app-navigation" aria-label="Điều hướng chính">
          <div className="app-nav-list">
            {isCollapsed
              ? sections
                  .flatMap((sec) => (sec.items ? sec.items : [sec]))
                  .map((item) => {
                    const active = isNavigationItemActive(item, location.pathname);
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        title={item.label}
                        className={`app-nav-item ${active ? "is-active" : ""}`}
                      >
                        <span className="app-nav-icon" aria-hidden="true">
                          {renderNavIcon(item.label)}
                        </span>
                      </NavLink>
                    );
                  })
              : sections.map((section) => {
                  if (section.to && section.label) {
                    const active = isNavigationItemActive(section, location.pathname);
                    return (
                      <NavLink
                        key={section.to}
                        to={section.to}
                        title={section.label}
                        className={`app-nav-item is-top-level ${active ? "is-active" : ""}`}
                      >
                        <span className="app-nav-item-left">
                          <span className="app-nav-icon" aria-hidden="true">
                            {renderNavIcon(section.label)}
                          </span>
                          <span className="app-label">{section.label}</span>
                        </span>
                      </NavLink>
                    );
                  }

                  const isOpen = openGroups[section.title] !== false;
                  const hasActiveChild = section.items?.some((item) => isNavigationItemActive(item, location.pathname));

                  return (
                    <section key={section.title} className="app-nav-section">
                      <button
                        type="button"
                        className={`app-nav-group ${hasActiveChild ? "is-parent-active" : ""} ${isOpen ? "is-open" : ""}`}
                        onClick={() => setOpenGroups((groups) => ({ ...groups, [section.title]: !isOpen }))}
                        aria-expanded={isOpen}
                        title={section.title}
                      >
                        <span className="app-nav-group-left">
                          <span className="app-nav-icon app-label" aria-hidden="true">
                            {renderSectionIcon(section.title)}
                          </span>
                          <span className="app-label">{section.title}</span>
                        </span>
                        <span className="app-group-action-plus app-label" aria-hidden="true">
                          +
                        </span>
                      </button>
                      {isOpen && (
                        <div className="app-nav-sub-list">
                          {section.items?.map((item) => {
                            const active = isNavigationItemActive(item, location.pathname);
                            return (
                              <NavLink
                                key={`${section.title}-${item.to}-${item.label}`}
                                to={item.to}
                                title={item.label}
                                className={`app-nav-item is-sub-item ${active ? "is-active" : ""}`}
                              >
                                <span className="app-nav-item-left">
                                  <span className="app-nav-icon" aria-hidden="true">
                                    {renderNavIcon(item.label)}
                                  </span>
                                  <span className="app-label">{item.label}</span>
                                </span>
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  );
                })}
          </div>

          {/* Untitled UI Footer Bottom Actions */}
          <div className="app-sidebar-footer">
            <button type="button" className="app-footer-btn" title="Phản hồi & Hỗ trợ" onClick={() => navigate(isStudent ? "/student/support" : "/contact")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span className="app-label">Support</span>
            </button>
            <button type="button" className="app-footer-btn" title={footerAccountAction.title} onClick={() => navigate(footerAccountAction.path)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              <span className="app-label">{footerAccountAction.label}</span>
            </button>
            {!isStudent && (
              <button
                type="button"
                className="app-footer-btn app-footer-logout"
                title="Đăng xuất"
                aria-label="Đăng xuất"
                disabled={isLoggingOut}
                onClick={handleLogout}
              >
                <IconLogOut />
                <span className="app-label">{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
              </button>
            )}
          </div>
        </nav>
      </aside>

      <div className="app-content">
        <header className="app-topbar">
          <div className="app-topbar-copy">
            {isLearningRoute && lessonCtx ? (
              // ── Lesson Mode Header ──
              <div className="app-lesson-header">
                <Link
                  to={`/student/courses/${lessonCtx.courseId}`}
                  className="app-lesson-back-btn"
                  title="Quay về khóa học"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                </Link>
                <div className="app-lesson-info">
                  <span className="app-lesson-chapter">{lessonCtx.chapterTitle || "Phòng học LingoFlow"}</span>
                  <span className="app-lesson-title">{lessonCtx.title || "Đang tải..."}</span>
                </div>
                <div className="app-lesson-progress-chip-wrapper" style={{ position: "relative" }}>
                  <div className="app-lesson-progress-chip">
                    <svg className="app-lesson-progress-ring" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.15" />
                      <circle
                        cx="18" cy="18" r="15.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray={`${(lessonCtx.percent || 0) * 0.974} 97.4`}
                        strokeDashoffset="24.35"
                      />
                    </svg>
                    <span className="app-lesson-pct">{lessonCtx.percent || 0}%</span>
                  </div>

                  {/* Hover Popover Card for Course Progress */}
                  <div className="app-lesson-progress-popover">
                    <div className="popover-header">
                      <span>🎯 Tiến độ khóa học</span>
                      <strong className="popover-pct">{lessonCtx.percent || 0}%</strong>
                    </div>
                    <div className="popover-bar-track">
                      <div className="popover-bar-fill" style={{ width: `${lessonCtx.percent || 0}%` }} />
                    </div>
                    <div className="popover-footer">
                      <span>{lessonCtx.completedCount || 0}/{lessonCtx.totalCount || 0} bài đã hoàn thành</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // ── Normal Header ──
              <>
                <span className="app-eyebrow">{breadcrumb}</span>
                <h1 className="app-topbar-title">{pageTitle}</h1>
              </>
            )}
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
                {cartCount > 0 && <span className="app-badge-dot">{cartCount}</span>}
              </Link>
              <div style={{ position: "relative" }}>
                <button 
                  className="app-icon-button app-badge-button" 
                  type="button" 
                  aria-label="Thông báo" 
                  title="Thông báo"
                  onClick={() => setShowNotif((v) => !v)}
                >
                  <IconBell />
                  <span className="app-badge-pulse" />
                </button>
                {showNotif && <NotificationDropdown onClose={() => setShowNotif(false)} />}
              </div>
              <div className="app-account-menu" ref={accountMenuRef} style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setShowAccountDropdown((v) => !v)}
                  aria-label="Mở menu tài khoản"
                  aria-expanded={showAccountDropdown}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                >
                  <span className="app-avatar">{initials(accountName)}</span>
                </button>
                {showAccountDropdown && (
                  <div className="app-menu-dropdown">
                    <div className="app-menu-header">
                      <strong>{accountName}</strong>
                      <small>{user?.email || "student@example.com"}</small>
                    </div>
                    <div className="app-menu-divider" />
                    <Link
                      to="/student/profile"
                      className="app-menu-item"
                      onClick={() => setShowAccountDropdown(false)}
                    >
                      <span>👤 Hồ sơ cá nhân</span>
                      <kbd className="app-kbd">⌘P</kbd>
                    </Link>
                    <Link
                      to="/student/settings"
                      className="app-menu-item"
                      onClick={() => setShowAccountDropdown(false)}
                    >
                      <span>⚙️ Cài đặt tài khoản</span>
                      <kbd className="app-kbd">⌘S</kbd>
                    </Link>
                    <Link
                      to="/student/orders"
                      className="app-menu-item"
                      onClick={() => setShowAccountDropdown(false)}
                    >
                      <span>🛒 Lịch sử mua hàng</span>
                    </Link>
                    <div className="app-menu-divider" />
                    <button
                      type="button"
                      className="app-menu-item is-logout"
                      onClick={() => {
                        setShowAccountDropdown(false);
                        handleLogout();
                      }}
                    >
                      <span>🚪 Đăng xuất</span>
                      <kbd className="app-kbd">⌥Q</kbd>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </header>
        <main className="app-main">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {user && isStudent && location.pathname !== "/student/chatbot" && location.pathname !== "/student/writing" && <MiniChatWidget />}
    </div>
  );
}
