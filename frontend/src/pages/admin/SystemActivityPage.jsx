import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getAdminAuditLogs } from "../../services/adminService";

const ACTION_TYPES = ["", "UPDATE_USER_STATUS", "DELETE_USER", "APPROVE_COURSE", "REJECT_COURSE", "PUBLISH_COURSE", "UPDATE_COURSE", "CREATE_TEACHER", "UPDATE_USER_ROLE"];

export default function SystemActivityPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [search, setSearch] = useState("");
  const [viewLog, setViewLog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  async function loadLogs() {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminAuditLogs({ size: 200 });
      setLogs(data?.items || []);
    } catch (err) {
      setError(err.message || "Lỗi tải nhật ký hệ thống");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadLogs(); }, []);

  const filtered = logs.filter((log) => {
    const matchAction = !actionFilter || (log.action || "").includes(actionFilter);
    const matchSearch = !search || (log.adminEmail || log.adminName || "").toLowerCase().includes(search.toLowerCase());
    return matchAction && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function exportCSV() {
    const header = "Timestamp,Admin,Action,Entity,Target ID,Details";
    const rows = filtered.map((log) =>
      [
        new Date(log.createdAt || Date.now()).toLocaleString("vi-VN"),
        log.adminEmail || log.adminName || "System",
        log.action || "",
        log.targetEntity || "",
        log.targetId || "",
        (log.details || "").replace(/,/g, ";"),
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `audit_log_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  function getActionColor(action) {
    if (!action) return "tag-level";
    if (action.includes("DELETE") || action.includes("REJECT")) return "tag-free";
    if (action.includes("APPROVE") || action.includes("PUBLISH")) return "tag-type";
    return "tag-level";
  }

  return (
    <div className="vocalyn-dashboard-container">
      <div className="vocalyn-metrics-grid">
        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Tổng Nhật Ký</span>
            <div className="metric-icon-circle">📜</div>
          </div>
          <div className="metric-val">{logs.length}</div>
          <div className="metric-change positive"><span>↑ Live Security Monitoring</span></div>
        </div>
        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Đang Hiển Thị</span>
            <div className="metric-icon-circle">🔍</div>
          </div>
          <div className="metric-val">{filtered.length}</div>
          <div className="metric-change positive"><span>↑ Đã lọc</span></div>
        </div>
      </div>

      <div className="vocalyn-card main-table-card">
        {error && <div className="p-3 mb-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

        <div className="vocalyn-table-toolbar">
          <div className="toolbar-search-box">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Tìm theo email admin..." value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <div className="toolbar-actions">
            <select className="vocalyn-btn-pill vocalyn-btn-secondary" value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}>
              <option value="">Tất cả hành động</option>
              {ACTION_TYPES.filter(Boolean).map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={loadLogs}>🔄 Refresh</button>
            <button type="button" className="vocalyn-btn-pill vocalyn-btn-primary" onClick={exportCSV}>⬇️ Xuất CSV</button>
          </div>
        </div>

        <div className="vocalyn-table-wrapper">
          <table className="vocalyn-data-table">
            <thead>
              <tr>
                <th>Thời Gian ⇅</th>
                <th>Admin Thực Hiện ⇅</th>
                <th>Hành Động ⇅</th>
                <th>Đối Tượng ⇅</th>
                <th>Chi Tiết ⇅</th>
                <th className="text-right">Xem</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center p-4">Đang tải nhật ký hệ thống...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan="6" className="text-center p-4">Không có nhật ký nào.</td></tr>
              ) : (
                paginated.map((log, i) => (
                  <tr key={log.id || i}>
                    <td><small className="course-sub-text">{new Date(log.createdAt || Date.now()).toLocaleString("vi-VN")}</small></td>
                    <td><strong className="course-name-text" style={{ fontSize: "0.82rem" }}>{log.adminEmail || log.adminName || "System"}</strong></td>
                    <td><span className={`vocalyn-tag ${getActionColor(log.action)}`}>{log.action || "SYSTEM_EVENT"}</span></td>
                    <td><span className="vocalyn-tag tag-level" style={{ fontSize: "0.75rem" }}>{log.targetEntity || "SYSTEM"} #{log.targetId || "-"}</span></td>
                    <td><span className="course-sub-text" style={{ fontSize: "0.78rem" }}>{(log.details || log.ipAddress || "—").slice(0, 60)}</span></td>
                    <td className="text-right">
                      <button type="button" className="vocalyn-icon-btn" onClick={() => setViewLog(log)}>👁️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="vocalyn-table-footer">
          <span className="footer-count-text">Showing {Math.min((currentPage - 1) * pageSize + 1, filtered.length)}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} logs</span>
          <div className="vocalyn-pagination">
            <button className="page-num-btn" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>‹</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button key={p} className={`page-num-btn ${currentPage === p ? "is-active" : ""}`} onClick={() => setCurrentPage(p)}>{p}</button>
            ))}
            <button className="page-num-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>›</button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {viewLog && createPortal(
        <div className="lb-overlay" onClick={() => setViewLog(null)}>
          <div className="lb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="lb-modal-header">
              <h3>📜 Chi Tiết Nhật Ký Hệ Thống</h3>
              <button type="button" className="lb-modal-close" onClick={() => setViewLog(null)}>x</button>
            </div>
            <div className="lb-modal-body" style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
              <div><strong>⏰ Thời gian:</strong> {new Date(viewLog.createdAt || Date.now()).toLocaleString("vi-VN")}</div>
              <div><strong>👤 Admin thực hiện:</strong> {viewLog.adminEmail || viewLog.adminName || "System"}</div>
              <div><strong>⚡ Hành động:</strong> <span className={`vocalyn-tag ${getActionColor(viewLog.action)}`}>{viewLog.action}</span></div>
              <div><strong>🎯 Đối tượng:</strong> {viewLog.targetEntity} #{viewLog.targetId}</div>
              <div><strong>📝 Trước thay đổi:</strong> <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>{viewLog.oldValue || "—"}</code></div>
              <div><strong>📝 Sau thay đổi:</strong> <code style={{ background: "#dcfce7", padding: "2px 6px", borderRadius: "4px" }}>{viewLog.newValue || "—"}</code></div>
              <div><strong>💬 Chi tiết:</strong> {viewLog.details || "Không có mô tả thêm"}</div>
              {viewLog.ipAddress && <div><strong>🌐 IP Address:</strong> {viewLog.ipAddress}</div>}
              <div className="lb-modal-footer" style={{ marginTop: "10px" }}>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => setViewLog(null)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
