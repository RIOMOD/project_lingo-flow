import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CourseWorkflowStepper from "../../components/teacher/CourseWorkflowStepper";
import { useToast } from "../../context/ToastContext";
import { getTeacherCourseChapters, getTeacherCourseDetail, submitCourseReview } from "../../services/courseService";
import {
  canTeacherEditCourse,
  courseStatusLabel,
  courseTypeLabel,
  formatMoney,
  lessonStatusLabel,
  lessonTypeLabel,
  levelLabel,
} from "../../utils/courseWorkflow";

function renderLessonSummary(lesson) {
  const details = [];

  if (lesson.content) {
    details.push(<p key="content" style={{ margin: "0.25rem 0" }}>{lesson.content}</p>);
  }
  if (lesson.videoUrl) {
    details.push(
      <p key="video" style={{ margin: "0.25rem 0", color: "#475569" }}>
        Video: {lesson.videoUrl}
      </p>
    );
  }
  if (lesson.audioUrl) {
    details.push(
      <p key="audio" style={{ margin: "0.25rem 0", color: "#475569" }}>
        Tài liệu hoặc âm thanh: {lesson.audioUrl}
      </p>
    );
  }

  if (details.length > 0) {
    return details;
  }

  return <p style={{ margin: "0.25rem 0" }}>Bài học chưa có nội dung hợp lệ.</p>;
}

export default function CoursePreviewPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([getTeacherCourseDetail(courseId), getTeacherCourseChapters(courseId)])
      .then(([courseDetail, chapterData]) => {
        setCourse(courseDetail);
        setChapters(chapterData ?? []);
      })
      .catch((err) => setError(err.message || "Không tải được bản xem trước khóa học."));
  }, [courseId]);

  async function handleSubmitReview() {
    setSubmitting(true);
    setError("");
    try {
      const updated = await submitCourseReview(courseId);
      setCourse(updated);
      toast.success("Đã gửi khóa học cho Admin duyệt.");
    } catch (err) {
      setError(err.message || "Không gửi duyệt được khóa học.");
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !course) return <p className="auth-error">{error}</p>;
  if (!course) return <p className="auth-state">Đang tải bản xem trước khóa học...</p>;

  const canSubmit = canTeacherEditCourse(course) && course.readyForReview;

  return (
    <div className="course-page">
      <section className="page-hero">        <h2 className="page-title">Bước 3: Xem trước và kiểm tra khóa học</h2>
        <p className="page-description">
          Kiểm tra lại nội dung, checklist hoàn thiện và chỉ gửi duyệt khi khóa học đã đủ điều kiện.
        </p>
      </section>

      <CourseWorkflowStepper activeStep={course.status === "SUBMITTED" ? 4 : 3} courseId={course.id} submitted={course.status === "SUBMITTED"} />

      {error && <p className="auth-error">{error}</p>}

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
          {levelLabel(course.level)} · {courseTypeLabel(course.courseType)} · {courseStatusLabel(course.status)} · Giá khóa học:{" "}
          <strong>{formatMoney(course.originalPrice)}</strong>
        </p>
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
          <p className="page-description">Khóa học đã đủ điều kiện để gửi Admin duyệt.</p>
        )}
      </section>

      <section className="page-panel-card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Danh sách chương và bài học</h3>
        {chapters.length === 0 && (
          <p className="page-description">Khóa học chưa có chương nào để xem trước.</p>
        )}
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
                        {lessonTypeLabel(lesson.lessonType)} · {lessonStatusLabel(lesson.status)} · {lesson.durationMinutes || 0} phút{" "}
                        {lesson.preview ? "· Có xem thử" : ""}
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

      <div className="page-actions">
        <button className="page-action page-action-secondary" onClick={() => navigate(`/teacher/courses/${course.id}/content`)}>
          Quay lại chỉnh sửa nội dung
        </button>
        <Link className="page-action page-action-secondary" to={`/teacher/courses/${course.id}/edit`}>
          Quay lại chỉnh sửa thông tin
        </Link>
        <button className="page-action page-action-primary" disabled={!canSubmit || submitting} onClick={handleSubmitReview}>
          {submitting ? "Đang gửi..." : course.status === "SUBMITTED" ? "Đã gửi Admin duyệt" : "Bước 4: Gửi Admin duyệt"}
        </button>
      </div>
    </div>
  );
}
