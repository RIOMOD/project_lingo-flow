import { useEffect, useState } from "react";
import { getAdminRoles } from "../../services/adminService";

const ROLE_PERMISSIONS = {
  ADMIN: [
    "Toàn quyền quản trị hệ thống",
    "Quản lý người dùng & phân quyền",
    "Phê duyệt & xuất bản khóa học",
    "Quản lý đơn hàng & giao dịch",
    "Xem báo cáo & thống kê doanh thu",
    "Cấu hình mã giảm giá & chiết khấu",
    "Quản lý khiếu nại & hoàn tiền",
    "Truy cập nhật ký hệ thống (Audit Log)",
  ],
  TEACHER: [
    "Tạo & chỉnh sửa khóa học cá nhân",
    "Thêm chương, bài học, video bài giảng",
    "Xem thống kê học viên & doanh thu của mình",
    "Gửi khóa học lên Admin để phê duyệt",
    "Trả lời bình luận & tương tác học viên",
    "Quản lý bài kiểm tra & bài tập",
  ],
  STUDENT: [
    "Đăng ký & học các khóa học đã mua",
    "Xem tài liệu & video bài giảng",
    "Làm bài kiểm tra & bài tập",
    "Ôn từ vựng với hệ thống flashcard",
    "Chấm bài phát âm bằng AI",
    "Theo dõi tiến độ học tập cá nhân",
  ],
};

const DEFAULT_ROLES = [
  { id: 1, code: "ADMIN", name: "Quản trị viên hệ thống", description: "Toàn quyền truy cập và điều hành toàn bộ nền tảng", level: "SUPER" },
  { id: 2, code: "TEACHER", name: "Giảng viên / Người tạo nội dung", description: "Tạo và quản lý khóa học, theo dõi học viên", level: "STANDARD" },
  { id: 3, code: "STUDENT", name: "Học viên", description: "Đăng ký và học khóa học trên nền tảng", level: "BASIC" },
];

