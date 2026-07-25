import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMyCourses } from "../../services/userService";
import { getCourseProgress } from "../../services/progressService";

const fallbackImages = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
];

function formatDate(value) {
  if (!value) return "Mới cấp quyền";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function CourseImage({ course, index }) {
  const [src, setSrc] = useState(course.thumbnailUrl || fallbackImages[index % fallbackImages.length]);

  return (
    <img
      src={src}
      alt={course.title}
      onError={() => setSrc(fallbackImages[index % fallbackImages.length])}
    />
  );
}

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [progressByCourse, setProgressByCourse] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    Promise.all([getMyCourses({ size: 12 }), getCourseProgress()])
      .then(([data, progress]) => {
        if (mounted) {
          setCourses(data?.items ?? []);
          setProgressByCourse(Object.fromEntries((progress ?? []).map((item) => [item.courseId, item])));
        }
      })
      .catch((caughtError) => {
        if (mounted) setError(caughtError.message || "Khong tai duoc khoa hoc cua ban");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const free = courses.filter((course) => course.courseType === "FREE").length;
    const paid = courses.filter((course) => course.courseType === "PAID").length;
    return {
      total: courses.length,
      free,
      paid,
    };
  }, [courses]);

  return (
    <section className="my-courses-page">
      <div className="my-courses-hero">
        <div className="my-courses-copy">
          <span className="page-badge">Student learning</span>
          <h2>Khoa hoc cua toi</h2>
          <p>
            Tat ca khoa FREE va PAID ban dang so huu nam o day. Chon mot khoa
            de vao hoc tiep, xem tien do va tiep tuc bai gan nhat.
          </p>
          <div className="my-courses-actions">
            <Link className="page-action page-action-primary" to="/courses">
              Mua them khoa hoc
            </Link>
            <Link className="page-action page-action-secondary" to="/student/progress">
              Xem tien do
            </Link>
          </div>
        </div>

        <div className="my-courses-summary" aria-label="Thong ke khoa hoc">
          <div>
            <span>Tong khoa</span>
            <strong>{stats.total}</strong>
          </div>
          <div>
            <span>FREE</span>
            <strong>{stats.free}</strong>
          </div>
          <div>
            <span>PAID</span>
            <strong>{stats.paid}</strong>
          </div>
        </div>
      </div>

      {loading && <p className="auth-state">Dang tai khoa hoc cua ban...</p>}
      {error && <p className="auth-error">{error}</p>}

      {!loading && !error && courses.length === 0 && (
        <article className="my-courses-empty">
          <h3>Ban chua so huu khoa hoc nao</h3>
          <p>Hay dang ky mot khoa FREE hoac mua khoa PAID de bat dau hoc.</p>
          <Link className="page-action page-action-primary" to="/courses">
            Kham pha khoa hoc
          </Link>
        </article>
      )}

      <div className="my-courses-grid">
        {courses.map((course, index) => (
          <article className="my-course-card" key={course.courseId}>
            <div className="my-course-media">
              <CourseImage course={course} index={index} />
              <span className={`my-course-type ${course.courseType?.toLowerCase()}`}>
                {course.courseType}
              </span>
            </div>

            <div className="my-course-body">
              <div className="course-card-meta">
                <span>{course.level}</span>
                <span>{course.ownershipType}</span>
              </div>

              <h3>{course.title}</h3>
              <p>
                Trang thai: <strong>{course.ownershipStatus}</strong> · Cap quyen:{" "}
                {formatDate(course.grantedAt)}
              </p>

              <div className="my-course-progress" aria-label={`Tiến độ ${Number(progressByCourse[course.courseId]?.progressPercent || 0).toFixed(0)}%`}>
                <span style={{ width: `${Number(progressByCourse[course.courseId]?.progressPercent || 0)}%` }} />
              </div>

              <div className="course-card-footer">
                <span className="my-course-status">{course.courseStatus}</span>
                <Link className="page-action page-action-primary" to={`/student/learn/${course.courseId}${progressByCourse[course.courseId]?.nextLessonId ? `/${progressByCourse[course.courseId].nextLessonId}` : ""}`}>
                  Vào học
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

