import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTeacherCourses } from "../../services/courseService";
import { canTeacherEditCourse, courseStatusLabel, courseTypeLabel, progressTone } from "../../utils/courseWorkflow";

export default function CourseManagementPage() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getTeacherCourses({ size: 30 })
      .then((data) => setCourses(data?.items ?? []))
      .catch((err) => setError(err.message || "Không tải được danh sách khóa học."));
  }, []);

  return (
    <div className="course-page">
      <section className="page-hero">        <h2 className="page-title">Quản lý khóa học</h2>
        <p className="page-description">
          Theo dõi tiến độ hoàn thiện của từng khóa học và truy cập đúng bước: thông tin cơ bản, nội dung, xem trước hoặc gửi duyệt.
        </p>
        <div className="page-actions">
          <Link className="page-action page-action-primary" to="/teacher/courses/create">Tạo khóa học mới</Link>
          <Link className="page-action page-action-secondary" to="/teacher/lessons">Mở trang quản lý nội dung</Link>
        </div>
      </section>

      {error && <p className="auth-error">{error}</p>}

      <section className="course-table page-panel-card">
        {courses.map((course) => (
          <div key={course.id} className="course-table-row" style={{ alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <strong>{course.title}</strong>
              <p style={{ margin: "0.35rem 0", color: "#475569" }}>
                {courseTypeLabel(course.courseType)} · {courseStatusLabel(course.status)}
              </p>
              <p style={{ margin: "0.35rem 0", color: "#475569" }}>
                Tiến độ hoàn thiện:{" "}
                <strong style={{ color: progressTone(course.completionPercent ?? 0) }}>{course.completionPercent ?? 0}%</strong>
                {course.readyForReview ? " · Đủ điều kiện gửi duyệt" : " · Chưa đủ điều kiện gửi duyệt"}
              </p>
              {course.lastRejectedReason && (
                <p className="auth-error" style={{ margin: "0.35rem 0 0" }}>
                  Lý do từ chối gần nhất: {course.lastRejectedReason}
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
            <div className="course-row-actions">
              <Link className="page-action page-action-secondary" to={`/teacher/courses/${course.id}/edit`}>
                Chỉnh sửa thông tin
              </Link>
              <Link className="page-action page-action-secondary" to={`/teacher/courses/${course.id}/content`}>
                Quản lý nội dung
              </Link>
              <Link className="page-action page-action-secondary" to={`/teacher/courses/${course.id}/preview`}>
                Xem trước
              </Link>
              <Link
                className="page-action page-action-primary"
                to={`/teacher/courses/${course.id}/preview`}
                aria-disabled={!course.readyForReview || !canTeacherEditCourse(course)}
                style={!course.readyForReview || !canTeacherEditCourse(course) ? { pointerEvents: "none", opacity: 0.45 } : undefined}
              >
                Gửi duyệt
              </Link>
            </div>
          </div>
        ))}
        {courses.length === 0 && <p className="page-description">Bạn chưa có khóa học nào.</p>}
      </section>
    </div>
  );
}
