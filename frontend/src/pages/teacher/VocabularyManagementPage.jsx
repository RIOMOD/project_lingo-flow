import { useEffect, useMemo, useState } from "react";
import { createTeacherVocabulary, deleteTeacherVocabulary, getTeacherVocabularies, updateTeacherVocabulary } from "../../services/learningService";
import { getTeacherCourseChapters, getTeacherCourses } from "../../services/courseService";

const emptyForm = {
  courseId: "",
  lessonId: "",
  topic: "",
  word: "",
  ipa: "",
  meaning: "",
  partOfSpeech: "OTHER",
  exampleSentence: "",
  exampleMeaning: "",
  imageUrl: "",
  audioUrl: "",
  level: "BEGINNER",
};

const partOfSpeechOptions = [
  ["NOUN", "Danh từ"],
  ["VERB", "Động từ"],
  ["ADJECTIVE", "Tính từ"],
  ["ADVERB", "Trạng từ"],
  ["PREPOSITION", "Giới từ"],
  ["CONJUNCTION", "Liên từ"],
  ["PRONOUN", "Đại từ"],
  ["PHRASE", "Cụm từ"],
  ["IDIOM", "Thành ngữ"],
  ["OTHER", "Khác"],
];

const levelOptions = [
  ["BEGINNER", "Sơ cấp"],
  ["ELEMENTARY", "Căn bản"],
  ["INTERMEDIATE", "Trung cấp"],
  ["ADVANCED", "Nâng cao"],
];

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function VocabularyManagementPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [loadingWords, setLoadingWords] = useState(false);

  const lessons = useMemo(
    () => chapters.flatMap((chapter) => (chapter.lessons ?? []).map((lesson) => ({ ...lesson, chapterTitle: chapter.title }))),
    [chapters]
  );

  const visibleItems = useMemo(() => {
    const topic = normalize(form.topic);
    return items.filter((item) => !topic || normalize(item.topic) === topic);
  }, [items, form.topic]);

  useEffect(() => {
    let mounted = true;
    getTeacherCourses({ size: 50 })
      .then((data) => {
        if (mounted) setCourses(data?.items ?? []);
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Không tải được danh sách khóa học.");
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!form.courseId) {
      setChapters([]);
      setItems([]);
      return;
    }

    let mounted = true;
    setLoadingLessons(true);
    setLoadingWords(true);
    setError("");
    Promise.all([
      getTeacherCourseChapters(form.courseId),
      getTeacherVocabularies({ courseId: form.courseId, size: 200 }),
    ])
      .then(([chapterData, vocabularyData]) => {
        if (!mounted) return;
        setChapters(chapterData ?? []);
        setItems(vocabularyData?.items ?? []);
      })
      .catch((err) => {
        if (!mounted) return;
        setChapters([]);
        setItems([]);
        setError(err.message || "Không tải được bài học hoặc danh sách từ vựng.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoadingLessons(false);
        setLoadingWords(false);
      });

    return () => {
      mounted = false;
    };
  }, [form.courseId]);

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
    setNotice("");
  }

  function handleCourseChange(value) {
    setForm((current) => ({
      ...current,
      courseId: value,
      lessonId: "",
    }));
    setFieldErrors({});
    setNotice("");
  }

  function validateForm() {
    const errors = {};
    if (!form.courseId) errors.courseId = "Vui lòng chọn khóa học.";
    if (!form.topic.trim()) errors.topic = "Vui lòng nhập chủ đề.";
    if (!form.word.trim()) errors.word = "Vui lòng nhập từ vựng.";
    if (!form.meaning.trim()) errors.meaning = "Vui lòng nhập nghĩa tiếng Việt.";
    if (form.lessonId && !lessons.some((lesson) => String(lesson.id) === String(form.lessonId))) {
      errors.lessonId = "Bài học đã chọn không thuộc khóa học hiện tại.";
    }
    if (!isValidUrl(form.imageUrl.trim())) {
      errors.imageUrl = "URL hình ảnh phải bắt đầu bằng http hoặc https.";
    }
    if (!isValidUrl(form.audioUrl.trim())) {
      errors.audioUrl = "URL âm thanh phải bắt đầu bằng http hoặc https.";
    }

    const duplicated = items.some((item) => {
      if (editingId && item.id === editingId) return false;
      return String(item.courseId) === String(form.courseId)
        && normalize(item.topic) === normalize(form.topic)
        && normalize(item.word) === normalize(form.word);
    });
    if (duplicated) {
      errors.word = "Từ vựng đã tồn tại trong cùng khóa học và chủ đề.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function buildPayload() {
    return {
      ...form,
      courseId: Number(form.courseId),
      lessonId: form.lessonId ? Number(form.lessonId) : null,
      topic: form.topic.trim(),
      word: form.word.trim(),
      ipa: form.ipa.trim(),
      meaning: form.meaning.trim(),
      exampleSentence: form.exampleSentence.trim(),
      exampleMeaning: form.exampleMeaning.trim(),
      imageUrl: form.imageUrl.trim(),
      audioUrl: form.audioUrl.trim(),
    };
  }

  async function reloadWords(courseId = form.courseId) {
    if (!courseId) return;
    const data = await getTeacherVocabularies({ courseId, size: 200 });
    setItems(data?.items ?? []);
  }

  async function submit(event, keepContext = false) {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      setError("");
      setNotice("");
      const payload = buildPayload();
      if (editingId) {
        await updateTeacherVocabulary(editingId, payload);
      } else {
        await createTeacherVocabulary(payload);
      }
      await reloadWords(payload.courseId);
      setNotice(editingId ? "Đã lưu thay đổi từ vựng." : "Đã lưu từ vựng.");
      setEditingId(null);
      setFieldErrors({});
      setForm(keepContext
        ? {
            ...emptyForm,
            courseId: String(payload.courseId),
            topic: payload.topic,
            lessonId: payload.lessonId ? String(payload.lessonId) : "",
            level: payload.level,
          }
        : emptyForm);
      if (!keepContext) {
        setChapters([]);
        setItems([]);
      }
    } catch (err) {
      setError(err.message || "Không lưu được từ vựng.");
    }
  }

  function edit(item) {
    setEditingId(item.id);
    setFieldErrors({});
    setNotice("");
    setForm({
      courseId: String(item.courseId || ""),
      lessonId: item.lessonId ? String(item.lessonId) : "",
      topic: item.topic || "",
      word: item.word || "",
      ipa: item.ipa || "",
      meaning: item.meaning || "",
      partOfSpeech: item.partOfSpeech || "OTHER",
      exampleSentence: item.exampleSentence || "",
      exampleMeaning: item.exampleMeaning || "",
      imageUrl: item.imageUrl || "",
      audioUrl: item.audioUrl || "",
      level: item.level || "BEGINNER",
    });
  }

  async function remove(item) {
    try {
      setError("");
      setNotice("");
      await deleteTeacherVocabulary(item.id);
      await reloadWords(item.courseId);
      setNotice("Đã xóa từ vựng.");
    } catch (err) {
      setError(err.message || "Không xóa được từ vựng.");
    }
  }

  function renderFieldError(name) {
    return fieldErrors[name] ? <small className="teacher-vocabulary-error">{fieldErrors[name]}</small> : null;
  }

  return (
    <div className="course-page">
      <section className="page-hero">        <h2 className="page-title">Quản lý từ vựng</h2>
        <p className="page-description">Tạo từ vựng theo khóa học, chủ đề và bài học tùy chọn để Student học bằng quiz.</p>
      </section>

      {notice && <p className="auth-success" role="status">{notice}</p>}
      {error && <p className="auth-error" role="alert">{error}</p>}

      <form className="page-panel-card teacher-vocabulary-form" onSubmit={(event) => submit(event, false)}>
        <label>
          Khóa học <span aria-hidden="true">*</span>
          <select value={form.courseId} onChange={(event) => handleCourseChange(event.target.value)} required>
            <option value="">-- Chọn khóa học --</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
          {renderFieldError("courseId")}
        </label>

        <label>
          Chủ đề <span aria-hidden="true">*</span>
          <input value={form.topic} onChange={(event) => setField("topic", event.target.value)} placeholder="Ví dụ: Biển" required />
          {renderFieldError("topic")}
        </label>

        <label>
          Bài học
          <select value={form.lessonId} onChange={(event) => setField("lessonId", event.target.value)} disabled={!form.courseId || loadingLessons}>
            <option value="">{loadingLessons ? "Đang tải bài học..." : "-- Không chọn bài học --"}</option>
            {chapters.map((chapter) => (
              <optgroup key={chapter.id} label={chapter.title}>
                {(chapter.lessons ?? []).map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                ))}
              </optgroup>
            ))}
          </select>
          {renderFieldError("lessonId")}
        </label>

        <label>
          Từ vựng <span aria-hidden="true">*</span>
          <input value={form.word} onChange={(event) => setField("word", event.target.value)} placeholder="Ví dụ: beach" required />
          {renderFieldError("word")}
        </label>

        <label>
          Phiên âm IPA
          <input value={form.ipa} onChange={(event) => setField("ipa", event.target.value)} placeholder="/biːtʃ/" />
        </label>

        <label>
          Nghĩa tiếng Việt <span aria-hidden="true">*</span>
          <input value={form.meaning} onChange={(event) => setField("meaning", event.target.value)} placeholder="Ví dụ: bãi biển" required />
          {renderFieldError("meaning")}
        </label>

        <label>
          Loại từ
          <select value={form.partOfSpeech} onChange={(event) => setField("partOfSpeech", event.target.value)}>
            {partOfSpeechOptions.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        <label>
          Trình độ
          <select value={form.level} onChange={(event) => setField("level", event.target.value)}>
            {levelOptions.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        <label className="teacher-vocabulary-field-full">
          Câu ví dụ
          <textarea value={form.exampleSentence} onChange={(event) => setField("exampleSentence", event.target.value)} placeholder="Ví dụ: We walked along the beach at sunset." />
        </label>

        <label className="teacher-vocabulary-field-full">
          Nghĩa của câu ví dụ
          <textarea value={form.exampleMeaning} onChange={(event) => setField("exampleMeaning", event.target.value)} placeholder="Ví dụ: Chúng tôi đi dọc bãi biển lúc hoàng hôn." />
        </label>

        <label>
          URL hình ảnh minh họa
          <input value={form.imageUrl} onChange={(event) => setField("imageUrl", event.target.value)} placeholder="https://..." />
          {renderFieldError("imageUrl")}
        </label>

        <label>
          URL âm thanh phát âm
          <input value={form.audioUrl} onChange={(event) => setField("audioUrl", event.target.value)} placeholder="https://..." />
          {renderFieldError("audioUrl")}
        </label>

        {(form.imageUrl || form.audioUrl) && (
          <div className="teacher-vocabulary-preview">
            {isValidUrl(form.imageUrl.trim()) && form.imageUrl.trim() && (
              <img src={form.imageUrl.trim()} alt="Xem trước hình minh họa" onError={(event) => { event.currentTarget.style.display = "none"; }} />
            )}
            {isValidUrl(form.audioUrl.trim()) && form.audioUrl.trim() && (
              <audio controls src={form.audioUrl.trim()}>
                Trình duyệt không hỗ trợ nghe thử âm thanh.
              </audio>
            )}
          </div>
        )}

        <p className="teacher-vocabulary-note">
          Nếu không chọn bài học, từ vựng chỉ thuộc kho từ của khóa học. Bài học được chọn luôn phải thuộc khóa học hiện tại.
        </p>

        <div className="teacher-vocabulary-actions">
          <button className="page-action page-action-primary" type="submit">
            {editingId ? "Lưu thay đổi" : "Lưu từ vựng"}
          </button>
          <button className="page-action page-action-secondary" type="button" onClick={(event) => submit(event, true)}>
            Lưu và thêm từ tiếp theo
          </button>
          {editingId && (
            <button
              className="page-action page-action-secondary"
              type="button"
              onClick={() => {
                setEditingId(null);
                setFieldErrors({});
                setForm(emptyForm);
                setChapters([]);
                setItems([]);
              }}
            >
              Hủy sửa
            </button>
          )}
        </div>
      </form>

      <section className="course-table page-panel-card">
        <h3 style={{ marginTop: 0 }}>Từ đã tạo trong khóa học/chủ đề</h3>
        {loadingWords && <p className="auth-state">Đang tải danh sách từ vựng...</p>}
        {!form.courseId && <p className="page-description">Chọn khóa học để xem danh sách từ đã tạo.</p>}
        {form.courseId && !loadingWords && visibleItems.length === 0 && (
          <p className="page-description">Chưa có từ vựng nào trong khóa học hoặc chủ đề đang chọn.</p>
        )}
        {!loadingWords && visibleItems.map((item) => (
          <div className="course-table-row" key={item.id}>
            <div>
              <strong>{item.word}</strong>
              <p>{item.meaning} · {item.topic} · {item.level} · {item.partOfSpeech}</p>
              {item.exampleSentence && <p className="page-description" style={{ margin: "0.25rem 0" }}>{item.exampleSentence}</p>}
            </div>
            <div className="course-row-actions">
              <button type="button" className="page-action page-action-secondary" onClick={() => edit(item)}>Sửa</button>
              <button type="button" className="page-action page-action-secondary" onClick={() => remove(item)}>Xóa</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
