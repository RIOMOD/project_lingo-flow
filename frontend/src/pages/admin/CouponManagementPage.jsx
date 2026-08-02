import { useState } from "react";
import { createPortal } from "react-dom";

export default function CouponManagementPage() {
  const [coupons, setCoupons] = useState([
    { id: 1, code: "LINGO2026", discount: "20%", discountType: "PERCENT", value: 20, usage: 142, maxUsage: 500, status: "ACTIVE", exp: "2026-12-31" },
    { id: 2, code: "HELLOSUMMER", discount: "50,000đ", discountType: "FIXED", value: 50000, usage: 50, maxUsage: 50, status: "EXPIRED", exp: "2026-07-01" },
    { id: 3, code: "VIPNEWUSER", discount: "30%", discountType: "PERCENT", value: 30, usage: 12, maxUsage: 100, status: "ACTIVE", exp: "2026-10-15" },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedCheckboxes, setSelectedCheckboxes] = useState(new Set());

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [viewDetailCoupon, setViewDetailCoupon] = useState(null);

  const [form, setForm] = useState({
    code: "",
    discountType: "PERCENT",
    value: 10,
    maxUsage: 100,
    status: "ACTIVE",
    exp: "2026-12-31",
  });

  // Handlers
  function handleCreate(e) {
    e.preventDefault();
    if (!form.code.trim()) return;

    const discountText = form.discountType === "PERCENT" ? `${form.value}%` : `${Number(form.value).toLocaleString()}đ`;
    const newCoupon = {
      id: Date.now(),
      code: form.code.trim().toUpperCase(),
      discount: discountText,
      discountType: form.discountType,
      value: Number(form.value),
      usage: 0,
      maxUsage: Number(form.maxUsage),
      status: form.status,
      exp: form.exp,
    };

    setCoupons([newCoupon, ...coupons]);
    setShowCreateModal(false);
    resetForm();
  }

  function startEdit(c) {
    setEditingCoupon(c);
    setForm({
      code: c.code,
      discountType: c.discountType || "PERCENT",
      value: c.value || 10,
      maxUsage: c.maxUsage || 100,
      status: c.status || "ACTIVE",
      exp: c.exp || "2026-12-31",
    });
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    const discountText = form.discountType === "PERCENT" ? `${form.value}%` : `${Number(form.value).toLocaleString()}đ`;

    setCoupons(
      coupons.map((c) =>
        c.id === editingCoupon.id
          ? {
              ...c,
              code: form.code.trim().toUpperCase(),
              discount: discountText,
              discountType: form.discountType,
              value: Number(form.value),
              maxUsage: Number(form.maxUsage),
              status: form.status,
              exp: form.exp,
            }
          : c
      )
    );
    setEditingCoupon(null);
    resetForm();
  }

  function handleDelete(id, code) {
    if (!window.confirm(`XÓA MÃ GIẢM GIÁ "${code}"?`)) return;
    setCoupons(coupons.filter((c) => c.id !== id));
  }

  // Checkbox Selection
  function toggleSelectAll() {
    if (selectedCheckboxes.size === filteredCoupons.length && filteredCoupons.length > 0) {
      setSelectedCheckboxes(new Set());
    } else {
      setSelectedCheckboxes(new Set(filteredCoupons.map((c) => c.id)));
    }
  }

  function toggleSelectOne(id) {
    const next = new Set(selectedCheckboxes);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCheckboxes(next);
  }

  function handleBulkDelete() {
    if (!window.confirm(`XÓA HÀNG LOẠT ${selectedCheckboxes.size} mã giảm giá đã chọn?`)) return;
    setCoupons(coupons.filter((c) => !selectedCheckboxes.has(c.id)));
    setSelectedCheckboxes(new Set());
  }

  function resetForm() {
    setForm({
      code: "",
      discountType: "PERCENT",
      value: 10,
      maxUsage: 100,
      status: "ACTIVE",
      exp: "2026-12-31",
    });
  }

  const filteredCoupons = coupons.filter((c) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || c.code.toLowerCase().includes(q) || c.discount.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="vocalyn-dashboard-container">
      {/* Metrics Row */}
      <div className="vocalyn-metrics-grid">
        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Active Coupons</span>
            <div className="metric-icon-circle">🏷️</div>
          </div>
          <div className="metric-val">{coupons.filter((c) => c.status === "ACTIVE").length}</div>
          <div className="metric-change positive">
            <span>↑ Marketing Live</span>
          </div>
        </div>

        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Total Coupons</span>
            <div className="metric-icon-circle">📜</div>
          </div>
          <div className="metric-val">{coupons.length}</div>
          <div className="metric-change positive">
            <span>↑ Total Managed</span>
          </div>
        </div>

        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Filter Results</span>
            <div className="metric-icon-circle">🔍</div>
          </div>
          <div className="metric-val">{filteredCoupons.length}</div>
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
              ☑️ Đã chọn <span style={{ color: "#2563eb", fontSize: "1rem" }}>{selectedCheckboxes.size}</span> mã giảm giá:
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
              placeholder="Search coupon code or discount..."
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
              <option value="ACTIVE">ACTIVE</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>

            <button type="button" className="vocalyn-btn-pill vocalyn-btn-primary" onClick={() => { resetForm(); setShowCreateModal(true); }}>
              ➕ Tạo Mã Mới
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
                    checked={selectedCheckboxes.size === filteredCoupons.length && filteredCoupons.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Coupon Code ⇅</th>
                <th>Mức Giảm ⇅</th>
                <th>Lượt Đã Dùng / Tối Đa ⇅</th>
                <th>Trạng Thái ⇅</th>
                <th>Hạn Sử Dụng ⇅</th>
                <th className="text-right">Thao Tác Admin ⇅</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((c) => {
                const isChecked = selectedCheckboxes.has(c.id);
                return (
                  <tr key={c.id} className={isChecked ? "is-checked-row" : ""}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectOne(c.id)}
                      />
                    </td>
                    <td><strong className="course-name-text" style={{ color: "#2563eb" }}>{c.code}</strong></td>
                    <td><span className="vocalyn-tag tag-type">{c.discount}</span></td>
                    <td><span className="course-sub-text">{c.usage} / {c.maxUsage} lượt</span></td>
                    <td>
                      <span className={`vocalyn-status-pill ${c.status === "ACTIVE" ? "status-healthy" : "status-submitted"}`}>
                        {c.status}
                      </span>
                    </td>
                    <td><small className="course-sub-text">{c.exp}</small></td>
                    <td className="text-right">
                      <div className="vocalyn-action-buttons">
                        <button type="button" className="vocalyn-icon-btn" title="Xem chi tiết" onClick={() => setViewDetailCoupon(c)}>👁️</button>
                        <button type="button" className="vocalyn-icon-btn" title="Chỉnh sửa mã" onClick={() => startEdit(c)}>✏️</button>
                        <button type="button" className="vocalyn-icon-btn" title="Xóa mã" onClick={() => handleDelete(c.id, c.code)}>🗑️</button>
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
      {viewDetailCoupon && createPortal(
        <div className="lb-overlay" onClick={() => setViewDetailCoupon(null)}>
          <div className="lb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div className="lb-modal-header">
              <h3>👁️ Chi Tiết Mã Giảm Giá #{viewDetailCoupon.code}</h3>
              <button type="button" className="lb-modal-close" onClick={() => setViewDetailCoupon(null)}>x</button>
            </div>
            <div className="lb-modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
              <div><strong>Mã Khuyến Mãi:</strong> <span className="vocalyn-tag tag-type">{viewDetailCoupon.code}</span></div>
              <div><strong>Mức Giảm Giá:</strong> {viewDetailCoupon.discount} ({viewDetailCoupon.discountType === "PERCENT" ? "Phần trăm" : "Cố định"})</div>
              <div><strong>Đã sử dụng:</strong> {viewDetailCoupon.usage} / {viewDetailCoupon.maxUsage} lượt</div>
              <div><strong>Trạng Thái:</strong> <span className="vocalyn-status-pill status-healthy">{viewDetailCoupon.status}</span></div>
              <div><strong>Hạn Sử Dụng:</strong> {viewDetailCoupon.exp}</div>

              <div className="lb-modal-footer" style={{ marginTop: "10px" }}>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-primary" onClick={() => { startEdit(viewDetailCoupon); setViewDetailCoupon(null); }}>✏️ Chỉnh Sửa</button>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => setViewDetailCoupon(null)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Create / Edit Modal */}
      {(showCreateModal || editingCoupon) && createPortal(
        <div className="lb-overlay" onClick={() => { setShowCreateModal(false); setEditingCoupon(null); }}>
          <div className="lb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="lb-modal-header">
              <h3>{editingCoupon ? `✏️ Chỉnh Sửa Mã ${editingCoupon.code}` : "➕ Tạo Mã Giảm Giá Mới"}</h3>
              <button type="button" className="lb-modal-close" onClick={() => { setShowCreateModal(false); setEditingCoupon(null); }}>x</button>
            </div>
            <form onSubmit={editingCoupon ? handleSaveEdit : handleCreate} className="lb-modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                Mã Khuyến Mãi (CODE):
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: SUMMER2026"
                  className="vocalyn-input-pill"
                  style={{ width: "100%", marginTop: "2px", textTransform: "uppercase" }}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                  Loại Giảm Giá:
                  <select
                    className="vocalyn-input-pill"
                    style={{ width: "100%", marginTop: "2px" }}
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                  >
                    <option value="PERCENT">Theo phần trăm (%)</option>
                    <option value="FIXED">Số tiền cố định (VNĐ)</option>
                  </select>
                </label>

                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                  Giá trị giảm:
                  <input
                    type="number"
                    required
                    className="vocalyn-input-pill"
                    style={{ width: "100%", marginTop: "2px" }}
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                  Giới hạn số lượt dùng:
                  <input
                    type="number"
                    required
                    className="vocalyn-input-pill"
                    style={{ width: "100%", marginTop: "2px" }}
                    value={form.maxUsage}
                    onChange={(e) => setForm({ ...form, maxUsage: e.target.value })}
                  />
                </label>

                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                  Hạn sử dụng:
                  <input
                    type="date"
                    required
                    className="vocalyn-input-pill"
                    style={{ width: "100%", marginTop: "2px" }}
                    value={form.exp}
                    onChange={(e) => setForm({ ...form, exp: e.target.value })}
                  />
                </label>
              </div>

              <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                Trạng thái mã:
                <select
                  className="vocalyn-input-pill"
                  style={{ width: "100%", marginTop: "2px" }}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE (Hoạt động)</option>
                  <option value="EXPIRED">EXPIRED (Hết hạn)</option>
                </select>
              </label>

              <div className="lb-modal-footer" style={{ marginTop: "10px" }}>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => { setShowCreateModal(false); setEditingCoupon(null); }}>Hủy</button>
                <button type="submit" className="vocalyn-btn-pill vocalyn-btn-primary">
                  {editingCoupon ? "💾 Lưu Mã" : "➕ Thêm Mã"}
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
