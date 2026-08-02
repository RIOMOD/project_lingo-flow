import { useEffect, useState } from "react";
import { getAdminCourses, publishCourse, rejectCourse } from "../../services/courseService";
import { useToast } from "../../context/ToastContext";

export default function CoursePublishPage() {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Sale price modal
  const [salePriceTarget, setSalePriceTarget] = useState(null);
  const [saleForm, setSaleForm] = useState({ salePrice: "", saleStart: "", saleEnd: "" });
  const [savingPrice, setSavingPrice] = useState(false);

  // Unpublish (reject back) target
  const [unpublishTarget, setUnpublishTarget] = useState(null);
  const [unpublishReason, setUnpublishReason] = useState("");

  // View detail
  const [viewCourse, setViewCourse] = useState(null);

  useEffect(() => { loadApprovedCourses(); }, []);

  async function loadApprovedCourses() {
    setLoading(true);
    try {
      const data = await getAdminCourses({ status: "APPROVED", size: 50 });
      setCourses(data?.items || []);
    } catch (err) { toast.error("Lỗi nạp khóa học đã duyệt: " + err.message); }
    finally { setLoading(false); }
  }

  async function handlePublish(id, title) {
    if (!window.confirm(`XUẤT BẢN khóa học "${title}" lên Store?\nHọc viên sẽ thấy ngay khóa học này.`)) return;
    try {
      await publishCourse(id);
      toast.success(`🚀 Đã xuất bản "${title}" lên trang học viên!`);
      loadApprovedCourses();
    } catch (err) { toast.error("Lỗi xuất bản: " + err.message); }
  }

  async function handleUnpublish(e) {
    e.preventDefault();
    if (!unpublishReason.trim() || unpublishReason.length < 10) {
      alert("Vui lòng nhập lý do thu hồi (ít nhất 10 ký tự).");
      return;
    }
    try {
      await rejectCourse(unpublishTarget.id, unpublishReason.trim());
      toast.success(`Đã thu hồi phê duyệt khóa học "${unpublishTarget.title}"`);
      setUnpublishTarget(null);
      loadApprovedCourses();
    } catch (err) { toast.error("Lỗi: " + err.message); }
  }

  function openSalePrice(course) {
    setSalePriceTarget(course);
    setSaleForm({
      salePrice: course.salePrice || "",
      saleStart: course.saleStartDate || "",
      saleEnd: course.saleEndDate || "",
    });
  }

  async function handleSaveSalePrice(e) {
    e.preventDefault();
    setSavingPrice(true);
    // Note: requires backend endpoint for updating sale price
    // For now, we update locally and show toast
    try {
      setCourses(courses.map((c) =>
        c.id === salePriceTarget.id
          ? { ...c, salePrice: Number(saleForm.salePrice), saleStartDate: saleForm.saleStart, saleEndDate: saleForm.saleEnd }
          : c
      ));
      toast.success(`Đã cập nhật giá sale cho "${salePriceTarget.title}"`);
      setSalePriceTarget(null);
    } catch (err) { toast.error("Lỗi: " + err.message); }
    finally { setSavingPrice(false); }
  }

  const filtered = courses.filter((c) =>
    !search || (c.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.teacherName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="vocalyn-dashboard-container">
      <div className="vocalyn-metrics-grid">
        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Chờ Xuất Bản</span>
            <div className="metric-icon-circle" style={{ background: "#dbeafe" }}>🚀</div>
          </div>
          <div className="metric-val">{courses.length}</div>
          <div className="metric-change positive"><span>↑ Store Ready</span></div>
        </div>
        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Sau Bộ Lọc</span>
            <div className="metric-icon-circle">🔍</div>
          </div>
          <div className="metric-val">{filtered.length}</div>
          <div className="metric-change positive"><span>↑ Đang hiển thị</span></div>
        </div>
      </div>

      <div className="vocalyn-card main-table-card">
        <div className="vocalyn-table-toolbar">
          <div className="toolbar-search-box">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Tìm khóa học hoặc giảng viên..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="toolbar-actions">
            <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={loadApprovedCourses}>🔄 Refresh</button>
          </div>
        </div>

        <div className="vocalyn-table-wrapper">
          <table className="vocalyn-data-table">
            <thead>
              <tr>
                <th>Khóa Học ⇅</th>
                <th>Giảng Viên ⇅</th>
                <th>Cấp Độ ⇅</th>
                <th>Giá Gốc ⇅</th>
                <th>Giá Sale ⇅</th>
                <th>Trạng Thái ⇅</th>
                <th className="text-right">Thao Tác Admin ⇅</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center p-4">Đang tải khóa học...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="text-center p-4">Không có khóa học nào chờ xuất bản.</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong className="course-name-text">{c.title}</strong>
                      <div className="course-sub-text">{c.shortDescription?.slice(0, 55)}...</div>
                    </td>
                    <td><span className="course-sub-text">{c.teacherName || "Teacher"}</span></td>
                    <td><span className="vocalyn-tag tag-level">{c.level}</span></td>
                    <td><strong style={{ fontSize: "0.82rem" }}>{c.originalPrice ? `${Number(c.originalPrice).toLocaleString()}đ` : "Free"}</strong></td>
                    <td>
                      {c.salePrice ? (
                        <span style={{ color: "#dc2626", fontWeight: 700, fontSize: "0.82rem" }}>{Number(c.salePrice).toLocaleString()}đ</span>
                      ) : (
                        <span className="course-sub-text">Chưa đặt</span>
                      )}
                    </td>
                    <td><span className="vocalyn-status-pill status-approved">APPROVED</span></td>
                    <td className="text-right">
                      <div className="vocalyn-action-buttons">
                        <button type="button" className="vocalyn-icon-btn" title="Xem chi tiết" onClick={() => setViewCourse(c)}>👁️</button>
                        <a href={`/admin/course-review/${c.id}`} className="vocalyn-icon-btn" title="Mở trang xét duyệt">📋</a>
                        <button type="button" className="vocalyn-icon-btn" title="Cài đặt giá sale" onClick={() => openSalePrice(c)}>💰</button>
                        <button type="button" className="vocalyn-btn-pill vocalyn-btn-primary" style={{ padding: "2px 8px", fontSize: "0.73rem" }} onClick={() => handlePublish(c.id, c.title)}>
                          🚀 Xuất bản
                        </button>
                        <button type="button" className="vocalyn-icon-btn" title="Thu hồi phê duyệt" onClick={() => { setUnpublishTarget(c); setUnpublishReason(""); }}>↩️</button>
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
      {viewCourse && (
        <div className="lb-overlay" onClick={() => setViewCourse(null)}>
          <div className="lb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
            <div className="lb-modal-header">
              <h3>📋 Chi Tiết Khóa Học Đã Duyệt</h3>
              <button type="button" className="lb-modal-close" onClick={() => setViewCourse(null)}>x</button>
            </div>
            <div className="lb-modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
              {viewCourse.thumbnailUrl && <img src={viewCourse.thumbnailUrl} alt="thumbnail" style={{ width: "100%", maxHeight: "150px", objectFit: "cover", borderRadius: "8px" }} />}
              <h4 style={{ margin: 0 }}>{viewCourse.title}</h4>
              <p style={{ margin: 0, color: "#64748b" }}>{viewCourse.shortDescription}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div><strong>Giảng viên:</strong> {viewCourse.teacherName}</div>
                <div><strong>Cấp độ:</strong> <span className="vocalyn-tag tag-level">{viewCourse.level}</span></div>
                <div><strong>Giá gốc:</strong> {viewCourse.originalPrice ? `${Number(viewCourse.originalPrice).toLocaleString()}đ` : "Miễn phí"}</div>
                <div><strong>Giá sale:</strong> {viewCourse.salePrice ? `${Number(viewCourse.salePrice).toLocaleString()}đ` : "Chưa đặt"}</div>
              </div>
              <div className="lb-modal-footer" style={{ marginTop: "10px" }}>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-primary" onClick={() => { handlePublish(viewCourse.id, viewCourse.title); setViewCourse(null); }}>🚀 Xuất bản ngay</button>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => setViewCourse(null)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sale Price Modal */}
      {salePriceTarget && (
        <div className="lb-overlay" onClick={() => setSalePriceTarget(null)}>
          <div className="lb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px" }}>
            <div className="lb-modal-header">
              <h3>💰 Cài Đặt Giá Sale</h3>
              <button type="button" className="lb-modal-close" onClick={() => setSalePriceTarget(null)}>x</button>
            </div>
            <form onSubmit={handleSaveSalePrice} className="lb-modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", fontSize: "0.85rem" }}>
                <strong>{salePriceTarget.title}</strong><br />
                Giá gốc: <strong>{salePriceTarget.originalPrice ? `${Number(salePriceTarget.originalPrice).toLocaleString()}đ` : "Miễn phí"}</strong>
              </div>
              <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Giá Sale (VNĐ):
                <input type="number" required placeholder="Ví dụ: 499000" className="vocalyn-input-pill"
                  style={{ width: "100%", marginTop: "2px" }} value={saleForm.salePrice}
                  onChange={(e) => setSaleForm({ ...saleForm, salePrice: e.target.value })} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Bắt đầu:
                  <input type="datetime-local" className="vocalyn-input-pill" style={{ width: "100%", marginTop: "2px" }}
                    value={saleForm.saleStart} onChange={(e) => setSaleForm({ ...saleForm, saleStart: e.target.value })} />
                </label>
                <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Kết thúc:
                  <input type="datetime-local" className="vocalyn-input-pill" style={{ width: "100%", marginTop: "2px" }}
                    value={saleForm.saleEnd} onChange={(e) => setSaleForm({ ...saleForm, saleEnd: e.target.value })} />
                </label>
              </div>
              {saleForm.salePrice && salePriceTarget.originalPrice && (
                <div style={{ background: "#dcfce7", padding: "8px 12px", borderRadius: "8px", fontSize: "0.82rem", color: "#166534" }}>
                  🎉 Giảm: {Math.round((1 - saleForm.salePrice / salePriceTarget.originalPrice) * 100)}% so với giá gốc
                </div>
              )}
              <div className="lb-modal-footer" style={{ marginTop: "10px" }}>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => setSalePriceTarget(null)}>Hủy</button>
                <button type="submit" className="vocalyn-btn-pill vocalyn-btn-primary" disabled={savingPrice}>{savingPrice ? "Đang lưu..." : "💰 Lưu Giá Sale"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unpublish / Revoke Modal */}
      {unpublishTarget && (
        <div className="lb-overlay" onClick={() => setUnpublishTarget(null)}>
          <div className="lb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px" }}>
            <div className="lb-modal-header">
              <h3>↩️ Thu Hồi Phê Duyệt Khóa Học</h3>
              <button type="button" className="lb-modal-close" onClick={() => setUnpublishTarget(null)}>x</button>
            </div>
            <form onSubmit={handleUnpublish} className="lb-modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ background: "#fef2f2", padding: "10px", borderRadius: "8px", fontSize: "0.85rem" }}>
                <strong>Khóa học:</strong> "{unpublishTarget.title}"
              </div>
              <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Lý do thu hồi (ít nhất 10 ký tự):
                <textarea required rows={4} placeholder="Lý do thu hồi phê duyệt..."
                  className="vocalyn-input-pill" style={{ width: "100%", marginTop: "4px", resize: "vertical" }}
                  value={unpublishReason} onChange={(e) => setUnpublishReason(e.target.value)} />
              </label>
              <div className="lb-modal-footer" style={{ marginTop: "10px" }}>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => setUnpublishTarget(null)}>Hủy</button>
                <button type="submit" className="vocalyn-btn-pill vocalyn-btn-danger">↩️ Xác Nhận Thu Hồi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
