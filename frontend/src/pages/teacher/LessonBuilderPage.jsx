import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import CourseWorkflowStepper from "../../components/teacher/CourseWorkflowStepper";
import { useToast } from "../../context/ToastContext";
import {
  createChapter,
  createLesson,
  deleteChapter,
  deleteLesson,
  getTeacherCourseById,
  getTeacherCourseChapters,
  getTeacherCourses,
  updateChapter,
  updateLesson,
} from "../../services/courseService";
import {
  canTeacherEditCourse,
  courseStatusLabel,
  courseTypeLabel,
  formatMoney,
  lessonStatusLabel,
  lessonTypeLabel,
  levelLabel,
} from "../../utils/courseWorkflow";

const emptyLesson = {
  title: "",
  lessonType: "TEXT",
  content: "",
  audioUrl: "",
  videoUrl: "",
  position: 1,
  durationMinutes: 10,
  preview: false,
  status: "DRAFT",
};

function getCourseLoadErrorMessage(error) {
  if (error?.status === 404) {
    return "Không tìm thấy khóa học.";
  }
  if (error?.status === 403) {
    return "Bạn không có quyền quản lý khóa học này.";
  }
  if (error?.status === 401) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  }
  return "Không tải được nội dung khóa học. Vui lòng thử lại sau.";
}

function StepHint({ course }) {
  return (
    <div className="page-panel-card" style={{ marginBottom: "1rem" }}>
      <p className="page-description" style={{ margin: 0 }}>
        Tiến độ hoàn thiện hiện tại: <strong>{course.completionPercent ?? 0}%</strong>. Trạng thái khóa học:{" "}
        <strong>{courseStatusLabel(course.status)}</strong>.
      </p>
      {course.lastRejectedReason && (
        <p className="auth-error" style={{ marginTop: "0.75rem" }}>
          Lý do từ chối gần nhất: {course.lastRejectedReason}
        </p>
      )}
    </div>
  );
}

function CourseSelector({ courses }) {
  return (
    <div className="page-panel-card">
      <h3 style={{ marginTop: 0 }}>Chọn khóa học để quản lý nội dung</h3>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {courses.map((course) => (
          <div
            key={course.id}
            style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}
          >
            <div>
              <strong>{course.title}</strong>
              <p style={{ margin: "0.25rem 0 0", color: "#475569" }}>
                {levelLabel(course.level)} · {courseTypeLabel(course.courseType)} · {courseStatusLabel(course.status)}
              </p>
            </div>
            <Link className="page-action page-action-primary" to={`/teacher/courses/${course.id}/content`}>
              Quản lý nội dung
            </Link>
          </div>
        ))}
        {courses.length === 0 && <p className="page-description">Bạn chưa có khóa học nào để xây dựng nội dung.</p>}
      </div>
    </div>
  );
}

function ChapterEditor({ chapter, onSave, onCancel, saving }) {
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: chapter?.title || "",
    description: chapter?.description || "",
    position: chapter?.position || 1,
  });

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Vui lòng nhập tên chương.");
      return;
    }
    if (Number(form.position || 0) <= 0) {
      setError("Thứ tự hiển thị phải lớn hơn 0.");
      return;
    }
    onSave({
      title: form.title.trim(),
      description: form.description,
      position: Number(form.position || 1),
    });
  }

  return (
    <form className="page-panel-card teacher-content-form teacher-content-form-chapter" onSubmit={handleSubmit}>
      <h3>{chapter?.id ? "Cập nhật chương" : "Thêm chương mới"}</h3>
      {error && <p className="auth-error teacher-content-form-error">{error}</p>}
      <label className="teacher-content-field">
        Tên chương
        <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
      </label>
      <label className="teacher-content-field">
        Thứ tự hiển thị
        <input
          type="number"
          min="1"
          value={form.position}
          onChange={(event) => setForm((current) => ({ ...current, position: event.target.value }))}
        />
      </label>
      <label className="teacher-content-field teacher-content-field-full">
        Mô tả chương
        <textarea rows="3" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
      </label>
      <div className="teacher-content-form-actions">
        <button className="page-action page-action-primary" disabled={saving}>
          {saving ? "Đang lưu..." : chapter?.id ? "Lưu chương" : "Thêm chương"}
        </button>
        <button type="button" className="page-action page-action-secondary" onClick={onCancel}>
          Hủy
        </button>
      </div>
    </form>
  );
}

