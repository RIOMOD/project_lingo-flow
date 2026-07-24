import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTeacherCourses, updateCourse } from "../../services/courseService";

export default function CourseEditPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getTeacherCourses({ size: 100 })
      .then((data) => {
        const course = (data?.items ?? []).find((item) => String(item.id) === String(courseId));
        if (!course) {
          setError("Khong tim thay khoa hoc cua ban");
          return;
        }
        setForm({
          title: course.title || "",
          slug: course.slug || "",
          shortDescription: course.shortDescription || "",
          description: "",
          thumbnailUrl: course.thumbnailUrl || "",
          level: course.level || "BEGINNER",
          courseType: course.courseType || "FREE",
          originalPrice: course.originalPrice || 0,
          salePrice: course.salePrice || 0,
        });
      })
      .catch((err) => setError(err.message || "Khong tai duoc khoa hoc"));
  }, [courseId]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await updateCourse(courseId, {
        ...form,
        originalPrice: Number(form.originalPrice || 0),
        salePrice: Number(form.salePrice || 0),
      });
      navigate("/teacher/courses");
    } catch (err) {
      setError(err.message || "Khong cap nhat duoc khoa hoc");
    }
  }

  if (error) return <p className="auth-error">{error}</p>;
  if (!form) return <p className="auth-state">Dang tai form sua...</p>;

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Teacher</span>
        <h2 className="page-title">Sua khoa hoc</h2>
        <p className="page-description">Chi sua duoc khoa DRAFT hoac REJECTED theo rule backend.</p>
      </section>
      <form className="course-form page-panel-card" onSubmit={handleSubmit}>
        <label>
          Ten khoa hoc
          <input required value={form.title} onChange={(event) => updateField("title", event.target.value)} />
        </label>
        <label>
          Slug
          <input value={form.slug} onChange={(event) => updateField("slug", event.target.value)} />
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
        <button className="page-action page-action-primary">Luu thay doi</button>
      </form>
    </div>
  );
}
