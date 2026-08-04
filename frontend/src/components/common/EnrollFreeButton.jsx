import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../hooks/useAuth";
import { enrollFree } from "../../services/courseService";

/**
 * EnrollFreeButton – animated enrollment button
 * Same animation as AddToCartButton but with a graduation cap icon.
 * After the 3.4s animation, calls onSuccess(courseId) so the parent
 * can move the card from catalog → my-courses tab.
 */
export default function EnrollFreeButton({
  courseId,
  isEnrolled = false,
  onSuccess,
  text = "Đăng ký miễn phí",
  className = "",
  style = {},
  disabled = false,
}) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Already enrolled state
  if (isEnrolled) {
    return (
      <button
        type="button"
        className={`animated-enroll-btn is-enrolled ${className}`}
        style={{
          background: "#dcfce7",
          color: "#15803d",
          border: "1px solid #86efac",
          boxShadow: "none",
          fontWeight: 700,
          cursor: "pointer",
          borderRadius: "10px",
          padding: "8px 14px",
          minWidth: "140px",
          ...style,
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          navigate(`/student/learn/${courseId}`);
        }}
        title="Đã đăng ký – Nhấn để học ngay"
      >
        <span style={{ paddingLeft: 0, marginLeft: 0, color: "#15803d" }}>
          ✓ Đã đăng ký
        </span>
      </button>
    );
  }

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading || disabled) return;

    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để đăng ký khóa học");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      await enrollFree(courseId);
    } catch (err) {
      const msg = err?.message || "";
      if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("đã đăng ký")) {
        toast.info("Bạn đã đăng ký khóa học này rồi!");
      } else {
        toast.error(msg || "Không thể đăng ký khóa học");
        setLoading(false);
        return;
      }
    }

    // Run 3.4s animation, then notify parent to move card
    setTimeout(() => {
      setLoading(false);
      toast.success("Đã đăng ký khóa học miễn phí thành công!");
      if (onSuccess) onSuccess(courseId);
    }, 3400);
  };

  return (
    <button
      type="button"
      className={`animated-enroll-btn ${loading ? "loading" : ""} ${className}`}
      style={style}
      onClick={handleClick}
      disabled={disabled || loading}
      title="Đăng ký học miễn phí"
    >
      <span>{text}</span>

      {/* Graduation cap icon that animates across */}
      <div className="enroll-icon" aria-hidden="true">
        <svg viewBox="0 0 36 26" fill="none" stroke="currentColor">
          {/* Graduation cap body */}
          <polygon points="18 2 34 10 18 18 2 10" strokeWidth="2" strokeLinejoin="round" />
          {/* Tassel cord */}
          <line x1="34" y1="10" x2="34" y2="20" strokeWidth="2" />
          {/* Diploma check tick */}
          <polyline points="11 14 16 18 24 10" strokeWidth="2.2" />
        </svg>
      </div>
    </button>
  );
}
