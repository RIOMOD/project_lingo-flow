import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../../services/userService";
import "../../styles/SettingsPage.css";

const emptyForm = { fullName: "", phone: "", avatarUrl: "", learningGoal: "", bio: "" };

export default function ProfileEditor({ title }) {
  const [form, setForm] = useState(emptyForm);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getProfile()
      .then((profile) => {
        setEmail(profile.email || "");
        setForm({
          fullName: profile.fullName || "",
          phone: profile.phone || "",
          avatarUrl: profile.avatarUrl || "",
          learningGoal: profile.learningGoal || "",
          bio: profile.bio || "",
        });
      })
      .catch((err) => setError(err.message || "Không tải được hồ sơ cá nhân."))
      .finally(() => setLoading(false));
  }, []);

  function change(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (saving || !form.fullName.trim()) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const profile = await updateProfile({ ...form, fullName: form.fullName.trim() });
      setForm({
        fullName: profile.fullName || "",
        phone: profile.phone || "",
        avatarUrl: profile.avatarUrl || "",
        learningGoal: profile.learningGoal || "",
        bio: profile.bio || "",
      });
      setSuccess("✅ Đã cập nhật hồ sơ cá nhân thành công!");
    } catch (err) {
      setError(err.message || "Không lưu được hồ sơ cá nhân.");
    } finally {
      setSaving(false);
    }
  }

  const initialAvatar = form.fullName ? form.fullName.charAt(0).toUpperCase() : "U";

  return (
    <div className="settings-page">
      <div className="settings-container">
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-badge">👤</div>
            <div>
              <h3>{title || "Hồ sơ cá nhân"}</h3>
              <p>Quản lý và cập nhật thông tin cá nhân của bạn</p>
            </div>
          </div>

          {loading ? (
            <div className="settings-alert default-alert">
              ⏳ Đang tải thông tin hồ sơ...
            </div>
          ) : (
            <form className="settings-form" onSubmit={submit}>
              {error && <div className="settings-alert error" role="alert">⚠️ {error}</div>}
              {success && <div className="settings-alert success" role="status">{success}</div>}

              {/* Avatar Preview Card */}
              <div className="profile-avatar-card">
                {form.avatarUrl ? (
                  <img
                    src={form.avatarUrl}
                    alt={form.fullName}
                    className="profile-avatar-img"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="profile-avatar-fallback">
                    {initialAvatar}
                  </div>
                )}
                <div className="profile-avatar-info">
                  <h4>{form.fullName || "Học viên LingoFlow"}</h4>
                  <span>✉️ {email || "student@example.com"}</span>
                </div>
              </div>

              <div className="settings-grid-2">
                <div className="settings-field">
                  <label htmlFor="profileEmail">Địa chỉ Email (Đã xác minh)</label>
                  <input id="profileEmail" value={email} disabled className="disabled-input" />
                </div>

                <div className="settings-field">
                  <label htmlFor="profileFullName">Họ và tên *</label>
                  <input
                    id="profileFullName"
                    name="fullName"
                    value={form.fullName}
                    onChange={change}
                    maxLength="150"
                    placeholder="Nhập họ và tên..."
                    required
                  />
                </div>
              </div>

              <div className="settings-grid-2">
                <div className="settings-field">
                  <label htmlFor="profilePhone">Số điện thoại liên hệ</label>
                  <input
                    id="profilePhone"
                    name="phone"
                    value={form.phone}
                    onChange={change}
                    maxLength="30"
                    placeholder="Ví dụ: 0900000000"
                  />
                </div>

                <div className="settings-field">
                  <label htmlFor="profileAvatarUrl">Ảnh đại diện (URL)</label>
                  <input
                    id="profileAvatarUrl"
                    name="avatarUrl"
                    type="url"
                    value={form.avatarUrl}
                    onChange={change}
                    maxLength="500"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              <div className="settings-field">
                <label htmlFor="profileGoal">Mục tiêu học tập cá nhân</label>
                <input
                  id="profileGoal"
                  name="learningGoal"
                  value={form.learningGoal}
                  onChange={change}
                  maxLength="255"
                  placeholder="Ví dụ: Đạt IELTS 7.0, Tự tin giao tiếp công việc..."
                />
              </div>

              <div className="settings-field">
                <label htmlFor="profileBio">Giới thiệu bản thân & Định hướng</label>
                <textarea
                  id="profileBio"
                  name="bio"
                  rows="4"
                  value={form.bio}
                  onChange={change}
                  placeholder="Viết đôi dòng giới thiệu bản thân..."
                  className="profile-bio-textarea"
                />
              </div>

              <div className="settings-actions">
                <button
                  className="settings-btn-primary"
                  type="submit"
                  disabled={saving || !form.fullName.trim()}
                >
                  {saving ? "⏳ Đang lưu thay đổi..." : "✨ Lưu Thay Đổi Hồ Sơ"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
