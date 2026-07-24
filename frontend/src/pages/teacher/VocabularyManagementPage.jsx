import { useEffect, useState } from "react";
import { createTeacherVocabulary, deleteTeacherVocabulary, getTeacherVocabularies, updateTeacherVocabulary } from "../../services/learningService";
import { getTeacherCourses, getCourseChapters } from "../../services/courseService";

const emptyForm = {
  courseId: "1",
  lessonId: "",
  word: "",
  ipa: "",
  meaning: "",
  partOfSpeech: "OTHER",
  exampleSentence: "",
  exampleMeaning: "",
  audioUrl: "",
  imageUrl: "",
  level: "BEGINNER",
  topic: "",
};

export default function VocabularyManagementPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);

  async function load() {
    try {
      const data = await getTeacherVocabularies({ size: 30 });
      setItems(data?.items ?? []);
      const coursesData = await getTeacherCourses({ size: 50 });
      setCourses(coursesData?.items ?? []);
    } catch (err) {
      setError(err.message || "Khong tai duoc tu vung");
    }
  }

  useEffect(() => {
    load();
  }, []);

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  useEffect(() => {
    if (form.courseId) {
      getCourseChapters(form.courseId).then(setChapters).catch(() => setChapters([]));
    } else {
      setChapters([]);
    }
  }, [form.courseId]);

  async function submit(event) {
    event.preventDefault();
    try {
      setError("");
      const payload = {
        ...form,
        courseId: Number(form.courseId),
        lessonId: form.lessonId ? Number(form.lessonId) : null,
      };
      if (editingId) {
        await updateTeacherVocabulary(editingId, payload);
      } else {
        await createTeacherVocabulary(payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.message || "Khong luu duoc tu vung");
    }
  }

  function edit(item) {
    setEditingId(item.id);
    setForm({
      courseId: String(item.courseId || ""),
      lessonId: item.lessonId ? String(item.lessonId) : "",
      word: item.word || "",
      ipa: item.ipa || "",
      meaning: item.meaning || "",
      partOfSpeech: item.partOfSpeech || "OTHER",
      exampleSentence: item.exampleSentence || "",
      exampleMeaning: item.exampleMeaning || "",
      audioUrl: item.audioUrl || "",
      imageUrl: item.imageUrl || "",
      level: item.level || "BEGINNER",
      topic: item.topic || "",
    });
  }

  async function remove(id) {
    try {
      await deleteTeacherVocabulary(id);
      await load();
    } catch (err) {
      setError(err.message || "Khong xoa duoc tu vung");
    }
  }

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Teacher</span>
        <h2 className="page-title">Quan ly tu vung</h2>
        <p className="page-description">Tao tu vung va gan vao course/lesson cua ban.</p>
      </section>
      {error && <p className="auth-error">{error}</p>}
      <form className="page-panel-card course-form" onSubmit={submit}>
        <select value={form.courseId} onChange={(event) => setField("courseId", event.target.value)} required>
          <option value="">-- Chọn khóa học --</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <select value={form.lessonId} onChange={(event) => setField("lessonId", event.target.value)}>
          <option value="">-- Chọn bài học (tùy chọn) --</option>
          {chapters.map(ch => (
             <optgroup key={ch.id} label={ch.title}>
               {ch.lessons?.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
             </optgroup>
          ))}
        </select>
        <input value={form.word} onChange={(event) => setField("word", event.target.value)} placeholder="Word" required />
        <input value={form.ipa} onChange={(event) => setField("ipa", event.target.value)} placeholder="IPA" />
        <input value={form.meaning} onChange={(event) => setField("meaning", event.target.value)} placeholder="Meaning" required />
        <input value={form.topic} onChange={(event) => setField("topic", event.target.value)} placeholder="Topic" />
        <textarea value={form.exampleSentence} onChange={(event) => setField("exampleSentence", event.target.value)} placeholder="Example sentence" />
        <textarea value={form.exampleMeaning} onChange={(event) => setField("exampleMeaning", event.target.value)} placeholder="Example meaning" />
        <button className="page-action page-action-primary" type="submit">{editingId ? "Luu thay doi" : "Them tu vung"}</button>
        {editingId && <button className="page-action page-action-secondary" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Huy sua</button>}
      </form>
      <section className="course-table page-panel-card">
        {items.map((item) => (
          <div className="course-table-row" key={item.id}>
            <div>
              <strong>{item.word}</strong>
              <p>{item.meaning} - {item.level} - {item.topic}</p>
            </div>
            <div className="course-row-actions">
              <button className="page-action page-action-secondary" onClick={() => edit(item)}>Sua</button>
              <button className="page-action page-action-secondary" onClick={() => remove(item.id)}>Xoa</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
