import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CourseWorkflowStepper from "../../components/teacher/CourseWorkflowStepper";
import { getTeacherCourseDetail, updateCourse } from "../../services/courseService";
import { canTeacherEditCourse, courseStatusLabel } from "../../utils/courseWorkflow";

export default function CourseEditPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getTeacherCourseDetail(courseId)
      .then((data) => {
        setCourse(data);
        setForm({
          title: data.title || "",
          slug: data.slug || "",
          shortDescription: data.shortDescription || "",
          description: data.description || "",
          thumbnailUrl: data.thumbnailUrl || "",
          level: data.level || "BEGINNER",
          courseType: data.courseType || "FREE",
          originalPrice: data.courseType === "FREE" ? 0 : data.originalPrice || "",
        });
      })
      .catch((err) => setError(err.message || "Không tải được khóa học."));
  }, [courseId]);

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
    if (!canTeacherEditCourse(course)) {
      setError("Khóa học ở trạng thái hiện tại không thể chỉnh sửa.");
      return;
    }
    if (form.courseType === "PAID" && Number(form.originalPrice || 0) <= 0) {
      setError("Giá khóa học phải lớn hơn 0 đối với khóa học trả phí.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const updated = await updateCourse(courseId, {
        ...form,
        originalPrice: form.courseType === "FREE" ? 0 : Number(form.originalPrice || 0),
      });
      setCourse(updated);
      navigate(`/teacher/courses/${courseId}/content`);
    } catch (err) {
      setError(err.message || "Không cập nhật được khóa học.");
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !form) return <p className="auth-error">{error}</p>;
  if (!form || !course) return <p className="auth-state">Đang tải biểu mẫu cập nhật...</p>;

  const editable = canTeacherEditCourse(course);

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Teacher</span>
        <h2 className="page-title">Bước 1: Cập nhật thông tin cơ bản</h2>
        <p className="page-description">
          Trạng thái hiện tại: <strong>{courseStatusLabel(course.status)}</strong>.
        </p>
        {course.lastRejectedReason && (
          <p className="auth-error" style={{ marginTop: "0.75rem" }}>
            Lý do từ chối gần nhất: {course.lastRejectedReason}
          </p>
        )}
      </section>

      <CourseWorkflowStepper activeStep={1} courseId={course.id} submitted={course.status === "SUBMITTED"} />

      <form className="course-form page-panel-card" onSubmit={handleSubmit}>
        {error && <p className="auth-error">{error}</p>}
        {!editable && (
          <p className="page-description">
            Khóa học đang ở trạng thái <strong>{courseStatusLabel(course.status)}</strong> nên không thể chỉnh sửa thông tin, chương hoặc bài học.
          </p>
        )}
        <label>
          Tên khóa học
          <input required disabled={!editable} value={form.title} onChange={(event) => updateField("title", event.target.value)} />
        </label>
        <label>
          Slug
          <input disabled={!editable} value={form.slug} onChange={(event) => updateField("slug", event.target.value)} />
        </label>
        <label>
          Mô tả ngắn
          <input disabled={!editable} value={form.shortDescription} onChange={(event) => updateField("shortDescription", event.target.value)} />
        </label>
        <label>
          Mô tả chi tiết
          <textarea disabled={!editable} rows="5" value={form.description} onChange={(event) => updateField("description", event.target.value)} />
        </label>
        <label>
          Đường dẫn ảnh đại diện
          <input disabled={!editable} value={form.thumbnailUrl} onChange={(event) => updateField("thumbnailUrl", event.target.value)} />
        </label>
        <div className="course-form-grid">
          <label>
            Trình độ
            <select disabled={!editable} value={form.level} onChange={(event) => updateField("level", event.target.value)}>
              <option value="BEGINNER">Sơ cấp</option>
              <option value="ELEMENTARY">Căn bản</option>
              <option value="INTERMEDIATE">Trung cấp</option>
              <option value="ADVANCED">Nâng cao</option>
            </select>
          </label>
          <label>
            Loại khóa học
            <select disabled={!editable} value={form.courseType} onChange={(event) => updateField("courseType", event.target.value)}>
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
                disabled={!editable}
                value={form.originalPrice}
                onChange={(event) => updateField("originalPrice", event.target.value)}
                placeholder="Nhập giá lớn hơn 0"
              />
            </label>
          )}
        </div>
        <div className="page-actions">
          <button className="page-action page-action-primary" disabled={!editable || submitting}>
            {submitting ? "Đang lưu..." : "Lưu và sang bước xây dựng nội dung"}
          </button>
          <button
            type="button"
            className="page-action page-action-secondary"
            onClick={() => navigate(`/teacher/courses/${course.id}/content`)}
          >
            Quản lý nội dung
          </button>
        </div>
      </form>
    </div>
  );
}