function LessonEditor({ chapterTitle, lesson, onSave, onCancel, saving }) {
  const [error, setError] = useState("");
  const [form, setForm] = useState(lesson || emptyLesson);
  const lessonType = form.lessonType || "TEXT";
  const showVideoUrl = lessonType === "VIDEO" || lessonType === "MIXED";
  const showAudioUrl = lessonType === "AUDIO" || lessonType === "MIXED";

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateLessonType(value) {
    setForm((current) => ({
      ...current,
      lessonType: value,
      videoUrl: value === "VIDEO" || value === "MIXED" ? current.videoUrl : "",
      audioUrl: value === "AUDIO" || value === "MIXED" ? current.audioUrl : "",
    }));
    setError("");
  }

  function validateLessonForm() {
    const content = form.content?.trim() || "";
    const videoUrl = form.videoUrl?.trim() || "";
    const audioUrl = form.audioUrl?.trim() || "";

    if (!form.title?.trim()) {
      return "Vui lòng nhập tên bài học.";
    }
    if (Number(form.durationMinutes || 0) <= 0) {
      return "Thời lượng phải lớn hơn 0.";
    }
    if (Number(form.position || 0) <= 0) {
      return "Thứ tự hiển thị phải lớn hơn 0.";
    }
    if (lessonType === "TEXT" && !content) {
      return "Bài học văn bản bắt buộc có nội dung.";
    }
    if (lessonType === "VIDEO" && !videoUrl && !content) {
      return "Bài học video cần URL video hoặc nội dung mô tả.";
    }
    if (lessonType === "AUDIO" && !audioUrl && !content) {
      return "Bài học âm thanh cần URL âm thanh hoặc transcript/nội dung.";
    }
    if (lessonType === "MIXED" && !content && !videoUrl && !audioUrl) {
      return "Bài học kết hợp cần ít nhất một nội dung, URL video hoặc URL âm thanh.";
    }
    return "";
  }

  function buildLessonPayload() {
    const payload = {
      title: form.title.trim(),
      lessonType,
      content: form.content?.trim() || "",
      position: Number(form.position || 1),
      durationMinutes: Number(form.durationMinutes || 0),
      preview: Boolean(form.preview),
      status: form.status,
    };

    if (showVideoUrl) {
      payload.videoUrl = form.videoUrl?.trim() || "";
    }
    if (showAudioUrl) {
      payload.audioUrl = form.audioUrl?.trim() || "";
    }

    return payload;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateLessonForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    onSave(buildLessonPayload());
  }

  return (
    <form className="page-panel-card teacher-content-form teacher-content-form-lesson" onSubmit={handleSubmit}>
      <h3>{lesson?.id ? "Cập nhật bài học" : "Thêm bài học mới"}</h3>
      <p className="page-description teacher-content-form-subtitle">Chương: {chapterTitle}</p>
      {error && <p className="auth-error teacher-content-form-error">{error}</p>}
      <label className="teacher-content-field teacher-content-field-full">
        Tên bài học
        <input value={form.title} onChange={(event) => updateField("title", event.target.value)} required />
      </label>
      <label className="teacher-content-field">
        Loại bài học
        <select value={lessonType} onChange={(event) => updateLessonType(event.target.value)}>
          <option value="TEXT">Văn bản</option>
          <option value="VIDEO">Video</option>
          <option value="AUDIO">Âm thanh</option>
          <option value="MIXED">Kết hợp</option>
        </select>
      </label>
      <label className="teacher-content-field">
        Trạng thái hoàn thiện
        <select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
          <option value="DRAFT">Bản nháp</option>
          <option value="PUBLISHED">Hoàn thiện</option>
          <option value="HIDDEN">Đang ẩn</option>
        </select>
      </label>
      <label className="teacher-content-field teacher-content-field-full">
        {lessonType === "AUDIO" ? "Transcript hoặc nội dung" : lessonType === "VIDEO" ? "Nội dung mô tả" : "Nội dung bài học"}
        <textarea rows="5" value={form.content} onChange={(event) => updateField("content", event.target.value)} />
      </label>
      {showVideoUrl && (
        <label className="teacher-content-field">
          URL video
          <input value={form.videoUrl} onChange={(event) => updateField("videoUrl", event.target.value)} placeholder="https://..." />
        </label>
      )}
      {showAudioUrl && (
        <label className="teacher-content-field">
          URL âm thanh hoặc tài liệu
          <input value={form.audioUrl} onChange={(event) => updateField("audioUrl", event.target.value)} placeholder="https://..." />
        </label>
      )}
      <label className="teacher-content-field">
        Thời lượng (phút)
        <input
          type="number"
          min="1"
          value={form.durationMinutes}
          onChange={(event) => updateField("durationMinutes", event.target.value)}
        />
      </label>
      <label className="teacher-content-field">
        Thứ tự hiển thị
        <input type="number" min="1" value={form.position} onChange={(event) => updateField("position", event.target.value)} />
      </label>
      <label className="teacher-content-checkbox teacher-content-field-full">
        <input type="checkbox" checked={Boolean(form.preview)} onChange={(event) => updateField("preview", event.target.checked)} />
        Cho phép xem thử
      </label>
      <div className="teacher-content-form-actions">
        <button className="page-action page-action-primary" disabled={saving}>
          {saving ? "Đang lưu..." : lesson?.id ? "Lưu bài học" : "Thêm bài học"}
        </button>
        <button type="button" className="page-action page-action-secondary" onClick={onCancel}>
          Hủy
        </button>
      </div>
    </form>
  );
}

