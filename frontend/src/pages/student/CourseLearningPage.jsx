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
  const [showHint, setShowHint] = useState(false);

  const contentRef = useRef(null);
  const latestProgressRef = useRef({ percent: 0, position: 0, duration: 0 });

  const lessons = useMemo(() => flattenLessons(chapters), [chapters]);
  const activeIndex = lessons.findIndex((item) => item.id === activeLessonId);
  const activeLesson = lessons[activeIndex];

  // Calculate course completion % from roadmap
  // Counts fully COMPLETED lessons; current in-progress lesson is tracked via contentPercent separately
  const completedCount = useMemo(() => {
    if (!lessons.length) return 0;
    return lessons.filter((l) => l.progressStatus === "COMPLETED").length;
  }, [lessons]);

  const calculatedCoursePct = useMemo(() => {
    if (!lessons.length) return 0;
    return Math.round((completedCount / lessons.length) * 100);
  }, [completedCount, lessons.length]);

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
    if (!courseId) return;
    setError("");
    loadRoadmap(lessonId).catch((err) => setError(err.message || "Không tải được lộ trình học"));
  }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (lessonId) {
      const numId = Number(lessonId);
      if (numId && numId !== activeLessonId) {
        setActiveLessonId(numId);
      }
    }
  }, [lessonId]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (isMediaLesson(lesson)) return undefined; // ONLY apply to text lessons

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

  // Display course progress %:
  // = (completed lessons + current lesson fraction) / total lessons
  // This ensures the ring grows continuously as user progresses through current lesson
  const displayCoursePct = useMemo(() => {
    const apiPct = Number(courseProgress?.progressPercent || 0);
    if (!lessons.length) return apiPct;
    // Current lesson's partial contribution (0..1 of 1 lesson)
    const currentIsCompleted = activeLesson?.progressStatus === "COMPLETED";
    const currentContribution = currentIsCompleted ? 1 : (contentPercent / 100);
    const numerator = completedCount + currentContribution;
    const computed = Math.round((numerator / lessons.length) * 100);
    return Math.min(100, Math.max(apiPct, computed));
  }, [courseProgress, lessons.length, completedCount, activeLesson, contentPercent]);

  // ── Dispatch lesson context to AppShell header ──
  useEffect(() => {
    if (!lesson) return;
    window.dispatchEvent(
      new CustomEvent("lesson-context-update", {
        detail: {
          title: lesson.title || "",
          chapterTitle: activeLesson?.chapterTitle || "",
          percent: displayCoursePct,
          courseId: courseId,
          completedCount: completedCount,
          totalCount: lessons.length,
        },
      })
    );
  }, [lesson, displayCoursePct, activeLesson, courseId, completedCount, lessons.length]);

  return (
    <div className="learning-room-v3">
      {/* Hero card removed – lesson title & progress are now shown in the top header */}

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
            <small className="sidebar-lesson-count">{lessons.length} bài</small>
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

              {/* Tab Content Container (Fixed Height Shell) */}
              <div className="tab-content-area">
                {/* Tab 1: Content Body */}
                {activeTab === "content" && (
                  <div className="lesson-content-body">
                    <div className="lesson-content-header">
                      <span className="lesson-type-pill">
                        {lesson.lessonType}
                      </span>
                      <h3 className="lesson-content-title">
                        {lesson.title}
                      </h3>
                    </div>
                    <div className="lesson-content-text">
                      {lesson.content || "Nội dung bài giảng đang được cập nhật."}
                    </div>
                  </div>
                )}

                {/* Tab 2: Interactive Quiz */}
                {activeTab === "quiz" && hasQuestion && (
                  <div className="quiz-tab-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <h4 className="quiz-tab-heading" style={{ margin: 0 }}>
                        ✍️ Thử thách kiểm tra bài học
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowHint((v) => !v)}
                        style={{
                          background: showHint ? "rgba(245, 158, 11, 0.15)" : "transparent",
                          border: "1px solid rgba(245, 158, 11, 0.4)",
                          color: "#d97706",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        💡 {showHint ? "Ẩn gợi ý" : "Gợi ý"}
                      </button>
                    </div>

                    <p className="quiz-tab-question">
                      {lesson.checkpointQuestion}
                    </p>

                    {showHint && (
                      <div style={{
                        background: "rgba(245, 158, 11, 0.08)",
                        borderLeft: "3px solid #f59e0b",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        color: "var(--text-secondary, #475569)",
                        marginBottom: "1rem"
                      }}>
                        <strong>💡 Gợi ý:</strong> {lesson.checkpointExplanation || "Hãy chú ý đến thời gian hoặc ngữ cảnh câu lệnh trong bài giảng."}
                      </div>
                    )}

                    {/* Choice pills for fast selection */}
                    {lesson.checkpointAnswer && (
                      <div style={{ marginBottom: "1rem" }}>
                        <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600, marginBottom: "6px" }}>
                          LỰA CHỌN GỢI Ý (Bấm để chọn nhanh):
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                          {[
                            lesson.checkpointAnswer,
                            "Present simple",
                            "Past simple",
                            "Present continuous"
                          ].filter((val, idx, self) => self.indexOf(val) === idx).map((choice) => (
                            <button
                              key={choice}
                              type="button"
                              onClick={() => handleAnswerInput(choice)}
                              style={{
                                background: checkpointAnswer === choice ? "#2563eb" : "var(--surface-soft, #f1f5f9)",
                                color: checkpointAnswer === choice ? "#ffffff" : "var(--text-primary, #1e293b)",
                                border: checkpointAnswer === choice ? "1px solid #2563eb" : "1px solid var(--border-color, #cbd5e1)",
                                borderRadius: "8px",
                                padding: "6px 12px",
                                fontSize: "0.85rem",
                                fontWeight: 500,
                                cursor: "pointer",
                                transition: "all 0.15s"
                              }}
                            >
                              {choice}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="quiz-tab-input-row">
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
                        className="quiz-tab-verify-btn"
                      >
                        Kiểm tra
                      </button>
                    </div>

                    {quizChecked && (
                      <div className={`quiz-tab-feedback ${quizSuccess ? "is-correct" : "is-wrong"}`}>
                        <strong>{quizSuccess ? "🎉 Chính xác!" : "⚠️ Chưa chính xác!"}</strong>
                        <p style={{ margin: "4px 0 0 0" }}>{lesson.checkpointExplanation || "Hãy đọc lại nội dung bài giảng để chọn đáp án đúng."}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
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
            <div className="lesson-completed-card">
              <div className="lesson-completed-title">
                ✓ Bài học đã hoàn thành
              </div>
              <p className="lesson-completed-sub">
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
