import { useState } from "react";
import { createPortal } from "react-dom";

export default function RefundManagementPage() {
  const [refunds, setRefunds] = useState([
    { id: "REF-101", user: "tran.van.c@gmail.com", orderId: "ORD-9819", amount: 599000, reason: "Mua nhầm khóa học", status: "PENDING", date: "2026-08-02" },
    { id: "REF-100", user: "pham.minh.d@gmail.com", orderId: "ORD-9818", amount: 499000, reason: "Trùng thanh toán", status: "APPROVED", date: "2026-08-01" },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedCheckboxes, setSelectedCheckboxes] = useState(new Set());

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRefund, setEditingRefund] = useState(null);
  const [viewDetailRefund, setViewDetailRefund] = useState(null);

  const [form, setForm] = useState({
    user: "",
    orderId: "",
    amount: 599000,
    reason: "Mua nhầm khóa học",
    status: "PENDING",
  });

  function handleCreate(e) {
    e.preventDefault();
    if (!form.user.trim() || !form.orderId.trim()) return;

    const newRefund = {
      id: `REF-${Math.floor(100 + Math.random() * 900)}`,
      user: form.user.trim(),
      orderId: form.orderId.trim(),
      amount: Number(form.amount),
      reason: form.reason.trim(),
      status: form.status,
      date: new Date().toISOString().substring(0, 10),
    };

    setRefunds([newRefund, ...refunds]);
    setShowCreateModal(false);
    resetForm();
  }

  function startEdit(r) {
    setEditingRefund(r);
    setForm({
      user: r.user,
      orderId: r.orderId,
      amount: r.amount,
      reason: r.reason,
      status: r.status,
    });
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    setRefunds(
      refunds.map((r) =>
        r.id === editingRefund.id
          ? {
              ...r,
              user: form.user.trim(),
              orderId: form.orderId.trim(),
              amount: Number(form.amount),
              reason: form.reason.trim(),
              status: form.status,
            }
          : r
      )
    );
    setEditingRefund(null);
    resetForm();
  }

  function handleUpdateStatus(id, newStatus) {
    setRefunds(
      refunds.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  }

  function handleDelete(id) {
    if (!window.confirm(`XÓA YÊU CẦU HOÀN TIỀN "${id}"?`)) return;
    setRefunds(refunds.filter((r) => r.id !== id));
  }

  // Checkbox Selection
  function toggleSelectAll() {
    if (selectedCheckboxes.size === filteredRefunds.length && filteredRefunds.length > 0) {
      setSelectedCheckboxes(new Set());
    } else {
      setSelectedCheckboxes(new Set(filteredRefunds.map((r) => r.id)));
    }
  }

  function toggleSelectOne(id) {
    const next = new Set(selectedCheckboxes);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCheckboxes(next);
  }

  function handleBulkDelete() {
    if (!window.confirm(`XÓA HÀNG LOẠT ${selectedCheckboxes.size} yêu cầu hoàn tiền đã chọn?`)) return;
    setRefunds(refunds.filter((r) => !selectedCheckboxes.has(r.id)));
    setSelectedCheckboxes(new Set());
  }

  function resetForm() {
    setForm({
      user: "",
      orderId: "",
      amount: 599000,
      reason: "Mua nhầm khóa học",
      status: "PENDING",
    });
  }

  const filteredRefunds = refunds.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || r.id.toLowerCase().includes(q) || r.user.toLowerCase().includes(q) || r.orderId.toLowerCase().includes(q) || r.reason.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="vocalyn-dashboard-container">
      {/* Metrics Row */}
      <div className="vocalyn-metrics-grid">
        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Refund Requests</span>
            <div className="metric-icon-circle">🔄</div>
          </div>
          <div className="metric-val">{refunds.length}</div>
          <div className="metric-change positive">
            <span>↑ Customer Service</span>
          </div>
        </div>

        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Pending Refunds</span>
            <div className="metric-icon-circle" style={{ background: "#fef9c3" }}>⏳</div>
          </div>
          <div className="metric-val">{refunds.filter((r) => r.status === "PENDING").length}</div>
          <div className="metric-change positive">
            <span>↑ Needs Review</span>
          </div>
        </div>

        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Filter Results</span>
            <div className="metric-icon-circle">🔍</div>
          </div>
          <div className="metric-val">{filteredRefunds.length}</div>
          <div className="metric-change positive">
            <span>↑ Matched</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="vocalyn-card main-table-card">
        {/* Bulk Actions Toolbar */}
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
            gap: "10px"
          }}>
            <div style={{ fontWeight: 700, color: "#1e40af", fontSize: "0.9rem" }}>
              ☑️ Đã chọn <span style={{ color: "#2563eb", fontSize: "1rem" }}>{selectedCheckboxes.size}</span> yêu cầu hoàn tiền:
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                className="vocalyn-btn-pill vocalyn-btn-danger"
                onClick={handleBulkDelete}
                style={{ fontSize: "0.78rem", padding: "4px 12px" }}
              >
                🗑️ Xóa Tất Cả Đã Chọn
              </button>
              <button
                type="button"
                className="vocalyn-btn-pill vocalyn-btn-secondary"
                onClick={() => setSelectedCheckboxes(new Set())}
                style={{ fontSize: "0.78rem", padding: "4px 10px" }}
              >
                ✖ Bỏ chọn
              </button>
            </div>
          </div>
        )}

        <div className="vocalyn-table-toolbar">
          <div className="toolbar-search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search refund ID, email, order or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="toolbar-actions">
            <select
              className="vocalyn-btn-pill vocalyn-btn-secondary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>

            <button type="button" className="vocalyn-btn-pill vocalyn-btn-primary" onClick={() => { resetForm(); setShowCreateModal(true); }}>
              ➕ Tạo Yêu Cầu Hoàn Tiền
            </button>
          </div>
        </div>

        <div className="vocalyn-table-wrapper">
          <table className="vocalyn-data-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>
                  <input
                    type="checkbox"
                    checked={selectedCheckboxes.size === filteredRefunds.length && filteredRefunds.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Refund Ref ⇅</th>
                <th>User Email ⇅</th>
                <th>Order Ref ⇅</th>
                <th>Số Tiền ⇅</th>
                <th>Lý Do Hoàn Tiền ⇅</th>
                <th>Trạng Thái ⇅</th>
                <th className="text-right">Thao Tác Admin ⇅</th>
              </tr>
            </thead>
            <tbody>
              {filteredRefunds.map((r) => {
                const isChecked = selectedCheckboxes.has(r.id);
                return (
                  <tr key={r.id} className={isChecked ? "is-checked-row" : ""}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectOne(r.id)}
                      />
                    </td>
                    <td><span className="vocalyn-tag tag-type">{r.id}</span></td>
                    <td><strong className="course-name-text">{r.user}</strong></td>
                    <td><span className="course-sub-text">{r.orderId}</span></td>
                    <td><strong>{r.amount ? `${r.amount.toLocaleString()}đ` : "0đ"}</strong></td>
                    <td><span className="course-sub-text">{r.reason}</span></td>
                    <td>
                      <span className={`vocalyn-status-pill ${
                        r.status === "APPROVED" ? "status-healthy" : r.status === "REJECTED" ? "status-broken" : "status-submitted"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="vocalyn-action-buttons">
                        <button type="button" className="vocalyn-icon-btn" title="Xem chi tiết" onClick={() => setViewDetailRefund(r)}>👁️</button>
                        {r.status === "PENDING" && (
                          <>
                            <button type="button" className="vocalyn-btn-pill vocalyn-btn-primary" style={{ padding: "2px 6px", fontSize: "0.72rem" }} onClick={() => handleUpdateStatus(r.id, "APPROVED")}>✅ Duyệt</button>
                            <button type="button" className="vocalyn-btn-pill vocalyn-btn-danger" style={{ padding: "2px 6px", fontSize: "0.72rem" }} onClick={() => handleUpdateStatus(r.id, "REJECTED")}>❌ Từ chối</button>
                          </>
                        )}
                        <button type="button" className="vocalyn-icon-btn" title="Sửa đơn hoàn" onClick={() => startEdit(r)}>✏️</button>
                        <button type="button" className="vocalyn-icon-btn" title="Xóa yêu cầu" onClick={() => handleDelete(r.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Detail Modal */}
      {viewDetailRefund && createPortal(
        <div className="lb-overlay" onClick={() => setViewDetailRefund(null)}>
          <div className="lb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div className="lb-modal-header">
              <h3>👁️ Chi Tiết Hoàn Tiền #{viewDetailRefund.id}</h3>
              <button type="button" className="lb-modal-close" onClick={() => setViewDetailRefund(null)}>x</button>
            </div>
            <div className="lb-modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
              <div><strong>Khách hàng:</strong> {viewDetailRefund.user}</div>
              <div><strong>Mã đơn hàng:</strong> {viewDetailRefund.orderId}</div>
              <div><strong>Số tiền hoàn:</strong> {viewDetailRefund.amount?.toLocaleString()}đ</div>
              <div><strong>Lý do yêu cầu:</strong> {viewDetailRefund.reason}</div>
              <div><strong>Trạng thái:</strong> <span className="vocalyn-status-pill status-healthy">{viewDetailRefund.status}</span></div>
              <div><strong>Ngày tạo yêu cầu:</strong> {viewDetailRefund.date}</div>

              <div className="lb-modal-footer" style={{ marginTop: "10px" }}>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-primary" onClick={() => { startEdit(viewDetailRefund); setViewDetailRefund(null); }}>✏️ Chỉnh Sửa</button>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => setViewDetailRefund(null)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Create / Edit Modal */}
      {(showCreateModal || editingRefund) && createPortal(
        <div className="lb-overlay" onClick={() => { setShowCreateModal(false); setEditingRefund(null); }}>
          <div className="lb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="lb-modal-header">
              <h3>{editingRefund ? `✏️ Sửa Yêu Cầu Hoàn Tiền #${editingRefund.id}` : "➕ Tạo Yêu Cầu Hoàn Tiền Mới"}</h3>
              <button type="button" className="lb-modal-close" onClick={() => { setShowCreateModal(false); setEditingRefund(null); }}>x</button>
            </div>
            <form onSubmit={editingRefund ? handleSaveEdit : handleCreate} className="lb-modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                Email Khách Hàng (*):
                <input
                  type="email"
                  required
                  placeholder="customer@gmail.com"
                  className="vocalyn-input-pill"
                  style={{ width: "100%", marginTop: "2px" }}
                  value={form.user}
                  onChange={(e) => setForm({ ...form, user: e.target.value })}
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                  Mã đơn hàng (*):
                  <input
                    type="text"
                    required
                    placeholder="ORD-9819"
                    className="vocalyn-input-pill"
                    style={{ width: "100%", marginTop: "2px" }}
                    value={form.orderId}
                    onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                  />
                </label>

                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                  Số tiền hoàn (VNĐ):
                  <input
                    type="number"
                    required
                    className="vocalyn-input-pill"
                    style={{ width: "100%", marginTop: "2px" }}
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </label>
              </div>

              <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                Lý do hoàn tiền:
                <input
                  type="text"
                  required
                  placeholder="Lý do hoàn..."
                  className="vocalyn-input-pill"
                  style={{ width: "100%", marginTop: "2px" }}
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </label>

              <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                Trạng thái:
                <select
                  className="vocalyn-input-pill"
                  style={{ width: "100%", marginTop: "2px" }}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="PENDING">PENDING (Chờ xử lý)</option>
                  <option value="APPROVED">APPROVED (Đã duyệt hoàn)</option>
                  <option value="REJECTED">REJECTED (Từ chối)</option>
                </select>
              </label>

              <div className="lb-modal-footer" style={{ marginTop: "10px" }}>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => { setShowCreateModal(false); setEditingRefund(null); }}>Hủy</button>
                <button type="submit" className="vocalyn-btn-pill vocalyn-btn-primary">
                  {editingRefund ? "💾 Lưu Thay Đổi" : "➕ Tạo Yêu Cầu"}
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
