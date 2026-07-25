import { useState } from "react";
import { updatePassword } from "../../services/userService";
import "../../styles/SettingsPage.css";

export default function SettingsPage() {
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingPass, setSavingPass] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  const [notifications, setNotifications] = useState({
    emailReminders: true,
    weeklyReport: true,
    courseUpdates: true,
  });

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  function handlePassChange(e) {
    setPassForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handlePassSubmit(e) {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }
    if (passForm.newPassword.length < 8) {
      setPassError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    setSavingPass(true);
    try {
      await updatePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      setPassSuccess("Đổi mật khẩu thành công!");
      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPassError(err.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.");
    } finally {
      setSavingPass(false);
    }
  }

  function handleThemeChange(newTheme) {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Section 1: Security & Password */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-badge">🔒</div>
            <div>
              <h3>Bảo mật & Mật khẩu</h3>
              <p>Cập nhật mật khẩu để bảo vệ tài khoản của bạn</p>
            </div>
          </div>
          <form className="settings-form" onSubmit={handlePassSubmit} autoComplete="off">
            {passError && <div className="settings-alert error">{passError}</div>}
            {passSuccess && <div className="settings-alert success">{passSuccess}</div>}

            <div className="settings-field">
              <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passForm.currentPassword}
                onChange={handlePassChange}
                placeholder="Nhập mật khẩu hiện tại..."
                required
              />
            </div>

            <div className="settings-grid-2">
              <div className="settings-field">
                <label htmlFor="newPassword">Mật khẩu mới</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passForm.newPassword}
                  onChange={handlePassChange}
                  placeholder="Ít nhất 8 ký tự..."
                  minLength={8}
                  required
                />
              </div>
              <div className="settings-field">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passForm.confirmPassword}
                  onChange={handlePassChange}
                  placeholder="Nhập lại mật khẩu mới..."
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="settings-actions">
              <button className="settings-btn-primary" type="submit" disabled={savingPass}>
                {savingPass ? "Đang lưu..." : "Đổi mật khẩu"}
              </button>
            </div>
          </form>
        </section>

        {/* Section 2: Appearance / Theme */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-badge">🎨</div>
            <div>
              <h3>Giao diện & Chủ đề</h3>
              <p>Tùy chỉnh chế độ hiển thị sáng/tối theo sở thích</p>
            </div>
          </div>
          <div className="theme-selector-grid">
            <button
              type="button"
              className={`theme-option-card ${theme === "light" ? "is-active" : ""}`}
              onClick={() => handleThemeChange("light")}
            >
              <div className="theme-preview light-preview">
                <div className="preview-header" />
                <div className="preview-body" />
              </div>
              <div className="theme-option-label">
                <span>☀️ Giao diện Sáng</span>
                <small>Phù hợp làm việc ban ngày</small>
              </div>
            </button>

            <button
              type="button"
              className={`theme-option-card ${theme === "dark" ? "is-active" : ""}`}
              onClick={() => handleThemeChange("dark")}
            >
              <div className="theme-preview dark-preview">
                <div className="preview-header" />
                <div className="preview-body" />
              </div>
              <div className="theme-option-label">
                <span>🌙 Giao diện Tối</span>
                <small>Dịu mắt khi học ban đêm</small>
              </div>
            </button>
          </div>
        </section>

        {/* Section 3: Notifications */}
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-badge">🔔</div>
            <div>
              <h3>Thông báo & Nhắc nhở</h3>
              <p>Quản lý cách hệ thống liên lạc và nhắc nhở học tập</p>
            </div>
          </div>
          <div className="settings-toggle-list">
            <label className="settings-toggle-item">
              <div>
                <strong>Nhắc nhở học tập qua Email</strong>
                <p>Nhận email nhắc học hằng ngày khi có bài tập hoặc từ vựng đến hạn ôn tập</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailReminders}
                onChange={(e) => setNotifications((prev) => ({ ...prev, emailReminders: e.target.checked }))}
              />
            </label>

            <label className="settings-toggle-item">
              <div>
                <strong>Báo cáo tiến độ tuần</strong>
                <p>Tổng hợp kết quả học tập và số từ vựng ghi nhớ hàng tuần gửi về email</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.weeklyReport}
                onChange={(e) => setNotifications((prev) => ({ ...prev, weeklyReport: e.target.checked }))}
              />
            </label>

            <label className="settings-toggle-item">
              <div>
                <strong>Cập nhật khóa học & Bài giảng mới</strong>
                <p>Nhận thông báo khi giảng viên cập nhật nội dung bài học mới</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.courseUpdates}
                onChange={(e) => setNotifications((prev) => ({ ...prev, courseUpdates: e.target.checked }))}
              />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}
