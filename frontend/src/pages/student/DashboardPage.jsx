import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LoadingState } from "../../components/common/UiState";
import { getCourseChapters } from "../../services/courseService";
import { getProgressDashboard } from "../../services/progressService";
import "../../styles/StudentDashboard.css";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Chào buổi sáng";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

function formatMinutes(minutes = 0) {
  if (minutes < 60) return `${minutes} phút`;
  return `${Math.floor(minutes / 60)} giờ ${minutes % 60} phút`;
}

function formatAccess(value) {
  if (!value) return "Chưa bắt đầu";
  return new Intl.RelativeTimeFormat("vi", { numeric: "auto" }).format(
    -Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 86400000)), "day",
  );
}

function MiniBarChart({ items = [] }) {
  const hasData = items.some((item) => Number(item.value) > 0);
  if (!hasData) return <div className="student-empty-state"><span aria-hidden="true">◔</span><strong>Tuần này đang chờ dấu ấn đầu tiên</strong><p>Học một bài hôm nay để biểu đồ tiến độ bắt đầu chuyển động.</p></div>;
  const max = Math.max(1, ...items.map((item) => item.value || 0));
  return <div className="student-chart" aria-label="Hoạt động học trong 7 ngày">{items.map((item) => <div className="student-chart-row" key={item.label}><span>{new Date(item.label).toLocaleDateString("vi-VN", { weekday: "short" })}</span><div><i style={{ width: `${((item.value || 0) / max) * 100}%` }} /></div><strong>{item.value}</strong></div>)}</div>;
}

