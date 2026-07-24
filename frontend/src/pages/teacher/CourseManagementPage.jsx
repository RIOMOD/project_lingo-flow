import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTeacherCourses, submitCourseReview } from "../../services/courseService";

export default function CourseManagementPage() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  async function loadCourses() {
    try {
      const data = await getTeacherCourses({ size: 20 });
      setCourses(data?.items ?? []);
    } catch (err) {
      setError(err.message || "Khong tai duoc khoa hoc");
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  async function handleSubmitReview(id) {
    try {
      await submitCourseReview(id);
      await loadCourses();
    } catch (err) {
      setError(err.message || "Khong gui duyet duoc");
    }
  }

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Teacher</span>
        <h2 className="page-title">Quan ly khoa hoc</h2>
        <p className="page-description">Theo doi trang thai, tao noi dung va gui Admin duyet khoa hoc.</p>
        <div className="page-actions">
          <Link className="page-action page-action-primary" to="/teacher/courses/create">Tao khoa hoc</Link>
          <Link className="page-action page-action-secondary" to="/teacher/lessons">Quan ly chapter/lesson</Link>
        </div>
      </section>
      {error && <p className="auth-error">{error}</p>}
      <section className="course-table page-panel-card">
        {courses.map((course) => (
          <div className="course-table-row" key={course.id}>
            <div>
              <strong>{course.title}</strong>
              <p>{course.level} - {course.courseType} - {course.status}</p>
            </div>
            <div className="course-row-actions">
              <Link className="page-action page-action-secondary" to={`/teacher/courses/${course.id}/edit`}>Sua</Link>
              {(course.status === "DRAFT" || course.status === "REJECTED") && (
                <button className="page-action page-action-primary" onClick={() => handleSubmitReview(course.id)}>
                  Gui duyet
                </button>
              )}
            </div>
          </div>
        ))}
        {courses.length === 0 && <p className="page-description">Chua co khoa hoc nao.</p>}
      </section>
    </div>
  );
}
