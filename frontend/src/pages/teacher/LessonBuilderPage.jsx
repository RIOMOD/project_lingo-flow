import { useCallback, useEffect, useRef, useState } from "react";
import {
  createChapter,
  createLesson,
  deleteChapter,
  deleteLesson,
  getTeacherCourseChapters,
  getTeacherCourses,
  submitCourseReview,
  updateChapter,
  updateLesson,
} from "../../services/courseService";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const LESSON_TYPES = [
  { value: "TEXT", label: "Văn bản" },
  { value: "VIDEO", label: "Video" },
  { value: "AUDIO", label: "Âm thanh" },
  { value: "MIXED", label: "Kết hợp" },
];

const LESSON_STATUS = [
  { value: "DRAFT", label: "Bản nháp" },
  { value: "PUBLISHED", label: "Đã đăng" },
];

function emptyLesson() {
  return {
    title: "",
    lessonType: "TEXT",
    content: "",
    videoUrl: "",
    audioUrl: "",
    position: 1,
    durationMinutes: 10,
    preview: false,
    status: "DRAFT",
  };
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ toasts }) {
  return (
    <div className="lb-toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`lb-toast lb-toast--${t.type}`}>
          {t.type === "success" ? "✓ " : "✕ "}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="lb-overlay">
      <div className="lb-dialog">
        <p className="lb-dialog-msg">{message}</p>
        <div className="lb-dialog-actions">
          <button className="lb-btn lb-btn-ghost" onClick={onCancel}>
            Hủy
          </button>
          <button className="lb-btn lb-btn-danger" onClick={onConfirm}>
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton({ lines = 3 }) {
  return (
    <div className="lb-skeleton-wrap">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="lb-skeleton" style={{ width: `${70 + (i % 3) * 10}%` }} />
      ))}
    </div>
  );
}

// ─── Lesson Form Modal ────────────────────────────────────────────────────────