export default function StudentDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [path, setPath] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getProgressDashboard().then(async (data) => {
      setDashboard(data);
      if (data?.continueLearning?.courseId) {
        const chapters = await getCourseChapters(data.continueLearning.courseId);
        setPath(chapters.flatMap((chapter) => (chapter.lessons ?? []).map((lesson) => ({ ...lesson, chapterTitle: chapter.title }))));
      }
    }).catch((err) => setError(err.message || "Không tải được tổng quan học tập"));
  }, []);

  const current = dashboard?.continueLearning;
  const stats = useMemo(() => [
    ["📚", "Khóa đang học", dashboard?.activeCourses ?? 0],
    ["🎯", "Bài đã hoàn thành", dashboard?.completedLessons ?? 0],
    ["⏱️", "Tổng thời gian học", formatMinutes(dashboard?.studyTimeMinutes ?? 0)],
    ["🔥", "Chuỗi ngày học", `${dashboard?.streakDays ?? 0} ngày`],
    ["📝", "Bài tập đã làm", dashboard?.completedExercises ?? 0],
    ["⭐", "Điểm trung bình", `${Number(dashboard?.averageScore ?? 0).toFixed(1)}`],
    ["🧠", "Từ vựng đã học", dashboard?.learnedWords ?? 0],
    ["🔄", "Từ cần ôn", dashboard?.dueReviewWords ?? 0],
  ], [dashboard]);

  return <div className="stu-dashboard-container">
    <section className="stu-hero-section">
      <div className="stu-hero-content">
        <span className="stu-badge">Kế hoạch hôm nay</span>
        <h2>{greeting()}, {dashboard?.studentName || "bạn"} 👋</h2>
        <p>Tiếp tục duy trì thói quen học tiếng Anh mỗi ngày nhé!</p>
      </div>
      <div className="stu-hero-goal">
        <span>Mục tiêu học tập</span>
        <strong>{dashboard?.learningGoal || "Xây dựng thói quen học đều đặn"}</strong>
        <small>Một bước nhỏ, đều đặn mỗi ngày.</small>
      </div>
    </section>
    
    {error && <div className="student-error-state" role="alert"><strong>Chưa tải được dữ liệu</strong><p>{error}</p><button type="button" onClick={() => window.location.reload()}>Thử lại</button></div>}
    {!dashboard && !error && <LoadingState title="Đang chuẩn bị lộ trình của bạn..." />}
    
    {dashboard && <>
      {current ? 
        <section className="stu-continue-card">
          <img className="stu-continue-image" src={current.thumbnailUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80"} alt="" />
          <div className="stu-continue-content">
            <span className="stu-badge">Tiếp tục học</span>
            <h3>{current.courseTitle}</h3>
            <p>{current.nextChapterTitle} · <strong>{current.nextLessonTitle}</strong></p>
            
            <div className="stu-progress-container">
              <div className="stu-progress-bar">
                <div className="stu-progress-fill" style={{ width: `${Number(current.progressPercent || 0)}%` }}></div>
              </div>
              <span className="stu-progress-text">{Number(current.progressPercent || 0).toFixed(0)}%</span>
            </div>
            
            <div className="stu-continue-meta">
              <span>⏱️ Đã học {formatMinutes(current.studyTimeMinutes)}</span>
              <span>📅 Truy cập {formatAccess(current.lastAccessedAt)}</span>
            </div>
            
            <Link className="stu-btn-primary" to={`/student/learn/${current.courseId}/${current.nextLessonId}`}>Tiếp tục đúng bài</Link>
          </div>
        </section>
        : 
        <section className="student-empty-state student-empty-wide">
          <strong>Bạn chưa có bài đang học</strong>
          <p>Khám phá một khóa học phù hợp để bắt đầu lộ trình.</p>
          <Link className="stu-btn-primary" to="/courses">Khám phá khóa học</Link>
        </section>
      }

      <section className="stu-stats-grid">
        {stats.map(([icon, label, value]) => (
          <article className="stu-stat-card" key={label}>
            <div className="stu-stat-icon" aria-hidden="true">{icon}</div>
            <div className="stu-stat-info">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="stu-bottom-grid">
        <article className="stu-panel">
          <div className="stu-panel-header">
            <h3 className="stu-panel-title">Lộ trình học tiếp theo</h3>
            <Link to="/student/progress">Xem tất cả</Link>
          </div>
          {path.length ? 
            <div className="stu-path-list">
              {path.slice(0, 6).map((lesson) => { 
                const state = lesson.progressStatus === "COMPLETED" ? "completed" : lesson.locked ? "locked" : lesson.progressStatus === "IN_PROGRESS" ? "current" : "ready"; 
                const icon = state === "completed" ? "✓" : state === "locked" ? "🔒" : state === "current" ? "▶" : "📚";
                return (
                  <div className={`stu-path-item is-${state}`} key={lesson.id}>
                    <div className="stu-path-icon" aria-hidden="true">{icon}</div>
                    <div className="stu-path-info">
                      <strong>{lesson.title}</strong>
                      <small>{state === "completed" ? "Đã hoàn thành" : state === "locked" ? lesson.lockReason : state === "current" ? "Đang học" : "Sẵn sàng học"}</small>
                    </div>
                    {!lesson.locked && lesson.progressStatus !== "COMPLETED" && <Link className="stu-path-action" to={`/student/learn/${current.courseId}/${lesson.id}`}>Học</Link>}
                  </div>
                ); 
              })}
            </div> 
            : 
            <div className="student-empty-state">
              <strong>Chưa có lộ trình</strong>
              <p>Lộ trình sẽ xuất hiện khi bạn bắt đầu một khóa học.</p>
            </div>
          }
        </article>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <article className="stu-panel">
            <div className="stu-panel-header">
              <h3 className="stu-panel-title">Nhịp học tuần này</h3>
            </div>
            <MiniBarChart items={dashboard.weeklyChart ?? []} />
          </article>
          
          <article className="stu-panel">
            <h3 className="stu-panel-title" style={{marginBottom: '1rem'}}>Đề xuất cho bạn</h3>
            <ul className="student-suggestion-list">
              <li>
                <span>🔄</span>
                <div>
                  <strong>Ôn {dashboard.dueReviewWords ?? 0} từ đến hạn</strong>
                  <Link to="/student/vocabulary">Ôn ngay</Link>
                </div>
              </li>
              <li>
                <span>📝</span>
                <div>
                  <strong>Luyện kỹ năng {dashboard.weakestSkill?.skill || "nền tảng"}</strong>
                  <Link to="/student/exercises">Làm bài tập</Link>
                </div>
              </li>
            </ul>
          </article>
        </div>
      </section>
    </>}
  </div>;
}
