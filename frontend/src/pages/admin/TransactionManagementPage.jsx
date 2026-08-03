import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function TransactionManagementPage() {
  const [txs, setTxs] = useState(() => {
    const saved = localStorage.getItem("lingoflow_txs");
    if (saved) return JSON.parse(saved);
    const initial = [
      { id: "TXN-8821", orderId: "ORD-9821", gateway: "VNPAY", amount: 699000, status: "SUCCESS", time: "2026-08-02 18:31" },
      { id: "TXN-8820", orderId: "ORD-9820", gateway: "MOMO", amount: 1290000, status: "SUCCESS", time: "2026-08-02 15:46" },
      { id: "TXN-8819", orderId: "ORD-9819", gateway: "BANK_TRANSFER", amount: 599000, status: "PENDING", time: "2026-08-02 12:12" },
    ];
    localStorage.setItem("lingoflow_txs", JSON.stringify(initial));
    return initial;
  });

  useEffect(() => {
    localStorage.setItem("lingoflow_txs", JSON.stringify(txs));
  }, [txs]);


  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [gatewayFilter, setGatewayFilter] = useState("ALL");
  const [selectedCheckboxes, setSelectedCheckboxes] = useState(new Set());

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [viewDetailTx, setViewDetailTx] = useState(null);

  const [form, setForm] = useState({
    orderId: "",
    gateway: "VNPAY",
    amount: 699000,
    status: "SUCCESS",
  });

  function handleCreate(e) {
    e.preventDefault();
    if (!form.orderId.trim()) return;

    const newTx = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: form.orderId.trim(),
      gateway: form.gateway,
      amount: Number(form.amount),
      status: form.status,
      time: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    setTxs([newTx, ...txs]);
    setShowCreateModal(false);
    resetForm();
  }

  function startEdit(t) {
    setEditingTx(t);
    setForm({
      orderId: t.orderId,
      gateway: t.gateway || "VNPAY",
      amount: t.amount,
      status: t.status || "SUCCESS",
    });
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    setTxs(
      txs.map((t) =>
        t.id === editingTx.id
          ? {
              ...t,
              orderId: form.orderId.trim(),
              gateway: form.gateway,
              amount: Number(form.amount),
              status: form.status,
            }
          : t
      )
    );
    setEditingTx(null);
    resetForm();
  }

  function handleDelete(id) {
    if (!window.confirm(`XÓA NHẬT KÝ GIAO DỊCH "${id}"?`)) return;
    setTxs(txs.filter((t) => t.id !== id));
  }

  // Checkbox Selection
  function toggleSelectAll() {
    if (selectedCheckboxes.size === filteredTxs.length && filteredTxs.length > 0) {
      setSelectedCheckboxes(new Set());
    } else {
      setSelectedCheckboxes(new Set(filteredTxs.map((t) => t.id)));
    }
  }

  function toggleSelectOne(id) {
    const next = new Set(selectedCheckboxes);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCheckboxes(next);
  }

  function handleBulkDelete() {
    if (!window.confirm(`XÓA HÀNG LOẠT ${selectedCheckboxes.size} giao dịch đã chọn?`)) return;
    setTxs(txs.filter((t) => !selectedCheckboxes.has(t.id)));
    setSelectedCheckboxes(new Set());
  }

  function resetForm() {
    setForm({
      orderId: "",
      gateway: "VNPAY",
      amount: 699000,
      status: "SUCCESS",
    });
  }

  const filteredTxs = txs.filter((t) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || t.id.toLowerCase().includes(q) || t.orderId.toLowerCase().includes(q) || t.gateway.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchGateway = gatewayFilter === "ALL" || t.gateway === gatewayFilter;
    return matchSearch && matchStatus && matchGateway;
  });

  return (
    <div className="vocalyn-dashboard-container">
      {/* Metrics Row */}
      <div className="vocalyn-metrics-grid">
        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Payment Gateways</span>
            <div className="metric-icon-circle">💳</div>
          </div>
          <div className="metric-val">VNPAY / MOMO</div>
          <div className="metric-change positive">
            <span>↑ Active Gateways</span>
          </div>
        </div>

        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Successful Transactions</span>
            <div className="metric-icon-circle">✅</div>
          </div>
          <div className="metric-val">{txs.filter((t) => t.status === "SUCCESS").length}</div>
          <div className="metric-change positive">
            <span>↑ Verified</span>
          </div>
        </div>

        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Filter Results</span>
            <div className="metric-icon-circle">🔍</div>
          </div>
          <div className="metric-val">{filteredTxs.length}</div>
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
              ☑️ Đã chọn <span style={{ color: "#2563eb", fontSize: "1rem" }}>{selectedCheckboxes.size}</span> giao dịch:
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
              placeholder="Search txn hash or order ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="toolbar-actions">
            <select
              className="vocalyn-btn-pill vocalyn-btn-secondary"
              value={gatewayFilter}
              onChange={(e) => setGatewayFilter(e.target.value)}
            >
              <option value="ALL">All Gateways</option>
              <option value="VNPAY">VNPAY</option>
              <option value="MOMO">MOMO</option>
              <option value="BANK_TRANSFER">BANK_TRANSFER</option>
            </select>

            <select
              className="vocalyn-btn-pill vocalyn-btn-secondary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
            </select>

            <button type="button" className="vocalyn-btn-pill vocalyn-btn-primary" onClick={() => { resetForm(); setShowCreateModal(true); }}>
              ➕ Tạo Giao Dịch Thủ Công
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
                    checked={selectedCheckboxes.size === filteredTxs.length && filteredTxs.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Txn Hash ⇅</th>
                <th>Order Ref ⇅</th>
                <th>Cổng Thanh Toán ⇅</th>
                <th>Số Tiền ⇅</th>
                <th>Trạng Thái ⇅</th>
                <th>Thời Gian ⇅</th>
                <th className="text-right">Thao Tác Admin ⇅</th>
              </tr>
            </thead>
            <tbody>
              {filteredTxs.map((t) => {
                const isChecked = selectedCheckboxes.has(t.id);
                return (
                  <tr key={t.id} className={isChecked ? "is-checked-row" : ""}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectOne(t.id)}
                      />
                    </td>
                    <td><span className="vocalyn-tag tag-type">{t.id}</span></td>
                    <td><span className="course-sub-text">{t.orderId}</span></td>
                    <td><span className="vocalyn-tag tag-level">{t.gateway}</span></td>
                    <td><strong>{t.amount ? `${t.amount.toLocaleString()}đ` : "0đ"}</strong></td>
                    <td>
                      <span className={`vocalyn-status-pill ${t.status === "SUCCESS" ? "status-healthy" : "status-submitted"}`}>
                        {t.status}
                      </span>
                    </td>
                    <td><small className="course-sub-text">{t.time}</small></td>
                    <td className="text-right">
                      <div className="vocalyn-action-buttons">
                        <button type="button" className="vocalyn-icon-btn" title="Xem chi tiết" onClick={() => setViewDetailTx(t)}>👁️</button>
                        <button type="button" className="vocalyn-icon-btn" title="Sửa giao dịch" onClick={() => startEdit(t)}>✏️</button>
                        <button type="button" className="vocalyn-icon-btn" title="Xóa giao dịch" onClick={() => handleDelete(t.id)}>🗑️</button>
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
      {viewDetailTx && createPortal(
        <div className="lb-overlay" onClick={() => setViewDetailTx(null)}>
          <div className="lb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div className="lb-modal-header">
              <h3>👁️ Chi Tiết Giao Dịch #{viewDetailTx.id}</h3>
              <button type="button" className="lb-modal-close" onClick={() => setViewDetailTx(null)}>x</button>
            </div>
            <div className="lb-modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
              <div><strong>Mã đơn hàng tham chiếu:</strong> {viewDetailTx.orderId}</div>
              <div><strong>Cổng thanh toán:</strong> {viewDetailTx.gateway}</div>
              <div><strong>Số tiền:</strong> {viewDetailTx.amount?.toLocaleString()}đ</div>
              <div><strong>Trạng thái:</strong> <span className="vocalyn-status-pill status-healthy">{viewDetailTx.status}</span></div>
              <div><strong>Thời gian giao dịch:</strong> {viewDetailTx.time}</div>

              <div className="lb-modal-footer" style={{ marginTop: "10px" }}>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-primary" onClick={() => { startEdit(viewDetailTx); setViewDetailTx(null); }}>✏️ Chỉnh Sửa Giao Dịch</button>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => setViewDetailTx(null)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Create / Edit Modal */}
      {(showCreateModal || editingTx) && createPortal(
        <div className="lb-overlay" onClick={() => { setShowCreateModal(false); setEditingTx(null); }}>
          <div className="lb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="lb-modal-header">
              <h3>{editingTx ? `✏️ Sửa Giao Dịch #${editingTx.id}` : "➕ Tạo Giao Dịch Mới"}</h3>
              <button type="button" className="lb-modal-close" onClick={() => { setShowCreateModal(false); setEditingTx(null); }}>x</button>
            </div>
            <form onSubmit={editingTx ? handleSaveEdit : handleCreate} className="lb-modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                Mã Đơn Hàng (*):
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: ORD-9821"
                  className="vocalyn-input-pill"
                  style={{ width: "100%", marginTop: "2px" }}
                  value={form.orderId}
                  onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                  Cổng Thanh Toán:
                  <select
                    className="vocalyn-input-pill"
                    style={{ width: "100%", marginTop: "2px" }}
                    value={form.gateway}
                    onChange={(e) => setForm({ ...form, gateway: e.target.value })}
                  >
                    <option value="VNPAY">VNPAY</option>
                    <option value="MOMO">MoMo Wallet</option>
                    <option value="BANK_TRANSFER">Chuyển Khoản Ngân Hàng</option>
                  </select>
                </label>

                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                  Số tiền (VNĐ):
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
                Trạng thái:
                <select
                  className="vocalyn-input-pill"
                  style={{ width: "100%", marginTop: "2px" }}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="SUCCESS">SUCCESS (Thành công)</option>
                  <option value="PENDING">PENDING (Đang xử lý)</option>
                  <option value="FAILED">FAILED (Thất bại)</option>
                </select>
              </label>

              <div className="lb-modal-footer" style={{ marginTop: "10px" }}>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => { setShowCreateModal(false); setEditingTx(null); }}>Hủy</button>
                <button type="submit" className="vocalyn-btn-pill vocalyn-btn-primary">
                  {editingTx ? "💾 Lưu Thay Đổi" : "➕ Tạo Giao Dịch"}
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
