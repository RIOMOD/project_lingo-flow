import { useEffect, useState } from "react";
import { getAdminAuditLogs } from "../../services/adminService";

export default function SystemActivityPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  async function loadLogs() {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminAuditLogs({ size: 50 });
      setLogs(data?.items ?? []);
    } catch (err) {
      setError(err.message || "Không thể tải nhật ký hoạt động");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  function formatDate(dtStr) {
    if (!dtStr) return "—";
    return new Date(dtStr).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Admin System</span>
        <h2 className="page-title">Nhật ký hoạt động</h2>
        <p className="page-description">Lưu trữ tất cả các thao tác quan trọng của Quản trị viên (Audit Trail).</p>
      </section>

      {error && <p className="auth-error">{error}</p>}

      <section className="course-table page-panel-card">
        {loading ? (
          <p className="page-description">Đang tải nhật ký...</p>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.5fr 1fr 1fr 1.5fr 0.8fr", padding: "12px 16px", background: "var(--surface-soft)", fontWeight: 600, fontSize: "0.85rem", borderBottom: "1px solid var(--border-soft)" }}>
              <span>Quản trị viên</span>
              <span>Hành động</span>
              <span>Đối tượng</span>
              <span>Target ID</span>
              <span>Thời gian</span>
              <span style={{ textAlign: "right" }}>Chi tiết</span>
            </div>

            {logs.map((log) => (
              <div key={log.id} style={{ display: "grid", gridTemplateColumns: "1.8fr 1.5fr 1fr 1fr 1.5fr 0.8fr", padding: "14px 16px", alignItems: "center", borderBottom: "1px solid var(--border-soft)", fontSize: "0.88rem" }}>
                <div>
                  <strong>{log.adminName || "System"}</strong>
                  <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "var(--text-secondary)" }}>{log.adminEmail}</p>
                </div>
                <div>
                  <span className="lb-badge lb-badge-type" style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                    {log.action}
                  </span>
                </div>
                <span>{log.targetType || "—"}</span>
                <span>#{log.targetId || "—"}</span>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>{formatDate(log.createdAt)}</span>
                <div style={{ textAlign: "right" }}>
                  <button className="page-action page-action-secondary" style={{ padding: "4px 10px", fontSize: "0.78rem" }} onClick={() => setSelectedLog(log)}>
                    Xem
                  </button>
                </div>
              </div>
            ))}

            {logs.length === 0 && !loading && (
              <p className="page-description" style={{ padding: "20px", margin: 0 }}>Chưa có nhật ký ghi nhận nào.</p>
            )}
          </>
        )}
      </section>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="lb-overlay" onClick={() => setSelectedLog(null)}>
          <div className="lb-modal lb-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="lb-modal-header">
              <h3>Chi tiết hoạt động #{selectedLog.id}</h3>
              <button className="lb-modal-close" onClick={() => setSelectedLog(null)}>✕</button>
            </div>
            <div className="lb-modal-body">
              <div>
                <label className="lb-label">Hành động</label>
                <p style={{ fontWeight: 600, color: "#2a6ed4", margin: 0 }}>{selectedLog.action}</p>
              </div>
              <div>
                <label className="lb-label">Quản trị viên</label>
                <p style={{ margin: 0 }}>{selectedLog.adminName} ({selectedLog.adminEmail})</p>
              </div>
              <div>
                <label className="lb-label">Đối tượng tác động</label>
                <p style={{ margin: 0 }}>{selectedLog.targetType} - ID #{selectedLog.targetId}</p>
              </div>
              {selectedLog.valueBefore && (
                <div>
                  <label className="lb-label">Giá trị trước</label>
                  <p style={{ margin: 0, padding: "8px", background: "var(--surface-soft)", borderRadius: "6px", fontSize: "0.85rem" }}>{selectedLog.valueBefore}</p>
                </div>
              )}
              {selectedLog.valueAfter && (
                <div>
                  <label className="lb-label">Giá trị sau</label>
                  <p style={{ margin: 0, padding: "8px", background: "var(--surface-soft)", borderRadius: "6px", fontSize: "0.85rem" }}>{selectedLog.valueAfter}</p>
                </div>
              )}
              {selectedLog.notes && (
                <div>
                  <label className="lb-label">Ghi chú / Lý do</label>
                  <p style={{ margin: 0, fontStyle: "italic" }}>{selectedLog.notes}</p>
                </div>
              )}
              <div>
                <label className="lb-label">Thời gian thực hiện</label>
                <p style={{ margin: 0, color: "var(--text-secondary)" }}>{formatDate(selectedLog.createdAt)}</p>
              </div>
              <div className="lb-modal-footer">
                <button type="button" className="lb-btn lb-btn-ghost" onClick={() => setSelectedLog(null)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
