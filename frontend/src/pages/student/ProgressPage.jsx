import { useCallback, useEffect, useState } from "react";
import { LoadingState } from "../../components/common/UiState";
import { getProgressDashboard } from "../../services/progressService";

function percent(value) {
  return Number(value || 0).toFixed(0);
}

export default function ProgressPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getProgressDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err.message || "Không thể kết nối tới máy chủ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <div className="student-page">
      <section className="student-hero compact">
        <div>
          <span className="page-badge">Progress</span>
          <h2>Tiến độ học tập</h2>
          <p>Xem tiến độ từng khóa, thời gian học, streak và bài học được đề xuất tiếp theo.</p>
        </div>
      </section>

      {error && (
        <div className="student-error-state" role="alert" style={{ margin: "1.5rem 0", padding: "1.5rem", borderRadius: "16px" }}>
          <strong>Lỗi kết nối dữ liệu:</strong>
          <p style={{ margin: "6px 0 1rem 0" }}>{error}</p>
          <button
            type="button"
            onClick={loadDashboard}
            style={{ padding: "9px 20px", borderRadius: "10px", background: "#0d9488", color: "#ffffff", border: "none", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(13,148,136,0.3)" }}
          >
            🔄 Thử tải lại ngay
          </button>
        </div>
      )}

      {loading && !error && <LoadingState title="Đang tải tiến độ học tập..." />}

      {!loading && dashboard && (
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
                <h3>Biểu đồ học tập tháng</h3>
              </div>
            </div>

            <div className="student-calendar-weekdays">
              <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
            </div>

            <div className="student-calendar-grid">
              {(dashboard.monthlyChart ?? []).map((item) => {
                const val = Number(item.value || 0);
                const active = val > 0;
                return (
                  <div
                    className={`student-calendar-cell ${active ? "has-activity" : ""}`}
                    key={item.label}
                    title={`Ngày ${item.label}: ${val > 0 ? `${val} phút học` : "Chưa học"}`}
                  >
                    <span className="calendar-day-num">{item.label}</span>
                    <span className="calendar-day-val">{val > 0 ? `${val}m` : "-"}</span>
                  </div>
                );
              })}
            </div>
          </article>
        </section>
      )}
    </div>
  );
}
