import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCourse } from "../../services/courseService";

const initialForm = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  thumbnailUrl: "",
  level: "BEGINNER",
  courseType: "FREE",
  originalPrice: 0,
  salePrice: 0,
};

export default function CourseCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await createCourse({
        ...form,
        originalPrice: Number(form.originalPrice || 0),
        salePrice: Number(form.salePrice || 0),
      });
      navigate("/teacher/courses");
    } catch (err) {
      setError(err.message || "Khong tao duoc khoa hoc");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Teacher</span>
        <h2 className="page-title">Tao khoa hoc</h2>
        <p className="page-description">Khoa hoc moi se o trang thai DRAFT, sau do ban gui Admin duyet.</p>
      </section>

      <form className="course-form page-panel-card" onSubmit={handleSubmit}>
        {error && <p className="auth-error">{error}</p>}
        <label>
          Ten khoa hoc
          <input required value={form.title} onChange={(event) => updateField("title", event.target.value)} />
        </label>
        <label>
          Slug
          <input value={form.slug} onChange={(event) => updateField("slug", event.target.value)} placeholder="De trong de tu sinh" />
        </label>
        <label>
          Mo ta ngan
          <input value={form.shortDescription} onChange={(event) => updateField("shortDescription", event.target.value)} />
        </label>
        <label>
          Mo ta chi tiet
          <textarea rows="5" value={form.description} onChange={(event) => updateField("description", event.target.value)} />
        </label>
        <label>
          Thumbnail URL
          <input value={form.thumbnailUrl} onChange={(event) => updateField("thumbnailUrl", event.target.value)} />
        </label>
        <div className="course-form-grid">
          <label>
            Trinh do
            <select value={form.level} onChange={(event) => updateField("level", event.target.value)}>
              <option value="BEGINNER">Beginner</option>
              <option value="ELEMENTARY">Elementary</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </label>
          <label>
            Loai khoa
            <select value={form.courseType} onChange={(event) => updateField("courseType", event.target.value)}>
              <option value="FREE">Free</option>
              <option value="PAID">Paid</option>
            </select>
          </label>
          <label>
            Gia goc
            <input type="number" min="0" value={form.originalPrice} onChange={(event) => updateField("originalPrice", event.target.value)} />
          </label>
          <label>
            Gia sale
            <input type="number" min="0" value={form.salePrice} onChange={(event) => updateField("salePrice", event.target.value)} />
          </label>
        </div>
        <button className="page-action page-action-primary" disabled={submitting}>
          {submitting ? "Dang tao..." : "Tao khoa hoc"}
        </button>
      </form>
    </div>
  );
}
