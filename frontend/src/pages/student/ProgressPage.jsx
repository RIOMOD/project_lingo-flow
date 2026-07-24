import { useEffect, useState } from "react";
import { LoadingState } from "../../components/common/UiState";
import { getProgressDashboard } from "../../services/progressService";

function percent(value) {
  return Number(value || 0).toFixed(0);
}

export default function ProgressPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getProgressDashboard()
      .then(setDashboard)
      .catch((err) => setError(err.message || "Không tải được tiến độ"));
  }, []);

  return (
    <div className="student-page">
      <section className="student-hero compact">
        <div>
          <span className="page-badge">Progress</span>
          <h2>Tiến độ học tập</h2>
          <p>Xem tiến độ từng khóa, thời gian học, streak và bài học được đề xuất tiếp theo.</p>
        </div>
      </section>

      {error && <p className="auth-error">{error}</p>}
      {!dashboard && !error && <LoadingState title="Đang tải tiến độ..." />}

      {dashboard && (
        <section className="student-progress-layout">
          <article className="student-panel">
            <div className="student-panel-head">
              <div>
                <span className="page-badge">Courses</span>
                <h3>Course progress</h3>
              </div>
            </div>
            <div className="student-course-progress-list">
              {(dashboard.courses ?? []).map((course) => (
                <div className="student-course-progress" key={course.courseId}>
                  <div>
                    <strong>{course.courseTitle}</strong>
                    <span>{course.completedLessons}/{course.totalLessons} bài · {course.studyTimeMinutes} phút</span>
                  </div>
                  <div className="student-progress-bar">
                    <i style={{ width: `${percent(course.progressPercent)}%` }} />
                  </div>
                  <p>Đề xuất: {course.nextLessonTitle || "Đã hoàn thành"}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="student-panel">
            <div className="student-panel-head">
              <div>
                <span className="page-badge">Monthly</span>
                <h3>Biểu đồ tháng</h3>
              </div>
            </div>
            <div className="student-month-grid">
              {(dashboard.monthlyChart ?? []).map((item) => (
                <div className="student-month-cell" key={item.label}>
                  <strong>{item.value}</strong>
                  <span>Ngày {item.label}</span>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}
    </div>
  );
}