function LessonFormModal({ chapterTitle, lesson, onSave, onClose, saving }) {
  const [form, setForm] = useState(lesson || emptyLesson());
  const isEdit = !!lesson?.id;

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave(form);
  }

  return (
    <div className="lb-overlay" onClick={onClose}>
      <div className="lb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="lb-modal-header">
          <h3>{isEdit ? "Chỉnh sửa bài học" : "Thêm bài học"}</h3>
          <p className="lb-modal-sub">Chương: {chapterTitle}</p>
          <button className="lb-modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <form className="lb-modal-body" onSubmit={handleSubmit}>
          <div className="lb-field">
            <label className="lb-label">Tên bài học *</label>
            <input
              className="lb-input"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ví dụ: Giới thiệu chủ đề"
              required
            />
          </div>

          <div className="lb-row">
            <div className="lb-field">
              <label className="lb-label">Loại bài học</label>
              <select className="lb-select" value={form.lessonType} onChange={(e) => set("lessonType", e.target.value)}>
                {LESSON_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="lb-field">
              <label className="lb-label">Trạng thái</label>
              <select className="lb-select" value={form.status} onChange={(e) => set("status", e.target.value)}>
                {LESSON_STATUS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {form.lessonType === "VIDEO" && (
            <div className="lb-field">
              <label className="lb-label">Đường dẫn video (URL)</label>
              <input
                className="lb-input"
                type="url"
                value={form.videoUrl}
                onChange={(e) => set("videoUrl", e.target.value)}
                placeholder="https://youtube.com/..."
              />
            </div>
          )}

          {form.lessonType === "AUDIO" && (
            <div className="lb-field">
              <label className="lb-label">Đường dẫn âm thanh (URL)</label>
              <input
                className="lb-input"
                type="url"
                value={form.audioUrl}
                onChange={(e) => set("audioUrl", e.target.value)}
                placeholder="https://..."
              />
            </div>
          )}

          <div className="lb-field">
            <label className="lb-label">Nội dung</label>
            <textarea
              className="lb-textarea"
              rows={5}
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="Nhập nội dung bài học..."
            />
          </div>

          <div className="lb-row">
            <div className="lb-field">
              <label className="lb-label">Thứ tự</label>
              <input
                className="lb-input"
                type="number"
                min={1}
                value={form.position}
                onChange={(e) => set("position", parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="lb-field">
              <label className="lb-label">Thời lượng (phút)</label>
              <input
                className="lb-input"
                type="number"
                min={1}
                value={form.durationMinutes}
                onChange={(e) => set("durationMinutes", parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <label className="lb-checkbox-row">
            <input
              type="checkbox"
              checked={form.preview}
              onChange={(e) => set("preview", e.target.checked)}
            />
            <span>Cho phép xem trước miễn phí</span>
          </label>

          <div className="lb-modal-footer">
            <button type="button" className="lb-btn lb-btn-ghost" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="lb-btn lb-btn-primary" disabled={saving}>
              {saving ? "Đang lưu..." : isEdit ? "Cập nhật bài học" : "Thêm bài học"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Chapter Form ─────────────────────────────────────────────────────────────

function ChapterForm({ courseId, totalChapters, onCreated }) {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const chapter = await createChapter(courseId, {
        title: title.trim(),
        description: "",
        position: totalChapters + 1,
      });
      setTitle("");
      onCreated(chapter);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="lb-add-chapter-form" onSubmit={handleSubmit}>
      <input
        className="lb-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tên chương mới..."
        required
      />
      <button className="lb-btn lb-btn-secondary" disabled={saving}>
        {saving ? "Đang tạo..." : "+ Thêm chương"}
      </button>
    </form>
  );
}

// ─── Lesson Row ───────────────────────────────────────────────────────────────

function LessonRow({ lesson, onEdit, onDelete }) {
  const typeLabel = LESSON_TYPES.find((t) => t.value === lesson.lessonType)?.label ?? lesson.lessonType;
  return (
    <div className="lb-lesson-row" draggable>
      <span className="lb-drag-handle" aria-label="Kéo thả">⠿</span>
      <div className="lb-lesson-info">
        <span className="lb-lesson-title">{lesson.title}</span>
        <div className="lb-lesson-meta">
          <span className="lb-badge lb-badge-type">{typeLabel}</span>
          <span className="lb-badge lb-badge-status">{lesson.status === "PUBLISHED" ? "Đã đăng" : "Nháp"}</span>
          {lesson.durationMinutes && (
            <span className="lb-badge lb-badge-duration">{lesson.durationMinutes} phút</span>
          )}
          {lesson.preview && <span className="lb-badge lb-badge-preview">Xem trước</span>}
        </div>
      </div>
      <div className="lb-row-actions">
        <button className="lb-icon-btn" title="Chỉnh sửa bài học" onClick={() => onEdit(lesson)}>✎</button>
        <button className="lb-icon-btn lb-icon-btn-danger" title="Xóa bài học" onClick={() => onDelete(lesson)}>✕</button>
      </div>
    </div>
  );
}

// ─── Chapter Card ─────────────────────────────────────────────────────────────

function ChapterCard({ chapter, index, onEdit, onDelete, onAddLesson, onLessonEdit, onLessonDelete }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="lb-chapter-card" draggable>
      <div className="lb-chapter-header">
        <span className="lb-drag-handle" aria-label="Kéo thả">⠿</span>
        <span className="lb-chapter-num">Chương {index}</span>
        <button
          className="lb-chapter-title-btn"
          onClick={() => setExpanded((p) => !p)}
          type="button"
        >
          {chapter.title}
          <span className="lb-chevron">{expanded ? "▲" : "▼"}</span>
        </button>
        <div className="lb-row-actions">
          <button className="lb-icon-btn" title="Chỉnh sửa chương" onClick={() => onEdit(chapter)}>✎</button>
          <button className="lb-icon-btn lb-icon-btn-danger" title="Xóa chương" onClick={() => onDelete(chapter)}>✕</button>
        </div>
      </div>

      {expanded && (
        <div className="lb-chapter-body">
          {chapter.lessons && chapter.lessons.length > 0 ? (
            chapter.lessons
              .slice()
              .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
              .map((lesson) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  onEdit={onLessonEdit}
                  onDelete={onLessonDelete}
                />
              ))
          ) : (
            <p className="lb-empty-lessons">Chưa có bài học nào. Thêm bài học để bắt đầu.</p>
          )}
          <button
            className="lb-add-lesson-btn"
            type="button"
            onClick={() => onAddLesson(chapter)}
          >
            + Thêm bài học vào chương này
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Chapter Edit Modal ───────────────────────────────────────────────────────

function ChapterEditModal({ chapter, onSave, onClose, saving }) {
  const [title, setTitle] = useState(chapter.title);
  const [description, setDescription] = useState(chapter.description || "");
  const [position, setPosition] = useState(chapter.position || 1);

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ title: title.trim(), description, position });
  }

  return (
    <div className="lb-overlay" onClick={onClose}>
      <div className="lb-modal lb-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="lb-modal-header">
          <h3>Chỉnh sửa chương</h3>
          <button className="lb-modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="lb-modal-body" onSubmit={handleSubmit}>
          <div className="lb-field">
            <label className="lb-label">Tên chương *</label>
            <input className="lb-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="lb-field">
            <label className="lb-label">Mô tả</label>
            <textarea className="lb-textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="lb-field">
            <label className="lb-label">Thứ tự</label>
            <input className="lb-input" type="number" min={1} value={position} onChange={(e) => setPosition(parseInt(e.target.value) || 1)} />
          </div>
          <div className="lb-modal-footer">
            <button type="button" className="lb-btn lb-btn-ghost" onClick={onClose}>Hủy</button>
            <button type="submit" className="lb-btn lb-btn-primary" disabled={saving}>
              {saving ? "Đang lưu..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LessonBuilderPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [confirm, setConfirm] = useState(null); // { message, onConfirm }
  const [lessonModal, setLessonModal] = useState(null); // { chapter, lesson? }
  const [chapterEditModal, setChapterEditModal] = useState(null); // chapter
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toastIdRef = useRef(0);

  // ── Toasts ────────────────────────────────────────────────────────────────
  const toast = useCallback((message, type = "success") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  // ── Load courses ──────────────────────────────────────────────────────────
  useEffect(() => {
    setCoursesLoading(true);
    getTeacherCourses({ size: 50 })
      .then((data) => setCourses(data?.items ?? []))
      .catch(() => toast("Không tải được danh sách khóa học", "error"))
      .finally(() => setCoursesLoading(false));
  }, [toast]);

  // ── Load chapters when course selected ───────────────────────────────────
  async function loadChapters(courseId) {
    setLoading(true);
    try {
      const data = await getTeacherCourseChapters(courseId);
      setChapters(Array.isArray(data) ? data : []);
    } catch {
      toast("Không tải được chương học", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleCourseChange(e) {
    const id = e.target.value;
    if (!id) {
      setSelectedCourse(null);
      setChapters([]);
      return;
    }
    const course = courses.find((c) => String(c.id) === id);
    setSelectedCourse(course);
    loadChapters(id);
  }

  // ── Create chapter ────────────────────────────────────────────────────────
  function handleChapterCreated(chapter) {
    // Backend returns chapter without lessons array; add empty lessons
    setChapters((prev) => [...prev, { ...chapter, lessons: [] }]);
    toast(`Đã tạo chương "${chapter.title}"`);
  }

  // ── Edit chapter ──────────────────────────────────────────────────────────
  async function handleChapterSave(data) {
    setSaving(true);
    try {
      const updated = await updateChapter(chapterEditModal.id, data);
      setChapters((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...updated, lessons: c.lessons ?? [] } : c))
      );
      toast(`Đã cập nhật chương "${updated.title}"`);
      setChapterEditModal(null);
    } catch (err) {
      toast(err.message || "Lỗi cập nhật chương", "error");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete chapter ────────────────────────────────────────────────────────
  function confirmDeleteChapter(chapter) {
    setConfirm({
      message: `Xóa chương "${chapter.title}"? Tất cả bài học bên trong cũng sẽ bị xóa.`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await deleteChapter(chapter.id);
          setChapters((prev) => prev.filter((c) => c.id !== chapter.id));
          toast(`Đã xóa chương "${chapter.title}"`);
        } catch (err) {
          toast(err.message || "Lỗi xóa chương", "error");
        }
      },
    });
  }

  // ── Create/Edit lesson ────────────────────────────────────────────────────
  async function handleLessonSave(formData) {
    setSaving(true);
    const isEdit = !!lessonModal.lesson?.id;
    try {
      if (isEdit) {
        const updated = await updateLesson(lessonModal.lesson.id, formData);
        setChapters((prev) =>
          prev.map((c) =>
            c.id === lessonModal.chapter.id
              ? { ...c, lessons: c.lessons.map((l) => (l.id === updated.id ? updated : l)) }
              : c
          )
        );
        toast(`Đã cập nhật bài học "${updated.title}"`);
      } else {
        const created = await createLesson(lessonModal.chapter.id, formData);
        setChapters((prev) =>
          prev.map((c) =>
            c.id === lessonModal.chapter.id
              ? { ...c, lessons: [...(c.lessons ?? []), created] }
              : c
          )
        );
        toast(`Đã thêm bài học "${created.title}"`);
      }
      setLessonModal(null);
    } catch (err) {
      toast(err.message || "Lỗi lưu bài học", "error");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete lesson ─────────────────────────────────────────────────────────
  function confirmDeleteLesson(lesson) {
    // Find which chapter owns this lesson
    const chapter = chapters.find((c) => c.lessons?.some((l) => l.id === lesson.id));
    setConfirm({
      message: `Xóa bài học "${lesson.title}"?`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await deleteLesson(lesson.id);
          if (chapter) {
            setChapters((prev) =>
              prev.map((c) =>
                c.id === chapter.id
                  ? { ...c, lessons: c.lessons.filter((l) => l.id !== lesson.id) }
                  : c
              )
            );
          }
          toast(`Đã xóa bài học "${lesson.title}"`);
        } catch (err) {
          toast(err.message || "Lỗi xóa bài học", "error");
        }
      },
    });
  }

  // ── Submit for review ─────────────────────────────────────────────────────
  const hasEnoughContent =
    chapters.length > 0 && chapters.some((c) => c.lessons && c.lessons.length > 0);

  async function handleSubmitReview() {
    if (!selectedCourse) return;
    if (!hasEnoughContent) {
      toast("Khóa học cần ít nhất 1 chương và 1 bài học", "error");
      return;
    }
    setSubmitting(true);
    try {
      await submitCourseReview(selectedCourse.id);
      const updated = { ...selectedCourse, status: "SUBMITTED" };
      setSelectedCourse(updated);
      setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      toast("Đã gửi khóa học để duyệt thành công!");
    } catch (err) {
      toast(err.message || "Lỗi gửi duyệt", "error");
    } finally {
      setSubmitting(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  const canSubmit =
    selectedCourse &&
    (selectedCourse.status === "DRAFT" || selectedCourse.status === "REJECTED") &&
    hasEnoughContent;

  return (
    <div className="lb-page">
      <Toast toasts={toasts} />
      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
      {lessonModal && (
        <LessonFormModal
          chapterTitle={lessonModal.chapter.title}
          lesson={lessonModal.lesson}
          onSave={handleLessonSave}
          onClose={() => setLessonModal(null)}
          saving={saving}
        />
      )}
      {chapterEditModal && (
        <ChapterEditModal
          chapter={chapterEditModal}
          onSave={handleChapterSave}
          onClose={() => setChapterEditModal(null)}
          saving={saving}
        />
      )}

      {/* ── Header ── */}
      <div className="lb-header">
        <div>
          <h1 className="lb-title">Xây dựng nội dung khóa học</h1>
          <p className="lb-subtitle">Quản lý chương và bài học theo thứ tự giảng dạy</p>
        </div>
        <div className="lb-header-actions">
          {selectedCourse && (
            <>
              <a
                href={`/courses/${selectedCourse.slug}`}
                target="_blank"
                rel="noreferrer"
                className="lb-btn lb-btn-ghost"
              >
                👁 Xem trước
              </a>
              <button
                className="lb-btn lb-btn-primary"
                onClick={handleSubmitReview}
                disabled={!canSubmit || submitting}
                title={
                  !hasEnoughContent
                    ? "Cần ít nhất 1 chương và 1 bài học"
                    : selectedCourse.status === "SUBMITTED"
                    ? "Đã gửi duyệt"
                    : ""
                }
              >
                {submitting
                  ? "Đang gửi..."
                  : selectedCourse.status === "SUBMITTED"
                  ? "✓ Đã gửi duyệt"
                  : "Gửi duyệt"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Course Selector ── */}
      <div className="lb-course-selector-card">
        <label className="lb-label">Chọn khóa học để chỉnh sửa nội dung</label>
        {coursesLoading ? (
          <Skeleton lines={1} />
        ) : (
          <select
            className="lb-select lb-course-select"
            value={selectedCourse?.id ?? ""}
            onChange={handleCourseChange}
          >
            <option value="">— Chọn khóa học —</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} [{c.status}]
              </option>
            ))}
          </select>
        )}
        {courses.length === 0 && !coursesLoading && (
          <p className="lb-hint">
            Bạn chưa có khóa học nào.{" "}
            <a href="/teacher/courses/create" className="lb-link">Tạo khóa học mới</a>
          </p>
        )}
      </div>

      {/* ── Curriculum ── */}
      {selectedCourse && (
        <div className="lb-curriculum">
          <div className="lb-curriculum-header">
            <h2 className="lb-curriculum-title">
              {selectedCourse.title}
              <span className={`lb-status-badge lb-status-${selectedCourse.status?.toLowerCase()}`}>
                {selectedCourse.status}
              </span>
            </h2>
            <span className="lb-curriculum-count">
              {chapters.length} chương · {chapters.reduce((s, c) => s + (c.lessons?.length ?? 0), 0)} bài học
            </span>
          </div>

          {loading ? (
            <Skeleton lines={6} />
          ) : (
            <>
              {chapters.length === 0 && (
                <div className="lb-empty-state">
                  <div className="lb-empty-icon">📚</div>
                  <h3>Chưa có chương nào</h3>
                  <p>Tạo chương đầu tiên để bắt đầu xây dựng nội dung khóa học của bạn</p>
                </div>
              )}

              {chapters
                .slice()
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                .map((chapter, idx) => (
                  <ChapterCard
                    key={chapter.id}
                    chapter={chapter}
                    index={idx + 1}
                    onEdit={(c) => setChapterEditModal(c)}
                    onDelete={confirmDeleteChapter}
                    onAddLesson={(c) => setLessonModal({ chapter: c, lesson: null })}
                    onLessonEdit={(lesson) => {
                      const ch = chapters.find((c) => c.lessons?.some((l) => l.id === lesson.id));
                      setLessonModal({ chapter: ch, lesson });
                    }}
                    onLessonDelete={confirmDeleteLesson}
                  />
                ))}

              <ChapterForm
                courseId={selectedCourse.id}
                totalChapters={chapters.length}
                onCreated={handleChapterCreated}
              />
            </>
          )}
        </div>
      )}

      {!selectedCourse && !coursesLoading && courses.length > 0 && (
        <div className="lb-empty-state lb-empty-state-center">
          <div className="lb-empty-icon">🎓</div>
          <h3>Chọn một khóa học để bắt đầu</h3>
          <p>Chọn khóa học từ danh sách trên để quản lý chương và bài học</p>
        </div>
      )}
    </div>
  );
}
