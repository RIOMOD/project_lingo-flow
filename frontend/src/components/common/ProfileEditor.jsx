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

  return <div className="course-page">
    <section className="page-hero"><span className="page-badge">Profile</span><h2 className="page-title">{title}</h2><p className="page-description">Thông tin được đọc và lưu trực tiếp qua backend.</p></section>
    {loading ? <p className="auth-state">Đang tải hồ sơ...</p> : <form className="page-panel-card auth-form" onSubmit={submit}>
      {error && <p className="auth-error" role="alert">{error}</p>}{success && <p className="auth-state" role="status">{success}</p>}
      <label className="auth-field">Email<input value={email} disabled /></label>
      <label className="auth-field">Họ tên<input name="fullName" value={form.fullName} onChange={change} maxLength="150" required /></label>
      <label className="auth-field">Số điện thoại<input name="phone" value={form.phone} onChange={change} maxLength="30" /></label>
      <label className="auth-field">Ảnh đại diện URL<input name="avatarUrl" type="url" value={form.avatarUrl} onChange={change} maxLength="500" /></label>
      <label className="auth-field">Mục tiêu học tập<input name="learningGoal" value={form.learningGoal} onChange={change} maxLength="255" /></label>
      <label className="auth-field">Giới thiệu<textarea name="bio" rows="5" value={form.bio} onChange={change} /></label>
      <button className="page-action page-action-primary" disabled={saving || !form.fullName.trim()}>{saving ? "Đang lưu..." : "Lưu hồ sơ"}</button>
    </form>}
  </div>;
}
