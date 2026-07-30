import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  approveCourse,
  archiveCourse,
  getAdminCourseChapters,
  getAdminCourseDetail,
  getAdminCourseReviewHistory,
  hideCourse,
  publishCourse,
  rejectCourse,
} from "../../services/courseService";
import {
  courseStatusLabel,
  courseTypeLabel,
  formatMoney,
  lessonStatusLabel,
  lessonTypeLabel,
  levelLabel,
  saleStatusLabel,
} from "../../utils/courseWorkflow";

function formatDateTime(value) {
  if (!value) return "Chưa có";
  return value.replace("T", " ").slice(0, 16);
}

function publicCourseUrl(course) {
  return course?.slug ? `/courses/${course.slug}` : "/courses";
}

function reviewActionLabel(action) {
  switch (action) {
    case "APPROVE":
      return "Duyệt";
    case "REJECT":
      return "Từ chối";
    case "REQUEST_CHANGES":
      return "Yêu cầu chỉnh sửa";
    default:
      return action || "Chưa xác định";
  }
}

export default function AdminCourseReviewPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    setError("");
    Promise.all([getAdminCourseDetail(courseId), getAdminCourseChapters(courseId), getAdminCourseReviewHistory(courseId)])
      .then(([courseDetail, chapterData, historyData]) => {
        if (!active) return;
        setCourse(courseDetail);
        setChapters(chapterData ?? []);
        setReviewHistory(historyData ?? []);
      })
      .catch((err) => {
        if (active) setError(err.message || "Không tải được chi tiết khóa học.");
      });

    return () => {
      active = false;
    };
  }, [courseId]);

  async function refreshReviewHistory() {
    setReviewHistory(await getAdminCourseReviewHistory(courseId));
  }

  async function handleApprove() {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const updated = await approveCourse(courseId);
      setCourse(updated);
      await refreshReviewHistory();
      setNotice("Đã duyệt khóa học. Khóa học hiện nằm trong tab Đã duyệt.");
    } catch (err) {
      setError(err.message || "Không duyệt được khóa học.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    if (busy) return;
    const reason = rejectReason.trim();
    if (reason.length < 10 || reason.length > 500) {
      setError("Lý do từ chối phải từ 10 đến 500 ký tự.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");
    try {
      const updated = await rejectCourse(courseId, reason);
      setCourse(updated);
      await refreshReviewHistory();
      setRejectReason("");
      setRejectModalOpen(false);
      setNotice("Đã từ chối khóa học. Khóa học hiện nằm trong tab Bị từ chối.");
    } catch (err) {
      setError(err.message || "Không từ chối được khóa học.");
    } finally {
      setBusy(false);
    }
  }

  async function handlePublish() {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const updated = await publishCourse(courseId);
      setCourse(updated);
      setNotice("Đã xuất bản khóa học. Khóa học hiện nằm trong tab Đã xuất bản.");
    } catch (err) {
      setError(err.message || "Không xuất bản được khóa học.");
    } finally {
      setBusy(false);
    }
  }

  async function handleHide() {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const updated = await hideCourse(courseId);
      setCourse(updated);
      setNotice("Đã ẩn khóa học. Khóa học hiện nằm trong tab Đã ẩn.");
    } catch (err) {
      setError(err.message || "Không ẩn được khóa học.");
    } finally {
      setBusy(false);
    }
  }

  async function handleArchive() {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const updated = await archiveCourse(courseId);
      setCourse(updated);
      setNotice("Đã lưu trữ khóa học. Khóa học hiện nằm trong tab Đã lưu trữ.");
    } catch (err) {
      setError(err.message || "Không lưu trữ được khóa học.");
    } finally {
      setBusy(false);
    }
  }

  function openRejectModal() {
    setError("");
    setNotice("");
    setRejectReason("");
    setRejectModalOpen(true);
  }

  function renderLessonSummary(lesson) {
    const details = [];

    if (lesson.content) {
      details.push(<p key="content" style={{ margin: "0.25rem 0" }}>{lesson.content}</p>);
    }
    if (lesson.videoUrl) {
      details.push(<p key="video" style={{ margin: "0.25rem 0", color: "#475569" }}>Video: {lesson.videoUrl}</p>);
    }
    if (lesson.audioUrl) {
      details.push(<p key="audio" style={{ margin: "0.25rem 0", color: "#475569" }}>Tài liệu hoặc âm thanh: {lesson.audioUrl}</p>);
    }

    return details.length > 0 ? details : <p style={{ margin: "0.25rem 0" }}>Bài học chưa có nội dung hợp lệ.</p>;
  }

  if (error && !course) return <p className="auth-error">{error}</p>;
  if (!course) return <p className="auth-state">Đang tải chi tiết khóa học...</p>;

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Admin</span>
        <h2 className="page-title">Chi tiết khóa học Admin</h2>
        <p className="page-description">
          Xem thông tin, nội dung, giá, sale, lịch sử duyệt và trạng thái hiện tại. Admin không chỉnh sửa chương, bài học hoặc nội dung Teacher tại đây.
        </p>
      </section>

      {notice && <p className="auth-success" role="status">{notice}</p>}
      {error && <p className="auth-error" role="alert">{error}</p>}

      <section className="page-panel-card" style={{ marginBottom: "1rem" }}>
        {course.thumbnailUrl && (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            style={{ width: "100%", maxHeight: "320px", objectFit: "cover", borderRadius: "16px", marginBottom: "1rem" }}
          />
        )}
        <h3 style={{ marginTop: 0 }}>{course.title}</h3>
        <p className="page-description">{course.shortDescription || course.description}</p>
        <p className="page-description">
          Teacher: <strong>{course.teacherName}</strong> · {levelLabel(course.level)} · {courseTypeLabel(course.courseType)} · Trạng thái hiện tại:{" "}
          <strong>{courseStatusLabel(course.status)}</strong>
        </p>
        <p className="page-description">
          Giá gốc: <strong>{formatMoney(course.originalPrice)}</strong> · Giá sale:{" "}
          <strong>{course.salePrice != null ? formatMoney(course.salePrice) : "Chưa có"}</strong> · Giá đang áp dụng:{" "}
          <strong>{formatMoney(course.currentPrice)}</strong>
        </p>
        <p className="page-description">
          Thời gian sale: <strong>{course.saleStartAt && course.saleEndAt ? `${formatDateTime(course.saleStartAt)} - ${formatDateTime(course.saleEndAt)}` : "Chưa thiết lập"}</strong> · Trạng thái sale:{" "}
          <strong>{saleStatusLabel(course.saleStatus)}</strong>
        </p>
        {course.publishedAt && <p className="page-description">Ngày xuất bản: <strong>{formatDateTime(course.publishedAt)}</strong></p>}
        {course.lastRejectedReason && (
          <p className="auth-error" style={{ marginTop: "0.75rem" }}>
            Lý do từ chối gần nhất: {course.lastRejectedReason}
          </p>
        )}
      </section>

      <section className="page-panel-card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Lịch sử duyệt</h3>
        {reviewHistory.length === 0 && <p className="page-description">Chưa có lịch sử duyệt hoặc từ chối.</p>}
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {reviewHistory.map((item) => (
            <div className="course-table-row" key={item.id} style={{ alignItems: "flex-start" }}>
              <div>
                <strong>{reviewActionLabel(item.action)}</strong>
                <p className="page-description" style={{ margin: "0.25rem 0" }}>
                  Admin: {item.adminName || "Không xác định"} · Thời gian: {formatDateTime(item.createdAt)}
                </p>
                {item.reason && <p className="page-description" style={{ margin: 0 }}>Lý do: {item.reason}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="page-panel-card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Checklist hoàn thiện</h3>
        <p className="page-description">
          Tiến độ hoàn thiện: <strong>{course.completionPercent ?? 0}%</strong>
        </p>
        {course.validationErrors?.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
            {course.validationErrors.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="page-description">Khóa học đã đủ dữ liệu để duyệt.</p>
        )}
      </section>

      <section className="page-panel-card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Nội dung khóa học</h3>
        <p className="page-description">Admin xem được cấu trúc chương, bài học, nội dung bài học và bài học xem thử trước khi quyết định trạng thái.</p>
        {chapters.length === 0 && <p className="page-description">Khóa học chưa có chương nào.</p>}
        <div style={{ display: "grid", gap: "1rem" }}>
          {chapters.map((chapter) => (
            <div key={chapter.id}>
              <strong>Chương {chapter.position}: {chapter.title}</strong>
              <p className="page-description">{chapter.description || "Chưa có mô tả chương."}</p>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {(chapter.lessons ?? []).map((lesson) => (
                  <div key={lesson.id} className="course-table-row" style={{ alignItems: "flex-start" }}>
                    <div>
                      <strong>{lesson.position}. {lesson.title}</strong>
                      <p style={{ margin: "0.25rem 0", color: "#475569" }}>
                        {lessonTypeLabel(lesson.lessonType)} · {lessonStatusLabel(lesson.status)} · {lesson.durationMinutes || 0} phút {lesson.preview ? "· Có xem thử" : ""}
                      </p>
                      {renderLessonSummary(lesson)}
                      {!lesson.completed && lesson.completionErrors?.length > 0 && (
                        <ul style={{ margin: "0.25rem 0 0", paddingLeft: "1.1rem" }}>
                          {lesson.completionErrors.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="page-panel-card">
        <h3 style={{ marginTop: 0 }}>Quản lý trạng thái</h3>
        <div className="page-actions">
          <Link className="page-action page-action-secondary" to="/admin/course-approval">
            Quay lại quản lý khóa học
          </Link>

          {course.status === "SUBMITTED" && (
            <>
              <button type="button" className="page-action page-action-primary" disabled={busy || !course.readyForReview} onClick={handleApprove}>
                {busy ? "Đang xử lý..." : "Duyệt khóa học"}
              </button>
              <button type="button" className="page-action page-action-secondary" disabled={busy} onClick={openRejectModal}>
                Từ chối khóa học
              </button>
            </>
          )}

          {course.status === "APPROVED" && (
            <>
              <button type="button" className="page-action page-action-primary" disabled={busy} onClick={handlePublish}>
                {busy ? "Đang xuất bản..." : "Xuất bản khóa học"}
              </button>
              <button type="button" className="page-action page-action-secondary" disabled={busy} onClick={openRejectModal}>
                Từ chối khóa học
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
              <button type="button" className="page-action page-action-secondary" disabled={busy} onClick={handleHide}>
                {busy ? "Đang ẩn..." : "Ẩn khóa học"}
              </button>
            </>
          )}

          {course.status === "HIDDEN" && (
            <>
              <button type="button" className="page-action page-action-primary" disabled={busy} onClick={handlePublish}>
                {busy ? "Đang xuất bản..." : "Xuất bản lại"}
              </button>
              <button type="button" className="page-action page-action-secondary" disabled={busy} onClick={handleArchive}>
                {busy ? "Đang lưu trữ..." : "Lưu trữ"}
              </button>
            </>
          )}
        </div>
      </section>

      {rejectModalOpen && (
        <div className="lb-overlay" onClick={() => !busy && setRejectModalOpen(false)}>
          <div className="lb-modal lb-modal-sm" onClick={(event) => event.stopPropagation()}>
            <div className="lb-modal-header">
              <h3>Từ chối khóa học</h3>
              <button type="button" className="lb-modal-close" disabled={busy} onClick={() => setRejectModalOpen(false)}>
                x
              </button>
            </div>
            <div className="lb-modal-body">
              {error && <p className="auth-error" style={{ margin: 0 }}>{error}</p>}
              <label className="teacher-content-field">
                Lý do từ chối
                <textarea
                  rows="5"
                  value={rejectReason}
                  minLength={10}
                  maxLength={500}
                  onChange={(event) => setRejectReason(event.target.value)}
                  placeholder="Nhập lý do cụ thể để Teacher biết cần chỉnh sửa gì."
                />
              </label>
              <p className="page-description" style={{ margin: 0 }}>
                {rejectReason.trim().length}/500 ký tự
              </p>
              <div className="lb-modal-footer">
                <button type="button" className="page-action page-action-secondary" disabled={busy} onClick={() => setRejectModalOpen(false)}>
                  Hủy
                </button>
                <button type="button" className="page-action page-action-primary" disabled={busy} onClick={handleReject}>
                  {busy ? "Đang xử lý..." : "Xác nhận từ chối"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
