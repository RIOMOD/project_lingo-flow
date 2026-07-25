import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../hooks/useAuth";
import { addCartItem } from "../../services/commerceService";
import {
  enrollFree,
  getCourseAccess,
  getCourseBySlug,
  getCourseChapters,
} from "../../services/courseService";

function priceText(course) {
  if (!course) return "";
  if (course.courseType === "FREE") return "Miễn phí";
  const value = course.currentPrice ?? course.originalPrice ?? 0;
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function hasSale(course) {
  return course?.courseType === "PAID" && course?.saleStatus === "ACTIVE" && course?.salePrice < course?.originalPrice;
}

function isPreviewLesson(lesson) {
  return Boolean(lesson?.preview ?? lesson?.isPreview);
}

function CourseImage({ course }) {
  const fallback = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80";
  const [src, setSrc] = useState(course.thumbnailUrl || fallback);

  return <img src={src} alt={course.title} onError={() => setSrc(fallback)} />;
}

export default function CourseDetailPage() {
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [access, setAccess] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setError("");
    setMessage("");

    getCourseBySlug(courseSlug)
      .then(async (data) => {
        if (!mounted) return;
        setCourse(data);

        const chapterData = await getCourseChapters(data.id);
        if (mounted) setChapters(chapterData ?? []);

        if (isAuthenticated) {
          const accessData = await getCourseAccess(data.id);
          if (mounted) setAccess(accessData);
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Không tải được khóa học");
      });

    return () => {
      mounted = false;
    };
  }, [courseSlug, isAuthenticated]);

  async function handleEnrollFree() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      const data = await enrollFree(course.id);
      setAccess(data);
      setMessage("Đăng ký khóa học thành công.");
    } catch (err) {
      setError(err.message || "Đăng ký thất bại");
    }
  }

  async function handleAddToCart() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      await addCartItem(course.id);
      toast.success("Đã thêm khóa học vào giỏ hàng");
      navigate("/student/cart");
    } catch (err) {
      setError(err.message || "Không thêm được khóa học vào giỏ hàng");
    }
  }

  async function handleBuyNow() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      await addCartItem(course.id);
      navigate("/student/checkout");
    } catch (err) {
      setError(err.message || "Không tạo được thanh toán nhanh");
    }
  }

  if (error) return <p className="auth-error">{error}</p>;
  if (!course) return <p className="auth-state">Đang tải chi tiết khóa học...</p>;

  const lessons = chapters.flatMap((chapter) => chapter.lessons ?? []);
  const firstPreview = lessons.find(isPreviewLesson);

  return (
    <div className="course-page">
      <section className="page-hero course-detail-hero">
        <div className="page-hero-copy">
          <span className="page-badge">{course.level}</span>
          <h2 className="page-title">{course.title}</h2>
          <p className="page-description">{course.shortDescription || course.description}</p>

          <div className="course-action-row">
            <div className="course-price-stack">
              {hasSale(course) && <span className="sale-badge">SALE</span>}
              {hasSale(course) && (
                <span className="course-original-price">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(course.originalPrice)}
                </span>
              )}
              <strong className="course-price">{priceText(course)}</strong>
            </div>

            {access?.owned && (
              <Link className="page-action page-action-primary" to={`/student/learn/${course.id}`}>
                Tiếp tục học
              </Link>
            )}
            {!access?.owned && course.courseType === "FREE" && (
              <button className="page-action page-action-primary" onClick={handleEnrollFree}>
                Đăng ký miễn phí
              </button>
            )}
            {!access?.owned && course.courseType === "PAID" && (
              <button className="page-action page-action-primary" onClick={handleBuyNow}>
                Mua ngay
              </button>
            )}
            {!access?.owned && course.courseType === "PAID" && (
              <button className="page-action page-action-secondary" onClick={handleAddToCart}>
                Thêm vào giỏ
              </button>
            )}
            {firstPreview && (
              <Link className="page-action page-action-secondary preview-action" to={`/preview/${course.id}/${firstPreview.id}`}>
                Học thử miễn phí
              </Link>
            )}
          </div>

          {message && <p className="course-success">{message}</p>}
        </div>

        <div className="course-detail-media">
          <CourseImage course={course} />
        </div>
      </section>

      <section className="course-detail-body">
        <article className="page-panel-card">
          <h3>Giới thiệu</h3>
          <p>{course.description || "Nội dung giới thiệu khóa học đang được giảng viên cập nhật."}</p>
        </article>

        <article className="page-panel-card">
          <h3>Chương và bài học</h3>
          <div className="lesson-list">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="lesson-chapter">
                <h4>{chapter.position}. {chapter.title}</h4>
                {(chapter.lessons ?? []).map((lesson) => {
                  const preview = isPreviewLesson(lesson);
                  return (
                    <Link
                      key={lesson.id}
                      to={preview || !lesson.locked ? `/preview/${course.id}/${lesson.id}` : "/login"}
                      className={`lesson-row ${lesson.locked ? "is-locked" : ""} ${preview ? "is-preview" : ""}`}
                    >
                      <span>{lesson.position}. {lesson.title}</span>
                      <small>{preview ? "Học thử" : lesson.locked ? "Cần sở hữu" : "Đã mở"}</small>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