export default function RoleManagementPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewRole, setViewRole] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });

  useEffect(() => {
    setLoading(true);
    getAdminRoles()
      .then((data) => setRoles(data?.length ? data : DEFAULT_ROLES))
      .catch(() => setRoles(DEFAULT_ROLES))
      .finally(() => setLoading(false));
  }, []);

  const displayRoles = roles.length ? roles : DEFAULT_ROLES;

  function startEdit(r) {
    setEditingRole(r);
    setEditForm({ name: r.name || "", description: r.description || "" });
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    setRoles(displayRoles.map((r) => r.id === editingRole.id ? { ...r, ...editForm } : r));
    setEditingRole(null);
  }

  return (
    <div className="vocalyn-dashboard-container">
      <div className="vocalyn-metrics-grid">
        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Hệ Thống Phân Quyền</span>
            <div className="metric-icon-circle">🛡️</div>
          </div>
          <div className="metric-val">{displayRoles.length}</div>
          <div className="metric-change positive"><span>↑ RBAC Roles Configured</span></div>
        </div>
        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Trạng Thái Bảo Mật</span>
            <div className="metric-icon-circle" style={{ background: "#dcfce7" }}>🔐</div>
          </div>
          <div className="metric-val" style={{ color: "#16a34a", fontSize: "1.4rem" }}>Ổn định</div>
          <div className="metric-change positive"><span>↑ JWT Auth + Spring Security</span></div>
        </div>
      </div>

      <div className="vocalyn-card main-table-card">
        {error && <div className="p-3 mb-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

        <div className="vocalyn-table-toolbar">
          <h3 className="inspector-title" style={{ fontSize: "1.05rem" }}>🛡️ Phân Quyền Hệ Thống (Role-Based Access Control)</h3>
          <span className="vocalyn-tag tag-type" style={{ fontSize: "0.78rem" }}>Chỉ Admin có quyền xem và chỉnh sửa</span>
        </div>

        <div className="vocalyn-table-wrapper">
          <table className="vocalyn-data-table">
            <thead>
              <tr>
                <th>Role Code ⇅</th>
                <th>Tên Vai Trò ⇅</th>
                <th>Mô Tả ⇅</th>
                <th>Cấp Độ ⇅</th>
                <th>Số Quyền Hạn ⇅</th>
                <th className="text-right">Thao Tác Admin ⇅</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center p-4">Đang tải phân quyền hệ thống...</td></tr>
              ) : (
                displayRoles.map((r) => {
                  const permissions = ROLE_PERMISSIONS[r.code] || [];
                  return (
                    <tr key={r.id}>
                      <td><span className="vocalyn-tag tag-type">{r.code}</span></td>
                      <td><strong className="course-name-text">{r.name}</strong></td>
                      <td><span className="course-sub-text">{r.description}</span></td>
                      <td>
                        <span className={`vocalyn-status-pill ${r.code === "ADMIN" ? "status-healthy" : r.code === "TEACHER" ? "status-submitted" : "status-published"}`}>
                          {r.level || (r.code === "ADMIN" ? "SUPER" : r.code === "TEACHER" ? "STANDARD" : "BASIC")}
                        </span>
                      </td>
                      <td><span className="vocalyn-tag tag-level">{permissions.length} quyền hạn</span></td>
                      <td className="text-right">
                        <div className="vocalyn-action-buttons">
                          <button type="button" className="vocalyn-icon-btn" title="Xem chi tiết quyền hạn" onClick={() => setViewRole(r)}>👁️</button>
                          <button type="button" className="vocalyn-icon-btn" title="Chỉnh sửa tên/mô tả" onClick={() => startEdit(r)}>✏️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Permissions Modal */}
      {viewRole && (
        <div className="lb-overlay" onClick={() => setViewRole(null)}>
          <div className="lb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
            <div className="lb-modal-header">
              <h3>🛡️ Quyền Hạn Của Vai Trò: <span className="vocalyn-tag tag-type">{viewRole.code}</span></h3>
              <button type="button" className="lb-modal-close" onClick={() => setViewRole(null)}>x</button>
            </div>
            <div className="lb-modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", marginBottom: "8px" }}>
                <div><strong>Vai trò:</strong> {viewRole.name}</div>
                <div><strong>Mô tả:</strong> {viewRole.description}</div>
              </div>
              <strong>Danh sách quyền hạn ({(ROLE_PERMISSIONS[viewRole.code] || []).length} quyền):</strong>
              <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {(ROLE_PERMISSIONS[viewRole.code] || ["Quyền hệ thống cơ bản"]).map((perm, i) => (
                  <li key={i} style={{ fontSize: "0.83rem" }}>
                    <span style={{ color: "#16a34a", marginRight: "6px" }}>✅</span>{perm}
                  </li>
                ))}
              </ul>
              <div className="lb-modal-footer" style={{ marginTop: "10px" }}>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-primary" onClick={() => { startEdit(viewRole); setViewRole(null); }}>✏️ Chỉnh Sửa</button>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => setViewRole(null)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingRole && (
        <div className="lb-overlay" onClick={() => setEditingRole(null)}>
          <div className="lb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px" }}>
            <div className="lb-modal-header">
              <h3>✏️ Chỉnh Sửa Vai Trò: {editingRole.code}</h3>
              <button type="button" className="lb-modal-close" onClick={() => setEditingRole(null)}>x</button>
            </div>
            <form onSubmit={handleSaveEdit} className="lb-modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Tên Vai Trò:
                <input type="text" required className="vocalyn-input-pill" style={{ width: "100%", marginTop: "2px" }}
                  value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </label>
              <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Mô Tả:
                <textarea rows={3} className="vocalyn-input-pill" style={{ width: "100%", marginTop: "2px", resize: "vertical" }}
                  value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              </label>
              <div style={{ padding: "8px 12px", background: "#fef9c3", borderRadius: "8px", fontSize: "0.78rem", color: "#92400e" }}>
                ⚠️ Lưu ý: Thay đổi phân quyền hệ thống có thể ảnh hưởng đến toàn bộ tài khoản thuộc vai trò này.
              </div>
              <div className="lb-modal-footer" style={{ marginTop: "10px" }}>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => setEditingRole(null)}>Hủy</button>
                <button type="submit" className="vocalyn-btn-pill vocalyn-btn-primary">💾 Lưu Vai Trò</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
