import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTeacherProgressDashboard } from "../../services/progressService";

export default function TeacherDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getTeacherProgressDashboard()
      .then(setDashboard)
      .catch((err) => setError(err.message || "Khong tai duoc dashboard teacher"));
  }, []);

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Teacher</span>
        <h2 className="page-title">Dashboard Teacher</h2>
        <p className="page-description">Theo doi lop hoc, attempt, ky nang manh/yeu va hoat dong theo tuan.</p>
        <div className="page-actions">
          <Link className="page-action page-action-primary" to="/teacher/question-bank">Xem ket qua</Link>
          <Link className="page-action page-action-secondary" to="/teacher/courses">Quan ly khoa hoc</Link>
        </div>
      </section>
      {error && <p className="auth-error">{error}</p>}
      {dashboard && (
        <>
          <section className="course-grid">
            <article className="page-panel-card"><strong>{dashboard.activeCourses}</strong><p>Khoa dang day</p></article>
            <article className="page-panel-card"><strong>{dashboard.startedLessons}</strong><p>Luot lam bai</p></article>
            <article className="page-panel-card"><strong>{dashboard.completedLessons}</strong><p>Da nop</p></article>
            <article className="page-panel-card"><strong>{dashboard.strongestSkill?.skill || "-"}</strong><p>Ky nang manh</p></article>
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
