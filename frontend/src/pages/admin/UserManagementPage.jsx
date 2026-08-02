import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { deleteAdminUser, getAdminUserDetail, getAdminUsers, lockUser, updateAdminUser } from "../../services/adminService";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [actionUserId, setActionUserId] = useState(null);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Bulk actions loading state
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [bulkRoleSelect, setBulkRoleSelect] = useState("");

  // Detail Modal
  const [viewUserDetail, setViewUserDetail] = useState(null);

  // Edit User Modal
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "STUDENT",
    status: "ACTIVE",
  });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminUsers({
        search,
        role: roleFilter,
        status: statusFilter,
        size: 100,
      });
      setUsers(data?.items ?? []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadUsers();
  }

  // Real-time client-side search filtering fallback (Instant UX)
  const filteredUsers = users.filter((user) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const nameMatch = (user.fullName || "").toLowerCase().includes(q);
    const emailMatch = (user.email || "").toLowerCase().includes(q);
    const phoneMatch = (user.phone || "").toLowerCase().includes(q);
    const idMatch = (user.id || "").toString().includes(q);
    return nameMatch || emailMatch || phoneMatch || idMatch;
  });

  async function handleToggleLock(user) {
    const isLocked = user.status === "LOCKED";
    const nextState = !isLocked;
    setActionUserId(user.id);
    setMessage("");
    setError("");
    try {
      await lockUser(user.id, nextState);
      setMessage(`Đã ${nextState ? "khóa" : "mở khóa"} tài khoản ${user.email}`);
      await loadUsers();
    } catch (err) {
      setError(err.message || "Thao tác thất bại");
    } finally {
      setActionUserId(null);
    }
  }

  async function handleViewDetail(userId) {
    setViewUserDetail(null);
    try {
      const detail = await getAdminUserDetail(userId);
      setViewUserDetail(detail);
    } catch (err) {
      setError("Không thể tải chi tiết người dùng: " + err.message);
    }
  }

  function startEditUser(user) {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      role: user.role || "STUDENT",
      status: user.status || "ACTIVE",
    });
    setShowPassword(false);
  }

  async function handleSaveUser(e) {
    e.preventDefault();
    if (!editForm.fullName.trim() || !editForm.email.trim()) {
      alert("Vui lòng điền đầy đủ Họ tên và Email!");
      return;
    }
    setSaving(true);
    try {
      await updateAdminUser(editingUser.id, editForm);
      setMessage(`Đã cập nhật thành công tài khoản ${editForm.email}`);
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      alert("Lỗi cập nhật: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteUser(user) {
    if (!window.confirm(`XÓA TÀI KHOẢN: "${user.email}"?\nThao tác này sẽ xóa vĩnh viễn người dùng khỏi hệ thống.`)) return;
    setActionUserId(user.id);
    try {
      await deleteAdminUser(user.id);
      setMessage(`Đã xóa vĩnh viễn tài khoản ${user.email}`);
      await loadUsers();
    } catch (err) {
      alert("Lỗi xóa người dùng: " + err.message);
    } finally {
      setActionUserId(null);
    }
  }

  // Checkbox Selection
  function toggleSelectAll() {
    if (selectedCheckboxes.size === filteredUsers.length && filteredUsers.length > 0) {
      setSelectedCheckboxes(new Set());
    } else {
      setSelectedCheckboxes(new Set(filteredUsers.map((u) => u.id)));
    }
  }

  function toggleSelectOne(id) {
    const next = new Set(selectedCheckboxes);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCheckboxes(next);
  }

  // BULK ACTIONS (CHỈNH SỬA HÀNG LOẠT CHO CÁC MỤC ĐÃ CHECK TÍCH XANH)
  async function handleBulkLock(shouldLock) {
    const actionText = shouldLock ? "KHÓA" : "MỞ KHÓA";
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} ${selectedCheckboxes.size} tài khoản đã chọn?`)) return;
    setBulkActionLoading(true);
    setMessage("");
    setError("");
    try {
      const selectedIds = Array.from(selectedCheckboxes);
      await Promise.all(selectedIds.map((id) => lockUser(id, shouldLock)));
      setMessage(`Đã ${actionText.toLowerCase()} thành công ${selectedIds.length} tài khoản.`);
      setSelectedCheckboxes(new Set());
      await loadUsers();
    } catch (err) {
      setError("Lỗi xử lý hàng loạt: " + err.message);
    } finally {
      setBulkActionLoading(false);
    }
  }

  async function handleBulkChangeRole(newRole) {
    if (!newRole) return;
    if (!window.confirm(`Đổi vai trò ${selectedCheckboxes.size} tài khoản đã chọn sang "${newRole}"?`)) return;
    setBulkActionLoading(true);
    setMessage("");
    setError("");
    try {
      const selectedIds = Array.from(selectedCheckboxes);
      await Promise.all(selectedIds.map((id) => updateAdminUser(id, { role: newRole })));
      setMessage(`Đã đổi vai trò sang ${newRole} cho ${selectedIds.length} tài khoản.`);
      setSelectedCheckboxes(new Set());
      setBulkRoleSelect("");
      await loadUsers();
    } catch (err) {
      setError("Lỗi cập nhật vai trò hàng loạt: " + err.message);
    } finally {
      setBulkActionLoading(false);
    }
  }

  async function handleBulkDelete() {
    if (!window.confirm(`⚠️ CẢNH BÁO: XÓA VĨNH VIỄN ${selectedCheckboxes.size} tài khoản đã chọn?\nThao tác này không thể hoàn tác!`)) return;
    setBulkActionLoading(true);
    setMessage("");
    setError("");
    try {
      const selectedIds = Array.from(selectedCheckboxes);
      await Promise.all(selectedIds.map((id) => deleteAdminUser(id)));
      setMessage(`Đã xóa vĩnh viễn ${selectedIds.length} tài khoản thành công.`);
      setSelectedCheckboxes(new Set());
      await loadUsers();
    } catch (err) {
      setError("Lỗi xóa hàng loạt: " + err.message);
    } finally {
      setBulkActionLoading(false);
    }
  }

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const studentCount = users.filter((u) => u.role === "STUDENT").length;
  const teacherCount = users.filter((u) => u.role === "TEACHER").length;
  const lockedCount = users.filter((u) => u.status === "LOCKED").length;

  return (
    <div className="vocalyn-dashboard-container">
      {/* Metrics Row */}
      <div className="vocalyn-metrics-grid">
        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Total Accounts</span>
            <div className="metric-icon-circle">👥</div>
          </div>
          <div className="metric-val">{users.length}</div>
          <div className="metric-change positive">
            <span>↑ Active System Users</span>
          </div>
        </div>

        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Students</span>
            <div className="metric-icon-circle">🎓</div>
          </div>
          <div className="metric-val">{studentCount}</div>
          <div className="metric-change positive">
            <span>↑ Learners</span>
          </div>
        </div>

        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Teachers</span>
            <div className="metric-icon-circle">👨‍🏫</div>
          </div>
          <div className="metric-val">{teacherCount}</div>
          <div className="metric-change positive">
            <span>↑ Instructors</span>
          </div>
        </div>

        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Locked Accounts</span>
            <div className="metric-icon-circle" style={{ background: lockedCount > 0 ? "#fee2e2" : "#dcfce7" }}>
              {lockedCount > 0 ? "🔒" : "✅"}
            </div>
          </div>
          <div className="metric-val" style={{ color: lockedCount > 0 ? "#dc2626" : "#16a34a" }}>
            {lockedCount}
          </div>
          <div className={`metric-change ${lockedCount > 0 ? "negative" : "positive"}`}>
            <span>{lockedCount > 0 ? "↓ Action required" : "↑ Clean"}</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="vocalyn-card main-table-card">
        {error && <div className="p-3 mb-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
        {message && <div className="p-3 mb-3 bg-green-100 text-green-700 rounded-lg text-sm">{message}</div>}

        {/* BULK ACTION BAR WHEN CHECKBOXES ARE CHECKED */}
        {selectedCheckboxes.size > 0 && (
          <div style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            padding: "10px 16px",
            borderRadius: "10px",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px"
          }}>
            <div style={{ fontWeight: 700, color: "#1e40af", fontSize: "0.9rem" }}>
              ☑️ Đã chọn <span style={{ color: "#2563eb", fontSize: "1rem" }}>{selectedCheckboxes.size}</span> tài khoản:
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="vocalyn-btn-pill vocalyn-btn-primary"
                disabled={bulkActionLoading}
                onClick={() => handleBulkLock(true)}
                style={{ fontSize: "0.78rem", padding: "4px 10px" }}
              >
                🔒 Khóa Tất Cả
              </button>

              <button
                type="button"
                className="vocalyn-btn-pill vocalyn-btn-secondary"
                disabled={bulkActionLoading}
                onClick={() => handleBulkLock(false)}
                style={{ fontSize: "0.78rem", padding: "4px 10px" }}
              >
                🔓 Mở Khóa Tất Cả
              </button>

              <select
                className="vocalyn-btn-pill vocalyn-btn-secondary"
                style={{ fontSize: "0.78rem", padding: "4px 10px" }}
                value={bulkRoleSelect}
                onChange={(e) => {
                  setBulkRoleSelect(e.target.value);
                  handleBulkChangeRole(e.target.value);
                }}
              >
                <option value="">🛡️ Đổi vai trò hàng loạt...</option>
                <option value="STUDENT">Chuyển thành STUDENT</option>
                <option value="TEACHER">Chuyển thành TEACHER</option>
                <option value="ADMIN">Chuyển thành ADMIN</option>
              </select>

              <button
                type="button"
                className="vocalyn-btn-pill vocalyn-btn-danger"
                disabled={bulkActionLoading}
                onClick={handleBulkDelete}
                style={{ fontSize: "0.78rem", padding: "4px 10px", background: "#dc2626", color: "#fff" }}
              >
                🗑️ Xóa Tất Cả Đã Chọn
              </button>

              <button
                type="button"
                className="vocalyn-btn-pill vocalyn-btn-secondary"
                onClick={() => setSelectedCheckboxes(new Set())}
                style={{ fontSize: "0.78rem", padding: "4px 8px" }}
              >
                ✖ Bỏ chọn
              </button>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="vocalyn-table-toolbar">
          <form onSubmit={handleSearchSubmit} className="toolbar-search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </form>

          <div className="toolbar-actions">
            <select
              className="vocalyn-btn-pill vocalyn-btn-secondary"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Roles</option>
              <option value="STUDENT">STUDENT</option>
              <option value="TEACHER">TEACHER</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            <select
              className="vocalyn-btn-pill vocalyn-btn-secondary"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="LOCKED">LOCKED</option>
            </select>

            <button type="button" className="vocalyn-btn-pill vocalyn-btn-primary" onClick={loadUsers}>
              🔄 Refresh List
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="vocalyn-table-wrapper">
          <table className="vocalyn-data-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>
                  <input
                    type="checkbox"
                    checked={selectedCheckboxes.size === filteredUsers.length && filteredUsers.length > 0}
                    onChange={toggleSelectAll}
                    title="Chọn tất cả người dùng"
                  />
                </th>
                <th>Họ Tên / User Details ⇅</th>
                <th>Email ⇅</th>
                <th>Số Điện Thoại ⇅</th>
                <th>Vai Trò ⇅</th>
                <th>Trạng Thái ⇅</th>
                <th className="text-right">Thao Tác Admin ⇅</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center p-4">Loading Users...</td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-4">No matching users found.</td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const isChecked = selectedCheckboxes.has(user.id);
                  const isLocked = user.status === "LOCKED";

                  return (
                    <tr key={user.id} className={isChecked ? "is-checked-row" : ""}>
                      <td>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(user.id)}
                        />
                      </td>

                      <td>
                        <div className="teacher-cell">
                          <span className="teacher-avatar">{user.fullName ? user.fullName[0].toUpperCase() : "U"}</span>
                          <div>
                            <strong className="course-name-text">{user.fullName || "User"}</strong>
                            <div className="course-sub-text">ID: #{user.id}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="course-sub-text" style={{ fontSize: "0.85rem", color: "#2563eb", fontWeight: 600 }}>{user.email}</span>
                      </td>

                      <td>
                        <span className="course-sub-text">{user.phone || "---"}</span>
                      </td>

                      <td>
                        <span className="vocalyn-tag tag-type">{user.role}</span>
                      </td>

                      <td>
                        <span className={`vocalyn-status-pill ${isLocked ? "status-broken" : "status-healthy"}`}>
                          {user.status || "ACTIVE"}
                        </span>
                      </td>

                      <td className="text-right">
                        <div className="vocalyn-action-buttons">
                          <button
                            type="button"
                            className="vocalyn-icon-btn"
                            title="Xem chi tiết"
                            onClick={() => handleViewDetail(user.id)}
                          >
                            👁️
                          </button>
                          <button
                            type="button"
                            className="vocalyn-icon-btn"
                            title="Chỉnh sửa (Email, SĐT, Mật khẩu, Quyền)"
                            onClick={() => startEditUser(user)}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="vocalyn-icon-btn"
                            title={isLocked ? "Mở khóa" : "Khóa tài khoản"}
                            onClick={() => handleToggleLock(user)}
                          >
                            {isLocked ? "🔓" : "🔒"}
                          </button>
                          <button
                            type="button"
                            className="vocalyn-icon-btn"
                            title="Xóa tài khoản vĩnh viễn"
                            onClick={() => handleDeleteUser(user)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="vocalyn-table-footer">
          <span className="footer-count-text">
            Showing {filteredUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} Users
          </span>

          <div className="vocalyn-pagination">
            <button
              type="button"
              className="page-num-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                className={`page-num-btn ${currentPage === p ? "is-active" : ""}`}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              className="page-num-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* ── View Detail Modal ── */}
      {viewUserDetail && createPortal(
        <div className="lb-overlay" onClick={() => setViewUserDetail(null)}>
          <div className="lb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <div className="lb-modal-header">
              <h3>👁️ Chi Tiết Tài Khoản #{viewUserDetail.id}</h3>
              <button type="button" className="lb-modal-close" onClick={() => setViewUserDetail(null)}>x</button>
            </div>
            <div className="lb-modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", background: "#f8fafc", padding: "10px", borderRadius: "8px" }}>
                <span className="teacher-avatar" style={{ width: "42px", height: "42px", fontSize: "1.2rem" }}>
                  {viewUserDetail.fullName ? viewUserDetail.fullName[0].toUpperCase() : "U"}
                </span>
                <div>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>{viewUserDetail.fullName}</h4>
                  <span style={{ color: "#2563eb", fontWeight: 600 }}>{viewUserDetail.email}</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div><strong>Số điện thoại:</strong> {viewUserDetail.phone || "Chưa cập nhật"}</div>
                <div><strong>Vai trò:</strong> <span className="vocalyn-tag tag-type">{viewUserDetail.role}</span></div>
                <div><strong>Trạng thái:</strong> <span className="vocalyn-status-pill status-healthy">{viewUserDetail.status}</span></div>
                <div><strong>Ngày đăng ký:</strong> {viewUserDetail.createdAt ? new Date(viewUserDetail.createdAt).toLocaleDateString("vi-VN") : "N/A"}</div>
              </div>

              {viewUserDetail.ordersCount !== undefined && (
                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px", marginTop: "4px" }}>
                  <strong>Lịch sử hoạt động:</strong>
                  <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                    <li>Tổng số đơn hàng đã mua: <strong>{viewUserDetail.ordersCount || 0}</strong></li>
                    <li>Khóa học đang sở hữu: <strong>{viewUserDetail.coursesCount || 0}</strong></li>
                  </ul>
                </div>
              )}

              <div className="lb-modal-footer" style={{ marginTop: "12px" }}>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-primary" onClick={() => {
                  startEditUser(viewUserDetail);
                  setViewUserDetail(null);
                }}>
                  ✏️ Chỉnh Sửa Chi Tiết
                </button>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => setViewUserDetail(null)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Edit User Modal (Admin Full Control) ── */}
      {editingUser && createPortal(
        <div className="lb-overlay" onClick={() => !saving && setEditingUser(null)}>
          <div className="lb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "540px" }}>
            <div className="lb-modal-header">
              <h3>✏️ Chỉnh Sửa Tài Khoản Admin #{editingUser.id}</h3>
              <button type="button" className="lb-modal-close" onClick={() => setEditingUser(null)}>x</button>
            </div>
            <form onSubmit={handleSaveUser} className="lb-modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                Họ và Tên (*):
                <input
                  type="text"
                  required
                  className="vocalyn-input-pill"
                  style={{ width: "100%", marginTop: "2px" }}
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                  Địa chỉ Email (*):
                  <input
                    type="email"
                    required
                    className="vocalyn-input-pill"
                    style={{ width: "100%", marginTop: "2px" }}
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </label>

                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                  Số điện thoại:
                  <input
                    type="text"
                    className="vocalyn-input-pill"
                    style={{ width: "100%", marginTop: "2px" }}
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </label>
              </div>

              <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                🔑 Đặt Mật Khẩu Mới (Bỏ trống nếu không thay đổi):
                <div style={{ position: "relative", marginTop: "2px" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu mới cho tài khoản..."
                    className="vocalyn-input-pill"
                    style={{ width: "100%", paddingRight: "42px" }}
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1rem",
                      padding: "0",
                      color: "#64748b",
                      lineHeight: 1,
                    }}
                    title={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {editForm.password && (
                  <div style={{ marginTop: "4px", fontSize: "0.75rem", color: editForm.password.length >= 8 ? "#16a34a" : "#dc2626", fontWeight: 500 }}>
                    {editForm.password.length >= 8
                      ? `✅ Độ dài hợp lệ (${editForm.password.length} ký tự)`
                      : `⚠️ Mật khẩu quá ngắn — cần ít nhất 8 ký tự (${editForm.password.length}/8)`}
                  </div>
                )}
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                  Vai trò (Role):
                  <select
                    className="vocalyn-input-pill"
                    style={{ width: "100%", marginTop: "2px" }}
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  >
                    <option value="STUDENT">STUDENT (Học viên)</option>
                    <option value="TEACHER">TEACHER (Giảng viên)</option>
                    <option value="ADMIN">ADMIN (Quản trị viên)</option>
                  </select>
                </label>

                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                  Trạng thái tài khoản:
                  <select
                    className="vocalyn-input-pill"
                    style={{ width: "100%", marginTop: "2px" }}
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="ACTIVE">ACTIVE (Hoạt động)</option>
                    <option value="LOCKED">LOCKED (Đã khóa)</option>
                  </select>
                </label>
              </div>

              <div className="lb-modal-footer" style={{ marginTop: "12px" }}>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => setEditingUser(null)}>Hủy</button>
                <button type="submit" className="vocalyn-btn-pill vocalyn-btn-primary" disabled={saving}>
                  {saving ? "Đang lưu..." : "💾 Lưu Thay Đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
