import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AddToCartButton from "../../components/common/AddToCartButton";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../hooks/useAuth";
import { addCartItem } from "../../services/commerceService";
import {
  enrollFree,
  getCourseAccess,
  getCourseBySlug,
  getCourseChapters,
} from "../../services/courseService";
import "../../styles/SettingsPage.css";

const fallbackImages = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
];

function priceText(course) {
  if (!course) return "";
  if (course.courseType === "FREE") return "Miễn phí";
  const value = course.salePrice || course.originalPrice || 0;
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function hasSale(course) {
  return course?.courseType === "PAID" && course?.salePrice && course?.originalPrice && course.salePrice < course.originalPrice;
}

function calcDiscountPercent(course) {
  if (!hasSale(course)) return 0;
  return Math.round(((course.originalPrice - course.salePrice) / course.originalPrice) * 100);
}

function isPreviewLesson(lesson) {
  return Boolean(lesson?.preview ?? lesson?.isPreview);
}

function CourseImage({ course }) {
  const [src, setSrc] = useState(course?.thumbnailUrl || fallbackImages[0]);

  return (
    <img
      src={src}
      alt={course?.title || "Course thumbnail"}
      onError={() => setSrc(fallbackImages[0])}
      style={{ width: "100%", height: "auto", borderRadius: "16px", objectFit: "cover" }}
    />
  );
}

export default function CourseDetailPage() {
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "curriculum" | "instructor" | "reviews"
  const [expandedChapters, setExpandedChapters] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    getCourseBySlug(courseSlug)
      .then(async (data) => {
        if (!mounted) return;
        setCourse(data);

        const chapterData = await getCourseChapters(data.id);
        if (mounted) {
          const list = chapterData ?? [];
          setChapters(list);
          // Expand all chapters by default
          setExpandedChapters(Object.fromEntries(list.map((ch) => [ch.id, true])));
        }

        if (isAuthenticated) {
          try {
            const accessData = await getCourseAccess(data.id);
            if (mounted) setAccess(accessData);
          } catch (accessErr) {
            console.warn("Could not check course access:", accessErr);
          }
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Không tìm thấy thông tin khóa học.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [courseSlug, isAuthenticated]);

  const lessons = useMemo(() => chapters.flatMap((chapter) => chapter.lessons ?? []), [chapters]);
  const firstPreview = useMemo(() => lessons.find(isPreviewLesson), [lessons]);
  const totalDuration = useMemo(() => lessons.reduce((acc, l) => acc + (l.durationMinutes || 5), 0), [lessons]);

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  async function handleEnrollFree() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await enrollFree(course.id);
      setAccess(data);
      toast.success("Đăng ký thành công! Bạn đã có thể bắt đầu học ngay.");
      navigate(`/student/learn/${course.id}`);
    } catch (err) {
      toast.error(err.message || "Đăng ký thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddToCart() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      await addCartItem(course.id);
      toast.success("Đã thêm khóa học vào giỏ hàng!");
    } catch (err) {
      const errMsg = err?.message || "";
      if (errMsg.toLowerCase().includes("already in cart")) {
        toast.info("Khóa học đã có trong giỏ hàng!");
      } else {
        toast.error(errMsg || "Không thêm được khóa học vào giỏ hàng");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleBuyNow() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      await addCartItem(course.id);
      navigate("/student/checkout");
    } catch (err) {
      const errMsg = err?.message || "";
      if (errMsg.toLowerCase().includes("already in cart")) {
        navigate("/student/checkout");
      } else {
        toast.error(errMsg || "Không tạo được đơn hàng");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="settings-container" style={{ textAlign: "center", padding: "4rem 1.5rem" }}>
        <div className="auth-state">Đang tải thông tin chi tiết khóa học...</div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="settings-container" style={{ textAlign: "center", padding: "4rem 1.5rem" }}>
        <div className="student-error-state" role="alert" style={{ maxWidth: "500px", margin: "0 auto" }}>
          <strong>Chưa tải được khóa học</strong>
          <p>{error || "Khóa học này không tồn tại hoặc đã bị ẩn."}</p>

          <Link to="/courses" className="stu-btn-primary" style={{ display: "inline-block", marginTop: "1rem" }}>
            ← Khám phá các khóa học khác
          </Link>
        </div>
      </div>
    );
  }

  const isOwned = access?.owned || access?.isOwned;
  const isFree = course.courseType === "FREE";

  return (
    <div className="settings-container" style={{ maxWidth: "1240px", margin: "0 auto", padding: "1.5rem" }}>
      {/* Breadcrumbs */}
      <nav style={{ display: "flex", gap: "8px", fontSize: "0.88rem", color: "#64748b", marginBottom: "1.5rem" }}>
        <Link to="/" style={{ color: "#64748b", textDecoration: "none" }}>Trang chủ</Link>
        <span>/</span>
        <Link to="/courses" style={{ color: "#64748b", textDecoration: "none" }}>Khóa học</Link>
        <span>/</span>
        <span style={{ color: "#0f172a", fontWeight: 600 }}>{course.title}</span>
      </nav>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem", alignItems: "start" }}>
        {/* Main Content (Left Side) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Header Banner */}
          <div style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", borderRadius: "24px", padding: "2.2rem", color: "#ffffff", boxShadow: "0 20px 40px rgba(15,23,42,0.15)" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "1rem" }}>
              <span className="stu-badge" style={{ background: "#2563eb", color: "#fff" }}>{course.level || "Tất cả trình độ"}</span>
              <span className="stu-badge" style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>{isFree ? "Miễn phí" : "Trả phí"}</span>
            </div>

            <h1 style={{ fontSize: "1.85rem", fontWeight: 800, margin: "0 0 0.8rem 0", lineHeight: 1.3 }}>{course.title}</h1>
            <p style={{ color: "#94a3b8", fontSize: "1rem", lineHeight: 1.6, margin: "0 0 1.5rem 0" }}>
              {course.shortDescription || course.description || "Khóa học tiếng Anh chuyên sâu giúp cải thiện toàn diện kỹ năng giao tiếp và vốn từ vựng."}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", fontSize: "0.9rem", color: "#cbd5e1", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <span>⭐ <strong>4.9</strong>/5 (120+ Đánh giá)</span>
              <span>👨‍🏫 Giảng viên: <strong>{course.teacherName || "LingoFlow Expert"}</strong></span>
              <span>📖 <strong>{lessons.length}</strong> bài học</span>
              <span>⏱️ <strong>{Math.round(totalDuration / 60)}h {totalDuration % 60}m</strong></span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: "flex", gap: "12px", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.5rem" }}>
            {[
              { id: "overview", label: "📖 Tổng quan" },
              { id: "curriculum", label: `📑 Nội dung (${chapters.length} chương)` },
              { id: "instructor", label: "👨‍🏫 Giảng viên" },
              { id: "reviews", label: "⭐ Đánh giá (4.9)" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "0.6rem 1.2rem", borderRadius: "10px", border: "none", background: activeTab === tab.id ? "#2563eb" : "transparent",
                  color: activeTab === tab.id ? "#ffffff" : "#64748b", fontWeight: 700, fontSize: "0.92rem", cursor: "pointer", transition: "all 0.2s"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ background: "#ffffff", borderRadius: "18px", padding: "1.8rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.2rem", fontWeight: 700, color: "#0f172a" }}>🎯 Những gì bạn sẽ làm chủ được:</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
                  {[
                    "Nắm vững 500+ từ vựng & cấu trúc ngữ pháp cốt lõi",
                    "Tự tin phát âm chuẩn giọng bản xứ với phản hồi từ AI",
                    "Phản xạ tiếng Anh giao tiếp tự nhiên trong công việc & cuộc sống",
                    "Thực hành trực tiếp với kho bài tập & đề kiểm tra phong phú"
                  ].map((point, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "0.8rem", background: "#f8fafc", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                      <span style={{ color: "#16a34a", fontWeight: "bold" }}>✓</span>
                      <span style={{ fontSize: "0.92rem", color: "#334155", lineHeight: 1.4 }}>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "#ffffff", borderRadius: "18px", padding: "1.8rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.2rem", fontWeight: 700, color: "#0f172a" }}>📝 Mô tả chi tiết</h3>
                <div style={{ fontSize: "0.95rem", color: "#475569", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                  {course.description || "Nội dung bài giảng được thiết kế bài bản, hiện đại, kết hợp lý thuyết và bài tập thực hành tương tác giúp học viên tiếp thu nhanh chóng và duy trì thói quen học tập đều đặn mỗi ngày."}
                </div>
              </div>
            </div>
          )}

          {activeTab === "curriculum" && (
            <div style={{ background: "#ffffff", borderRadius: "18px", padding: "1.8rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#0f172a" }}>Danh sách chương & bài học</h3>
                <span style={{ fontSize: "0.88rem", color: "#64748b" }}>{chapters.length} Chương · {lessons.length} Bài học</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {chapters.map((chapter, cIdx) => {
                  const isExpanded = Boolean(expandedChapters[chapter.id]);
                  const chLessons = chapter.lessons ?? [];
                  return (
                    <div key={chapter.id} style={{ border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden" }}>
                      <button
                        type="button"
                        onClick={() => toggleChapter(chapter.id)}
                        style={{
                          width: "100%", padding: "1rem 1.2rem", background: "#f8fafc", border: "none", display: "flex",
                          justify: "space-between", alignItems: "center", cursor: "pointer", textAlign: "left"
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: "0.98rem", color: "#0f172a" }}>Chương {cIdx + 1}: {chapter.title}</strong>
                          <span style={{ display: "block", fontSize: "0.8rem", color: "#64748b", marginTop: "2px" }}>{chLessons.length} bài học</span>
                        </div>
                        <span style={{ fontSize: "1.1rem", color: "#64748b" }}>{isExpanded ? "▲" : "▼"}</span>
                      </button>

                      {isExpanded && (
                        <div style={{ padding: "0.5rem 1rem", background: "#ffffff" }}>
                          {chLessons.map((lesson, lIdx) => {
                            const isPreview = isPreviewLesson(lesson);
                            return (
                              <div
                                key={lesson.id}
                                style={{
                                  display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0.5rem",
                                  borderBottom: lIdx < chLessons.length - 1 ? "1px solid #f1f5f9" : "none"
                                }}
                              >
                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                  <span style={{ fontSize: "0.9rem", color: "#64748b" }}>{isPreview ? "▶" : "📚"}</span>
                                  <span style={{ fontSize: "0.92rem", fontWeight: 500, color: "#1e293b" }}>{lesson.title}</span>
                                  {isPreview && (
                                    <span style={{ background: "#dcfce7", color: "#166534", fontSize: "0.75rem", padding: "2px 8px", borderRadius: "999px", fontWeight: 700 }}>
                                      Học thử
                                    </span>
                                  )}
                                </div>

                                <div>
                                  {isPreview ? (
                                    <Link
                                      to={`/preview/${course.id}/${lesson.id}`}
                                      style={{ fontSize: "0.82rem", color: "#2563eb", fontWeight: 700, textDecoration: "none" }}
                                    >
                                      Xem bài mẫu →
                                    </Link>
                                  ) : isOwned ? (
                                    <Link
                                      to={`/student/learn/${course.id}/${lesson.id}`}
                                      style={{ fontSize: "0.82rem", color: "#16a34a", fontWeight: 700, textDecoration: "none" }}
                                    >
                                      Học bài này →
                                    </Link>
                                  ) : (
                                    <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>🔒 Cần sở hữu</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "instructor" && (
            <div style={{ background: "#ffffff", borderRadius: "18px", padding: "1.8rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", gap: "1.2rem", alignItems: "center", marginBottom: "1rem" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #4f46e5)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 800 }}>
                  {(course.teacherName || "T")[0].toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#0f172a" }}>{course.teacherName || "Giảng viên LingoFlow"}</h3>
                  <p style={{ margin: "4px 0 0 0", fontSize: "0.88rem", color: "#64748b" }}>Chuyên gia Đào tạo Tiếng Anh Giao tiếp & IELTS</p>
                </div>
              </div>
              <p style={{ fontSize: "0.95rem", color: "#475569", lineHeight: 1.6 }}>
                Với nhiều năm kinh nghiệm giảng dạy tiếng Anh trực tuyến và xây dựng lộ trình luyện tập thông minh, giảng viên giúp hàng ngàn học viên làm chủ kỹ năng phát âm, từ vựng và tự tin giao tiếp.
              </p>
            </div>
          )}

          {activeTab === "reviews" && (
            <div style={{ background: "#ffffff", borderRadius: "18px", padding: "1.8rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
              <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.2rem", fontWeight: 700, color: "#0f172a" }}>Đánh giá nổi bật</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[
                  { name: "Phạm Hoàng Nam", rating: 5, comment: "Bài giảng rất dễ hiểu, đặc biệt tính năng luyện phát âm AI chấm điểm cực kỳ chính xác!" },
                  { name: "Nguyễn Thu Trang", rating: 5, comment: "Học theo lộ trình rất mượt mà. Hệ thống từ vựng flashcard xoay 3D giúp nhớ lâu hơn." }
                ].map((rev, idx) => (
                  <div key={idx} style={{ padding: "1rem", background: "#f8fafc", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <strong style={{ fontSize: "0.92rem", color: "#1e293b" }}>{rev.name}</strong>
                      <span style={{ color: "#eab308" }}>{"★".repeat(rev.rating)}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.88rem", color: "#475569" }}>{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Purchase Card (Right Side) */}
        <div style={{ position: "sticky", top: "2rem" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", padding: "1.5rem", border: "1px solid #e2e8f0", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <CourseImage course={course} />

            {/* Price Box */}
            <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
                <strong style={{ fontSize: "1.8rem", fontWeight: 800, color: isFree ? "#16a34a" : "#2563eb" }}>
                  {priceText(course)}
                </strong>
                {hasSale(course) && (
                  <span style={{ textDecoration: "line-through", color: "#94a3b8", fontSize: "1rem", fontWeight: 600 }}>
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(course.originalPrice)}
                  </span>
                )}
                {hasSale(course) && (
                  <span style={{ background: "#ef4444", color: "#fff", fontSize: "0.78rem", fontWeight: 800, padding: "2px 8px", borderRadius: "999px" }}>
                    Giảm {calcDiscountPercent(course)}%
                  </span>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {isOwned ? (
                <Link
                  to={`/student/learn/${course.id}`}
                  style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", border: "none", fontWeight: 700, fontSize: "1rem", textAlign: "center", textDecoration: "none", boxShadow: "0 4px 14px rgba(22,163,74,0.3)" }}
                >
                  ▶ Tiếp tục học ngay
                </Link>
              ) : isFree ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleEnrollFree}
                  style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", border: "none", fontWeight: 700, fontSize: "1rem", cursor: "pointer", boxShadow: "0 4px 14px rgba(22,163,74,0.3)" }}
                >
                  {isSubmitting ? "Đang xử lý..." : "✨ Đăng ký học miễn phí"}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleBuyNow}
                    style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "linear-gradient(135deg, #2563eb, #4f46e5)", color: "#fff", border: "none", fontWeight: 700, fontSize: "1rem", cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}
                  >
                    {isSubmitting ? "Đang xử lý..." : "⚡ Mua ngay"}
                  </button>

                  <AddToCartButton courseId={course.id} text="Thêm vào giỏ hàng" variant="light" style={{ width: "100%" }} />
                </>
              )}

              {firstPreview && !isOwned && (
                <Link
                  to={`/preview/${course.id}/${firstPreview.id}`}
                  style={{ width: "100%", padding: "10px", borderRadius: "12px", background: "transparent", color: "#2563eb", border: "1.5px solid #2563eb", fontWeight: 700, fontSize: "0.9rem", textAlign: "center", textDecoration: "none", marginTop: "4px" }}
                >
                  ▶ Học thử bài đầu tiên
                </Link>
              )}
            </div>

            {/* Course Features */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "1rem", borderTop: "1px solid #f1f5f9", fontSize: "0.85rem", color: "#475569" }}>
              <span>✅ Quyền truy cập học trọn đời</span>
              <span>✅ Học trên cả máy tính & điện thoại</span>
              <span>✅ Cấp chứng chỉ hoàn thành khóa học</span>
              <span>✅ Hỗ trợ hỏi đáp trực tiếp từ AI & Giáo viên</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
