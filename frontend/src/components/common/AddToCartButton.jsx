import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../hooks/useAuth";
import { addCartItem } from "../../services/commerceService";

export default function AddToCartButton({
  courseId,
  onSuccess,
  text = "Giỏ hàng",
  className = "",
  style = {},
  disabled = false,
  variant = "primary", // "primary" | "secondary" | "dark"
}) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading || disabled) return;

    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để thêm khóa học vào giỏ hàng");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      await addCartItem(courseId);
    } catch (err) {
      const msg = err?.message || "";
      if (msg.toLowerCase().includes("already in cart")) {
        toast.info("Khóa học đã có trong giỏ hàng!");
      } else {
        toast.error(msg || "Không thể thêm vào giỏ hàng");
        setLoading(false);
        return;
      }
    }

    // Run 3.4s animation
    setTimeout(() => {
      setLoading(false);
      toast.success("Đã thêm khóa học vào giỏ hàng!");
      if (onSuccess) onSuccess();
    }, 3400);
  };

  const bgStyle = variant === "secondary" 
    ? { "--background": "#1e293b", "--text": "#ffffff" }
    : variant === "light"
    ? { "--background": "#f1f5f9", "--text": "#334155", "--cart": "#334155" }
    : { "--background": "#2563eb", "--text": "#ffffff" };

  return (
    <button
      type="button"
      className={`animated-cart-btn ${loading ? "loading" : ""} ${className}`}
      style={{ ...bgStyle, ...style }}
      onClick={handleClick}
      disabled={disabled || loading}
      title="Thêm vào giỏ hàng"
    >
      <span>{text}</span>

      <div className="cart">
        <svg viewBox="0 0 36 26" stroke="#fff">
          <polyline points="1 2.5 6 2.5 10 18.5 25.5 18.5 28.5 7.5 7.5 7.5" />
          <polyline points="15 13.5 17 15.5 22 10.5" />
        </svg>
      </div>
    </button>
  );
}
