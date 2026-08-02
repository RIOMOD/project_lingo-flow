import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../hooks/useAuth";
import { cancelOrder, getOrder } from "../../services/commerceService";

const fallbackImages = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
];

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

function formatDate(value) {
  if (!value) return "Vừa tạo";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function CourseImage({ item, index = 0 }) {
  const idx = typeof index === "number" ? index : 0;
  const fallback = fallbackImages[idx % fallbackImages.length];
  const [src, setSrc] = useState(item?.thumbnailUrl || fallback);

  return (
    <img
      src={src || fallback}
      alt={item?.title || "Khóa học"}
      onError={() => setSrc(fallback)}
      style={{
        width: "76px",
        height: "60px",
        borderRadius: "10px",
        objectFit: "cover",
        flexShrink: 0,
      }}
    />
  );
}

export default function OrderDetailPage() {
  const { orderCode } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [canceling, setCanceling] = useState(false);
  const [copied, setCopied] = useState(false);

  async function loadOrder() {
    setLoading(true);
    setError("");
    try {
      const data = await getOrder(orderCode);
      setOrder(data);
    } catch (err) {
      setError(err.message || "Không tải được thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, [orderCode]);

  const handleCopyCode = () => {
    if (!orderCode) return;
    navigator.clipboard.writeText(orderCode);
    setCopied(true);
    toast.success("Đã sao chép mã đơn hàng!");
    setTimeout(() => setCopied(false), 2000);
  };

  async function handleCancel() {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;
    try {
      setCanceling(true);
      const updated = await cancelOrder(orderCode);
      setOrder(updated);
      toast.success("Đã hủy đơn hàng thành công");
    } catch (err) {
      toast.error(err.message || "Không thể hủy đơn hàng");
    } finally {
      setCanceling(false);
    }
  }

  const isPaid = order?.status === "PAID";
  const isPending = order?.status === "PENDING_PAYMENT";
  const isCancelled = order?.status === "CANCELLED";
  const items = order?.items ?? [];

  return (
    <div className="order-detail-page" style={{ width: "100%", margin: "0 auto", padding: "1rem 0" }}>
      {/* Breadcrumbs */}
      <nav className="order-detail-breadcrumb" style={{ display: "flex", gap: "8px", fontSize: "0.88rem", marginBottom: "1.2rem" }}>
        <Link to="/" style={{ textDecoration: "none" }}>Trang chủ</Link>
        <span>/</span>
        <Link to="/student/orders" style={{ textDecoration: "none" }}>Lịch sử mua hàng</Link>
        <span>/</span>
        <strong className="order-code-text">Đơn hàng #{orderCode}</strong>
      </nav>

      {/* Header Panel */}
      <div className="order-detail-header-card">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 className="order-hero-title">
              Đơn hàng #{orderCode}
            </h1>
            <button
              type="button"
              className="order-copy-btn"
              onClick={handleCopyCode}
            >
              {copied ? "✓ Đã chép" : "📋 Sao chép"}
            </button>
          </div>
          <p className="order-hero-sub">
            Ngày đặt hàng: {formatDate(order?.createdAt)}
          </p>
        </div>

        {/* Status Tag */}
        <div>
          {isPaid && (
            <span style={{ background: "#dcfce7", color: "#15803d", fontSize: "0.88rem", fontWeight: 800, padding: "8px 16px", borderRadius: "999px", border: "1px solid #86efac", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              ✓ ĐÃ THANH TOÁN & KÍCH HOẠT
            </span>
          )}
          {isPending && (
            <span style={{ background: "#fef3c7", color: "#d97706", fontSize: "0.88rem", fontWeight: 800, padding: "8px 16px", borderRadius: "999px", border: "1px solid #fde68a", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              ⏳ CHỜ THANH TOÁN
            </span>
          )}
          {isCancelled && (
            <span style={{ background: "#fee2e2", color: "#b91c1c", fontSize: "0.88rem", fontWeight: 800, padding: "8px 16px", borderRadius: "999px", border: "1px solid #fca5a5", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              ✕ ĐÃ HỦY ĐƠN HÀNG
            </span>
          )}
        </div>
      </div>

      {loading && (
        <div className="order-detail-card-panel" style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <div className="auth-state">Đang tải chi tiết đơn hàng...</div>
        </div>
      )}

      {error && !loading && (
        <div className="student-error-state" role="alert" style={{ marginBottom: "1.5rem" }}>
          <strong>Lỗi đơn hàng:</strong> {error}
        </div>
      )}

      {!loading && order && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 0.85fr)", gap: "1.8rem", alignItems: "start" }}>
          {/* Left Column: Purchased Courses & Billing Profile */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Registered Courses List */}
            <div className="order-detail-card-panel">
              <h3 className="order-panel-title">📚 Khóa học trong đơn hàng ({items.length})</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                {items.map((item, idx) => (
                  <div key={item.courseId || idx} className="order-detail-course-row">
                    <CourseImage item={item} index={idx} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link
                        to={`/student/courses/${item.slug || item.courseId}`}
                        className="order-course-title"
                      >
                        {item.title}
                      </Link>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "4px" }}>
                        {item.originalPrice && item.finalPrice && item.finalPrice < item.originalPrice && (
                          <span style={{ textDecoration: "line-through", color: "#94a3b8", fontSize: "0.82rem" }}>
                            {money.format(item.originalPrice)}
                          </span>
                        )}
                        <span className="order-course-price">
                          {money.format(item.finalPrice || item.price || 0)}
                        </span>
                      </div>
                    </div>

                    {isPaid && (
                      <Link
                        to={`/student/learn/${item.courseId}`}
                        style={{
                          padding: "8px 14px",
                          borderRadius: "10px",
                          background: "linear-gradient(135deg, #16a34a, #15803d)",
                          color: "#ffffff",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          textDecoration: "none",
                          flexShrink: 0,
                          boxShadow: "0 2px 8px rgba(22,163,74,0.25)",
                        }}
                      >
                        🎓 Vào học →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Buyer Info Profile */}
            <div className="order-detail-card-panel">
              <h3 className="order-panel-title">👤 Thông tin học viên đăng ký</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.92rem" }}>
                <div>
                  <span className="order-field-label">Họ và tên</span>
                  <strong className="order-field-value">{user?.fullName || "Học viên LingoFlow"}</strong>
                </div>
                <div>
                  <span className="order-field-label">Email nhận kích hoạt</span>
                  <strong className="order-field-value">{user?.email || "student@example.com"}</strong>
                </div>
                <div>
                  <span className="order-field-label">Mã đơn hàng</span>
                  <strong style={{ color: "#2563eb" }}>{orderCode}</strong>
                </div>
                <div>
                  <span className="order-field-label">Thời gian khởi tạo</span>
                  <strong className="order-field-value">{formatDate(order?.createdAt)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Actions */}
          <div style={{ position: "sticky", top: "2rem" }}>
            <div className="order-detail-summary-card">
              <h3 className="order-panel-title">Chi tiết thanh toán</h3>

              {/* Invoice Breakdown */}
              <div className="order-summary-box">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="order-field-label">Tạm tính ({items.length} khóa):</span>
                  <strong className="order-field-value">{money.format(order?.subtotalAmount || order?.totalAmount || 0)}</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="order-field-label">Giảm giá voucher:</span>
                  <strong style={{ color: order?.discountAmount > 0 ? "#16a34a" : "#64748b" }}>
                    -{money.format(order?.discountAmount || 0)}
                  </strong>
                </div>

                {order?.couponCode && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="order-field-label">Mã ưu đãi đã dùng:</span>
                    <span style={{ background: "#dcfce7", color: "#15803d", fontWeight: 800, fontSize: "0.78rem", padding: "2px 8px", borderRadius: "6px" }}>
                      🏷️ {order.couponCode}
                    </span>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.7rem", borderTop: "1px solid #e2e8f0", fontSize: "1.05rem" }}>
                  <span style={{ fontWeight: 700 }}>Tổng thanh toán:</span>
                  <strong style={{ fontSize: "1.55rem", fontWeight: 800, color: "#2563eb" }}>
                    {money.format(order?.totalAmount || 0)}
                  </strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {isPaid && (
                  <>
                    <Link
                      to="/student/courses"
                      style={{
                        display: "block",
                        textAlign: "center",
                        padding: "13px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #16a34a, #15803d)",
                        color: "#ffffff",
                        fontWeight: 700,
                        fontSize: "1rem",
                        textDecoration: "none",
                        boxShadow: "0 4px 14px rgba(22,163,74,0.3)",
                      }}
                    >
                      🎓 Vào học các khóa học ngay
                    </Link>

                    {order.invoice && (
                      <Link
                        to={`/student/orders/${order.orderCode}/invoice`}
                        className="order-invoice-btn"
                      >
                        📄 Xem & Tải Hóa đơn VAT
                      </Link>
                    )}
                  </>
                )}

                {isPending && (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate("/student/checkout")}
                      style={{
                        width: "100%",
                        padding: "13px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                        color: "#ffffff",
                        border: "none",
                        fontWeight: 700,
                        fontSize: "1rem",
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
                      }}
                    >
                      ⚡ Thanh toán đơn hàng ngay (VietQR)
                    </button>

                    <button
                      type="button"
                      disabled={canceling}
                      onClick={handleCancel}
                      style={{
                        width: "100%",
                        padding: "11px",
                        borderRadius: "12px",
                        background: "#fef2f2",
                        color: "#dc2626",
                        border: "1px solid #fecaca",
                        fontWeight: 700,
                        fontSize: "0.92rem",
                        cursor: "pointer",
                      }}
                    >
                      {canceling ? "Đang hủy đơn..." : "❌ Hủy đơn hàng này"}
                    </button>
                  </>
                )}

                <Link
                  to="/student/orders"
                  className="order-back-link"
                >
                  ← Quay lại Lịch sử mua hàng
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
