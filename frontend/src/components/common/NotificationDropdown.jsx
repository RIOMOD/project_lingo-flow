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

    function handleRealtimeNotification(e) {
      if (e.detail && isMounted) {
        setNotifications((prev) => {
          const exists = prev.some((n) => n.id === e.detail.id || n.message === e.detail.message);
          if (exists) return prev;
          return [e.detail, ...prev];
        });
      }
    }
    window.addEventListener("add_notification", handleRealtimeNotification);

    return () => {
      isMounted = false;
      window.removeEventListener("add_notification", handleRealtimeNotification);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markSingleRead(id) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  function deleteNotif(id, e) {
    e.preventDefault();
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  const filteredItems = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "course") return n.type === "course";
    if (filter === "system") return n.type === "system" || n.type === "payment" || n.type === "reminder";
    return true;
  });

  return (
    <div className="app-notif-popover notif-dropdown-menu" ref={containerRef}>
      {/* Header */}
      <div className="app-notif-header">
        <div className="app-notif-title-row">
          <h3 className="app-notif-title">Thông báo</h3>
          {unreadCount > 0 && (
            <span className="app-notif-badge">
              {unreadCount} mới
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button type="button" className="app-notif-readall-btn" onClick={markAllRead}>
            Đọc tất cả
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="app-notif-filter-bar">
        {[
          { key: "all", label: "Tất cả" },
          { key: "unread", label: `Chưa đọc (${unreadCount})` },
          { key: "course", label: "Khóa học" },
          { key: "system", label: "Hệ thống" }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`app-notif-tab ${filter === tab.key ? "is-active" : ""}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="app-notif-list">
        {filteredItems.length === 0 ? (
          <div className="app-notif-empty">
            <span style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}>🔔</span>
            <strong>Không có thông báo nào</strong>
            <small>Bạn đã xem hết các thông báo cập nhật.</small>
          </div>
        ) : (
          filteredItems.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              className={`app-notif-item ${item.read ? "is-read" : "is-unread"}`}
              onClick={() => {
                markSingleRead(item.id);
                if (onClose) onClose();
              }}
            >
              <div className="app-notif-icon-badge" style={{ background: item.bg, color: item.color }}>
                {item.icon}
              </div>

              <div className="app-notif-info">
                <div className="app-notif-item-header">
                  <strong className="app-notif-item-title">
                    {item.title}
                  </strong>
                  <span className="app-notif-item-time">
                    {item.time}
                  </span>
                </div>
                <p className="app-notif-item-desc">
                  {item.message}
                </p>
              </div>

              <button
                type="button"
                className="app-notif-del-btn"
                onClick={(e) => deleteNotif(item.id, e)}
                title="Xóa thông báo này"
              >
                ×
              </button>
            </Link>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="app-notif-footer">
        <Link to="/student/settings" onClick={onClose} className="app-notif-settings-link">
          ⚙️ Tùy chỉnh cài đặt nhận thông báo
        </Link>
      </div>
    </div>
  );
}
