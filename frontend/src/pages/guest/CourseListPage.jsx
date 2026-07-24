import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, LoadingState } from "../../components/common/UiState";
import { getCourses } from "../../services/courseService";

const fallbackImages = [
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
];

function formatPrice(course) {
  if (course.courseType === "FREE") return "Miễn phí";
  const price = course.salePrice || course.originalPrice || 0;
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

function CourseThumb({ course, index }) {
  const [src, setSrc] = useState(course.thumbnailUrl || fallbackImages[index % fallbackImages.length]);
  return <img src={src} alt={course.title} onError={() => setSrc(fallbackImages[index % fallbackImages.length])} />;
}

function hasSale(course) {
  return course.courseType === "PAID" && course.salePrice && course.originalPrice && course.salePrice < course.originalPrice;
}

export default function CourseListPage() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [courseType, setCourseType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    getCourses({ search, level, courseType, size: 12 })
      .then((data) => {
        if (mounted) setCourses(data?.items ?? []);
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Không tải được danh sách khóa học");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [search, level, courseType]);

  return (
    <div className="course-page">
      <section className="page-hero">
        <div className="page-hero-copy">
          <span className="page-badge">Course catalog</span>
          <h2 className="page-title">Khóa học tiếng Anh</h2>
          <p className="page-description">
            Chọn khóa FREE để đăng ký ngay, hoặc xem trước bài học của khóa PAID trước khi mua.
          </p>
        </div>

        <div className="course-filter-row">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm khóa học" />
          <select value={level} onChange={(event) => setLevel(event.target.value)}>
            <option value="">Mọi trình độ</option>
            <option value="BEGINNER">Beginner</option>
            <option value="ELEMENTARY">Elementary</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
          <select value={courseType} onChange={(event) => setCourseType(event.target.value)}>
            <option value="">Tất cả</option>
            <option value="FREE">Free</option>
            <option value="PAID">Paid</option>
          </select>
        </div>
      </section>

      {loading && <LoadingState title="Đang tải khóa học..." description="Hệ thống đang lấy catalog mới nhất từ backend." />}
      {error && <p className="auth-error">{error}</p>}
      {!loading && !error && courses.length === 0 && (
        <EmptyState
          title="Chưa có khóa học phù hợp"
          description="Hãy thử bộ lọc khác hoặc quay lại sau khi Teacher xuất bản thêm khóa học."
        />
      )}

      <section className="course-grid">
        {courses.map((course, index) => (
          <article className="course-card" key={course.id}>
            <div className="course-thumb">
              <CourseThumb course={course} index={index} />
              <span className={`course-type-badge ${course.courseType?.toLowerCase()}`}>{course.courseType}</span>
              {hasSale(course) && <span className="course-sale-corner">SALE</span>}
            </div>
            <div className="course-card-body">
              <div className="course-card-meta">
                <span>{course.level}</span>
                <span>{course.courseType === "FREE" ? "Học miễn phí" : "Có thanh toán"}</span>
              </div>
              <h3>{course.title}</h3>
              <p>{course.shortDescription || "Khóa học đang được cập nhật mô tả ngắn."}</p>
              <div className="course-card-footer">
                <div className="course-list-price">
                  {hasSale(course) && (
                    <span>
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(course.originalPrice)}
                    </span>
                  )}
                  <strong>{formatPrice(course)}</strong>
                </div>
                <Link className="page-action page-action-primary" to={`/courses/${course.slug}`}>
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

