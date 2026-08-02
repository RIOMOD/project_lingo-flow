import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { approveCourse, getAdminCourses, rejectCourse } from "../../services/courseService";
import { useToast } from "../../context/ToastContext";

export default function CourseApprovalPage() {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  // View detail
  const [viewCourse, setViewCourse] = useState(null);

  useEffect(() => { loadSubmittedCourses(); }, []);

  async function loadSubmittedCourses() {
    setLoading(true);
    try {
      const data = await getAdminCourses({ status: "SUBMITTED", size: 50 });
      setCourses(data?.items || []);
    } catch (err) {
      toast.error("Lỗi nạp khóa học chờ duyệt: " + err.message);
    } finally { setLoading(false); }
  }

  async function handleApprove(id, title) {
    if (!window.confirm(`PHÊ DUYỆT khóa học "${title}"?\nKhóa học sẽ chuyển sang trạng thái APPROVED.`)) return;
    try {
      await approveCourse(id);
      toast.success(`✅ Đã phê duyệt "${title}" thành công!`);
      loadSubmittedCourses();
    } catch (err) { toast.error("Lỗi phê duyệt: " + err.message); }
  }

  function openRejectModal(course) {
    setRejectTarget(course);
    setRejectReason("");
  }

  async function handleReject(e) {
    e.preventDefault();
    if (!rejectReason.trim() || rejectReason.length < 10) {
      alert("Vui lòng nhập lý do từ chối (ít nhất 10 ký tự).");
      return;
    }
    setRejecting(true);
    try {
      await rejectCourse(rejectTarget.id, rejectReason.trim());
      toast.success(`❌ Đã từ chối "${rejectTarget.title}"`);
      setRejectTarget(null);
      loadSubmittedCourses();
    } catch (err) { toast.error("Lỗi từ chối: " + err.message); }
    finally { setRejecting(false); }
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
            <span className="metric-title">Chờ Phê Duyệt</span>
            <div className="metric-icon-circle" style={{ background: "#fef9c3" }}>⏳</div>
          </div>
          <div className="metric-val" style={{ color: courses.length > 0 ? "#d97706" : "#16a34a" }}>{courses.length}</div>
          <div className="metric-change positive">
            <span>{courses.length > 0 ? "↓ Cần xét duyệt" : "↑ All clear"}</span>
          </div>
        </div>
        <div className="vocalyn-card metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Đang Hiển Thị</span>
            <div className="metric-icon-circle">🔍</div>
          </div>
          <div className="metric-val">{filtered.length}</div>
          <div className="metric-change positive"><span>↑ Sau bộ lọc</span></div>
        </div>
      </div>

      <div className="vocalyn-card main-table-card">
        <div className="vocalyn-table-toolbar">
          <div className="toolbar-search-box">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Tìm theo tên khóa học hoặc giảng viên..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="toolbar-actions">
            <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={loadSubmittedCourses}>🔄 Refresh</button>
          </div>
        </div>

        <div className="vocalyn-table-wrapper">
          <table className="vocalyn-data-table">
            <thead>
              <tr>
                <th>Tên Khóa Học ⇅</th>
                <th>Giảng Viên ⇅</th>
                <th>Cấp Độ ⇅</th>
                <th>Loại KH ⇅</th>
                <th>Giá ⇅</th>
                <th>Trạng Thái ⇅</th>
                <th className="text-right">Thao Tác Admin ⇅</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center p-4">Đang tải danh sách chờ duyệt...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="text-center p-4">Không có khóa học nào đang chờ duyệt.</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong className="course-name-text">{c.title}</strong>
                      <div className="course-sub-text">{c.shortDescription?.slice(0, 60)}{c.shortDescription?.length > 60 ? "..." : ""}</div>
                    </td>
                    <td><span className="course-sub-text" style={{ fontWeight: 600 }}>{c.teacherName || "Teacher"}</span></td>
                    <td><span className="vocalyn-tag tag-level">{c.level}</span></td>
                    <td><span className="vocalyn-tag tag-type">{c.courseType || "FREE"}</span></td>
                    <td>
                      <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                        {c.originalPrice ? `${Number(c.originalPrice).toLocaleString()}đ` : "Miễn phí"}
                      </span>
                    </td>
                    <td><span className="vocalyn-status-pill status-submitted">SUBMITTED</span></td>
                    <td className="text-right">
                      <div className="vocalyn-action-buttons">
                        <button type="button" className="vocalyn-icon-btn" title="Xem chi tiết" onClick={() => setViewCourse(c)}>👁️</button>
                        <a href={`/admin/course-review/${c.id}`} className="vocalyn-icon-btn" title="Mở trang xét duyệt chi tiết">📋</a>
                        <button type="button" className="vocalyn-btn-pill vocalyn-btn-primary" style={{ padding: "2px 8px", fontSize: "0.73rem" }} onClick={() => handleApprove(c.id, c.title)}>
                          ✅ Duyệt
                        </button>
                        <button type="button" className="vocalyn-btn-pill vocalyn-btn-danger" style={{ padding: "2px 8px", fontSize: "0.73rem" }} onClick={() => openRejectModal(c)}>
                          ❌ Từ chối
                        </button>
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
      {viewCourse && createPortal(
        <div className="lb-overlay" onClick={() => setViewCourse(null)}>
          <div className="lb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "540px" }}>
            <div className="lb-modal-header">
              <h3>📋 Chi Tiết Khóa Học Chờ Duyệt</h3>
              <button type="button" className="lb-modal-close" onClick={() => setViewCourse(null)}>x</button>
            </div>
            <div className="lb-modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
              {viewCourse.thumbnailUrl && (
                <img src={viewCourse.thumbnailUrl} alt="thumbnail" style={{ width: "100%", maxHeight: "160px", objectFit: "cover", borderRadius: "8px" }} />
              )}
              <h4 style={{ margin: 0 }}>{viewCourse.title}</h4>
              <p style={{ margin: 0, color: "#64748b" }}>{viewCourse.shortDescription}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div><strong>Giảng viên:</strong> {viewCourse.teacherName || "N/A"}</div>
                <div><strong>Cấp độ:</strong> <span className="vocalyn-tag tag-level">{viewCourse.level}</span></div>
                <div><strong>Loại KH:</strong> <span className="vocalyn-tag tag-type">{viewCourse.courseType}</span></div>
                <div><strong>Giá gốc:</strong> {viewCourse.originalPrice ? `${Number(viewCourse.originalPrice).toLocaleString()}đ` : "Miễn phí"}</div>
              </div>
              <div className="lb-modal-footer" style={{ marginTop: "10px" }}>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-primary" onClick={() => { handleApprove(viewCourse.id, viewCourse.title); setViewCourse(null); }}>✅ Duyệt ngay</button>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-danger" onClick={() => { openRejectModal(viewCourse); setViewCourse(null); }}>❌ Từ chối</button>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => setViewCourse(null)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Reject Modal */}
      {rejectTarget && createPortal(
        <div className="lb-overlay" onClick={() => !rejecting && setRejectTarget(null)}>
          <div className="lb-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div className="lb-modal-header">
              <h3>❌ Từ Chối Khóa Học</h3>
              <button type="button" className="lb-modal-close" onClick={() => setRejectTarget(null)}>x</button>
            </div>
            <form onSubmit={handleReject} className="lb-modal-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ background: "#fef2f2", padding: "10px", borderRadius: "8px", fontSize: "0.85rem" }}>
                <strong>Khóa học:</strong> "{rejectTarget.title}"<br />
                <strong>Giảng viên:</strong> {rejectTarget.teacherName || "N/A"}
              </div>
              <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                Lý do từ chối (bắt buộc, min 10 ký tự):
                <textarea
                  required rows={4} placeholder="Ví dụ: Nội dung bài giảng chưa đầy đủ, video bị lỗi, thiếu mô tả chi tiết..."
                  className="vocalyn-input-pill" style={{ width: "100%", marginTop: "4px", resize: "vertical" }}
                  value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                />
                <div style={{ fontSize: "0.73rem", color: rejectReason.length >= 10 ? "#16a34a" : "#dc2626", marginTop: "2px" }}>
                  {rejectReason.length}/500 ký tự {rejectReason.length < 10 ? `(cần thêm ${10 - rejectReason.length} ký tự)` : "✅"}
                </div>
              </label>
              <div className="lb-modal-footer" style={{ marginTop: "10px" }}>
                <button type="button" className="vocalyn-btn-pill vocalyn-btn-secondary" onClick={() => setRejectTarget(null)}>Hủy</button>
                <button type="submit" className="vocalyn-btn-pill vocalyn-btn-danger" disabled={rejecting}>{rejecting ? "Đang từ chối..." : "❌ Xác nhận từ chối"}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
