import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseWorkflowStepper from "../../components/teacher/CourseWorkflowStepper";
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
};

export default function CourseCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(field, value) {
    if (field === "courseType") {
      setForm((current) => ({
        ...current,
        courseType: value,
        originalPrice: value === "FREE" ? 0 : current.originalPrice > 0 ? current.originalPrice : "",
      }));
      return;
    }

    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (form.courseType === "PAID" && Number(form.originalPrice || 0) <= 0) {
      setError("Giá khóa học phải lớn hơn 0 đối với khóa học trả phí.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const createdCourse = await createCourse({
        ...form,
        originalPrice: form.courseType === "FREE" ? 0 : Number(form.originalPrice || 0),
      });
      const createdCourseId = createdCourse?.id;
      if (!createdCourseId) {
        setError("Đã tạo khóa học nhưng hệ thống chưa trả về mã khóa học. Vui lòng mở lại danh sách khóa học để tiếp tục.");
        return;
      }
      navigate(`/teacher/courses/${createdCourseId}/content`, {
        state: { createdCourseId },
      });
    } catch (err) {
      setError(err.message || "Không tạo được khóa học.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="course-page">
      <section className="page-hero">        <h2 className="page-title">Bước 1: Tạo thông tin cơ bản khóa học</h2>
        <p className="page-description">
          Sau khi lưu thông tin cơ bản, bạn sẽ được chuyển sang bước xây dựng chương và bài học của khóa học.
        </p>
      </section>

      <CourseWorkflowStepper activeStep={1} />

      <form className="course-form page-panel-card" onSubmit={handleSubmit}>
        {error && <p className="auth-error">{error}</p>}
        <label>
          Tên khóa học
          <input required value={form.title} onChange={(event) => updateField("title", event.target.value)} />
        </label>
        <label>
          Slug
          <input value={form.slug} onChange={(event) => updateField("slug", event.target.value)} placeholder="Để trống để tự sinh" />
        </label>
        <label>
          Mô tả ngắn
          <input value={form.shortDescription} onChange={(event) => updateField("shortDescription", event.target.value)} />
        </label>
        <label>
          Mô tả chi tiết
          <textarea rows="5" value={form.description} onChange={(event) => updateField("description", event.target.value)} />
        </label>
        <label>
          Đường dẫn ảnh đại diện
          <input value={form.thumbnailUrl} onChange={(event) => updateField("thumbnailUrl", event.target.value)} />
        </label>
        <div className="course-form-grid">
          <label>
            Trình độ
            <select value={form.level} onChange={(event) => updateField("level", event.target.value)}>
              <option value="BEGINNER">Sơ cấp</option>
              <option value="ELEMENTARY">Căn bản</option>
              <option value="INTERMEDIATE">Trung cấp</option>
              <option value="ADVANCED">Nâng cao</option>
            </select>
          </label>
          <label>
            Loại khóa học
            <select value={form.courseType} onChange={(event) => updateField("courseType", event.target.value)}>
              <option value="FREE">Miễn phí</option>
              <option value="PAID">Trả phí</option>
            </select>
          </label>
          {form.courseType === "PAID" && (
            <label>
              Giá khóa học
              <input
                type="number"
                min="1"
                step="1000"
                value={form.originalPrice}
                onChange={(event) => updateField("originalPrice", event.target.value)}
                placeholder="Nhập giá lớn hơn 0"
              />
            </label>
          )}
        </div>
        <button className="page-action page-action-primary" disabled={submitting}>
          {submitting ? "Đang tạo..." : "Lưu và sang bước xây dựng nội dung"}
        </button>
      </form>
    </div>
  );
}
