import { useEffect, useState } from "react";
import { getAdminUsers, lockUser, updateAdminUser, deleteAdminUser, createTeacher } from "../../services/adminService";

export default function TeacherManagementPage() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [actionId, setActionId] = useState(null);

  // View detail
  const [viewDetail, setViewDetail] = useState(null);

  // Edit modal
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  // Create teacher modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [showCreatePwd, setShowCreatePwd] = useState(false);
  const [creating, setCreating] = useState(false);

  async function loadTeachers() {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminUsers({ search, role: "TEACHER", size: 50 });
      setTeachers(data?.items ?? []);
    } catch (err) {
      setError(err.message || "Lỗi tải giảng viên");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTeachers(); }, []);

  async function handleStatusChange(teacher) {
    const isLocked = teacher.status === "LOCKED";
    setActionId(teacher.id);
    setError(""); setMessage("");
    try {
      await lockUser(teacher.id, !isLocked);
      setMessage(`Đã ${!isLocked ? "tạm dừng" : "kích hoạt"} giảng viên ${teacher.email}`);
      await loadTeachers();
    } catch (err) {
      setError(err.message || "Lỗi cập nhật");
    } finally { setActionId(null); }
  }

  function startEdit(t) {
    setEditingTeacher(t);
    setEditForm({ fullName: t.fullName || "", email: t.email || "", phone: t.phone || "", password: "" });
    setShowPassword(false);
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAdminUser(editingTeacher.id, editForm);
      setMessage(`Đã cập nhật giảng viên ${editForm.email}`);
      setEditingTeacher(null);
      await loadTeachers();
    } catch (err) {
      alert("Lỗi: " + err.message);
    } finally { setSaving(false); }
  }

  async function handleDelete(t) {
    if (!window.confirm(`XÓA GIẢNG VIÊN "${t.email}"?`)) return;
    setActionId(t.id);
    try {
      await deleteAdminUser(t.id);
      setMessage(`Đã xóa giảng viên ${t.email}`);
      await loadTeachers();
    } catch (err) {
      alert("Lỗi: " + err.message);
    } finally { setActionId(null); }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!createForm.fullName || !createForm.email || !createForm.password) {
      alert("Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu!");
      return;
    }
    setCreating(true);
    try {
      await createTeacher(createForm);
      setMessage(`Đã tạo tài khoản giảng viên ${createForm.email}`);
      setShowCreate(false);
      setCreateForm({ fullName: "", email: "", phone: "", password: "" });
      await loadTeachers();
    } catch (err) {
      alert("Lỗi tạo giảng viên: " + err.message);
    } finally { setCreating(false); }
  }

  return (
    <div className="vocalyn-dashboard-container">
      <div className="vocalyn-metrics-grid">
        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Total Teachers</span>
            <div className="metric-icon-circle">👨‍🏫</div>
          </div>
          <div className="metric-val">{teachers.length}</div>
          <div className="metric-change positive"><span>↑ Approved instructors</span></div>
        </div>
        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Active Teachers</span>
            <div className="metric-icon-circle">✅</div>
          </div>
          <div className="metric-val">{teachers.filter((t) => t.status === "ACTIVE").length}</div>
          <div className="metric-change positive"><span>↑ Verified</span></div>
        </div>
        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Suspended</span>
            <div className="metric-icon-circle" style={{ background: "#fee2e2" }}>🔒</div>
          </div>
          <div className="metric-val" style={{ color: "#dc2626" }}>{teachers.filter((t) => t.status === "LOCKED").length}</div>
          <div className="metric-change negative"><span>↓ Suspended accounts</span></div>
        </div>
      </div>

      <div className="vocalyn-card main-table-card">
        {error && <div className="p-3 mb-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
        {message && <div className="p-3 mb-3 bg-green-100 text-green-700 rounded-lg text-sm">{message}</div>}

        <div className="vocalyn-table-toolbar">
          <form className="toolbar-search-box" onSubmit={(e) => { e.preventDefault(); loadTeachers(); }}>
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Tìm giảng viên theo tên hoặc email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </form>
          <div className="toolbar-actions">
            <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={loadTeachers}>🔄 Refresh</button>
            <button type="button" className="vocalyn-btn-pill vocalyn-btn-primary" onClick={() => setShowCreate(true)}>➕ Thêm Giảng Viên Mới</button>
          </div>
        </div>

        <div className="vocalyn-table-wrapper">
          <table className="vocalyn-data-table">
            <thead>
              <tr>
                <th>Họ Tên Giảng Viên ⇅</th>
                <th>Email ⇅</th>
                <th>Số Điện Thoại ⇅</th>
                <th>Trạng Thái ⇅</th>
                <th className="text-right">Thao Tác Admin ⇅</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center p-4">Đang tải danh sách giảng viên...</td></tr>
              ) : teachers.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-4">Không có giảng viên nào.</td></tr>
              ) : (
                teachers.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className="teacher-cell">
                        <span className="teacher-avatar">{t.fullName ? t.fullName[0].toUpperCase() : "T"}</span>
                        <div>
                          <strong className="course-name-text">{t.fullName || "Giảng viên"}</strong>
                          <div className="course-sub-text">ID: #{t.id}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="course-sub-text" style={{ color: "#2563eb", fontWeight: 600 }}>{t.email}</span></td>
                    <td><span className="course-sub-text">{t.phone || "---"}</span></td>
                    <td>
                      <span className={`vocalyn-status-pill ${t.status === "ACTIVE" ? "status-healthy" : "status-broken"}`}>
                        {t.status || "ACTIVE"}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="vocalyn-action-buttons">
                        <button type="button" className="vocalyn-icon-btn" title="Xem chi tiết" onClick={() => setViewDetail(t)}>👁️</button>
                        <button type="button" className="vocalyn-icon-btn" title="Chỉnh sửa" onClick={() => startEdit(t)}>✏️</button>
                        <button type="button" className="vocalyn-icon-btn" title={t.status === "ACTIVE" ? "Tạm dừng" : "Kích hoạt"}
                          disabled={actionId === t.id} onClick={() => handleStatusChange(t)}>
                          {t.status === "ACTIVE" ? "🔒" : "🔓"}
                        </button>
                        <button type="button" className="vocalyn-icon-btn" title="Xóa giảng viên" onClick={() => handleDelete(t)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Detail Modal */}
      {viewDetail && (
        <div className="lb-overlay" onClick={() => setViewDetail(null)}>
          <div className="lb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div className="lb-modal-header">
              <h3>👨‍🏫 Chi Tiết Giảng Viên #{viewDetail.id}</h3>
              <button type="button" className="lb-modal-close" onClick={() => setViewDetail(null)}>x</button>
            </div>
            <div className="lb-modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", background: "#f8fafc", padding: "10px", borderRadius: "8px" }}>
                <span className="teacher-avatar" style={{ width: "42px", height: "42px", fontSize: "1.2rem" }}>
                  {viewDetail.fullName ? viewDetail.fullName[0].toUpperCase() : "T"}
                </span>
                <div>
                  <h4 style={{ margin: 0, fontSize: "1rem" }}>{viewDetail.fullName}</h4>
                  <span style={{ color: "#2563eb", fontWeight: 600 }}>{viewDetail.email}</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div><strong>Số điện thoại:</strong> {viewDetail.phone || "Chưa cập nhật"}</div>
                <div><strong>Trạng thái:</strong> <span className="vocalyn-status-pill status-healthy">{viewDetail.status}</span></div>
                <div><strong>Ngày tạo TK:</strong> {viewDetail.createdAt ? new Date(viewDetail.createdAt).toLocaleDateString("vi-VN") : "N/A"}</div>
              </div>
              <div className="lb-modal-footer" style={{ marginTop: "10px" }}>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-primary" onClick={() => { startEdit(viewDetail); setViewDetail(null); }}>✏️ Chỉnh Sửa</button>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => setViewDetail(null)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTeacher && (
        <div className="lb-overlay" onClick={() => !saving && setEditingTeacher(null)}>
          <div className="lb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="lb-modal-header">
              <h3>✏️ Chỉnh Sửa Giảng Viên #{editingTeacher.id}</h3>
              <button type="button" className="lb-modal-close" onClick={() => setEditingTeacher(null)}>x</button>
            </div>
            <form onSubmit={handleSaveEdit} className="lb-modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Họ và Tên (*):
                <input type="text" required className="vocalyn-input-pill" style={{ width: "100%", marginTop: "2px" }}
                  value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Email (*):
                  <input type="email" required className="vocalyn-input-pill" style={{ width: "100%", marginTop: "2px" }}
                    value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                </label>
                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Số điện thoại:
                  <input type="text" className="vocalyn-input-pill" style={{ width: "100%", marginTop: "2px" }}
                    value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                </label>
              </div>
              <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>🔑 Đặt Mật Khẩu Mới (bỏ trống để giữ nguyên):
                <div style={{ position: "relative", marginTop: "2px" }}>
                  <input type={showPassword ? "text" : "password"} placeholder="Nhập mật khẩu mới..."
                    className="vocalyn-input-pill" style={{ width: "100%", paddingRight: "40px" }}
                    value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1rem" }}>
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </label>
              <div className="lb-modal-footer" style={{ marginTop: "10px" }}>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => setEditingTeacher(null)}>Hủy</button>
                <button type="submit" className="vocalyn-btn-pill vocalyn-btn-primary" disabled={saving}>{saving ? "Đang lưu..." : "💾 Lưu Thay Đổi"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Teacher Modal */}
      {showCreate && (
        <div className="lb-overlay" onClick={() => !creating && setShowCreate(false)}>
          <div className="lb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="lb-modal-header">
              <h3>➕ Thêm Giảng Viên Mới</h3>
              <button type="button" className="lb-modal-close" onClick={() => setShowCreate(false)}>x</button>
            </div>
            <form onSubmit={handleCreate} className="lb-modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Họ và Tên Giảng Viên (*):
                <input type="text" required className="vocalyn-input-pill" style={{ width: "100%", marginTop: "2px" }}
                  placeholder="Nguyễn Văn A" value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Email (*):
                  <input type="email" required className="vocalyn-input-pill" style={{ width: "100%", marginTop: "2px" }}
                    placeholder="teacher@example.com" value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
                </label>
                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Số điện thoại:
                  <input type="text" className="vocalyn-input-pill" style={{ width: "100%", marginTop: "2px" }}
                    placeholder="0901234567" value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} />
                </label>
              </div>
              <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>🔑 Mật khẩu (*):
                <div style={{ position: "relative", marginTop: "2px" }}>
                  <input type={showCreatePwd ? "text" : "password"} required placeholder="Mật khẩu tối thiểu 8 ký tự"
                    className="vocalyn-input-pill" style={{ width: "100%", paddingRight: "40px" }}
                    value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} />
                  <button type="button" onClick={() => setShowCreatePwd((v) => !v)}
                    style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1rem" }}>
                    {showCreatePwd ? "🙈" : "👁️"}
                  </button>
                </div>
                {createForm.password && (
                  <div style={{ marginTop: "4px", fontSize: "0.75rem", color: createForm.password.length >= 8 ? "#16a34a" : "#dc2626", fontWeight: 500 }}>
                    {createForm.password.length >= 8 ? `✅ Hợp lệ (${createForm.password.length} ký tự)` : `⚠️ Quá ngắn (${createForm.password.length}/8)`}
                  </div>
                )}
              </label>
              <div className="lb-modal-footer" style={{ marginTop: "10px" }}>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => setShowCreate(false)}>Hủy</button>
                <button type="submit" className="vocalyn-btn-pill vocalyn-btn-primary" disabled={creating}>{creating ? "Đang tạo..." : "➕ Tạo Giảng Viên"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
