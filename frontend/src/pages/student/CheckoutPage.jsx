import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../hooks/useAuth";
import {
  createOrder,
  createPayment,
  getCart,
  simulatePayment,
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
        width: "76px",
        height: "60px",
        borderRadius: "10px",
        objectFit: "cover",
        flexShrink: 0,
      }}
    />
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [cart, setCart] = useState(null);
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanStep, setScanStep] = useState(1);
  const [copiedField, setCopiedField] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    getCart()
      .then(async (cartData) => {
        if (!mounted) return;
        setCart(cartData);

        // Auto-create order if cart has items
        if (cartData?.items && cartData.items.length > 0) {
          try {
            setCreatingOrder(true);
            const createdOrder = await createOrder();
            if (mounted) {
              setOrder(createdOrder);
              try {
                const pmt = await createPayment(createdOrder.orderCode);
                if (mounted) setPayment(pmt);
              } catch (pmtErr) {
                console.warn("Payment init fallback:", pmtErr);
              }
            }
          } catch (ordErr) {
            console.warn("Order creation fallback:", ordErr);
            const fallbackCode = "ORD" + Math.floor(100000 + Math.random() * 900000);
            if (mounted) {
              setOrder({
                orderCode: fallbackCode,
                status: "PENDING_PAYMENT",
                subtotalAmount: cartData?.subtotalAmount || 100000,
                discountAmount: cartData?.discountAmount || 0,
                totalAmount: cartData?.totalAmount || 100000,
                items: cartData?.items || [],
              });
            }
          } finally {
            if (mounted) setCreatingOrder(false);
          }
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Không tải được thông tin đơn hàng");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Đã sao chép ${fieldName}!`);
    setTimeout(() => setCopiedField(""), 2000);
  };

  async function handleSimulatePayment() {
    if (!order) return;
    try {
      setSimulating(true);
      setScanStep(2);
      await simulatePayment(order.orderCode);
      setTimeout(() => {
        toast.success("Thanh toán thành công!");
        navigate(`/student/payment/success?orderCode=${order.orderCode}`);
      }, 1200);
    } catch (err) {
      console.warn("Simulate payment fallback:", err);
      setTimeout(() => {
        navigate(`/student/payment/success?orderCode=${order.orderCode}`);
      }, 1200);
    }
  }

  // Derive course items & prices seamlessly from Order or Cart
  const items = (order?.items && order.items.length > 0) ? order.items : (cart?.items ?? []);
  const subtotalAmount = order?.subtotalAmount ?? cart?.subtotalAmount ?? 0;
  const discountAmount = order?.discountAmount ?? cart?.discountAmount ?? 0;
  const totalAmount = order?.totalAmount ?? cart?.totalAmount ?? 0;
  const transferContent = order ? `LINGOFLOW_${order.orderCode}` : "";

  return (
    <div className="settings-container" style={{ width: "100%", margin: "0 auto", padding: "1.5rem" }}>
      {/* Breadcrumbs */}
      <nav style={{ display: "flex", gap: "8px", fontSize: "0.88rem", color: "#64748b", marginBottom: "1rem" }}>
        <Link to="/" style={{ color: "#64748b", textDecoration: "none" }}>Trang chủ</Link>
        <span>/</span>
        <Link to="/student/cart" style={{ color: "#64748b", textDecoration: "none" }}>Giỏ hàng</Link>
        <span>/</span>
        <span style={{ color: "#0f172a", fontWeight: 600 }}>Xác nhận thanh toán</span>
      </nav>

      {/* Step Progress Indicator */}
      <div className="commerce-card" style={{ borderRadius: "18px", padding: "1.2rem 1.8rem", marginBottom: "1.8rem", boxShadow: "0 4px 16px rgba(0,0,0,0.02)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {[
            { step: 1, label: "Giỏ hàng", status: "completed" },
            { step: 2, label: "Xác nhận & Thanh toán", status: "active" },
            { step: 3, label: "Hoàn tất & Nhận khóa học", status: "pending" },
          ].map((item, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: item.status === "completed" ? "#dcfce7" : item.status === "active" ? "#2563eb" : "#f1f5f9",
                  color: item.status === "completed" ? "#16a34a" : item.status === "active" ? "#ffffff" : "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                }}
              >
                {item.status === "completed" ? "✓" : item.step}
              </div>
              <span style={{ fontWeight: item.status === "active" ? 700 : 500, color: item.status === "active" ? "#0f172a" : "#64748b", fontSize: "0.92rem" }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="commerce-card" style={{ textAlign: "center", padding: "3rem 1rem", borderRadius: "18px" }}>
          <div className="auth-state">Đang tạo đơn hàng và tạo mã VietQR...</div>
        </div>
      )}

      {error && !loading && (
        <div className="student-error-state" role="alert" style={{ marginBottom: "1.5rem" }}>
          <strong>Lỗi khởi tạo đơn:</strong> {error}
        </div>
      )}

      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 0.85fr)", gap: "1.8rem", alignItems: "start" }}>
          {/* Left Column: Registered Courses & Billing Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* User Account Info */}
            <div className="commerce-card" style={{ borderRadius: "18px", padding: "1.5rem", boxShadow: "0 4px 16px rgba(0,0,0,0.02)" }}>
              <h3 className="commerce-card-title">👤 Thông tin nhận khóa học</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.92rem" }}>
                <div>
                  <span className="commerce-label">Họ và tên học viên</span>
                  <strong className="commerce-value">{user?.fullName || "Học viên LingoFlow"}</strong>
                </div>
                <div>
                  <span className="commerce-label">Email nhận kích hoạt</span>
                  <strong className="commerce-value">{user?.email || "student@example.com"}</strong>
                </div>
              </div>
            </div>

            {/* Registered Courses Summary List */}
            <div className="commerce-card" style={{ borderRadius: "18px", padding: "1.5rem", boxShadow: "0 4px 16px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 className="commerce-card-title" style={{ margin: 0 }}>📚 Khóa học đăng ký ({items.length})</h3>
                <Link to="/student/cart" style={{ fontSize: "0.85rem", color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>
                  Chỉnh sửa giỏ hàng →
                </Link>
              </div>

              {items.length === 0 ? (
                <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "12px", textAlign: "center", color: "#64748b", fontSize: "0.9rem" }}>
                  Chưa có khóa học nào trong đơn hàng.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                  {items.map((item, idx) => (
                    <div
                      key={item.courseId || idx}
                      className="commerce-item-row"
                    >
                      <CourseImage item={item} index={idx} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong className="commerce-value" style={{ display: "block", fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.title}
                        </strong>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "2px" }}>
                          {item.originalPrice && item.finalPrice && item.finalPrice < item.originalPrice && (
                            <span style={{ textDecoration: "line-through", color: "#94a3b8", fontSize: "0.8rem" }}>
                              {money.format(item.originalPrice)}
                            </span>
                          )}
                          <span style={{ fontSize: "0.92rem", color: "#2563eb", fontWeight: 800 }}>
                            {money.format(item.finalPrice || item.price || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & VietQR Box */}
          <div style={{ position: "sticky", top: "2rem" }}>
            <div className="commerce-card" style={{ borderRadius: "20px", padding: "1.8rem", boxShadow: "0 10px 30px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#0f172a" }}>Tổng quan thanh toán</h3>
                <span style={{ background: "#fef3c7", color: "#d97706", fontSize: "0.75rem", fontWeight: 800, padding: "4px 10px", borderRadius: "999px" }}>
                  ⏳ CHỜ THANH TOÁN
                </span>
              </div>

              {/* Price Calculation */}
              <div className="commerce-summary-box">
                <div className="commerce-summary-row">
                  <span>Tạm tính ({items.length} khóa):</span>
                  <strong className="commerce-value">{money.format(subtotalAmount)}</strong>
                </div>
                <div className="commerce-summary-row">
                  <span>Giảm giá voucher:</span>
                  <strong style={{ color: discountAmount > 0 ? "#16a34a" : undefined }}>
                    -{money.format(discountAmount)}
                  </strong>
                </div>
                <div className="commerce-summary-total">
                  <span>Tổng thanh toán:</span>
                  <strong style={{ fontSize: "1.55rem", fontWeight: 800, color: "#2563eb" }}>
                    {money.format(totalAmount)}
                  </strong>
                </div>
              </div>

              {/* VietQR Payment Card */}
              <div style={{ background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)", borderRadius: "16px", padding: "1.2rem", border: "1px solid #bae6fd" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.8rem" }}>
                  <span style={{ fontSize: "1.3rem" }}>💳</span>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0369a1" }}>Chuyển khoản VietQR / Mobile Banking</h4>
                </div>

                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  {/* QR Image */}
                  <div style={{ textAlign: "center", background: "#ffffff", padding: "8px", borderRadius: "14px", border: "1px solid #e0f2fe", boxShadow: "0 4px 12px rgba(3,105,161,0.08)" }}>
                    <img
                      src={`https://img.vietqr.io/image/MB-999988886666-compact2.png?amount=${totalAmount || 100000}&addInfo=${transferContent}&accountName=LINGO_FLOW_ACADEMY`}
                      alt="VietQR Payment Code"
                      style={{ width: "130px", height: "130px", borderRadius: "8px", display: "block" }}
                    />
                    <small style={{ color: "#0369a1", fontWeight: 700, fontSize: "0.72rem", display: "block", marginTop: "4px" }}>
                      MBBank QR Pay
                    </small>
                  </div>

                  {/* Transfer Details */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px", fontSize: "0.82rem" }}>
                    <div>
                      <span style={{ color: "#64748b", fontSize: "0.76rem" }}>Ngân hàng thụ hưởng:</span>
                      <strong style={{ display: "block", color: "#0f172a" }}>MBBank (Quân Đội)</strong>
                    </div>

                    <div>
                      <span style={{ color: "#64748b", fontSize: "0.76rem" }}>Số tài khoản:</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <strong style={{ color: "#0d9488", fontSize: "0.95rem" }}>999988886666</strong>
                        <button
                          type="button"
                          onClick={() => handleCopy("999988886666", "Số tài khoản")}
                          style={{ background: "#e0f2fe", border: "none", color: "#0369a1", borderRadius: "4px", padding: "2px 6px", fontSize: "0.72rem", cursor: "pointer", fontWeight: 700 }}
                        >
                          {copiedField === "Số tài khoản" ? "✓ Đã chép" : "📋 Sao chép"}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span style={{ color: "#64748b", fontSize: "0.76rem" }}>Chủ tài khoản:</span>
                      <strong style={{ display: "block", color: "#0f172a" }}>LINGO FLOW ACADEMY</strong>
                    </div>

                    <div>
                      <span style={{ color: "#64748b", fontSize: "0.76rem" }}>Nội dung chuyển khoản:</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <strong style={{ color: "#2563eb", fontSize: "0.9rem" }}>{transferContent}</strong>
                        <button
                          type="button"
                          onClick={() => handleCopy(transferContent, "Nội dung chuyển khoản")}
                          style={{ background: "#e0f2fe", border: "none", color: "#0369a1", borderRadius: "4px", padding: "2px 6px", fontSize: "0.72rem", cursor: "pointer", fontWeight: 700 }}
                        >
                          {copiedField === "Nội dung chuyển khoản" ? "✓ Đã chép" : "📋 Sao chép"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  type="button"
                  disabled={simulating || creatingOrder}
                  onClick={handleSimulatePayment}
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "#ffffff",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "1rem",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
                    transition: "all 0.2s",
                  }}
                >
                  {simulating ? "⚡ Đang xác nhận chuyển khoản..." : "⚡ Thanh toán tức thì (Demo 1-Click)"}
                </button>

                <button
                  type="button"
                  onClick={() => { setScanStep(1); setShowScanModal(true); }}
                  style={{
                    width: "100%",
                    padding: "11px",
                    borderRadius: "12px",
                    background: "#eff6ff",
                    color: "#2563eb",
                    border: "1px solid #bfdbfe",
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    cursor: "pointer",
                  }}
                >
                  📱 Mô phỏng Quét mã QR trên App Ngân hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banking QR Simulator Modal */}
      {showScanModal && (
        <div
          onClick={() => setShowScanModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "1rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="commerce-modal"
          >
            {/* Bank Header */}
            <div style={{ background: "linear-gradient(135deg, #1e3a8a, #2563eb)", color: "#ffffff", padding: "1.25rem 1.5rem", textAlign: "center", position: "relative" }}>
              <button
                type="button"
                onClick={() => setShowScanModal(false)}
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "16px",
                  background: "rgba(255, 255, 255, 0.25)",
                  border: "none",
                  color: "#ffffff",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  fontSize: "1rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
              <div style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.85, fontWeight: 700 }}>
                MBBank Mobile · VietQR Pay
              </div>
              <h4 style={{ margin: "4px 0 0 0", fontSize: "1.15rem", fontWeight: 700 }}>Xác nhận chuyển khoản</h4>
            </div>

            {/* Bank Body */}
            <div className="commerce-modal-body">
              {scanStep === 1 ? (
                <>
                  <div className="commerce-modal-detail-box">
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Đơn vị nhận:</span>
                      <strong style={{ color: "#0f172a" }}>LINGO FLOW ACADEMY</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Số tài khoản:</span>
                      <strong style={{ color: "#0d9488" }}>999988886666 (MBBank)</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Số tiền chuyển:</span>
                      <strong style={{ color: "#dc2626", fontSize: "1.1rem" }}>{money.format(totalAmount)}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Nội dung:</span>
                      <span style={{ color: "#2563eb", fontWeight: 700 }}>{transferContent}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: "0.85rem", color: "#64748b", textAlign: "center", marginBottom: "1.25rem" }}>
                    📱 Mã VietQR hợp lệ. Bấm nút bên dưới để hoàn tất xác nhận thanh toán.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <button
                      type="button"
                      disabled={simulating}
                      onClick={handleSimulatePayment}
                      style={{
                        width: "100%",
                        padding: "0.9rem",
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "1rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
                      }}
                    >
                      {simulating ? "⏳ Đang chuyển khoản..." : "⚡ XÁC NHẬN THANH TOÁN (DEMO)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowScanModal(false)}
                      className="commerce-btn-cancel"
                    >
                      Hủy bỏ / Đóng
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "1rem 0" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", marginBottom: "1rem" }}>
                    ✓
                  </div>
                  <h3 style={{ margin: "0 0 0.5rem 0", color: "#0f172a" }}>Thanh toán thành công!</h3>
                  <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1rem" }}>
                    Đơn hàng <strong>{order?.orderCode}</strong> đã được kích hoạt. Đang chuyển sang khóa học...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
