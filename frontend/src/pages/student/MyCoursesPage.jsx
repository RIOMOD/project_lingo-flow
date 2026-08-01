import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AddToCartButton from "../../components/common/AddToCartButton";
import CertificateModal from "../../components/student/CertificateModal";
import { useToast } from "../../context/ToastContext";
import { addCartItem, getCart } from "../../services/commerceService";
import { enrollFree, getCourses } from "../../services/courseService";
import { getCertificateEligibility, getCourseProgress } from "../../services/progressService";
import { getMyCourses } from "../../services/userService";

const fallbackImages = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
];

function isRequiredCourse(course) {
  if (!course) return false;
  const id = Number(course.id);
  const slug = (course.slug || "").toLowerCase();
  return id === 2 || id === 3 || id === 4 || slug.includes("ielts-foundation") || slug.includes("phat-am") || slug.includes("business-english");
}

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

function priceText(course) {
  if (!course) return "";
  if (course.courseType === "FREE") return "Miễn phí";
  const value = course.salePrice || course.originalPrice || 0;
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function hasSale(course) {
  return course?.courseType === "PAID" && course?.salePrice && course?.originalPrice && course.salePrice < course.originalPrice;
}

export default function MyCoursesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(tabParam === "catalog" ? "catalog" : "my"); // "my" | "catalog"
  const [courses, setCourses] = useState([]);
  const [catalogCourses, setCatalogCourses] = useState([]);

  useEffect(() => {
    if (tabParam === "catalog") {
      setActiveTab("catalog");
    }
  }, [tabParam]);
  const [cartCourseIds, setCartCourseIds] = useState(new Set());
  const [progressByCourse, setProgressByCourse] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [certCourse, setCertCourse] = useState(null);
  const [ineligibleData, setIneligibleData] = useState(null);
  const [checkingCert, setCheckingCert] = useState(false);
  const [actionCourseId, setActionCourseId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [myRes, progRes, catRes, cartRes] = await Promise.allSettled([
        getMyCourses({ size: 20 }),
        getCourseProgress(),
        getCourses({ size: 30 }),
        getCart(),
      ]);

      if (myRes.status === "fulfilled") setCourses(myRes.value?.items ?? []);
      if (progRes.status === "fulfilled") setProgressByCourse(Object.fromEntries((progRes.value ?? []).map((item) => [item.courseId, item])));
      if (catRes.status === "fulfilled") {
        const cat = catRes.value;
        setCatalogCourses(Array.isArray(cat) ? cat : Array.isArray(cat?.items) ? cat.items : []);
      }
      if (cartRes.status === "fulfilled" && cartRes.value?.items) {
        setCartCourseIds(new Set(cartRes.value.items.map((item) => item.courseId)));
      }
    } catch (err) {
      setError(err.message || "Không tải được danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const enrolledCourseIds = useMemo(() => {
    return new Set(courses.map((c) => c.courseId || c.id));
  }, [courses]);

  const availableCatalog = useMemo(() => {
    return catalogCourses.filter((c) => !enrolledCourseIds.has(c.id));
  }, [catalogCourses, enrolledCourseIds]);

  async function handleOpenCertificate(course) {
    setCheckingCert(true);
    try {
      const eligibility = await getCertificateEligibility();
      if (eligibility && eligibility.eligible) {
        setCertCourse(course);
      } else {
        setIneligibleData(eligibility || {
          message: "Chưa đủ điều kiện nhận chứng chỉ",
          skillCourses: [
            { skillType: "LISTENING", skillName: "Nghe (Listening)", courseTitle: "Khóa học Nghe", progressPercent: 0, isPassed: false },
            { skillType: "SPEAKING", skillName: "Nói (Speaking)", courseTitle: "Khóa học Nói", progressPercent: 0, isPassed: false },
            { skillType: "WRITING", skillName: "Viết (Writing)", courseTitle: "Khóa học Viết", progressPercent: 0, isPassed: false },
          ]
        });
      }
    } catch (err) {
      setError(err.message || "Không thể kiểm tra điều kiện cấp chứng chỉ");
    } finally {
      setCheckingCert(false);
    }
  }

  async function handleEnrollFreeCourse(courseId) {
    setActionCourseId(courseId);
    try {
      await enrollFree(courseId);
      toast.success("Đã đăng ký khóa học miễn phí thành công!");
      await loadData();
      setActiveTab("my");
    } catch (err) {
      toast.error(err.message || "Không thể đăng ký khóa học này");
    } finally {
      setActionCourseId(null);
    }
  }

  async function handleBuyCourseNow(courseId) {
    setActionCourseId(courseId);
    try {
      await addCartItem(courseId);
      navigate("/student/checkout");
    } catch (err) {
      if (err?.message?.toLowerCase().includes("already in cart")) {
        navigate("/student/checkout");
      } else {
        toast.error(err.message || "Không tạo được thanh toán");
      }
    } finally {
      setActionCourseId(null);
    }
  }

  async function handleAddToCartCourse(courseId) {
    setActionCourseId(courseId);
    try {
      await addCartItem(courseId);
      toast.success("Đã thêm khóa học vào giỏ hàng!");
    } catch (err) {
      if (err?.message?.toLowerCase().includes("already in cart")) {
        toast.info("Khóa học đã có sẵn trong giỏ hàng!");
      } else {
        toast.error(err.message || "Không thêm được vào giỏ");
      }
    } finally {
      setActionCourseId(null);
    }
  }

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
          <h2>Góc học tập & Khám phá khóa học</h2>
          <p>
            Quản lý các khóa học đang sở hữu hoặc khám phá khóa học mới để đăng ký & mua thêm trực tiếp tại đây.
          </p>
          <div className="my-courses-actions" style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
            <button
              type="button"
              className={`page-action ${activeTab === "my" ? "page-action-primary" : "page-action-secondary"}`}
              onClick={() => setActiveTab("my")}
            >
              📚 Khóa học của tôi ({courses.length})
            </button>
            <button
              type="button"
              className={`page-action ${activeTab === "catalog" ? "page-action-primary" : "page-action-secondary"}`}
              onClick={() => setActiveTab("catalog")}
            >
              🛒 Khám phá khóa học mới ({availableCatalog.length})
            </button>
          </div>
        </div>

        <div className="my-courses-summary" aria-label="Thống kê khóa học">
          <div>
            <span>Đã sở hữu</span>
            <strong>{stats.total}</strong>
          </div>
          <div>
            <span>Khóa FREE</span>
            <strong>{stats.free}</strong>
          </div>
          <div>
            <span>Khóa PAID</span>
            <strong>{stats.paid}</strong>
          </div>
        </div>
      </div>

      {loading && <p className="auth-state">Đang tải dữ liệu khóa học...</p>}
      {error && <p className="auth-error">{error}</p>}

      {!loading && !error && activeTab === "my" && (
        <>
          {courses.length === 0 ? (
            <article className="my-courses-empty">
              <h3>Bạn chưa sở hữu khóa học nào</h3>
              <p>Hãy khám phá các khóa học mới bên dưới để bắt đầu lộ trình.</p>
              <button
                type="button"
                className="page-action page-action-primary"
                onClick={() => setActiveTab("catalog")}
              >
                Khám phá khóa học mới
              </button>
            </article>
          ) : (
            <div className="my-courses-grid">
              {courses.map((course, index) => {
                const prog = progressByCourse[course.courseId];
                const percent = Number(prog?.progressPercent || 0);

                return (
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
                        Trạng thái: <strong>{course.ownershipStatus}</strong> · Cấp quyền:{" "}
                        {formatDate(course.grantedAt)}
                      </p>

                      <div className="my-course-progress" aria-label={`Tiến độ ${percent.toFixed(0)}%`}>
                        <span style={{ width: `${percent}%` }} />
                      </div>

                      <div className="course-card-footer" style={{ marginTop: "auto", paddingTop: "10px", borderTop: "1px solid #f1f5f9", display: "flex", gap: "8px", width: "100%" }}>
                        <button
                          type="button"
                          disabled={checkingCert}
                          onClick={() => handleOpenCertificate(course)}
                          style={{ flex: "1.2", padding: "8px 10px", fontSize: "0.78rem", borderRadius: "8px", border: "1px solid #99f6e4", background: "#f0fdfa", color: "#0d9488", cursor: "pointer", fontWeight: "700", opacity: checkingCert ? 0.6 : 1, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                        >
                          {checkingCert ? "Đang kiểm tra..." : "🎓 Chứng nhận (PDF)"}
                        </button>
                        <Link
                          className="page-action page-action-primary"
                          to={`/student/learn/${course.courseId}${prog?.nextLessonId ? `/${prog.nextLessonId}` : ""}`}
                          style={{ flex: "1", padding: "8px 12px", fontSize: "0.85rem", textAlign: "center", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                        >
                          Vào học
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {!loading && !error && activeTab === "catalog" && (
        <>
          <div style={{ margin: "1.5rem 0 1rem 0" }}>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.4rem 0" }}>
              Danh mục khóa học chưa tham gia ({availableCatalog.length})
            </h3>
            <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>
              Đăng ký ngay khóa FREE hoặc mua khóa PAID để bổ sung vào lộ trình học tập của bạn.
            </p>
          </div>

          {availableCatalog.length === 0 ? (
            <article className="my-courses-empty">
              <h3>Bạn đã sở hữu tất cả khóa học hiện có!</h3>
              <p>Hãy chọn tab "Khóa học của tôi" để tiếp tục nâng cao trình độ.</p>
              <button type="button" className="page-action page-action-primary" onClick={() => setActiveTab("my")}>
                Quay lại Khóa học của tôi
              </button>
            </article>
          ) : (
            <div className="my-courses-grid">
              {availableCatalog.map((course, index) => {
                const isFree = course.courseType === "FREE";
                const isActing = actionCourseId === course.id;

                return (
                  <article key={course.id} className="my-course-card catalog-item" style={{ display: "flex", flexDirection: "column" }}>
                    <div className="my-course-media" style={{ position: "relative" }}>
                      {isRequiredCourse(course) && (
                        <span
                          style={{
                            position: "absolute",
                            top: "10px",
                            left: "10px",
                            background: "linear-gradient(135deg, #ef4444, #dc2626)",
                            color: "#ffffff",
                            fontSize: "0.75rem",
                            fontWeight: 900,
                            padding: "4px 10px",
                            borderRadius: "999px",
                            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)",
                            letterSpacing: "0.05em",
                            zIndex: 3,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                          }}
                        >
                          🔥 BẮT BUỘC
                        </span>
                      )}
                      <Link to={`/student/courses/${course.slug || course.id}`}>
                        <CourseImage course={course} index={index} />
                      </Link>
                      <span className={`my-course-type ${course.courseType?.toLowerCase()}`}>
                        {course.courseType}
                      </span>
                    </div>

                    <div className="my-course-body" style={{ display: "flex", flexDirection: "column", flex: "1" }}>
                      <div className="course-card-meta">
                        <span>{course.level}</span>
                        <span>{isFree ? "Miễn phí" : "Khóa trả phí"}</span>
                      </div>

                      <h3 style={{ margin: "0.2rem 0 0.4rem 0" }}>
                        <Link to={`/student/courses/${course.slug || course.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                          {course.title}
                        </Link>
                      </h3>
                      <p style={{ color: "#475569", fontSize: "0.86rem", lineHeight: 1.4, margin: "0 0 0.5rem 0", height: "2.8em", minHeight: "2.8em", maxHeight: "2.8em", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {course.shortDescription || "Nâng cao kỹ năng tiếng Anh giao tiếp thông minh với bài giảng bài bản."}
                      </p>

                      <div style={{ marginTop: "auto", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "24px", minHeight: "24px", marginBottom: "10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {hasSale(course) && (
                              <span style={{ textDecoration: "line-through", color: "#94a3b8", fontSize: "0.8rem" }}>
                                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(course.originalPrice)}
                              </span>
                            )}
                            <strong style={{ fontSize: "1.1rem", color: isFree ? "#16a34a" : "#2563eb", fontWeight: 700 }}>
                              {priceText(course)}
                            </strong>
                          </div>

                          <Link
                            to={`/student/courses/${course.slug || course.id}`}
                            style={{ fontSize: "0.8rem", color: "#64748b", textDecoration: "none", fontWeight: 600 }}
                          >
                            👁️ Chi tiết
                          </Link>
                        </div>

                        {isFree ? (
                          <button
                            type="button"
                            disabled={isActing}
                            onClick={() => handleEnrollFreeCourse(course.id)}
                            style={{ width: "100%", padding: "8px 12px", borderRadius: "10px", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            {isActing ? "Đang xử lý..." : "✨ Đăng ký miễn phí"}
                          </button>
                        ) : (
                          <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                            <AddToCartButton
                              courseId={course.id}
                              isInCart={cartCourseIds.has(course.id)}
                              onSuccess={(cId) => setCartCourseIds((prev) => new Set([...prev, cId]))}
                              variant="light"
                              style={{ flex: "1", minWidth: "110px" }}
                            />
                            <button
                              type="button"
                              disabled={isActing}
                              onClick={() => handleBuyCourseNow(course.id)}
                              style={{ flex: "1.2", padding: "8px 12px", borderRadius: "8px", background: "linear-gradient(135deg, #2563eb, #4f46e5)", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(37,99,235,0.25)" }}
                            >
                              {isActing ? "Đang xử lý..." : "⚡ Mua ngay"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {ineligibleData && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "1.5rem"
        }}>
          <div style={{
            background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "520px", padding: "2rem",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", border: "1px solid #f1f5f9"
          }}>
            <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#fef3c7", color: "#d97706", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", marginBottom: "0.75rem" }}>
                🔒
              </div>
              <h3 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 700, color: "#0f172a" }}>Chưa đủ điều kiện nhận chứng chỉ</h3>
              <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.88rem", color: "#64748b", lineHeight: 1.5 }}>
                Điều kiện: Học viên phải tham gia đủ <strong>3 khóa học cho 3 kỹ năng (Nghe, Nói, Viết)</strong> và đạt <strong>trên 95% tiến độ học tập</strong> của 3 khóa đó.
              </p>
            </div>

            <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.8rem", marginBottom: "1.5rem", border: "1px solid #e2e8f0" }}>
              {(ineligibleData.skillCourses || []).map((skill) => (
                <div key={skill.skillType} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0.85rem", background: "#ffffff", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                  <div>
                    <strong style={{ display: "block", fontSize: "0.9rem", color: "#1e293b" }}>{skill.skillName}</strong>
                    <small style={{ color: "#64748b", fontSize: "0.78rem" }}>{skill.courseTitle}</small>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ display: "block", fontWeight: 700, fontSize: "0.92rem", color: skill.isPassed ? "#16a34a" : "#dc2626" }}>
                      {Number(skill.progressPercent || 0).toFixed(0)}%
                    </span>
                    <small style={{ fontSize: "0.72rem", color: skill.isPassed ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
                      {skill.isPassed ? "✓ Đạt (≥ 95%)" : "✕ Chưa đạt"}
                    </small>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setIneligibleData(null)}
                style={{ width: "100%", padding: "0.75rem", background: "linear-gradient(135deg, #2563eb, #4f46e5)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer" }}
              >
                Đã hiểu, tôi sẽ hoàn thành đủ 3 khóa
              </button>
            </div>
          </div>
        </div>
      )}

      {certCourse && (
        <CertificateModal 
          courseTitle={certCourse.title}
          onClose={() => setCertCourse(null)}
        />
      )}
    </section>
  );
}
