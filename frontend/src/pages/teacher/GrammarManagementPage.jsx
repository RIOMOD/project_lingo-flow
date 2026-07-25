import { useEffect, useState } from "react";
import { createTeacherGrammar, deleteTeacherGrammar, getTeacherGrammarTopics, updateTeacherGrammar } from "../../services/learningService";
import { getTeacherCourses, getCourseChapters } from "../../services/courseService";

const emptyForm = {
  courseId: "1",
  lessonId: "",
  title: "",
  description: "",
  formula: "",
  usage: "",
  example: "",
  note: "",
  level: "BEGINNER",
};

export default function GrammarManagementPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);

  async function load() {
    try {
      const data = await getTeacherGrammarTopics({ size: 30 });
      setItems(data?.items ?? []);
      const coursesData = await getTeacherCourses({ size: 50 });
      setCourses(coursesData?.items ?? []);
    } catch (err) {
      setError(err.message || "Khong tai duoc ngu phap");
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
      const payload = {
        ...form,
        courseId: Number(form.courseId),
        lessonId: form.lessonId ? Number(form.lessonId) : null,
      };
      if (editingId) {
        await updateTeacherGrammar(editingId, payload);
      } else {
        await createTeacherGrammar(payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.message || "Khong luu duoc ngu phap");
    }
  }

  function edit(item) {
    setEditingId(item.id);
    setForm({
      courseId: String(item.courseId || ""),
      lessonId: item.lessonId ? String(item.lessonId) : "",
      title: item.title || "",
      description: item.description || "",
      formula: item.formula || "",
      usage: item.usage || "",
      example: item.example || "",
      note: item.note || "",
      level: item.level || "BEGINNER",
    });
  }

  async function remove(id) {
    try {
      await deleteTeacherGrammar(id);
      await load();
    } catch (err) {
      setError(err.message || "Khong xoa duoc ngu phap");
    }
  }

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Teacher</span>
        <h2 className="page-title">Quan ly ngu phap</h2>
        <p className="page-description">Tao chu diem ngu phap va gan vao course/lesson.</p>
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
        <input value={form.title} onChange={(event) => setField("title", event.target.value)} placeholder="Title" required />
        <textarea value={form.description} onChange={(event) => setField("description", event.target.value)} placeholder="Description" />
        <textarea value={form.formula} onChange={(event) => setField("formula", event.target.value)} placeholder="Formula" />
        <textarea value={form.usage} onChange={(event) => setField("usage", event.target.value)} placeholder="Usage" />
        <textarea value={form.example} onChange={(event) => setField("example", event.target.value)} placeholder="Example" />
        <button className="page-action page-action-primary" type="submit">{editingId ? "Luu thay doi" : "Them ngu phap"}</button>
        {editingId && <button className="page-action page-action-secondary" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Huy sua</button>}
      </form>
      <section className="course-table page-panel-card">
        {items.map((item) => (
          <div className="course-table-row" key={item.id}>
            <div>
              <strong>{item.title}</strong>
              <p>{item.level} - {item.formula}</p>
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
