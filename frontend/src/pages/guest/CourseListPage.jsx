import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EmptyState, LoadingState } from "../../components/common/UiState";
import { getCourses } from "../../services/courseService";
import { useAuth } from "../../hooks/useAuth";

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
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [courseType, setCourseType] = useState(!isAuthenticated ? "FREE" : "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Force FREE courseType when guest user is not logged in
  const effectiveCourseType = !isAuthenticated ? "FREE" : courseType;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    getCourses({ search, level, courseType: effectiveCourseType, size: 24 })
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
  }, [search, level, effectiveCourseType, isAuthenticated]);

  return (
    <div className="course-page">
      <section className="page-hero">
        <div className="page-hero-copy">
          <span className="page-badge">Course catalog</span>
          <h2 className="page-title">Khóa học tiếng Anh</h2>
          <p className="page-description">
            {!isAuthenticated
              ? "Khám phá các khóa học Miễn phí (FREE). Đăng nhập tài khoản để mở khóa các khóa học Chuyên sâu (PAID)."
              : "Chọn khóa FREE để đăng ký ngay, hoặc xem trước bài học của khóa PAID trước khi mua."}
          </p>
        </div>

        {/* Guest Lock Alert Banner */}
        {!isAuthenticated && (
          <div style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            padding: "12px 18px",
            borderRadius: "12px",
            marginBottom: "16px",
            fontSize: "0.9rem",
            color: "#1e40af",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px"
          }}>
            <span>
              💡 <strong>Bạn chưa đăng nhập:</strong> Hệ thống đang hiển thị các khóa học <strong>Miễn Phí (FREE)</strong>.
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="vocalyn-btn-pill vocalyn-btn-primary"
                style={{ fontSize: "0.78rem", padding: "4px 14px" }}
              >
                🔑 Đăng nhập ngay
              </button>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="vocalyn-btn-pill vocalyn-btn-secondary"
                style={{ fontSize: "0.78rem", padding: "4px 14px" }}
              >
                ✨ Đăng ký
              </button>
            </div>
          </div>
        )}

        <div className="course-filter-row">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm khóa học" />
          <select value={level} onChange={(event) => setLevel(event.target.value)}>
            <option value="">Mọi trình độ</option>
            <option value="BEGINNER">Beginner</option>
            <option value="ELEMENTARY">Elementary</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
          <select
            value={effectiveCourseType}
            onChange={(event) => {
              if (!isAuthenticated && event.target.value === "PAID") {
                if (window.confirm("Bạn cần đăng nhập để xem các khóa học Chuyên sâu (PAID). Đến trang Đăng nhập?")) {
                  navigate("/login");
                }
                return;
              }
              setCourseType(event.target.value);
            }}
          >
            {!isAuthenticated ? (
              <>
                <option value="FREE">FREE (Khóa học Miễn phí)</option>
                <option value="PAID">🔒 PAID (Cần đăng nhập)</option>
              </>
            ) : (
              <>
                <option value="">Tất cả (FREE & PAID)</option>
                <option value="FREE">FREE (Miễn phí)</option>
                <option value="PAID">PAID (Trả phí)</option>
              </>
            )}
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
