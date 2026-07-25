import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  approveCourse,
  archiveCourse,
  getAdminCourses,
  hideCourse,
  publishCourse,
  rejectCourse,
} from "../../services/courseService";
import { courseStatusLabel, courseTypeLabel, formatMoney, levelLabel } from "../../utils/courseWorkflow";

const STATUS_TABS = [
  { key: "ALL", label: "Tất cả" },
  { key: "SUBMITTED", label: "Chờ duyệt" },
  { key: "APPROVED", label: "Đã duyệt" },
  { key: "PUBLISHED", label: "Đã xuất bản" },
  { key: "REJECTED", label: "Bị từ chối" },
  { key: "HIDDEN", label: "Đã ẩn" },
  { key: "ARCHIVED", label: "Đã lưu trữ" },
];

const MOVED_TAB_LABEL = {
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
  PUBLISHED: "Đã xuất bản",
  HIDDEN: "Đã ẩn",
  ARCHIVED: "Đã lưu trữ",
};

function buildParams(status) {
  return status === "ALL" ? { size: 50 } : { status, size: 50 };
}

function publicCourseUrl(course) {
  return course.slug ? `/courses/${course.slug}` : `/courses`;
}

export default function CourseApprovalPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [rejectCourseItem, setRejectCourseItem] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  async function load(status = activeTab) {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminCourses(buildParams(status));
      setCourses(data?.items ?? []);
    } catch (err) {
      setError(err.message || "Không tải được danh sách khóa học.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getAdminCourses(buildParams(activeTab))
      .then((data) => {
        if (active) setCourses(data?.items ?? []);
      })
      .catch((err) => {
        if (active) setError(err.message || "Không tải được danh sách khóa học.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeTab]);

  function changeTab(nextTab) {
    setActiveTab(nextTab);
    setNotice("");
    setError("");
  }

  async function runStatusAction(course, action, nextStatus, successText) {
    if (busyId) return;
    setBusyId(course.id);
    setError("");
    setNotice("");
    try {
      await action(course.id);
      setNotice(`${successText} Khóa học đã chuyển sang tab "${MOVED_TAB_LABEL[nextStatus]}".`);
      await load(activeTab);
    } catch (err) {
      setError(err.message || "Không cập nhật được trạng thái khóa học.");
    } finally {
      setBusyId(null);
    }
  }

  function openRejectModal(course) {
    setRejectCourseItem(course);
    setRejectReason("");
    setError("");
    setNotice("");
  }

  async function handleReject() {
    if (!rejectCourseItem || busyId) return;
    const reason = rejectReason.trim();
    if (reason.length < 10 || reason.length > 500) {
      setError("Lý do từ chối phải từ 10 đến 500 ký tự.");
      return;
    }

    setBusyId(rejectCourseItem.id);
    setError("");
    setNotice("");
    try {
      await rejectCourse(rejectCourseItem.id, reason);
      setNotice(`Đã từ chối khóa học. Khóa học đã chuyển sang tab "${MOVED_TAB_LABEL.REJECTED}".`);
      setRejectCourseItem(null);
      setRejectReason("");
      await load(activeTab);
    } catch (err) {
      setError(err.message || "Không từ chối được khóa học.");
    } finally {
      setBusyId(null);
    }
  }

  function renderActions(course) {
    const disabled = busyId === course.id;

    return (
      <>
        <Link className="page-action page-action-primary" to={`/admin/courses/${course.id}/review`}>
          Xem chi tiết
        </Link>

        {course.status === "SUBMITTED" && (
          <>
            <button
              type="button"
              className="page-action page-action-primary"
              disabled={disabled || !course.readyForReview}
              onClick={() => runStatusAction(course, approveCourse, "APPROVED", "Đã duyệt khóa học.")}
            >
              {disabled ? "Đang xử lý..." : "Duyệt"}
            </button>
            <button type="button" className="page-action page-action-secondary" disabled={disabled} onClick={() => openRejectModal(course)}>
              Từ chối
            </button>
          </>
        )}

        {course.status === "APPROVED" && (
          <>
            <button
              type="button"
              className="page-action page-action-primary"
              disabled={disabled}
              onClick={() => runStatusAction(course, publishCourse, "PUBLISHED", "Đã xuất bản khóa học.")}
            >
              {disabled ? "Đang xuất bản..." : "Xuất bản"}
            </button>
            <button type="button" className="page-action page-action-secondary" disabled={disabled} onClick={() => openRejectModal(course)}>
              Từ chối
            </button>
          </>
        )}

        {course.status === "PUBLISHED" && (
          <>
            <Link className="page-action page-action-secondary" to={publicCourseUrl(course)} target="_blank" rel="noreferrer">
              Xem trang công khai
            </Link>
            <Link className="page-action page-action-secondary" to="/admin/course-publish">
              Quản lý giá sale
            </Link>
            <button
              type="button"
              className="page-action page-action-secondary"
              disabled={disabled}
              onClick={() => runStatusAction(course, hideCourse, "HIDDEN", "Đã ẩn khóa học.")}
            >
              {disabled ? "Đang ẩn..." : "Ẩn khóa học"}
            </button>
          </>
        )}

        {course.status === "HIDDEN" && (
          <>
            <button
              type="button"
              className="page-action page-action-primary"
              disabled={disabled}
              onClick={() => runStatusAction(course, publishCourse, "PUBLISHED", "Đã xuất bản lại khóa học.")}
            >
              {disabled ? "Đang xuất bản..." : "Xuất bản lại"}
            </button>
            <button
              type="button"
              className="page-action page-action-secondary"
              disabled={disabled}
              onClick={() => runStatusAction(course, archiveCourse, "ARCHIVED", "Đã lưu trữ khóa học.")}
            >
              {disabled ? "Đang lưu trữ..." : "Lưu trữ"}
            </button>
          </>
        )}

        {course.status === "REJECTED" && course.lastRejectedReason && (
          <span className="page-description" style={{ margin: 0 }}>
            Lý do: {course.lastRejectedReason}
          </span>
        )}
      </>
    );
  }

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Admin</span>
        <h2 className="page-title">Quản lý khóa học theo trạng thái</h2>
        <p className="page-description">
          Theo dõi khóa học ở mọi trạng thái sau khi duyệt, xuất bản, ẩn hoặc lưu trữ. Admin chỉ xem nội dung và quản lý trạng thái, không chỉnh sửa chương hoặc bài học của Teacher.
        </p>
        <div className="course-status-tabs" role="tablist" aria-label="Lọc khóa học theo trạng thái">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`course-status-tab ${activeTab === tab.key ? "is-active" : ""}`}
              onClick={() => changeTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {notice && <p className="auth-success" role="status">{notice}</p>}
      {error && <p className="auth-error" role="alert">{error}</p>}

      <section className="course-table page-panel-card">
        {loading && <p className="auth-state">Đang tải danh sách khóa học...</p>}
        {!loading &&
          courses.map((course) => (
            <div className="course-table-row" key={course.id} style={{ alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong>{course.title}</strong>
                <p style={{ margin: "0.35rem 0", color: "#475569" }}>
                  {course.teacherName} · {levelLabel(course.level)} · {courseTypeLabel(course.courseType)} · {courseStatusLabel(course.status)}
                </p>
                <p style={{ margin: "0.35rem 0", color: "#475569" }}>
                  Giá gốc: <strong>{formatMoney(course.originalPrice)}</strong> · Giá hiện tại: <strong>{formatMoney(course.currentPrice)}</strong> · Tiến độ:{" "}
                  <strong>{course.completionPercent ?? 0}%</strong>
                </p>
                {course.salePrice != null && (
                  <p style={{ margin: "0.35rem 0", color: "#475569" }}>
                    Giá sale: <strong>{formatMoney(course.salePrice)}</strong>
                  </p>
                )}
                {!course.readyForReview && course.validationErrors?.length > 0 && (
                  <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.1rem" }}>
                    {course.validationErrors.slice(0, 3).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="course-row-actions">{renderActions(course)}</div>
            </div>
          ))}
        {!loading && courses.length === 0 && (
          <p className="page-description">
            Không có khóa học trong tab này. Khóa học sau khi chuyển trạng thái sẽ xuất hiện ở tab tương ứng.
          </p>
        )}
      </section>

      {rejectCourseItem && (
        <div className="lb-overlay" onClick={() => !busyId && setRejectCourseItem(null)}>
          <div className="lb-modal lb-modal-sm" onClick={(event) => event.stopPropagation()}>
            <div className="lb-modal-header">
              <h3>Từ chối khóa học</h3>
              <button type="button" className="lb-modal-close" disabled={Boolean(busyId)} onClick={() => setRejectCourseItem(null)}>
                x
              </button>
            </div>
            <div className="lb-modal-body">
              <p className="page-description" style={{ marginTop: 0 }}>
                Nhập lý do cụ thể để Teacher biết cần chỉnh sửa gì cho khóa "{rejectCourseItem.title}".
              </p>
              <label className="teacher-content-field">
                Lý do từ chối
                <textarea
                  rows="5"
                  minLength={10}
                  maxLength={500}
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                  placeholder="Ví dụ: Khóa học còn thiếu nội dung bài học hoặc ảnh đại diện chưa phù hợp."
                />
              </label>
              <p className="page-description" style={{ margin: 0 }}>
                {rejectReason.trim().length}/500 ký tự
              </p>
              <div className="lb-modal-footer">
                <button type="button" className="page-action page-action-secondary" disabled={Boolean(busyId)} onClick={() => setRejectCourseItem(null)}>
                  Hủy
                </button>
                <button type="button" className="page-action page-action-primary" disabled={Boolean(busyId)} onClick={handleReject}>
                  {busyId ? "Đang xử lý..." : "Xác nhận từ chối"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
