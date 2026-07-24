import { useEffect, useState } from "react";
import { approveCourse, getAdminCourses, publishCourse, rejectCourse } from "../../services/courseService";

export default function CourseApprovalPage() {
  const [status, setStatus] = useState("SUBMITTED");
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  async function loadCourses(nextStatus = status) {
    try {
      const data = await getAdminCourses({ status: nextStatus, size: 20 });
      setCourses(data?.items ?? []);
    } catch (err) {
      setError(err.message || "Khong tai duoc danh sach duyet");
    }
  }

  useEffect(() => {
    loadCourses(status);
  }, [status]);

  async function runAction(action, id) {
    setError("");
    try {
      await action(id);
      await loadCourses();
    } catch (err) {
      setError(err.message || "Thao tac that bai");
    }
  }

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Admin</span>
        <h2 className="page-title">Duyet khoa hoc</h2>
        <p className="page-description">Kiem tra khoa hoc giao vien gui len, duyet noi dung/gia va xuat ban.</p>
        <div className="course-filter-row">
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="SUBMITTED">Cho duyet</option>
            <option value="APPROVED">Da duyet</option>
            <option value="PUBLISHED">Da xuat ban</option>
            <option value="REJECTED">Da tu choi</option>
          </select>
        </div>
      </section>
      {error && <p className="auth-error">{error}</p>}
      <section className="course-table page-panel-card">
        {courses.map((course) => (
          <div className="course-table-row" key={course.id}>
            <div>
              <strong>{course.title}</strong>
              <p>{course.teacherName} - {course.level} - {course.courseType} - {course.status}</p>
            </div>
            <div className="course-row-actions">
              {course.status === "SUBMITTED" && (
                <>
                  <button className="page-action page-action-primary" onClick={() => runAction(approveCourse, course.id)}>Duyet</button>
                  <button className="page-action page-action-secondary" onClick={() => runAction((id) => rejectCourse(id, "Can cap nhat noi dung"), course.id)}>Tu choi</button>
                </>
              )}
              {course.status === "APPROVED" && (
                <button className="page-action page-action-primary" onClick={() => runAction(publishCourse, course.id)}>Xuat ban</button>
              )}
            </div>
          </div>
        ))}
        {courses.length === 0 && <p className="page-description">Khong co khoa hoc trong trang thai nay.</p>}
      </section>
    </div>
  );
}
