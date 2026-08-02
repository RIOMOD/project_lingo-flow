import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import LessonMedia from "../../components/common/LessonMedia";
import { LoadingState } from "../../components/common/UiState";
import { useToast } from "../../context/ToastContext";
import { getCourseChapters, getLesson } from "../../services/courseService";
import { completeLessonProgress, startLessonProgress, trackLessonProgress } from "../../services/progressService";
import "../../styles/LearningRoom.css";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
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

function normalizeAnswer(str) {
  if (!str) return "";
  return str.trim().toLowerCase().replace(/\s+/g, " ");
}

function answersMatch(submitted, expected) {
  if (!expected || expected.trim() === "") return true;
  const norm = normalizeAnswer(submitted);
  const exp = normalizeAnswer(expected);
  if (!norm) return false;
  return norm === exp || norm.includes(exp) || exp.includes(norm);
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
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
  const [isSwitching, setIsSwitching] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [activeTab, setActiveTab] = useState("content");

  const contentRef = useRef(null);
  const latestProgressRef = useRef({ percent: 0, position: 0, duration: 0 });

  const lessons = useMemo(() => flattenLessons(chapters), [chapters]);
  const activeIndex = lessons.findIndex((item) => item.id === activeLessonId);
  const activeLesson = lessons[activeIndex];

  // Calculate course completion % from roadmap
  const calculatedCoursePct = useMemo(() => {
    if (!lessons.length) return 0;
    const completedCount = lessons.filter((l) => l.progressStatus === "COMPLETED").length;
    return Math.round((completedCount / lessons.length) * 100);
  }, [lessons]);

  // ── Load roadmap ──────────────────────────────────────────
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

  const reloadAndGoTo = useCallback(
    async (targetLessonId) => {
      try {
        const data = await getCourseChapters(courseId);
        const safe = data ?? [];
        setChapters(safe);
        setActiveLessonId(targetLessonId);
        navigate(`/student/learn/${courseId}/${targetLessonId}`, { replace: false });
      } catch {
        toast.error("Không thể tải lộ trình học. Vui lòng thử lại.");
      }
    },
    [courseId, navigate, toast]
  );

  useEffect(() => {
    setError("");
    loadRoadmap(lessonId).catch((err) => setError(err.message || "Không tải được lộ trình học"));
  }, [lessonId, loadRoadmap]);

  // ── Load lesson detail ────────────────────────────────────
  useEffect(() => {
    if (!activeLessonId) return;
    let mounted = true;

    if (!lesson) {
      setLoadingLesson(true);
    } else {
      setIsSwitching(true);
    }

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

        let initialPercent;
        if (isCompleted) {
          initialPercent = 100;
        } else if (isMedia) {
          const pos = Number(data.mediaPositionSeconds || 0);
          const dur = Number(data.mediaDurationSeconds || 0);
          initialPercent = dur > 0 ? Math.min(100, (pos / dur) * 100) : 0;
        } else {
          initialPercent = 0;
        }

        const savedPosition = Number(data.mediaPositionSeconds || 0);
        const fallbackDur = (Number(data.durationMinutes) || 20) * 60;
        const savedDuration = Number(data.mediaDurationSeconds || 0) > 0
          ? Number(data.mediaDurationSeconds)
          : fallbackDur;

        setContentPercent(initialPercent);
        setMediaState({ position: savedPosition, duration: savedDuration });
        latestProgressRef.current = {
          percent: initialPercent,
          position: savedPosition,
          duration: savedDuration,
        };

        if (data.checkpointPassed) {
          setQuizSuccess(true);
        }

        try {
          const progress = await startLessonProgress(activeLessonId, {});
          if (mounted) setCourseProgress(progress);
        } catch (startErr) {
          if (mounted && startErr?.message) {
            console.warn("[CourseLearning] startLesson warning:", startErr.message);
          }
        }
      })
      .catch((err) => {
        if (mounted) {
          const msg = err.message || "Không thể mở bài học này";
          setError(msg);
          if (msg.includes("Hoàn thành bài") || msg.includes("locked") || msg.includes("quyền")) {
            toast.error(msg);
          }
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingLesson(false);
          setIsSwitching(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [courseId, activeLessonId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync progress with server every 10s ────────────────────
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
        console.warn("[CourseLearning] trackLesson warning:", err.message);
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

  // ── Reading & Active time ticker progress ─────────────────
  useEffect(() => {
    if (!lesson) return undefined;

    function measureReading() {
      const node = contentRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const total = Math.max(1, rect.height);
      const seen = Math.min(total, Math.max(0, window.innerHeight - rect.top));
      const percent = Math.min(100, (seen / total) * 100);
      setContentPercent((current) => {
        const next = Math.max(current, percent);
        latestProgressRef.current.percent = Math.max(latestProgressRef.current.percent, next);
        return next;
      });
    }
    measureReading();
    window.addEventListener("scroll", measureReading, { passive: true });

    // Ticker: +5% every 3 seconds spent actively on page
    const timeTicker = window.setInterval(() => {
      setContentPercent((current) => {
        if (current >= 100) return 100;
        const next = Math.min(100, current + 5);
        latestProgressRef.current.percent = Math.max(latestProgressRef.current.percent, next);
        return next;
      });
    }, 3000);

    return () => {
      window.removeEventListener("scroll", measureReading);
      window.clearInterval(timeTicker);
    };
  }, [lesson]);

  // ── Media progress callback ───────────────────────────────
  const handleMediaProgress = useCallback(
    (state) => {
      const isCompleted = activeLesson?.progressStatus === "COMPLETED";
      const rawPercent = state.percent || 0;
      const nextPercent = isCompleted ? 100 : Math.min(100, rawPercent);
      const nextPos = state.position || 0;
      const fallbackDur = (lesson?.durationMinutes || 20) * 60;
      const nextDur = state.duration > 0 ? state.duration : fallbackDur;

      setContentPercent((current) => {
        const best = Math.max(current, nextPercent);
        latestProgressRef.current = { percent: best, position: nextPos, duration: nextDur };
        return best;
      });

      setMediaState((prev) => ({
        position: Math.max(prev.position, nextPos),
        duration: nextDur,
      }));
    },
    [activeLesson, lesson]
  );

  function chooseLesson(item) {
    if (item.locked) {
      toast.error(item.lockReason || "Hoàn thành bài trước để mở khóa bài này.");
      return;
    }
    if (item.id === activeLessonId) return;
    persistProgress();
    setActiveLessonId(item.id);
    navigate(`/student/learn/${courseId}/${item.id}`, { replace: true });
  }

  // Handle answer input change with real-time matching
  const handleAnswerInput = (value) => {
    setCheckpointAnswer(value);
    setError(""); // Clear previous inline error when user re-types
    if (lesson?.checkpointAnswer) {
      const isMatch = answersMatch(value, lesson.checkpointAnswer);
      setQuizSuccess(isMatch);
      if (isMatch) {
        setQuizChecked(true);
      }
    }
  };

  const handleVerifyQuiz = () => {
    if (!checkpointAnswer.trim()) {
      toast.error("Vui lòng nhập câu trả lời trước khi kiểm tra!");
      return;
    }
    setQuizChecked(true);
    const matched = answersMatch(checkpointAnswer, lesson?.checkpointAnswer);
    setQuizSuccess(matched);
    if (matched) {
      toast.success("Chính xác! Đáp án hoàn toàn đúng 🎉");
    } else {
      toast.error("Chưa chính xác, hãy thử lại!");
    }
  };

  async function handleCompleteLesson() {
    if (completing) return;
    setError("");
    setMessage("");
    setCompleting(true);
    try {
      const finalPercent = Math.max(85, latestProgressRef.current.percent || 100);
      const payload = {
        contentProgressPercent: finalPercent,
        mediaPositionSeconds: latestProgressRef.current.position,
        mediaDurationSeconds: latestProgressRef.current.duration,
        checkpointAnswer: checkpointAnswer.trim(),
      };
      const progress = await completeLessonProgress(activeLessonId, payload);
      setCourseProgress(progress);
      setMessage("Bạn đã hoàn thành bài học 🎉");

      const updatedData = await getCourseChapters(courseId);
      const updatedChapters = updatedData ?? [];
      setChapters(updatedChapters);
      const flat = flattenLessons(updatedChapters);
      const index = flat.findIndex((item) => item.id === activeLessonId);
      const next = flat[index + 1] ?? null;

      setCompletion({
        next: next,
        courseComplete: !next,
        progressPercent: progress.progressPercent,
      });
    } catch (err) {
      const msg = err.message || "Chưa thể hoàn thành bài học";
      setError(msg);
      // Display inline error nicely instead of toast spam
    } finally {
      setCompleting(false);
    }
  }

  async function handleGoToNext() {
    if (!completion?.next) return;
    await reloadAndGoTo(completion.next.id);
    setCompletion(null);
    setMessage("");
  }

  // ── Derived state for checklist ───────────────────────────
  const hasQuestion = Boolean(
    lesson?.checkpointQuestion && lesson.checkpointQuestion.trim().length > 0
  );
  const isAlreadyCompleted = activeLesson?.progressStatus === "COMPLETED";

  const step1Done = isAlreadyCompleted || contentPercent >= 85;
  // Step 2 is ONLY done if completed, or no question, or answer matches expected answer
  const step2Done =
    isAlreadyCompleted ||
    !hasQuestion ||
    quizSuccess ||
    answersMatch(checkpointAnswer, lesson?.checkpointAnswer);

  const localReady = step1Done && step2Done;

  // Display course progress % (take max of API response and calculated)
  const displayCoursePct = Math.max(
    Number(courseProgress?.progressPercent || 0),
    calculatedCoursePct
  );

  return (
    <div className="learning-room-v3">
      {/* ── Hero Card ── */}
      <section className="learning-hero-card">
        <div className="hero-left">
          <div className="hero-badge-pill">
            <span>✨ PHÒNG HỌC LINGOFLOW</span>
          </div>
          <h2 className="hero-title">{lesson?.title || "Đang mở bài học..."}</h2>
          <p className="hero-subtitle">
            📚 {activeLesson?.chapterTitle || "Khóa học chính thức"}
          </p>
        </div>
        <div className="hero-progress-ring">
          <div className="hero-progress-value">{displayCoursePct}%</div>
          <div className="hero-progress-label">Tiến độ khóa học</div>
        </div>
      </section>

      {error && (
        <div style={{ padding: "1rem 1.25rem", background: "#fef2f2", color: "#b91c1c", border: "1px solid #fca5a5", borderRadius: "14px", marginBottom: "1rem", fontWeight: 600, fontSize: "0.92rem", lineHeight: 1.5 }}>
          <strong>Chưa thể tiếp tục:</strong> {error}
        </div>
      )}
      {message && (
        <div style={{ padding: "1rem 1.25rem", background: "#f0fdf4", color: "#15803d", border: "1px solid #86efac", borderRadius: "14px", marginBottom: "1rem", fontWeight: 700 }}>
          {message}
        </div>
      )}

      {/* ── Main Layout Grid ── */}
      <div className="learning-layout-grid">
        {/* ── Left Sidebar (Roadmap Accordion) ── */}
        <aside className="learning-sidebar-card">
          <div className="sidebar-heading">
            <span>📖 Lộ trình khóa học</span>
            <small style={{ color: "#64748b", fontWeight: 600 }}>{lessons.length} bài</small>
          </div>
          <div>
            {chapters.map((chapter) => (
              <div key={chapter.id} className="roadmap-chapter-group">
                <div className="chapter-title-tag">
                  Chương {chapter.position}: {chapter.title}
                </div>
                {(chapter.lessons ?? []).map((item) => {
                  const isActive = item.id === activeLessonId;
                  const isDone = item.progressStatus === "COMPLETED";
                  const isLocked = item.locked;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={isLocked}
                      onClick={() => chooseLesson(item)}
                      className={`roadmap-lesson-item ${isActive ? "is-active" : ""} ${isDone ? "is-completed" : ""} ${isLocked ? "is-locked" : ""}`}
                    >
                      <div className="lesson-item-left">
                        <div className="lesson-status-icon">
                          {isDone ? "✓" : isLocked ? "🔒" : isActive ? "▶" : "○"}
                        </div>
                        <div>
                          <div className="lesson-item-title">{item.position}. {item.title}</div>
                          <div className="lesson-item-duration">
                            {isDone ? "Đã hoàn thành" : isLocked ? "Chưa mở" : `${item.durationMinutes || 0} phút`}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* ── Middle Panel (Media Player & Lesson Notes) ── */}
        <article
          className="learning-main-card"
          ref={contentRef}
          style={{
            opacity: isSwitching ? 0.78 : 1,
            transition: "opacity 0.18s ease",
          }}
        >
          {loadingLesson && !lesson ? (
            <LoadingState title="Đang tải bài học..." />
          ) : lesson ? (
            <>
              {/* Lesson Media Component */}
              <LessonMedia
                lesson={lesson}
                resumePosition={Number(lesson.mediaPositionSeconds || 0)}
                onProgress={handleMediaProgress}
              />

              {/* Nav Tabs */}
              <div className="content-tabs-nav">
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "content" ? "is-active" : ""}`}
                  onClick={() => setActiveTab("content")}
                >
                  📖 Bài giảng & Ghi chú
                </button>
                {hasQuestion && (
                  <button
                    type="button"
                    className={`tab-btn ${activeTab === "quiz" ? "is-active" : ""}`}
                    onClick={() => setActiveTab("quiz")}
                  >
                    ✍️ Kiểm tra nhanh ({quizSuccess ? "✓ Đã xong" : "1 câu hỏi"})
                  </button>
                )}
              </div>

              {/* Tab 1: Content Body */}
              {activeTab === "content" && (
                <div style={{ lineHeight: 1.75, color: "#334155" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
                    <span style={{ padding: "4px 10px", background: "#e0f2fe", color: "#0284c7", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 800 }}>
                      {lesson.lessonType}
                    </span>
                    <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>
                      {lesson.title}
                    </h3>
                  </div>
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "1.5rem", whiteSpace: "pre-line", fontSize: "0.98rem" }}>
                    {lesson.content || "Nội dung bài giảng đang được cập nhật."}
                  </div>
                </div>
              )}

              {/* Tab 2: Interactive Quiz */}
              {activeTab === "quiz" && hasQuestion && (
                <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "16px", padding: "1.5rem" }}>
                  <h4 style={{ margin: "0 0 0.8rem 0", color: "#0369a1", fontSize: "1.05rem", fontWeight: 800 }}>
                    ✍️ Thử thách kiểm tra bài học
                  </h4>
                  <p style={{ fontWeight: 700, color: "#0f172a", fontSize: "1rem", marginBottom: "1rem" }}>
                    {lesson.checkpointQuestion}
                  </p>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "1rem", width: "100%", boxSizing: "border-box" }}>
                    <input
                      type="text"
                      className="checkpoint-input-field"
                      style={{ flex: 1, minWidth: 0 }}
                      value={checkpointAnswer}
                      onChange={(e) => handleAnswerInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleVerifyQuiz()}
                      placeholder="Nhập câu trả lời của bạn..."
                    />
                    <button
                      type="button"
                      onClick={handleVerifyQuiz}
                      style={{ padding: "10px 20px", background: "#0284c7", color: "#ffffff", fontWeight: 800, border: "none", borderRadius: "10px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
                    >
                      Kiểm tra
                    </button>
                  </div>
                  {quizChecked && (
                    <div style={{ padding: "1rem", borderRadius: "12px", background: quizSuccess ? "#dcfce7" : "#fee2e2", color: quizSuccess ? "#15803d" : "#b91c1c", border: `1px solid ${quizSuccess ? "#86efac" : "#fca5a5"}`, fontSize: "0.9rem" }}>
                      <strong>{quizSuccess ? "🎉 Chính xác!" : "⚠️ Chưa chính xác!"}</strong>
                      <p style={{ margin: "4px 0 0 0" }}>{lesson.checkpointExplanation || "Hãy đọc lại nội dung bài giảng để chọn đáp án đúng."}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </article>

        {/* ── Right Panel (Completion Checklist & Actions) ── */}
        <aside className="learning-progress-panel">
          <div className="panel-header-title">
            <span>🎯 Điều kiện hoàn thành</span>
          </div>

          {/* Progress Gauge */}
          <div className="progress-guage-box">
            <div className="guage-header">
              <span className="guage-label">Tiến độ bài học</span>
              <span className="guage-pct">{Math.min(100, contentPercent).toFixed(0)}%</span>
            </div>
            <div className="guage-track">
              <div className="guage-fill" style={{ width: `${Math.min(100, contentPercent)}%` }} />
            </div>
            <p className="guage-subtext">
              {isMediaLesson(lesson)
                ? `Thời lượng: ${formatTime(mediaState.position)} / ${formatTime(mediaState.duration || (lesson?.durationMinutes || 20) * 60)}`
                : "Đọc xong nội dung bài học"}
            </p>
          </div>

          {/* Checklist Steps */}
          <div className="checklist-steps-list">
            <div className={`step-row-item ${step1Done ? "is-done" : "is-pending"}`}>
              <div className="step-badge-icon">{step1Done ? "✓" : "1"}</div>
              <div className="step-content-body">
                <div className="step-title-text">
                  {isMediaLesson(lesson) ? "Xem Video / Bài giảng" : "Đọc nội dung bài học"}
                </div>
                <div className="step-desc-text">
                  {step1Done ? "Đã đạt trên 85% thời lượng" : `Cần học ít nhất 85% (hiện tại: ${contentPercent.toFixed(0)}%)`}
                </div>
              </div>
            </div>

            {hasQuestion && (
              <div className={`step-row-item ${step2Done ? "is-done" : "is-pending"}`}>
                <div className="step-badge-icon">{step2Done ? "✓" : "2"}</div>
                <div className="step-content-body">
                  <div className="step-title-text">Trả lời câu hỏi kiểm tra</div>
                  <div className="step-desc-text">
                    {step2Done
                      ? "Đã trả lời đúng"
                      : checkpointAnswer.trim().length > 0
                      ? "Đã nhập đáp án (chưa đúng)"
                      : "Bắt buộc nhập đáp án chính xác"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Question Input Box (Right Panel) */}
          {hasQuestion && !isAlreadyCompleted && !completion && (
            <div className="panel-checkpoint-box">
              <span className="checkpoint-title-label">✍️ Câu hỏi nhanh</span>
              <span className="checkpoint-q-text">{lesson.checkpointQuestion}</span>
              <input
                type="text"
                className="checkpoint-input-field"
                value={checkpointAnswer}
                onChange={(e) => handleAnswerInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyQuiz()}
                placeholder="Nhập câu trả lời..."
              />
            </div>
          )}

          {/* Completion Button & Card */}
          {isAlreadyCompleted || completion ? (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "16px", padding: "1.25rem", textAlign: "center" }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#15803d", marginBottom: "0.5rem" }}>
                ✓ Bài học đã hoàn thành
              </div>
              <p style={{ fontSize: "0.85rem", color: "#166534", margin: "0 0 1rem 0" }}>
                {completion?.courseComplete
                  ? "🎉 Chúc mừng bạn đã hoàn thành toàn bộ khóa học!"
                  : `Tiến độ khóa học: ${Number(completion?.progressPercent || displayCoursePct).toFixed(0)}%`}
              </p>
              {completion?.next ? (
                <button
                  type="button"
                  className="btn-complete-lesson is-ready"
                  onClick={handleGoToNext}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Bài tiếp theo →
                </button>
              ) : (
                <Link to="/student/progress" className="btn-complete-lesson is-ready" style={{ textDecoration: "none", width: "100%", justifyContent: "center" }}>
                  🏆 Xem tổng kết khóa học
                </Link>
              )}
            </div>
          ) : (
            <>
              <button
                type="button"
                className={`btn-complete-lesson ${localReady ? "is-ready" : "is-disabled"}`}
                disabled={!localReady || completing}
                onClick={handleCompleteLesson}
              >
                {completing
                  ? "Đang lưu..."
                  : localReady
                  ? "🎉 Hoàn thành bài học"
                  : !step1Done
                  ? "Học thêm video (đạt 85%)"
                  : checkpointAnswer.trim().length > 0
                  ? "Trả lời đúng câu hỏi để tiếp tục"
                  : "Vui lòng nhập câu trả lời"}
              </button>
              {!localReady && (
                <div className="completion-hint-text">
                  {!step1Done
                    ? "Học ít nhất 85% nội dung để tiếp tục."
                    : "Nhập câu trả lời đúng vào ô phía trên để kích hoạt nút."}
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
