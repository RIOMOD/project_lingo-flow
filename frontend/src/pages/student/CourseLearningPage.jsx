import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LoadingState } from "../../components/common/UiState";
import LessonMedia from "../../components/common/LessonMedia";
import { getCourseChapters, getLesson } from "../../services/courseService";
import { completeLessonProgress, startLessonProgress, trackLessonProgress } from "../../services/progressService";

const VIDEO_COMPLETE_PERCENT = 90;
const TEXT_COMPLETE_PERCENT = 85;
const SAVE_INTERVAL_MS = 12000;

function flattenLessons(chapters) {
  return chapters.flatMap((chapter) =>
    (chapter.lessons ?? []).map((lesson) => ({
      ...lesson,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
    }))
  );
}

function isVideoLesson(lesson) {
  return Boolean(lesson?.videoUrl);
}

function hasCheckpoint(lesson) {
  return Boolean(lesson?.checkpointQuestion);
}

function lessonTypeLabel(type) {
  switch (type) {
    case "VIDEO":
      return "Video";
    case "AUDIO":
      return "Âm thanh";
    case "MIXED":
      return "Kết hợp";
    default:
      return "Văn bản";
  }
}

export default function CourseLearningPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [courseProgress, setCourseProgress] = useState(null);
  const [contentPercent, setContentPercent] = useState(0);
  const [mediaState, setMediaState] = useState({ position: 0, duration: 0 });
  const [checkpointAnswer, setCheckpointAnswer] = useState("");
  const [loadingRoadmap, setLoadingRoadmap] = useState(true);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const contentRef = useRef(null);
  const dirtyProgressRef = useRef(false);
  const latestProgressRef = useRef({ percent: 0, position: 0, duration: 0 });

  const lessons = useMemo(() => flattenLessons(chapters), [chapters]);
  const activeIndex = lessons.findIndex((item) => item.id === activeLessonId);
  const activeLesson = lessons[activeIndex] ?? null;
  const previousLesson = activeIndex > 0 ? lessons[activeIndex - 1] : null;
  const nextLesson = activeIndex >= 0 ? lessons[activeIndex + 1] : null;
  const requiredPercent = isVideoLesson(lesson) ? VIDEO_COMPLETE_PERCENT : TEXT_COMPLETE_PERCENT;
  const canComplete = contentPercent >= requiredPercent && (!hasCheckpoint(lesson) || checkpointAnswer.trim().length > 0);

  const persistProgress = useCallback(async (snapshot = latestProgressRef.current) => {
    if (!activeLessonId) return null;
    dirtyProgressRef.current = false;
    const progress = await trackLessonProgress(activeLessonId, {
      contentProgressPercent: Math.min(100, snapshot.percent),
      mediaPositionSeconds: snapshot.position,
      mediaDurationSeconds: snapshot.duration,
    });
    setCourseProgress(progress);
    return progress;
  }, [activeLessonId]);

  const refreshRoadmap = useCallback(async () => {
    const data = await getCourseChapters(courseId);
    setChapters(data ?? []);
    return data ?? [];
  }, [courseId]);

  useEffect(() => {
    let mounted = true;
    setLoadingRoadmap(true);
    setError("");
    refreshRoadmap()
      .catch((err) => {
        if (mounted) setError(err.message || "Không tải được lộ trình học.");
      })
      .finally(() => {
        if (mounted) setLoadingRoadmap(false);
      });
    return () => {
      mounted = false;
    };
  }, [refreshRoadmap]);

  useEffect(() => {
    if (lessons.length === 0) return;
    const requestedId = Number(lessonId);
    const selected =
      lessons.find((item) => item.id === requestedId && !item.locked) ||
      lessons.find((item) => !item.locked && item.progressStatus !== "COMPLETED") ||
      lessons.find((item) => !item.locked);

    if (!selected) return;
    setActiveLessonId(selected.id);
    if (String(selected.id) !== String(lessonId)) {
      navigate(`/student/learn/${courseId}/${selected.id}`, { replace: true });
    }
  }, [courseId, lessonId, lessons, navigate]);

  useEffect(() => {
    if (!activeLessonId) return undefined;
    let mounted = true;
    setLoadingLesson(true);
    setLesson(null);
    setError("");
    setMessage("");
    setCheckpointAnswer("");
    dirtyProgressRef.current = false;

    async function loadLesson() {
      const data = await getLesson(courseId, activeLessonId);
      if (!mounted) return;
      const savedPercent = Number(data.contentProgressPercent || 0);
      const savedPosition = Number(data.mediaPositionSeconds || 0);
      latestProgressRef.current = { percent: savedPercent, position: savedPosition, duration: 0 };
      setContentPercent(savedPercent);
      setMediaState({ position: savedPosition, duration: 0 });
      setLesson(data);
      const progress = await startLessonProgress(activeLessonId, {});
      if (mounted) setCourseProgress(progress);
    }

    loadLesson()
      .catch((err) => {
        if (mounted) setError(err.message || "Không thể mở bài học này.");
      })
      .finally(() => {
        if (mounted) setLoadingLesson(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeLessonId, courseId]);

  useEffect(() => {
    if (!activeLessonId) return undefined;
    const timer = window.setInterval(() => {
      if (!dirtyProgressRef.current) return;
      persistProgress().catch((err) => setError(err.message || "Chưa lưu được vị trí học."));
    }, SAVE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [activeLessonId, persistProgress]);

  useEffect(() => {
    if (!lesson || isVideoLesson(lesson)) return undefined;

    function measureReading() {
      const node = contentRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const seen = Math.min(rect.height, Math.max(0, window.innerHeight - rect.top));
      const percent = Math.min(100, Math.max(latestProgressRef.current.percent, (seen / Math.max(1, rect.height)) * 100));
      latestProgressRef.current = { ...latestProgressRef.current, percent };
      dirtyProgressRef.current = true;
      setContentPercent(percent);
    }

    measureReading();
    window.addEventListener("scroll", measureReading, { passive: true });
    return () => window.removeEventListener("scroll", measureReading);
  }, [lesson]);

  const handleMediaProgress = useCallback((state) => {
    const next = {
      percent: Math.max(latestProgressRef.current.percent, Number(state.percent || 0)),
      position: Number(state.position || 0),
      duration: Number(state.duration || 0),
    };
    latestProgressRef.current = next;
    dirtyProgressRef.current = true;
    setContentPercent(Math.min(100, next.percent));
    setMediaState({ position: next.position, duration: next.duration });
  }, []);

  async function chooseLesson(item) {
    if (!item || item.locked || item.id === activeLessonId) return;
    if (dirtyProgressRef.current) {
      persistProgress().catch(() => {});
    }
    setActiveLessonId(item.id);
    navigate(`/student/learn/${courseId}/${item.id}`);
  }

  async function handleCompleteLesson(options = {}) {
    if (!activeLessonId || submitting) return;
    if (!options.force && !canComplete) return;
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const snapshot = options.snapshot ?? latestProgressRef.current;
      await persistProgress(snapshot);
      const progress = await completeLessonProgress(activeLessonId, {
        contentProgressPercent: Math.min(100, snapshot.percent),
        mediaPositionSeconds: snapshot.position,
        mediaDurationSeconds: snapshot.duration,
        checkpointAnswer,
      });
      setCourseProgress(progress);
      const updated = await refreshRoadmap();
      const flat = flattenLessons(updated);
      const index = flat.findIndex((item) => item.id === activeLessonId);
      const next = flat[index + 1];
      setMessage(next ? "Đã hoàn thành bài học. Bạn có thể học bài tiếp theo." : "Bạn đã hoàn thành khóa học.");
    } catch (err) {
      setError(err.message || "Chưa thể hoàn thành bài học.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleMediaEnded() {
    const snapshot = {
      ...latestProgressRef.current,
      percent: 100,
      position: latestProgressRef.current.duration || latestProgressRef.current.position,
    };
    latestProgressRef.current = snapshot;
    setContentPercent(100);
    if (!hasCheckpoint(lesson)) {
      handleCompleteLesson({ force: true, snapshot });
    }
  }

  if (loadingRoadmap) {
    return <LoadingState title="Đang tải phòng học..." />;
  }

  return (
    <div className="student-page learning-room-v2">
      <section className="student-learning-hero">
        <div>
          <span className="page-badge">Phòng học</span>
          <h2>{lesson?.title || "Chọn bài học để bắt đầu"}</h2>
          <p>{activeLesson?.chapterTitle || "Lộ trình khóa học"}</p>
        </div>
        <div className="student-learning-meta">
          <strong>{Number(courseProgress?.progressPercent || 0).toFixed(0)}%</strong>
          <small>Tiến độ khóa học</small>
        </div>
      </section>

      {error && (
        <div className="student-error-state" role="alert">
          <strong>Chưa thể tiếp tục</strong>
          <p>{error}</p>
        </div>
      )}
      {message && <p className="course-success" role="status">{message}</p>}

      <section className="student-learning-shell">
        <aside className="student-lesson-sidebar">
          <h3>Chương và bài học</h3>
          <div className="student-lesson-list">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="student-lesson-group">
                <h4>{chapter.position}. {chapter.title}</h4>
                {(chapter.lessons ?? []).map((item) => (
                  <div className="student-lesson-entry" key={item.id}>
                    <button
                      type="button"
                      className={`student-lesson-button ${item.id === activeLessonId ? "is-active" : ""} ${item.locked ? "is-locked" : ""} ${item.progressStatus === "COMPLETED" ? "is-completed" : ""}`}
                      disabled={item.locked}
                      onClick={() => chooseLesson(item)}
                    >
                      <span>
                        <i aria-hidden="true">{item.progressStatus === "COMPLETED" ? "✓" : item.locked ? "⌁" : "○"}</i>
                        {item.position}. {item.title}
                      </span>
                      <small>{item.progressStatus === "COMPLETED" ? "Đã hoàn thành" : item.locked ? "Chưa mở" : `${item.durationMinutes || 0} phút`}</small>
                    </button>
                    {item.locked && <p className="lesson-lock-reason">{item.lockReason}</p>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </aside>

        <article className="student-lesson-content" ref={contentRef}>
          {loadingLesson && <LoadingState title="Đang tải bài học..." />}
          {!loadingLesson && lesson && (
            <>
              <LessonMedia
                key={lesson.id}
                lesson={lesson}
                resumePosition={Number(lesson.mediaPositionSeconds || 0)}
                onProgress={handleMediaProgress}
                onEnded={handleMediaEnded}
              />
              <div className="student-lesson-actions">
                <button type="button" className="page-action page-action-secondary" disabled={!previousLesson || previousLesson.locked} onClick={() => chooseLesson(previousLesson)}>
                  Bài trước
                </button>
                <button type="button" className="page-action page-action-primary" disabled={!canComplete || submitting} onClick={() => handleCompleteLesson()}>
                  {submitting ? "Đang lưu..." : "Hoàn thành"}
                </button>
                <button type="button" className="page-action page-action-secondary" disabled={!nextLesson || nextLesson.locked} onClick={() => chooseLesson(nextLesson)}>
                  Bài tiếp theo
                </button>
              </div>
              <div className="student-lesson-text">
                <span className="page-badge">{lessonTypeLabel(lesson.lessonType)}</span>
                <h3>Transcript và nội dung bài học</h3>
                <p>{lesson.content || "Nội dung bài học đang được cập nhật."}</p>
                {lesson.audioUrl && (
                  <p>
                    <strong>Tài liệu hoặc âm thanh: </strong>
                    <a href={lesson.audioUrl} target="_blank" rel="noreferrer">Mở tài liệu</a>
                  </p>
                )}
              </div>
            </>
          )}
        </article>

        <aside className="student-progress-card">
          <h3>Tiến độ bài học</h3>
          <div className="lesson-condition">
            <span><i style={{ width: `${Math.min(100, contentPercent)}%` }} /></span>
            <strong>{Math.min(100, contentPercent).toFixed(0)}%</strong>
          </div>
          <p>
            {isVideoLesson(lesson)
              ? `Video cần đạt ít nhất ${VIDEO_COMPLETE_PERCENT}%. Vị trí hiện tại: ${Math.floor(mediaState.position || 0)} giây.`
              : `Nội dung cần đạt ít nhất ${TEXT_COMPLETE_PERCENT}%.`}
          </p>
          {hasCheckpoint(lesson) && (
            <label className="checkpoint-field">
              <span>Câu hỏi nhanh</span>
              <strong>{lesson.checkpointQuestion}</strong>
              <input value={checkpointAnswer} onChange={(event) => setCheckpointAnswer(event.target.value)} placeholder="Nhập câu trả lời" />
            </label>
          )}
          {!canComplete && (
            <small className="lesson-helper">
              Hãy học đủ tiến độ yêu cầu{hasCheckpoint(lesson) ? " và trả lời câu hỏi" : ""} để hoàn thành bài học.
            </small>
          )}
          {nextLesson && !nextLesson.locked && (
            <button type="button" className="page-action page-action-secondary" onClick={() => chooseLesson(nextLesson)}>
              Sang bài tiếp theo
            </button>
          )}
          {!nextLesson && (
            <Link className="page-action page-action-secondary" to="/student/progress">
              Xem tổng kết khóa học
            </Link>
          )}
        </aside>
      </section>
    </div>
  );
}
