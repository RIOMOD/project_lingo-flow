import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../services/apiClient";

const initialNotifications = [
  {
    id: "notif-1",
    type: "course",
    title: "Bài học mới sẵn sàng",
    message: "Khóa học 'TOEIC Full Listening & Reading' vừa được bổ sung 3 bài luyện tập mới.",
    time: "5 phút trước",
    read: false,
    link: "/student/courses",
    icon: "🎓",
    color: "#0369a1",
    bg: "#e0f2fe"
  },
  {
    id: "notif-2",
    type: "leaderboard",
    title: "Thăng hạng Bảng xếp hạng! 🔥",
    message: "Chúc mừng! Bạn vừa tích lũy +150 EXP và vươn lên Top 3 bảng xếp hạng học viên xuất sắc.",
    time: "1 giờ trước",
    read: false,
    link: "/student/leaderboard",
    icon: "🏆",
    color: "#b45309",
    bg: "#fef3c7"
  },
  {
    id: "notif-3",
    type: "payment",
    title: "Thanh toán đơn hàng thành công",
    message: "Đơn hàng #ORD-9821 đã được VietQR xác thực thành công. Khóa học đã kích hoạt vào tài khoản.",
    time: "3 giờ trước",
    read: false,
    link: "/student/orders",
    icon: "💳",
    color: "#15803d",
    bg: "#dcfce7"
  },
  {
    id: "notif-4",
    type: "reminder",
    title: "Đã đến giờ ôn từ vựng!",
    message: "Bạn có 12 từ vựng đến hạn cần ôn tập theo lộ trình nhắc nhở hôm nay.",
    time: "Hôm qua",
    read: true,
    link: "/student/vocabulary",
    icon: "🧠",
    color: "#6d28d9",
    bg: "#ede9fe"
  }
];

export default function NotificationDropdown({ onClose }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState("all");
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        const bellBtn = document.querySelector(".app-badge-button[aria-label='Thông báo']");
        if (bellBtn && bellBtn.contains(event.target)) return;
        if (onClose) onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    let isMounted = true;
    async function fetchRealNotifications() {
      try {
        const res = await apiRequest("/notifications");
        if (isMounted && res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const formatted = res.data.map((n) => ({
            id: n.id,
            type: n.type || "system",
            title: n.title,
            message: n.message,
            time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Vừa xong",
            read: Boolean(n.read),
            link: "/student/orders",
            icon: n.type === "payment" ? "💳" : n.type === "course" ? "🎓" : "🔔",
            color: n.type === "payment" ? "#15803d" : n.type === "course" ? "#0369a1" : "#0d9488",
            bg: n.type === "payment" ? "#dcfce7" : n.type === "course" ? "#e0f2fe" : "#ccfbf1"
          }));
          setNotifications(formatted);
        }
      } catch (err) {
        // Keeps initial fallback if unauthenticated / offline
      }
    }
    fetchRealNotifications();
    return () => { isMounted = false; };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await apiRequest("/notifications/read-all", { method: "PUT" });
    } catch (e) {}
  };

  const markSingleRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (typeof id === "number") {
      try {
        await apiRequest(`/notifications/${id}/read`, { method: "PUT" });
      } catch (e) {}
    }
  };

  const deleteNotif = async (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (typeof id === "number") {
      try {
        await apiRequest(`/notifications/${id}`, { method: "DELETE" });
      } catch (e) {}
    }
  };

  const filteredItems = notifications.filter((item) => {
    if (filter === "unread") return !item.read;
    if (filter === "course") return item.type === "course";
    if (filter === "system") return item.type === "payment" || item.type === "leaderboard";
    return true;
  });

  return (
    <div 
      className="app-notif-popover notif-dropdown-menu"
      ref={containerRef}
    >
      {/* ─── Header ────────────────────────────────────── */}
      <div 
        style={{
          padding: "1.2rem 1.25rem 0.8rem 1.25rem",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#ffffff"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>Thông báo</h3>
          {unreadCount > 0 && (
            <span style={{ background: "#0d9488", color: "#ffffff", fontSize: "0.72rem", fontWeight: "700", padding: "0.15rem 0.5rem", borderRadius: "99px" }}>
              {unreadCount} mới
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button 
            type="button" 
            onClick={markAllRead}
            style={{ background: "none", border: "none", color: "#0d9488", fontSize: "0.82rem", fontWeight: "700", cursor: "pointer", padding: 0 }}
          >
            Đọc tất cả
          </button>
        )}
      </div>

      {/* ─── Filter Tabs ────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "0.35rem", padding: "0.6rem 1.25rem", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
        {[
          { key: "all", label: "Tất cả" },
          { key: "unread", label: `Chưa đọc (${unreadCount})` },
          { key: "course", label: "Khóa học" },
          { key: "system", label: "Hệ thống" }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            style={{
              padding: "0.35rem 0.7rem",
              borderRadius: "8px",
              border: "none",
              background: filter === tab.key ? "#ffffff" : "transparent",
              color: filter === tab.key ? "#0f172a" : "#64748b",
              fontWeight: filter === tab.key ? "700" : "500",
              fontSize: "0.78rem",
              boxShadow: filter === tab.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Notifications List ────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem 0" }}>
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#94a3b8" }}>
            <span style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}>🔔</span>
            <strong style={{ display: "block", color: "#475569", fontSize: "0.95rem" }}>Không có thông báo nào</strong>
            <small style={{ fontSize: "0.82rem" }}>Bạn đã xem hết các thông báo cập nhật.</small>
          </div>
        ) : (
          filteredItems.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              onClick={() => {
                markSingleRead(item.id);
                if (onClose) onClose();
              }}
              style={{
                display: "flex",
                gap: "0.9rem",
                padding: "0.9rem 1.25rem",
                textDecoration: "none",
                background: item.read ? "#ffffff" : "#f0fdfa",
                borderBottom: "1px solid #f1f5f9",
                transition: "background 0.15s ease",
                position: "relative"
              }}
            >
              <div 
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "12px",
                  background: item.bg,
                  color: item.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                  flexShrink: 0
                }}
              >
                {item.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.2rem" }}>
                  <strong style={{ fontSize: "0.9rem", color: item.read ? "#334155" : "#0f172a", fontWeight: "700" }}>
                    {item.title}
                  </strong>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8", flexShrink: 0, marginLeft: "0.5rem" }}>
                    {item.time}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#64748b", lineHeight: "1.4", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {item.message}
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => deleteNotif(item.id, e)}
                title="Xóa thông báo này"
                style={{
                  background: "none",
                  border: "none",
                  color: "#cbd5e1",
                  fontSize: "1rem",
                  cursor: "pointer",
                  padding: "0 0.2rem",
                  alignSelf: "flex-start"
                }}
              >
                ×
              </button>
            </Link>
          ))
        )}
      </div>

      {/* ─── Footer ────────────────────────────────────── */}
      <div 
        style={{
          padding: "0.75rem 1.25rem",
          background: "#f8fafc",
          borderTop: "1px solid #f1f5f9",
          textAlign: "center"
        }}
      >
        <Link 
          to="/student/settings" 
          onClick={onClose}
          style={{ fontSize: "0.82rem", color: "#0d9488", fontWeight: "700", textDecoration: "none" }}
        >
          ⚙️ Tùy chỉnh cài đặt nhận thông báo
        </Link>
      </div>
    </div>
  );
}
