import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import {
  applyCoupon,
  clearCart,
  getCart,
  removeCartItem,
  removeCoupon,
} from "../../services/commerceService";

const fallbackImages = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
];

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

function CourseImage({ item, index }) {
  const [src, setSrc] = useState(item?.thumbnailUrl || fallbackImages[index % fallbackImages.length]);

  return (
    <img
      src={src}
      alt={item?.title}
      onError={() => setSrc(fallbackImages[index % fallbackImages.length])}
      style={{
        width: "90px",
        height: "70px",
        borderRadius: "12px",
        objectFit: "cover",
        flexShrink: 0,
      }}
    />
  );
}

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  async function loadCart() {
    try {
      setError("");
      const data = await getCart();
      setCart(data);
    } catch (err) {
      setError(err.message || "Không tải được giỏ hàng");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function runAction(action, successMsg) {
    setActionLoading(true);
    try {
      setError("");
      const updated = await action();
      setCart(updated);
      if (successMsg) toast.success(successMsg);
    } catch (err) {
      toast.error(err.message || "Thao tác thất bại");
    } finally {
      setActionLoading(false);
    }
  }

  const items = cart?.items ?? [];
  const isEmpty = !loading && items.length === 0;

  return (
    <div className="settings-container" style={{ maxWidth: "1180px", margin: "0 auto", padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <nav style={{ display: "flex", gap: "8px", fontSize: "0.88rem", color: "#64748b", marginBottom: "0.8rem" }}>
          <Link to="/" style={{ color: "#64748b", textDecoration: "none" }}>Trang chủ</Link>
          <span>/</span>
          <Link to="/student/courses" style={{ color: "#64748b", textDecoration: "none" }}>Khóa học</Link>
          <span>/</span>
          <span style={{ color: "#0f172a", fontWeight: 600 }}>Giỏ hàng</span>
        </nav>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.4rem 0" }}>
              Giỏ hàng của bạn 🛒
            </h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
              Xem lại danh sách khóa học đã chọn và áp dụng mã giảm giá trước khi thanh toán.
            </p>
          </div>

          {!isEmpty && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => runAction(clearCart, "Đã xóa toàn bộ giỏ hàng")}
              style={{
                background: "#fef2f2",
                color: "#dc2626",
                border: "1px solid #fecaca",
                padding: "8px 16px",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "0.88rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              🗑️ Xóa tất cả
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "3rem 1rem", background: "#ffffff", borderRadius: "18px", border: "1px solid #e2e8f0" }}>
          <div className="auth-state">Đang tải giỏ hàng...</div>
        </div>
      )}

      {error && !loading && (
        <div className="student-error-state" role="alert" style={{ marginBottom: "1.5rem" }}>
          <strong>Lỗi giỏ hàng:</strong> {error}
        </div>
      )}

      {isEmpty && (
        <div style={{ background: "#ffffff", borderRadius: "24px", padding: "3.5rem 2rem", textAlign: "center", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🛒</div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.5rem 0" }}>Giỏ hàng của bạn đang trống</h2>
          <p style={{ color: "#64748b", fontSize: "0.95rem", maxWidth: "450px", margin: "0 auto 1.8rem auto" }}>
            Hãy khám phá các khóa học tiếng Anh giao tiếp & luyện thi rực rỡ để bổ sung vào lộ trình học tập của bạn.
          </p>
          <Link
            to="/student/courses"
            className="stu-btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px", borderRadius: "12px", background: "linear-gradient(135deg, #2563eb, #4f46e5)", color: "#fff", textDecoration: "none", fontWeight: 700 }}
          >
            ✨ Khám phá khóa học ngay
          </Link>
        </div>
      )}

      {!isEmpty && !loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem", alignItems: "start" }}>
          {/* Cart Item List (Left Side) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {items.map((item, index) => {
              const hasSale = item.originalPrice && item.finalPrice && item.finalPrice < item.originalPrice;
              return (
                <div
                  key={item.courseId}
                  style={{
                    background: "#ffffff",
                    borderRadius: "18px",
                    padding: "1.2rem",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
                    display: "flex",
                    gap: "1rem",
                    alignItems: "center",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                >
                  <CourseImage item={item} index={index} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: "0 0 0.4rem 0", fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <Link to={`/student/courses/${item.slug || item.courseId}`} style={{ color: "inherit", textDecoration: "none" }}>
                        {item.title}
                      </Link>
                    </h3>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      {hasSale && (
                        <span style={{ textDecoration: "line-through", color: "#94a3b8", fontSize: "0.85rem", fontWeight: 500 }}>
                          {money.format(item.originalPrice)}
                        </span>
                      )}
                      <strong style={{ fontSize: "1.1rem", color: "#2563eb", fontWeight: 800 }}>
                        {money.format(item.finalPrice || 0)}
                      </strong>
                      {hasSale && (
                        <span style={{ background: "#fef2f2", color: "#ef4444", fontSize: "0.72rem", fontWeight: 800, padding: "2px 6px", borderRadius: "6px" }}>
                          Giảm giá
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => runAction(() => removeCartItem(item.courseId), "Đã xóa khỏi giỏ")}
                    style={{
                      background: "#f8fafc",
                      color: "#64748b",
                      border: "1px solid #e2e8f0",
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "1rem",
                      flexShrink: 0,
                      transition: "all 0.2s",
                    }}
                    title="Xóa khóa học này"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          {/* Summary & Coupon Card (Right Side) */}
          <div style={{ position: "sticky", top: "2rem" }}>
            <div style={{ background: "#ffffff", borderRadius: "20px", padding: "1.8rem", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#0f172a" }}>Tóm tắt đơn hàng</h3>

              {/* Coupon Box */}
              <div style={{ background: "#f8fafc", borderRadius: "14px", padding: "1rem", border: "1px solid #e2e8f0" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "0.5rem" }}>
                  🎁 Mã giảm giá / Voucher
                </label>

                {cart?.couponCode ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#dcfce7", border: "1px solid #86efac", padding: "8px 12px", borderRadius: "10px" }}>
                    <span style={{ fontWeight: 700, color: "#15803d", fontSize: "0.9rem" }}>🎉 Mã: {cart.couponCode}</span>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => runAction(removeCoupon, "Đã gỡ mã giảm giá")}
                      style={{ background: "transparent", border: "none", color: "#dc2626", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}
                    >
                      Hủy mã
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Nhập mã (VD: CHAO2026)"
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.9rem",
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    />
                    <button
                      type="button"
                      disabled={actionLoading || !couponCode.trim()}
                      onClick={() => runAction(() => applyCoupon(couponCode), "Áp dụng mã giảm giá thành công!")}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                        color: "#fff",
                        border: "none",
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        cursor: couponCode.trim() ? "pointer" : "not-allowed",
                        opacity: couponCode.trim() ? 1 : 0.6,
                      }}
                    >
                      Áp mã
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "1rem", fontSize: "0.95rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                  <span>Tạm tính ({items.length} khóa học):</span>
                  <strong style={{ color: "#1e293b" }}>{money.format(cart?.subtotalAmount || 0)}</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                  <span>Giảm giá voucher:</span>
                  <strong style={{ color: cart?.discountAmount > 0 ? "#16a34a" : "#64748b" }}>
                    -{money.format(cart?.discountAmount || 0)}
                  </strong>
                </div>
              </div>

              {/* Total Amount */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a" }}>Tổng thanh toán:</span>
                <strong style={{ fontSize: "1.6rem", fontWeight: 800, color: "#2563eb" }}>
                  {money.format(cart?.totalAmount || 0)}
                </strong>
              </div>

              {/* Checkout Button */}
              <Link
                to="/student/checkout"
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textAlign: "center",
                  textDecoration: "none",
                  boxShadow: "0 6px 20px rgba(37,99,235,0.3)",
                  display: "block",
                  boxSizing: "border-box",
                }}
              >
                ⚡ Tiến hành thanh toán
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
