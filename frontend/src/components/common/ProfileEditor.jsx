import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../../services/userService";

const emptyForm = { fullName: "", phone: "", avatarUrl: "", learningGoal: "", bio: "" };

export default function ProfileEditor({ title }) {
  const [form, setForm] = useState(emptyForm);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getProfile().then((profile) => {
      setEmail(profile.email || "");
      setForm({
        fullName: profile.fullName || "", phone: profile.phone || "", avatarUrl: profile.avatarUrl || "",
        learningGoal: profile.learningGoal || "", bio: profile.bio || "",
      });
    }).catch((err) => setError(err.message || "Không tải được hồ sơ."))
      .finally(() => setLoading(false));
  }, []);

  function change(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (saving || !form.fullName.trim()) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      const profile = await updateProfile({ ...form, fullName: form.fullName.trim() });
      setForm({ fullName: profile.fullName || "", phone: profile.phone || "", avatarUrl: profile.avatarUrl || "", learningGoal: profile.learningGoal || "", bio: profile.bio || "" });
      setSuccess("Đã lưu hồ sơ. Dữ liệu sẽ được giữ sau khi tải lại trang.");
    } catch (err) {
      setError(err.message || "Không lưu được hồ sơ.");
    } finally { setSaving(false); }
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <section className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-badge">👤</div>
            <div>
              <h3>{title}</h3>
              <p>Quản lý thông tin cá nhân và hồ sơ người dùng</p>
            </div>
          </div>

          {loading ? (
            <p className="auth-state">Đang tải hồ sơ...</p>
          ) : (
            <form className="settings-form" onSubmit={submit}>
              {error && <div className="settings-alert error" role="alert">{error}</div>}
              {success && <div className="settings-alert success" role="status">{success}</div>}

              <div className="settings-grid-2">
                <div className="settings-field">
                  <label htmlFor="profileEmail">Địa chỉ Email</label>
                  <input id="profileEmail" value={email} disabled style={{ opacity: 0.7, cursor: "not-allowed" }} />
                </div>
                <div className="settings-field">
                  <label htmlFor="profileFullName">Họ và tên</label>
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
                  <label htmlFor="profilePhone">Số điện thoại</label>
                  <input
                    id="profilePhone"
                    name="phone"
                    value={form.phone}
                    onChange={change}
                    maxLength="30"
                    placeholder="Nhập số điện thoại..."
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
                    placeholder="https://example.com/avatar.png"
                  />
                </div>
              </div>

              <div className="settings-field">
                <label htmlFor="profileGoal">Mục tiêu học tập</label>
                <input
                  id="profileGoal"
                  name="learningGoal"
                  value={form.learningGoal}
                  onChange={change}
                  maxLength="255"
                  placeholder="Ví dụ: Đạt IELTS 7.0 trong 6 tháng, Giao tiếp tự tin..."
                />
              </div>

              <div className="settings-field">
                <label htmlFor="profileBio">Giới thiệu bản thân</label>
                <textarea
                  id="profileBio"
                  name="bio"
                  rows="4"
                  value={form.bio}
                  onChange={change}
                  placeholder="Mô tả ngắn gọn về bạn và định hướng học tập..."
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.95rem",
                    fontFamily: "inherit"
                  }}
                />
              </div>

              <div className="settings-actions">
                <button
                  className="settings-btn-primary"
                  type="submit"
                  disabled={saving || !form.fullName.trim()}
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi hồ sơ"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
