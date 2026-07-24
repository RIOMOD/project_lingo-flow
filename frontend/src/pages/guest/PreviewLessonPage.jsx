import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import LessonMedia from "../../components/common/LessonMedia";
import { getLesson } from "../../services/courseService";

export default function PreviewLessonPage() {
  const { courseId, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getLesson(courseId, lessonId)
      .then(setLesson)
      .catch((err) => setError(err.message || "Không mở được bài học"));
  }, [courseId, lessonId]);

  if (error) return <p className="auth-error">{error}</p>;
  if (!lesson) return <p className="auth-state">Đang tải bài học...</p>;

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">{lesson.lessonType}</span>
        <h2 className="page-title">{lesson.title}</h2>
        <p className="page-description">Bài học mẫu và nội dung đã được mở khóa theo quyền truy cập của bạn.</p>
      </section>
      <article className="page-panel-card lesson-content">
        <LessonMedia lesson={lesson} />
        <p>{lesson.content || "Bài học này chưa có nội dung text."}</p>
        <Link className="page-action page-action-secondary" to={`/courses`}>
          Quay lai danh sach
        </Link>
      </article>
    </div>
  );
}
