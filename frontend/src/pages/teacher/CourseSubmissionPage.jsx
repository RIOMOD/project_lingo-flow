import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTeacherCourses } from "../../services/courseService";
import { courseStatusLabel } from "../../utils/courseWorkflow";

export default function CourseSubmissionPage() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getTeacherCourses({ size: 30 })
      .then((data) => setCourses(data?.items ?? []))
      .catch((err) => setError(err.message || "Không tải được danh sách khóa học."));
  }, []);

  return (
    <div className="course-page">
      <section className="page-hero">        <h2 className="page-title">Bước 4: Gửi khóa học cho Admin duyệt</h2>
        <p className="page-description">
          Chỉ các khóa học đã đủ điều kiện hoàn thiện mới có thể gửi duyệt. Chọn khóa học bên dưới để xem trước và gửi.
        </p>
      </section>
      {error && <p className="auth-error">{error}</p>}
      <section className="course-table page-panel-card">
        {courses.map((course) => (
          <div key={course.id} className="course-table-row">
            <div>
              <strong>{course.title}</strong>
              <p style={{ margin: "0.35rem 0", color: "#475569" }}>
                {courseStatusLabel(course.status)} · Tiến độ {course.completionPercent ?? 0}%
              </p>
            </div>
            <div className="course-row-actions">
              <Link className="page-action page-action-secondary" to={`/teacher/courses/${course.id}/content`}>
                Quản lý nội dung
              </Link>
              <Link className="page-action page-action-primary" to={`/teacher/courses/${course.id}/preview`}>
                Xem trước và gửi duyệt
              </Link>
            </div>
          </div>
        ))}
        {courses.length === 0 && <p className="page-description">Bạn chưa có khóa học nào để gửi duyệt.</p>}
      </section>
    </div>
  );
}
