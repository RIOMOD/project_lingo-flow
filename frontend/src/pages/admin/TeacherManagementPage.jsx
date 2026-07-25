import { useEffect, useState } from "react";
import { createTeacher, getAdminUsers, lockUser } from "../../services/adminService";

export default function TeacherManagementPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Create Teacher Modal Form State
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phoneNumber: "", bio: "" });
  const [submitting, setSubmitting] = useState(false);

  async function loadTeachers() {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminUsers({ role: "TEACHER", size: 50 });
      setTeachers(data?.items ?? []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách giảng viên");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeachers();
  }, []);

  async function handleCreateTeacher(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      await createTeacher(form);
      setMessage(`Đã tạo tài khoản giảng viên thành công cho ${form.email}`);
      setShowModal(false);
      setForm({ fullName: "", email: "", password: "", phoneNumber: "", bio: "" });
      await loadTeachers();
    } catch (err) {
      setError(err.message || "Không thể tạo tài khoản giảng viên");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleLock(teacher) {
    const nextLocked = teacher.status !== "LOCKED";
    setMessage("");
    setError("");
    try {
      await lockUser(teacher.id, nextLocked);
      setMessage(`Đã ${nextLocked ? "khóa" : "mở khóa"} giảng viên ${teacher.fullName || teacher.email}`);
      await loadTeachers();
    } catch (err) {
      setError(err.message || "Thao tác thất bại");
    }
  }

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Admin System</span>
        <h2 className="page-title">Quản lý giảng viên</h2>
        <p className="page-description">Danh sách giảng viên trong hệ thống và khởi tạo tài khoản giảng viên mới.</p>
        <div style={{ marginTop: "14px" }}>
          <button className="page-action page-action-primary" onClick={() => setShowModal(true)}>
            + Tạo tài khoản giảng viên
          </button>
        </div>
      </section>

      {error && <p className="auth-error">{error}</p>}
      {message && <p className="course-success">{message}</p>}

      <section className="course-table page-panel-card">
        {loading ? (
          <p className="page-description">Đang tải danh sách giảng viên...</p>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1.2fr", padding: "12px 16px", background: "var(--surface-soft)", fontWeight: 600, fontSize: "0.85rem", borderBottom: "1px solid var(--border-soft)" }}>
              <span>Giảng viên / Email</span>
              <span>Số điện thoại</span>
              <span>Vai trò</span>
              <span>Trạng thái</span>
              <span style={{ textAlign: "right" }}>Thao tác</span>
            </div>

            {teachers.map((t) => (
              <div key={t.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1.2fr", padding: "14px 16px", alignItems: "center", borderBottom: "1px solid var(--border-soft)", fontSize: "0.9rem" }}>
                <div>
                  <strong>{t.fullName || "—"}</strong>
                  <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "var(--text-secondary)" }}>{t.email}</p>
                </div>
                <span>{t.phoneNumber || "—"}</span>
                <span style={{ fontWeight: 600, color: "#2a6ed4" }}>{t.role}</span>
                <div>
                  <span className={`lb-badge ${t.status === "LOCKED" ? "lb-status-rejected" : "lb-status-approved"}`}>
                    {t.status === "LOCKED" ? "Đã khóa" : "Hoạt động"}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <button
                    className={`page-action ${t.status === "LOCKED" ? "page-action-primary" : "page-action-secondary"}`}
                    style={{ padding: "4px 12px", fontSize: "0.8rem" }}
                    onClick={() => handleToggleLock(t)}
                  >
                    {t.status === "LOCKED" ? "Mở khóa" : "Khóa TK"}
                  </button>
                </div>
              </div>
            ))}

            {teachers.length === 0 && !loading && (
              <p className="page-description" style={{ padding: "20px", margin: 0 }}>Chưa có giảng viên nào.</p>
            )}
          </>
        )}
      </section>

      {/* Modal create teacher */}
      {showModal && (
        <div className="lb-overlay" onClick={() => setShowModal(false)}>
          <div className="lb-modal lb-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="lb-modal-header">
              <h3>Khởi tạo giảng viên</h3>
              <button className="lb-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form className="lb-modal-body" onSubmit={handleCreateTeacher}>
              <div className="lb-field">
                <label className="lb-label">Họ và tên *</label>
                <input
                  className="lb-input"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div className="lb-field">
                <label className="lb-label">Email tài khoản *</label>
                <input
                  className="lb-input"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="teacher@lingoflow.edu.vn"
                />
              </div>
              <div className="lb-field">
                <label className="lb-label">Mật khẩu *</label>
                <input
                  className="lb-input"
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>
              <div className="lb-field">
                <label className="lb-label">Số điện thoại</label>
                <input
                  className="lb-input"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  placeholder="0912345678"
                />
              </div>
              <div className="lb-field">
                <label className="lb-label">Giới thiệu ngắn</label>
                <textarea
                  className="lb-textarea"
                  rows={2}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Chuyên gia IELTS / TOEIC..."
                />
              </div>
              <div className="lb-modal-footer">
                <button type="button" className="lb-btn lb-btn-ghost" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="lb-btn lb-btn-primary" disabled={submitting}>
                  {submitting ? "Đang tạo..." : "Khởi tạo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
