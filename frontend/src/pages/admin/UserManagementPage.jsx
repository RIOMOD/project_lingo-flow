import { useEffect, useState } from "react";
import { getAdminUsers, lockUser, updateAdminUserRole } from "../../services/adminService";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [actionUserId, setActionUserId] = useState(null);

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminUsers({
        search,
        role: roleFilter,
        status: statusFilter,
        size: 30,
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

  async function handleRoleChange(user, newRole) {
    if (newRole === user.role) return;
    setActionUserId(user.id);
    setMessage("");
    setError("");
    try {
      await updateAdminUserRole(user.id, newRole);
      setMessage(`Đã thay đổi quyền của ${user.email} thành ${newRole}`);
      await loadUsers();
    } catch (err) {
      setError(err.message || "Không thể thay đổi quyền");
    } finally {
      setActionUserId(null);
    }
  }

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Admin System</span>
        <h2 className="page-title">Quản lý người dùng</h2>
        <p className="page-description">Tìm kiếm, phân quyền và khóa/mở khóa tài khoản người dùng trong hệ thống.</p>

        <form onSubmit={handleSearchSubmit} className="course-filter-row" style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            className="lb-input"
            style={{ maxWidth: "260px" }}
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="lb-select" style={{ maxWidth: "160px" }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">Tất cả vai trò</option>
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select className="lb-select" style={{ maxWidth: "160px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="LOCKED">Đã khóa</option>
          </select>
          <button className="page-action page-action-primary" type="submit">Tìm kiếm</button>
        </form>
      </section>

      {error && <p className="auth-error">{error}</p>}
      {message && <p className="course-success">{message}</p>}

      <section className="course-table page-panel-card">
        {loading ? (
          <p className="page-description">Đang tải danh sách...</p>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1.2fr", padding: "12px 16px", background: "var(--surface-soft)", fontWeight: 600, fontSize: "0.85rem", borderBottom: "1px solid var(--border-soft)" }}>
              <span>Họ tên / Email</span>
              <span>Số điện thoại</span>
              <span>Vai trò</span>
              <span>Trạng thái</span>
              <span style={{ textAlign: "right" }}>Thao tác</span>
            </div>

            {users.map((u) => (
              <div key={u.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1.2fr", padding: "14px 16px", alignItems: "center", borderBottom: "1px solid var(--border-soft)", fontSize: "0.9rem" }}>
                <div>
                  <strong>{u.fullName || "—"}</strong>
                  <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "var(--text-secondary)" }}>{u.email}</p>
                </div>
                <span>{u.phoneNumber || "—"}</span>
                <div>
                  <select
                    className="lb-select"
                    style={{ padding: "4px 8px", fontSize: "0.8rem", width: "auto" }}
                    value={u.role || "STUDENT"}
                    onChange={(e) => handleRoleChange(u, e.target.value)}
                    disabled={actionUserId === u.id}
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="TEACHER">TEACHER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <span className={`lb-badge ${u.status === "LOCKED" ? "lb-status-rejected" : "lb-status-approved"}`}>
                    {u.status === "LOCKED" ? "Đã khóa" : "Hoạt động"}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <button
                    className={`page-action ${u.status === "LOCKED" ? "page-action-primary" : "page-action-secondary"}`}
                    style={{ padding: "4px 12px", fontSize: "0.8rem" }}
                    onClick={() => handleToggleLock(u)}
                    disabled={actionUserId === u.id}
                  >
                    {u.status === "LOCKED" ? "Mở khóa" : "Khóa TK"}
                  </button>
                </div>
              </div>
            ))}

            {users.length === 0 && !loading && (
              <p className="page-description" style={{ padding: "20px", margin: 0 }}>Không tìm thấy người dùng phù hợp.</p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
