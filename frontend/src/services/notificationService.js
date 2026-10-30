/**
 * NotificationService.js
 * ──────────────────────
 * Central utility to push real-time notifications into the
 * NotificationDropdown component via a custom DOM event.
 *
 * Usage (anywhere in the app):
 *   import { notify } from "../../services/notificationService";
 *   notify.payment("Thanh toán #ORD-1234 thành công!", "/student/orders/1234");
 *   notify.course("Bạn đã hoàn thành bài học ABC 🎉");
 *   notify.system("Phiên làm việc sẽ hết hạn sau 5 phút");
 *   notify.error("Đã xảy ra lỗi khi lưu tiến độ");
 *   notify.progress("Hoàn thành 80% khóa học TOEIC!");
 *   notify.vocab("Ôn tập 12 từ vựng hoàn tất ✨");
 *   notify.grammar("Bài ngữ pháp điểm: 9/10 🏅");
 *   notify.writing("AI đã chấm bài viết của bạn ✍️");
 *   notify.test("Kết quả thi thử: 750/990 điểm TOEIC 🏆");
 *   notify.achievement("Bạn lên Top 3 bảng xếp hạng 🔥");
 */

let _counter = 0;

function generateId(prefix = "notif") {
  return `${prefix}-${Date.now()}-${++_counter}`;
}

function formatTime() {
  return new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Core push function – dispatches the add_notification custom event.
 * @param {object} opts
 */
function push({
  type = "system",
  title,
  message,
  link = "/student",
  icon = "🔔",
  color = "#0d9488",
  bg = "#ccfbf1",
}) {
  const item = {
    id: generateId(type),
    type,
    title: title || message,
    message,
    time: formatTime(),
    read: false,
    link,
    icon,
    color,
    bg,
  };
  window.dispatchEvent(new CustomEvent("add_notification", { detail: item }));
}

/* ── Convenience helpers per notification type ──────────────────────────── */

export const notify = {
  /** 💳 Payment / checkout success */
  payment(message, link = "/student/orders") {
    push({
      type: "payment",
      title: "Thanh toán thành công 💳",
      message,
      link,
      icon: "💳",
      color: "#15803d",
      bg: "#dcfce7",
    });
  },

  /** 📚 Course enrollment / learning milestone */
  course(message, link = "/student/courses") {
    push({
      type: "course",
      title: "Khóa học 📚",
      message,
      link,
      icon: "📚",
      color: "#0369a1",
      bg: "#e0f2fe",
    });
  },

  /** 📈 Learning progress (lesson complete, chapter done, etc.) */
  progress(message, link = "/student/progress") {
    push({
      type: "course",
      title: "Tiến độ học tập 📈",
      message,
      link,
      icon: "📈",
      color: "#7c3aed",
      bg: "#ede9fe",
    });
  },

  /** 🧠 Vocabulary session completed */
  vocab(message, link = "/student/vocabulary") {
    push({
      type: "course",
      title: "Từ vựng 🧠",
      message,
      link,
      icon: "🧠",
      color: "#0369a1",
      bg: "#dbeafe",
    });
  },

  /** 📝 Grammar exercise completed */
  grammar(message, link = "/student/grammar") {
    push({
      type: "course",
      title: "Ngữ pháp 📝",
      message,
      link,
      icon: "📝",
      color: "#6d28d9",
      bg: "#ede9fe",
    });
  },

  /** ✍️ Writing correction submitted */
  writing(message, link = "/student/writing") {
    push({
      type: "course",
      title: "AI sửa Writing ✍️",
      message,
      link,
      icon: "✍️",
      color: "#0284c7",
      bg: "#e0f2fe",
    });
  },

  /** 🏆 Test / exam result */
  test(message, link = "/student/tests") {
    push({
      type: "course",
      title: "Kết quả bài kiểm tra 🏆",
      message,
      link,
      icon: "🏆",
      color: "#b45309",
      bg: "#fef3c7",
    });
  },

  /** 🔥 Achievement / leaderboard */
  achievement(message, link = "/student/leaderboard") {
    push({
      type: "system",
      title: "Thành tích mới 🔥",
      message,
      link,
      icon: "🔥",
      color: "#b45309",
      bg: "#fef3c7",
    });
  },

  /** ⚠️ Error / warning */
  error(message, link = "/student") {
    push({
      type: "system",
      title: "Lỗi hệ thống ⚠️",
      message,
      link,
      icon: "⚠️",
      color: "#b91c1c",
      bg: "#fee2e2",
    });
  },

  /** 🔔 Generic system notification */
  system(message, link = "/student") {
    push({
      type: "system",
      title: "Thông báo hệ thống 🔔",
      message,
      link,
      icon: "🔔",
      color: "#0d9488",
      bg: "#ccfbf1",
    });
  },
};

export default notify;