export default function LessonBuilderPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);

  const editable = canTeacherEditCourse(course);

  useEffect(() => {
    if (courseId) {
      return;
    }

    getTeacherCourses({ size: 100 })
      .then((data) => setCourses(data?.items ?? []))
      .catch((err) => setError(err.message || "Không tải được danh sách khóa học."));
  }, [courseId]);

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    async function loadContent() {
      setLoading(true);
      setError("");
      try {
        const [courseDetail, chapterData] = await Promise.all([
          getTeacherCourseById(courseId),
          getTeacherCourseChapters(courseId),
        ]);
        setCourse(courseDetail);
        setChapters(chapterData ?? []);
      } catch (err) {
        setError(getCourseLoadErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, [courseId]);

  useEffect(() => {
    if (location.state?.createdCourseId) {
      toast.success("Đã tạo khóa học. Hãy thêm chương và bài học trước khi gửi duyệt.");
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state?.createdCourseId, navigate, toast]);

  const totalLessons = useMemo(
    () => chapters.reduce((total, chapter) => total + (chapter.lessons?.length ?? 0), 0),
    [chapters]
  );

  async function reloadCourse() {
    if (!courseId) return;
    const [courseDetail, chapterData] = await Promise.all([
      getTeacherCourseById(courseId),
      getTeacherCourseChapters(courseId),
    ]);
    setCourse(courseDetail);
    setChapters(chapterData ?? []);
  }

  async function handleSaveChapter(payload) {
    if (!course) return;
    setSaving(true);
    try {
      if (editingChapter?.id) {
        await updateChapter(editingChapter.id, payload);
        toast.success("Đã cập nhật chương.");
      } else {
        await createChapter(course.id, payload);
        toast.success("Đã thêm chương mới.");
      }
      setEditingChapter(null);
      await reloadCourse();
    } catch (err) {
      setError(err.message || "Không lưu được chương.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteChapter(chapter) {
    if (!window.confirm(`Bạn có chắc muốn xóa chương "${chapter.title}" không?`)) return;
    setSaving(true);
    try {
      await deleteChapter(chapter.id);
      toast.success("Đã xóa chương.");
      await reloadCourse();
    } catch (err) {
      setError(err.message || "Không xóa được chương.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveLesson(payload) {
    if (!editingLesson?.chapter) return;
    setSaving(true);
    try {
      if (editingLesson.lesson?.id) {
        await updateLesson(editingLesson.lesson.id, payload);
        toast.success("Đã cập nhật bài học.");
      } else {
        await createLesson(editingLesson.chapter.id, payload);
        toast.success("Đã thêm bài học mới.");
      }
      setEditingLesson(null);
      await reloadCourse();
    } catch (err) {
      setError(err.message || "Không lưu được bài học.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteLesson(lesson) {
    if (!window.confirm(`Bạn có chắc muốn xóa bài học "${lesson.title}" không?`)) return;
    setSaving(true);
    try {
      await deleteLesson(lesson.id);
      toast.success("Đã xóa bài học.");
      await reloadCourse();
    } catch (err) {
      setError(err.message || "Không xóa được bài học.");
    } finally {
      setSaving(false);
    }
  }

  async function moveChapter(chapterIndex, direction) {
    const targetIndex = chapterIndex + direction;
    if (targetIndex < 0 || targetIndex >= chapters.length) return;
    const currentChapter = chapters[chapterIndex];
    const targetChapter = chapters[targetIndex];
    setSaving(true);
    try {
      await updateChapter(currentChapter.id, {
        title: currentChapter.title,
        description: currentChapter.description || "",
        position: targetChapter.position,
      });
      await updateChapter(targetChapter.id, {
        title: targetChapter.title,
        description: targetChapter.description || "",
        position: currentChapter.position,
      });
      await reloadCourse();
    } catch (err) {
      setError(err.message || "Không sắp xếp lại được chương.");
    } finally {
      setSaving(false);
    }
  }

  async function moveLesson(chapter, lessonIndex, direction) {
    const lessons = chapter.lessons ?? [];
    const targetIndex = lessonIndex + direction;
    if (targetIndex < 0 || targetIndex >= lessons.length) return;
    const currentLesson = lessons[lessonIndex];
    const targetLesson = lessons[targetIndex];
    setSaving(true);
    try {
      await updateLesson(currentLesson.id, {
        title: currentLesson.title,
        lessonType: currentLesson.lessonType,
        content: currentLesson.content || "",
        audioUrl: currentLesson.audioUrl || "",
        videoUrl: currentLesson.videoUrl || "",
        position: targetLesson.position,
        durationMinutes: currentLesson.durationMinutes || 1,
        preview: Boolean(currentLesson.preview),
        status: currentLesson.status,
      });
      await updateLesson(targetLesson.id, {
        title: targetLesson.title,
        lessonType: targetLesson.lessonType,
        content: targetLesson.content || "",
        audioUrl: targetLesson.audioUrl || "",
        videoUrl: targetLesson.videoUrl || "",
        position: currentLesson.position,
        durationMinutes: targetLesson.durationMinutes || 1,
        preview: Boolean(targetLesson.preview),
        status: targetLesson.status,
      });
      await reloadCourse();
    } catch (err) {
      setError(err.message || "Không sắp xếp lại được bài học.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="auth-state">Đang tải dữ liệu khóa học...</p>;
  }

  if (!courseId) {
    return (
      <div className="course-page">
        <section className="page-hero">          <h2 className="page-title">Bước 2: Xây dựng nội dung khóa học</h2>
          <p className="page-description">Chọn một khóa học để thêm chương, bài học và nội dung chi tiết.</p>
        </section>
        <CourseSelector courses={courses} />
      </div>
    );
  }

  if (error && !course) return <p className="auth-error">{error}</p>;
  if (!course) return <p className="auth-state">Không tìm thấy khóa học.</p>;

  const orderedChapters = [...chapters].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  return (
    <div className="course-page">
      <section className="page-hero">        <h2 className="page-title">Bước 2: Xây dựng nội dung khóa học</h2>
        <p className="page-description">
          Quản lý chương, bài học, trạng thái hoàn thiện và xem trước khóa học trước khi gửi duyệt.
        </p>
      </section>

      <CourseWorkflowStepper activeStep={2} courseId={course.id} submitted={course.status === "SUBMITTED"} />
      <StepHint course={course} />

      {error && <p className="auth-error">{error}</p>}

      <section className="page-panel-card" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h3 style={{ marginTop: 0 }}>{course.title}</h3>
            <p className="page-description" style={{ margin: 0 }}>
              {levelLabel(course.level)} · {courseTypeLabel(course.courseType)} · {courseStatusLabel(course.status)} · Giá:{" "}
              <strong>{formatMoney(course.originalPrice)}</strong>
            </p>
            <p className="page-description" style={{ marginTop: "0.5rem" }}>
              {orderedChapters.length} chương · {totalLessons} bài học
            </p>
          </div>
          <div className="page-actions">
            <Link className="page-action page-action-secondary" to={`/teacher/courses/${course.id}/edit`}>
              Chỉnh sửa thông tin
            </Link>
            <Link className="page-action page-action-primary" to={`/teacher/courses/${course.id}/preview`}>
              Xem trước khóa học
            </Link>
          </div>
        </div>
      </section>

      {editingChapter && (
        <ChapterEditor
          chapter={editingChapter.id ? editingChapter : null}
          onSave={handleSaveChapter}
          onCancel={() => setEditingChapter(null)}
          saving={saving}
        />
      )}

      {editingLesson && (
        <LessonEditor
          key={editingLesson.lesson?.id ?? `new-${editingLesson.chapter.id}`}
          chapterTitle={editingLesson.chapter.title}
          lesson={editingLesson.lesson}
          onSave={handleSaveLesson}
          onCancel={() => setEditingLesson(null)}
          saving={saving}
        />
      )}

      {!editingChapter && editable && orderedChapters.length > 0 && (
        <div className="page-actions" style={{ marginBottom: "1rem" }}>
          <button className="page-action page-action-primary" onClick={() => setEditingChapter({ title: "", description: "", position: orderedChapters.length + 1 })}>
            Thêm chương mới
          </button>
        </div>
      )}

      {!editable && (
        <section className="page-panel-card" style={{ marginBottom: "1rem" }}>
          <p className="page-description" style={{ margin: 0 }}>
            Khóa học đang ở trạng thái <strong>{courseStatusLabel(course.status)}</strong>. Bạn có thể xem nội dung nhưng không thể thêm, sửa hoặc xóa chương và bài học.
          </p>
        </section>
      )}

      <section className="course-table page-panel-card">
        {orderedChapters.length === 0 && (
          <div>
            <p className="page-description">
              Khóa học chưa có chương nào. Hãy tạo ít nhất một chương trước khi sang bước xem trước và gửi duyệt.
            </p>
            {editable && (
              <button
                className="page-action page-action-primary"
                onClick={() => setEditingChapter({ title: "", description: "", position: 1 })}
              >
                Thêm chương đầu tiên
              </button>
            )}
          </div>
        )}

        {orderedChapters.map((chapter, chapterIndex) => (
          <div key={chapter.id} style={{ borderBottom: "1px solid #e2e8f0", paddingBlock: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
              <div>
                <strong>Chương {chapter.position}: {chapter.title}</strong>
                <p className="page-description" style={{ margin: "0.35rem 0 0" }}>
                  {chapter.description || "Chưa có mô tả chương."}
                </p>
              </div>
              <div className="course-row-actions">
                {editable && (
                  <>
                    <button className="page-action page-action-secondary" onClick={() => moveChapter(chapterIndex, -1)} disabled={saving || chapterIndex === 0}>
                      Lên
                    </button>
                    <button className="page-action page-action-secondary" onClick={() => moveChapter(chapterIndex, 1)} disabled={saving || chapterIndex === orderedChapters.length - 1}>
                      Xuống
                    </button>
                    <button className="page-action page-action-secondary" onClick={() => setEditingChapter(chapter)}>
                      Sửa chương
                    </button>
                    <button className="page-action page-action-secondary" onClick={() => setEditingLesson({ chapter, lesson: { ...emptyLesson, position: (chapter.lessons?.length ?? 0) + 1 } })}>
                      Thêm bài học
                    </button>
                    <button className="page-action page-action-secondary" onClick={() => handleDeleteChapter(chapter)}>
                      Xóa chương
                    </button>
                  </>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
              {(chapter.lessons ?? [])
                .slice()
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                .map((lesson, lessonIndex, lessons) => (
                  <div key={lesson.id} className="course-table-row" style={{ alignItems: "flex-start" }}>
                    <div>
                      <strong>{lesson.position}. {lesson.title}</strong>
                      <p style={{ margin: "0.3rem 0", color: "#475569" }}>
                        {lessonTypeLabel(lesson.lessonType)} · {lessonStatusLabel(lesson.status)} · {lesson.durationMinutes || 0} phút
                        {lesson.preview ? " · Có xem thử" : ""}
                      </p>
                      <p style={{ margin: "0.3rem 0", color: lesson.completed ? "#2e7d32" : "#b45309", fontWeight: 600 }}>
                        {lesson.completed ? "Đã hoàn thiện" : "Chưa hoàn thiện"}
                      </p>
                      {!lesson.completed && lesson.completionErrors?.length > 0 && (
                        <ul style={{ margin: "0.25rem 0 0", paddingLeft: "1.1rem" }}>
                          {lesson.completionErrors.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="course-row-actions">
                      {editable && (
                        <>
                          <button className="page-action page-action-secondary" onClick={() => moveLesson(chapter, lessonIndex, -1)} disabled={saving || lessonIndex === 0}>
                            Lên
                          </button>
                          <button className="page-action page-action-secondary" onClick={() => moveLesson(chapter, lessonIndex, 1)} disabled={saving || lessonIndex === lessons.length - 1}>
                            Xuống
                          </button>
                          <button className="page-action page-action-secondary" onClick={() => setEditingLesson({ chapter, lesson })}>
                            Sửa bài học
                          </button>
                          <button className="page-action page-action-secondary" onClick={() => handleDeleteLesson(lesson)}>
                            Xóa bài học
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}

              {(chapter.lessons ?? []).length === 0 && (
                <p className="page-description">Chương này chưa có bài học nào.</p>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
