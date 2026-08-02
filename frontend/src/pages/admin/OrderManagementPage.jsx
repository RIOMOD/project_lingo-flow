import { useState } from "react";
import { createPortal } from "react-dom";

export default function OrderManagementPage() {
  const [orders, setOrders] = useState([
    { id: "ORD-9821", user: "nguyen.van.a@gmail.com", course: "Speaking with Confidence", amount: 699000, status: "COMPLETED", date: "2026-08-02 18:30" },
    { id: "ORD-9820", user: "le.thi.b@gmail.com", course: "IELTS Writing Task 2 Intensive", amount: 1290000, status: "COMPLETED", date: "2026-08-02 15:45" },
    { id: "ORD-9819", user: "tran.van.c@gmail.com", course: "Practical Writing for Study and Work", amount: 599000, status: "PENDING", date: "2026-08-02 12:10" },
    { id: "ORD-9818", user: "pham.minh.d@gmail.com", course: "Vocabulary Through Word Patterns", amount: 499000, status: "CANCELLED", date: "2026-08-01 09:20" },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedCheckboxes, setSelectedCheckboxes] = useState(new Set());

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewDetailOrder, setViewDetailOrder] = useState(null);

  const [form, setForm] = useState({
    user: "",
    course: "",
    amount: 699000,
    status: "COMPLETED",
  });

  function handleCreate(e) {
    e.preventDefault();
    if (!form.user.trim() || !form.course.trim()) return;

    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      user: form.user.trim(),
      course: form.course.trim(),
      amount: Number(form.amount),
      status: form.status,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    setOrders([newOrder, ...orders]);
    setShowCreateModal(false);
    resetForm();
  }

  function startEdit(o) {
    setEditingOrder(o);
    setForm({
      user: o.user,
      course: o.course,
      amount: o.amount,
      status: o.status,
    });
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    setOrders(
      orders.map((o) =>
        o.id === editingOrder.id
          ? {
              ...o,
              user: form.user.trim(),
              course: form.course.trim(),
              amount: Number(form.amount),
              status: form.status,
            }
          : o
      )
    );
    setEditingOrder(null);
    resetForm();
  }

  function handleDelete(id) {
    if (!window.confirm(`XÓA ĐƠN HÀNG "${id}"?`)) return;
    setOrders(orders.filter((o) => o.id !== id));
  }

  // Checkbox Selection
  function toggleSelectAll() {
    if (selectedCheckboxes.size === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedCheckboxes(new Set());
    } else {
      setSelectedCheckboxes(new Set(filteredOrders.map((o) => o.id)));
    }
  }

  function toggleSelectOne(id) {
    const next = new Set(selectedCheckboxes);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCheckboxes(next);
  }

  function handleBulkDelete() {
    if (!window.confirm(`XÓA HÀNG LOẠT ${selectedCheckboxes.size} đơn hàng đã chọn?`)) return;
    setOrders(orders.filter((o) => !selectedCheckboxes.has(o.id)));
    setSelectedCheckboxes(new Set());
  }

  function resetForm() {
    setForm({
      user: "",
      course: "",
      amount: 699000,
      status: "COMPLETED",
    });
  }

  const filteredOrders = orders.filter((o) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || o.id.toLowerCase().includes(q) || o.user.toLowerCase().includes(q) || o.course.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="vocalyn-dashboard-container">
      {/* Metrics Row */}
      <div className="vocalyn-metrics-grid">
        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Total Orders</span>
            <div className="metric-icon-circle">📦</div>
          </div>
          <div className="metric-val">{orders.length}</div>
          <div className="metric-change positive">
            <span>↑ Platform Orders</span>
          </div>
        </div>

        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Completed Orders</span>
            <div className="metric-icon-circle">✅</div>
          </div>
          <div className="metric-val">{orders.filter((o) => o.status === "COMPLETED").length}</div>
          <div className="metric-change positive">
            <span>↑ Successful</span>
          </div>
        </div>

        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Filter Results</span>
            <div className="metric-icon-circle">🔍</div>
          </div>
          <div className="metric-val">{filteredOrders.length}</div>
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
              ☑️ Đã chọn <span style={{ color: "#2563eb", fontSize: "1rem" }}>{selectedCheckboxes.size}</span> đơn hàng:
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
              placeholder="Search order ID, email or course name..."
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
              <option value="COMPLETED">COMPLETED</option>
              <option value="PENDING">PENDING</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>

            <button type="button" className="vocalyn-btn-pill vocalyn-btn-primary" onClick={() => { resetForm(); setShowCreateModal(true); }}>
              ➕ Tạo Đơn Hàng Mới
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
                    checked={selectedCheckboxes.size === filteredOrders.length && filteredOrders.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Order ID ⇅</th>
                <th>User Email ⇅</th>
                <th>Khóa Học ⇅</th>
                <th>Giá Trị ⇅</th>
                <th>Trạng Thái ⇅</th>
                <th>Thời Gian ⇅</th>
                <th className="text-right">Thao Tác Admin ⇅</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => {
                const isChecked = selectedCheckboxes.has(o.id);
                return (
                  <tr key={o.id} className={isChecked ? "is-checked-row" : ""}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectOne(o.id)}
                      />
                    </td>
                    <td><span className="vocalyn-tag tag-type">{o.id}</span></td>
                    <td><strong className="course-name-text">{o.user}</strong></td>
                    <td><span className="course-sub-text">{o.course}</span></td>
                    <td><strong>{o.amount ? `${o.amount.toLocaleString()}đ` : "Free"}</strong></td>
                    <td>
                      <span className={`vocalyn-status-pill ${
                        o.status === "COMPLETED" ? "status-healthy" : o.status === "PENDING" ? "status-submitted" : "status-broken"
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td><small className="course-sub-text">{o.date}</small></td>
                    <td className="text-right">
                      <div className="vocalyn-action-buttons">
                        <button type="button" className="vocalyn-icon-btn" title="Xem chi tiết đơn" onClick={() => setViewDetailOrder(o)}>👁️</button>
                        <button type="button" className="vocalyn-icon-btn" title="Sửa đơn hàng" onClick={() => startEdit(o)}>✏️</button>
                        <button type="button" className="vocalyn-icon-btn" title="Xóa đơn hàng" onClick={() => handleDelete(o.id)}>🗑️</button>
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
      {viewDetailOrder && createPortal(
        <div className="lb-overlay" onClick={() => setViewDetailOrder(null)}>
          <div className="lb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div className="lb-modal-header">
              <h3>👁️ Chi Tiết Đơn Hàng #{viewDetailOrder.id}</h3>
              <button type="button" className="lb-modal-close" onClick={() => setViewDetailOrder(null)}>x</button>
            </div>
            <div className="lb-modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
              <div><strong>Khách hàng:</strong> {viewDetailOrder.user}</div>
              <div><strong>Khóa học đăng ký:</strong> {viewDetailOrder.course}</div>
              <div><strong>Số tiền thanh toán:</strong> {viewDetailOrder.amount?.toLocaleString()}đ</div>
              <div><strong>Trạng thái đơn:</strong> <span className="vocalyn-status-pill status-healthy">{viewDetailOrder.status}</span></div>
              <div><strong>Thời gian tạo đơn:</strong> {viewDetailOrder.date}</div>

              <div className="lb-modal-footer" style={{ marginTop: "10px" }}>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-primary" onClick={() => { startEdit(viewDetailOrder); setViewDetailOrder(null); }}>✏️ Chỉnh Sửa Đơn</button>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => setViewDetailOrder(null)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Create / Edit Modal */}
      {(showCreateModal || editingOrder) && createPortal(
        <div className="lb-overlay" onClick={() => { setShowCreateModal(false); setEditingOrder(null); }}>
          <div className="lb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="lb-modal-header">
              <h3>{editingOrder ? `✏️ Chỉnh Sửa Đơn Hàng #${editingOrder.id}` : "➕ Tạo Đơn Hàng Mới"}</h3>
              <button type="button" className="lb-modal-close" onClick={() => { setShowCreateModal(false); setEditingOrder(null); }}>x</button>
            </div>
            <form onSubmit={editingOrder ? handleSaveEdit : handleCreate} className="lb-modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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

              <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                Tên Khóa Học (*):
                <input
                  type="text"
                  required
                  placeholder="Tên khóa học..."
                  className="vocalyn-input-pill"
                  style={{ width: "100%", marginTop: "2px" }}
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                  Số tiền thanh toán (VNĐ):
                  <input
                    type="number"
                    required
                    className="vocalyn-input-pill"
                    style={{ width: "100%", marginTop: "2px" }}
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </label>

                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                  Trạng thái đơn:
                  <select
                    className="vocalyn-input-pill"
                    style={{ width: "100%", marginTop: "2px" }}
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="COMPLETED">COMPLETED (Hoàn tất)</option>
                    <option value="PENDING">PENDING (Chờ xử lý)</option>
                    <option value="CANCELLED">CANCELLED (Đã hủy)</option>
                    <option value="REFUNDED">REFUNDED (Đã hoàn tiền)</option>
                  </select>
                </label>
              </div>

              <div className="lb-modal-footer" style={{ marginTop: "10px" }}>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => { setShowCreateModal(false); setEditingOrder(null); }}>Hủy</button>
                <button type="submit" className="vocalyn-btn-pill vocalyn-btn-primary">
                  {editingOrder ? "💾 Lưu Thay Đổi" : "➕ Tạo Đơn Hàng"}
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
