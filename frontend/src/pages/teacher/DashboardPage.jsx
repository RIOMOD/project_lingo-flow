import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTeacherProgressDashboard } from "../../services/progressService";

export default function TeacherDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getTeacherProgressDashboard()
      .then(setDashboard)
      .catch((err) => setError(err.message || "Không tải được dashboard teacher"));
  }, []);

  return (
    <div className="course-page">
      <section className="page-hero">
        <div className="page-hero-copy">
          <h2 className="page-title">Dashboard giảng viên</h2>
          <p className="page-description">Theo dõi khóa học, bài làm và tiến độ học viên.</p>
        </div>
        <div className="page-actions">
          <Link className="page-action page-action-primary" to="/teacher/question-bank">Xem kết quả</Link>
          <Link className="page-action page-action-secondary" to="/teacher/courses">Quản lý khóa học</Link>
        </div>
      </section>
      {error && <p className="auth-error">{error}</p>}
      {dashboard && (
        <>
          <section className="course-grid">
            <article className="page-panel-card"><strong>{dashboard.activeCourses}</strong><p>Khóa đang dạy</p></article>
            <article className="page-panel-card"><strong>{dashboard.startedLessons}</strong><p>Lượt làm bài</p></article>
            <article className="page-panel-card"><strong>{dashboard.completedLessons}</strong><p>Đã nộp</p></article>
            <article className="page-panel-card"><strong>{dashboard.strongestSkill?.skill || "-"}</strong><p>Kỹ năng mạnh</p></article>
          </section>
          <section className="course-table page-panel-card">
            {(dashboard.weeklyChart ?? []).map((item) => (
              <div className="course-table-row" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
