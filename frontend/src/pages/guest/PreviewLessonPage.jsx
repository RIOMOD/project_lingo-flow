import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import LessonMedia from "../../components/common/LessonMedia";
import { useAuth } from "../../hooks/useAuth";
import { getCourseBySlug, getLesson } from "../../services/courseService";

export default function PreviewLessonPage() {
  const { courseId, lessonId } = useParams();
  const { isAuthenticated } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getLesson(courseId, lessonId)
      .then(setLesson)
      .catch((err) => setError(err.message || "Không mở được bài học."));

    if (courseId) {
      getCourseBySlug(courseId)
        .then(setCourse)
        .catch(() => {});
    }
  }, [courseId, lessonId]);

  if (error) return <p className="auth-state" style={{ color: "#ef4444", textAlign: "center", padding: "3rem" }}>{error}</p>;
  if (!lesson) return <p className="auth-state" style={{ textAlign: "center", padding: "3rem" }}>Đang tải bài học...</p>;

  const backUrl = isAuthenticated
    ? `/student/courses/${course?.slug || courseId}`
    : `/courses/${course?.slug || courseId}`;

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">{lesson.lessonType}</span>
        <h2 className="page-title">{lesson.title}</h2>
        <p className="page-description">Bài học mẫu và nội dung đã được mở khóa theo quyền truy cập của bạn.</p>
      </section>
      <article className="page-panel-card lesson-content">
        <LessonMedia lesson={lesson} />
        <p>{lesson.content || "Bài học này chưa có nội dung văn bản."}</p>
        <Link className="page-action page-action-secondary" to={backUrl} style={{ textDecoration: "none", textAlign: "center", width: "100%", display: "inline-block", marginTop: "1rem" }}>
          ← Quay lại trang chi tiết khóa học
        </Link>
      </article>
    </div>
  );
}
