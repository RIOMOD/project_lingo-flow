import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import LessonMedia from "../../components/common/LessonMedia";
import { LoadingState } from "../../components/common/UiState";
import { useToast } from "../../context/ToastContext";
import { getCourseChapters, getLesson } from "../../services/courseService";
import { completeLessonProgress, startLessonProgress, trackLessonProgress } from "../../services/progressService";

function flattenLessons(chapters) {
  return (chapters ?? []).flatMap((chapter) =>
    (chapter.lessons ?? []).map((lesson) => ({
      ...lesson,
      chapterTitle: chapter.title,
    }))
  );
}

function isMediaLesson(lesson) {
  return Boolean(lesson?.videoUrl || lesson?.audioUrl);
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function CourseLearningPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [chapters, setChapters] = useState([]);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [courseProgress, setCourseProgress] = useState(null);
  const [contentPercent, setContentPercent] = useState(0);
  const [mediaState, setMediaState] = useState({ position: 0, duration: 0 });
  const [checkpointAnswer, setCheckpointAnswer] = useState("");
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizSuccess, setQuizSuccess] = useState(false);
  const [completion, setCompletion] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [activeTab, setActiveTab] = useState("content"); // "content" | "quiz"

  const contentRef = useRef(null);
  const latestProgressRef = useRef({ percent: 0, position: 0, duration: 0 });
  const lessons = useMemo(() => flattenLessons(chapters), [chapters]);
  const activeIndex = lessons.findIndex((item) => item.id === activeLessonId);
  const activeLesson = lessons[activeIndex];

  const loadRoadmap = useCallback(
    async (preferredId) => {
      const data = await getCourseChapters(courseId);
      const safe = data ?? [];
      setChapters(safe);
      const flat = flattenLessons(safe);
      const requested = Number(preferredId);
      const selected =
        flat.find((item) => item.id === requested && !item.locked) ||
        flat.find((item) => !item.locked && item.progressStatus !== "COMPLETED") ||
        flat.find((item) => !item.locked);

      if (selected) {
        setActiveLessonId(selected.id);
        if (String(selected.id) !== String(preferredId)) {
          navigate(`/student/learn/${courseId}/${selected.id}`, { replace: true });
        }
      }
      return { chapters: safe, lessons: flat };
    },
    [courseId, navigate]
  );

  useEffect(() => {
    setError("");
    loadRoadmap(lessonId).catch((err) => setError(err.message || "Không tải được lộ trình học"));
  }, [lessonId, loadRoadmap]);

  useEffect(() => {
    if (!activeLessonId) return;
    let mounted = true;
    setLoadingLesson(true);
    setError("");
    setMessage("");
    setCompletion(null);
    setCheckpointAnswer("");
    setQuizChecked(false);
    setQuizSuccess(false);

    getLesson(courseId, activeLessonId)
      .then(async (data) => {
        if (!mounted) return;
        setLesson(data);
        const isMedia = isMediaLesson(data);
        const isCompleted = data.progressStatus === "COMPLETED";
        const initialPercent = isCompleted
          ? 100
          : isMedia
          ? Number(data.mediaDurationSeconds) > 0
            ? (Number(data.mediaPositionSeconds || 0) / Number(data.mediaDurationSeconds)) * 100
            : 0
          : 100;
        const savedPosition = Number(data.mediaPositionSeconds || 0);

        setContentPercent(initialPercent);
        setMediaState({ position: savedPosition, duration: Number(data.mediaDurationSeconds || 0) });
        latestProgressRef.current = {
          percent: initialPercent,
          position: savedPosition,
          duration: Number(data.mediaDurationSeconds || 0),
        };

        const progress = await startLessonProgress(activeLessonId, {});
        if (mounted) setCourseProgress(progress);
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Không thể mở bài học này");
      })
      .finally(() => {
        if (mounted) setLoadingLesson(false);
      });

    return () => {
      mounted = false;
    };
  }, [courseId, activeLessonId]);

  const persistProgress = useCallback(
    async (snapshot = latestProgressRef.current) => {
      if (!activeLessonId) return;
      try {
        const progress = await trackLessonProgress(activeLessonId, {
          contentProgressPercent: Math.min(100, snapshot.percent),
          mediaPositionSeconds: snapshot.position,
          mediaDurationSeconds: snapshot.duration,
        });
        setCourseProgress(progress);
      } catch (err) {
        setError(err.message || "Chưa lưu được vị trí học");
      }
    },
    [activeLessonId]
  );

  useEffect(() => {
    if (!activeLessonId) return undefined;
    const timer = window.setInterval(() => {
      if (latestProgressRef.current.percent > 0) persistProgress();
    }, 10000);
    return () => window.clearInterval(timer);
  }, [activeLessonId, persistProgress]);

  useEffect(() => {
    if (!lesson || isMediaLesson(lesson)) return undefined;
    function measureReading() {
      const node = contentRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const total = Math.max(1, rect.height);
      const seen = Math.min(total, Math.max(0, window.innerHeight - rect.top));
      const percent = Math.min(100, (seen / total) * 100);
      setContentPercent((current) => Math.max(current, percent));
      latestProgressRef.current = {
        ...latestProgressRef.current,
        percent: Math.max(latestProgressRef.current.percent, percent),
      };
    }
    measureReading();
    window.addEventListener("scroll", measureReading, { passive: true });
    return () => window.removeEventListener("scroll", measureReading);
  }, [lesson]);

  const handleMediaProgress = useCallback(
    (state) => {
      const isCompleted = activeLesson?.progressStatus === "COMPLETED";
      const rawPercent = state.percent || 0;
      const nextPercent = isCompleted ? 100 : Math.min(100, rawPercent);
      const nextPos = state.position || 0;
      const nextDur = state.duration || 0;
      latestProgressRef.current = { percent: nextPercent, position: nextPos, duration: nextDur };

      setContentPercent(nextPercent);
      setMediaState((prev) =>
        Math.abs(prev.position - nextPos) >= 0.5 || prev.duration !== nextDur
          ? { position: nextPos, duration: nextDur }
          : prev
      );
    },
    [activeLesson]
  );

  function chooseLesson(item) {
    if (item.locked) return;
    persistProgress();
    setActiveLessonId(item.id);
    navigate(`/student/learn/${courseId}/${item.id}`);
  }

  const handleVerifyQuiz = () => {
    if (!checkpointAnswer.trim()) {
      toast.error("Vui lòng nhập câu trả lời trước khi kiểm tra!");
      return;
    }
    const inputClean = checkpointAnswer.trim().toLowerCase();
    const targetClean = (lesson?.checkpointAnswer || "").trim().toLowerCase();

    setQuizChecked(true);
    if (targetClean && (inputClean.includes(targetClean) || targetClean.includes(inputClean))) {
      setQuizSuccess(true);
      toast.success("Chính xác! Đáp án hoàn toàn đúng 🎉");
    } else {
      setQuizSuccess(false);
      toast.error("Chưa chính xác, hãy xem lại gợi ý!");
    }
  };

  async function handleCompleteLesson() {
    setError("");
    setMessage("");
    try {
      const finalPercent = Math.max(85, latestProgressRef.current.percent || 100);
      const payload = {
        ...latestProgressRef.current,
        contentProgressPercent: finalPercent,
        mediaPositionSeconds: latestProgressRef.current.position,
        mediaDurationSeconds: latestProgressRef.current.duration,
        checkpointAnswer: checkpointAnswer.trim(),
      };
      const progress = await completeLessonProgress(activeLessonId, payload);
      setCourseProgress(progress);
      const updated = await getCourseChapters(courseId);
      setChapters(updated);
      const flat = flattenLessons(updated);
      const index = flat.findIndex((item) => item.id === activeLessonId);
      const next = flat[index + 1];
      setCompletion({ next: next ? next : null, courseComplete: !next, progressPercent: progress.progressPercent });
      setMessage("Bạn đã hoàn thành bài học 🎉");
    } catch (err) {
      setError(err.message || "Chưa thể hoàn thành bài học");
    }
  }

  const hasQuestion = Boolean(lesson?.checkpointQuestion && lesson.checkpointQuestion.trim().length > 0);
  const isAlreadyCompleted = activeLesson?.progressStatus === "COMPLETED";
  const localReady = isAlreadyCompleted || (contentPercent >= 85 && (!hasQuestion || checkpointAnswer.trim().length > 0));

  return (
    <div className="student-page learning-room-v2">
      {/* Top Banner */}
      <section className="student-learning-hero">
        <div>
          <span className="page-badge">Phòng học LingoFlow</span>
          <h2>{lesson?.title || "Đang mở bài học"}</h2>
          <p>{activeLesson?.chapterTitle || "Chọn bài học để bắt đầu"}</p>
        </div>
        <div className="student-learning-meta">
          <strong>{Number(courseProgress?.progressPercent || 0).toFixed(0)}%</strong>
          <small>Tiến độ khóa học</small>
        </div>
      </section>

      {error && (
        <div className="student-error-state" role="alert">
          <strong>Chưa thể tiếp tục:</strong> {error}
        </div>
      )}
      {message && <p className="course-success" role="status">{message}</p>}

      <section className="student-learning-shell">
        {/* Left Sidebar: Roadmap Accordion */}
        <aside className="student-lesson-sidebar">
          <h3>Lộ trình khóa học</h3>
          <div className="student-lesson-list">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="student-lesson-group">
                <h4>{chapter.position}. {chapter.title}</h4>
                {(chapter.lessons ?? []).map((item) => (
                  <div className="student-lesson-entry" key={item.id}>
                    <button
                      className={`student-lesson-button ${item.id === activeLessonId ? "is-active" : ""} ${item.locked ? "is-locked" : ""} ${item.progressStatus === "COMPLETED" ? "is-completed" : ""}`}
                      disabled={item.locked}
                      onClick={() => chooseLesson(item)}
                      type="button"
                      title={item.lockReason || item.title}
                    >
                      <span>
                        <i aria-hidden="true">
                          {item.progressStatus === "COMPLETED" ? "✓" : item.locked ? "⌑" : "○"}
                        </i>
                        {item.position}. {item.title}
                      </span>
                      <small>
                        {item.progressStatus === "COMPLETED"
                          ? "Đã hoàn thành"
                          : item.locked
                          ? "Chưa mở"
                          : item.progressStatus === "IN_PROGRESS"
                          ? "Đang học"
                          : `${item.durationMinutes || 0} phút`}
                      </small>
                    </button>
                    {item.locked && <p className="lesson-lock-reason">{item.lockReason}</p>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </aside>

        {/* Middle Main Content Panel */}
        <article className="student-lesson-content" ref={contentRef}>
          {loadingLesson && <LoadingState title="Đang tải bài học..." />}
          {!loadingLesson && lesson && (
            <>
              {/* Media Player */}
              <LessonMedia lesson={lesson} resumePosition={Number(lesson.mediaPositionSeconds || 0)} onProgress={handleMediaProgress} />

              {/* Tabs Bar */}
              <div style={{ display: "flex", gap: "10px", marginTop: "1.5rem", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px" }}>
                <button
                  type="button"
                  onClick={() => setActiveTab("content")}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "8px 16px",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    color: activeTab === "content" ? "#2563eb" : "#64748b",
                    borderBottom: activeTab === "content" ? "3px solid #2563eb" : "none",
                  }}
                >
                  📖 Bài giảng & Từ vựng
                </button>
                {hasQuestion && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("quiz")}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "8px 16px",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      color: activeTab === "quiz" ? "#2563eb" : "#64748b",
                      borderBottom: activeTab === "quiz" ? "3px solid #2563eb" : "none",
                    }}
                  >
                    ✍️ Kiểm tra nhanh ({quizSuccess ? "✓ Đã xong" : "1 câu hỏi"})
                  </button>
                )}
              </div>

              {/* Tab 1: Content Details */}
              {activeTab === "content" && (
                <div style={{ marginTop: "1.2rem", lineHeight: 1.7, fontSize: "0.96rem", color: "#334155" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.8rem" }}>
                    <span className="page-badge">{lesson.lessonType}</span>
                    <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>{lesson.title}</h3>
                  </div>

                  {/* Formatted Content */}
                  <div style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", whiteSpace: "pre-line" }}>
                    {lesson.content || "Nội dung bài học đang được cập nhật."}
                  </div>
                </div>
              )}

              {/* Tab 2: Interactive Quiz Checkpoint */}
              {activeTab === "quiz" && hasQuestion && (
                <div style={{ marginTop: "1.2rem", background: "#f0f9ff", padding: "1.5rem", borderRadius: "18px", border: "1px solid #bae6fd" }}>
                  <h4 style={{ margin: "0 0 0.8rem 0", color: "#0369a1", fontSize: "1.1rem", fontWeight: 700 }}>
                    ✍️ Thử thách kiểm tra kiến thức bài học
                  </h4>
                  <p style={{ fontWeight: 700, color: "#0f172a", fontSize: "1rem", marginBottom: "1rem" }}>
                    {lesson.checkpointQuestion}
                  </p>

                  <div style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
                    <input
                      type="text"
                      value={checkpointAnswer}
                      onChange={(e) => {
                        setCheckpointAnswer(e.target.value);
                        setQuizChecked(false);
                      }}
                      placeholder="Nhập câu trả lời của bạn..."
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.95rem",
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyQuiz}
                      style={{
                        padding: "10px 18px",
                        borderRadius: "10px",
                        background: "#0284c7",
                        color: "#ffffff",
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Kiểm tra
                    </button>
                  </div>

                  {quizChecked && (
                    <div
                      style={{
                        padding: "1rem",
                        borderRadius: "12px",
                        background: quizSuccess ? "#dcfce7" : "#fee2e2",
                        color: quizSuccess ? "#15803d" : "#b91c1c",
                        border: `1px solid ${quizSuccess ? "#86efac" : "#fca5a5"}`,
                        fontSize: "0.9rem",
                      }}
                    >
                      <strong>{quizSuccess ? "🎉 Chính xác!" : "⚠️ Chưa chính xác!"}</strong>
                      <p style={{ margin: "4px 0 0 0" }}>{lesson.checkpointExplanation || "Hãy đọc lại nội dung ghi chú trong bài giảng để tìm câu trả lời đúng."}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </article>

        {/* Right Action Sidebar */}
        <aside className="student-progress-card">
          <h3>Điều kiện hoàn thành</h3>
          <div className="lesson-condition">
            <span>
              <i style={{ width: `${Math.min(100, contentPercent)}%` }} />
            </span>
            <strong>{Math.min(100, contentPercent).toFixed(0)}%</strong>
          </div>
          <p>
            {isMediaLesson(lesson)
              ? `Đã học: ${formatTime(mediaState.position)}${mediaState.duration ? ` / ${formatTime(mediaState.duration)}` : ""}. `
              : "Đọc gần hết nội dung. "}
            {hasQuestion ? "Cần đạt ít nhất 85% và trả lời đúng câu hỏi." : "Cần đạt ít nhất 85% thời lượng."}
          </p>

          {hasQuestion && !isAlreadyCompleted && (
            <label className="checkpoint-field">
              <span>Câu hỏi nhanh</span>
              <strong>{lesson.checkpointQuestion}</strong>
              <input
                value={checkpointAnswer}
                onChange={(event) => setCheckpointAnswer(event.target.value)}
                placeholder="Nhập câu trả lời"
              />
            </label>
          )}

          {isAlreadyCompleted || completion ? (
            <>
              <div className="lesson-already-completed-badge">✓ Bài học đã hoàn thành</div>
              <div className="lesson-completion-card">
                <strong>
                  {completion?.courseComplete
                    ? "🎉 Bạn đã hoàn thành toàn bộ khóa học!"
                    : `Tiến độ khóa học: ${Number(completion?.progressPercent || courseProgress?.progressPercent || 0).toFixed(0)}%`}
                </strong>
                {completion?.next ? (
                  <button className="page-action-next" type="button" onClick={() => chooseLesson(completion.next)}>
                    Bài tiếp theo →
                  </button>
                ) : (
                  <Link to="/student/progress" className="page-action-next">
                    Xem tổng kết khóa học
                  </Link>
                )}
                <Link to="/student/courses" className="completion-link">
                  ← Quay về lộ trình
                </Link>
              </div>
            </>
          ) : (
            <>
              <button
                className="page-action page-action-primary"
                disabled={!localReady || Boolean(completion)}
                onClick={handleCompleteLesson}
                type="button"
              >
                Hoàn thành bài học
              </button>
              {!localReady && (
                <small className="lesson-helper">
                  {hasQuestion
                    ? "Học ít nhất 85% nội dung và trả lời câu hỏi để tiếp tục."
                    : "Học ít nhất 85% nội dung để hoàn thành."}
                </small>
              )}
            </>
          )}
        </aside>
      </section>
    </div>
  );
}
