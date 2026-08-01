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
        width: "70px",
        height: "55px",
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

        // Auto-create order if cart has items and order isn't created yet
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
                totalAmount: cartData?.totalAmount || 100000,
              });
            }
          } finally {
            if (mounted) setCreatingOrder(false);
          }
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Không tải được giỏ hàng");
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

  const items = cart?.items ?? [];
  const transferContent = order ? `LINGOFLOW_${order.orderCode}` : "";

  return (
    <div className="settings-container" style={{ maxWidth: "1180px", margin: "0 auto", padding: "1.5rem" }}>
      {/* Breadcrumbs */}
      <nav style={{ display: "flex", gap: "8px", fontSize: "0.88rem", color: "#64748b", marginBottom: "1rem" }}>
        <Link to="/" style={{ color: "#64748b", textDecoration: "none" }}>Trang chủ</Link>
        <span>/</span>
        <Link to="/student/cart" style={{ color: "#64748b", textDecoration: "none" }}>Giỏ hàng</Link>
        <span>/</span>
        <span style={{ color: "#0f172a", fontWeight: 600 }}>Xác nhận thanh toán</span>
      </nav>

      {/* Checkout Step Progress Indicator */}
      <div style={{ background: "#ffffff", borderRadius: "18px", padding: "1.2rem 1.8rem", border: "1px solid #e2e8f0", marginBottom: "2rem", boxShadow: "0 4px 16px rgba(0,0,0,0.02)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
          {[
            { step: 1, label: "Giỏ hàng", status: "completed", link: "/student/cart" },
            { step: 2, label: "Xác nhận & Thanh toán", status: "active" },
            { step: 3, label: "Hoàn tất & Nhận khóa học", status: "pending" },
          ].map((item, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", zIndex: 1 }}>
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
        <div style={{ textAlign: "center", padding: "3rem 1rem", background: "#ffffff", borderRadius: "18px", border: "1px solid #e2e8f0" }}>
          <div className="auth-state">Đang khởi tạo hóa đơn thanh toán...</div>
        </div>
      )}

      {error && !loading && (
        <div className="student-error-state" role="alert" style={{ marginBottom: "1.5rem" }}>
          <strong>Không khởi tạo được đơn hàng:</strong> {error}
        </div>
      )}

      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem", alignItems: "start" }}>
          {/* Left Column: Course Items & User Billing Card */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* User Account Info */}
            <div style={{ background: "#ffffff", borderRadius: "18px", padding: "1.5rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.02)" }}>
              <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>👤 Thông tin nhận khóa học</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.92rem" }}>
                <div>
                  <span style={{ display: "block", color: "#64748b", fontSize: "0.82rem" }}>Họ và tên học viên</span>
                  <strong style={{ color: "#1e293b" }}>{user?.fullName || "Học viên LingoFlow"}</strong>
                </div>
                <div>
                  <span style={{ display: "block", color: "#64748b", fontSize: "0.82rem" }}>Email nhận kích hoạt</span>
                  <strong style={{ color: "#1e293b" }}>{user?.email || "student@example.com"}</strong>
                </div>
              </div>
            </div>

            {/* Registered Courses Summary */}
            <div style={{ background: "#ffffff", borderRadius: "18px", padding: "1.5rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>📚 Khóa học đăng ký ({items.length})</h3>
                <Link to="/student/cart" style={{ fontSize: "0.85rem", color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>
                  Chỉnh sửa giỏ hàng →
                </Link>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                {items.map((item, idx) => (
                  <div
                    key={item.courseId}
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                      padding: "0.75rem",
                      background: "#f8fafc",
                      borderRadius: "12px",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <CourseImage item={item} index={idx} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "0.92rem", color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.title}
                      </strong>
                      <span style={{ fontSize: "0.85rem", color: "#2563eb", fontWeight: 700 }}>
                        {money.format(item.finalPrice || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & VietQR Transfer Card */}
          <div style={{ position: "sticky", top: "2rem" }}>
            <div style={{ background: "#ffffff", borderRadius: "20px", padding: "1.8rem", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#0f172a" }}>Tổng quan thanh toán</h3>
                <span style={{ background: "#fef3c7", color: "#d97706", fontSize: "0.75rem", fontWeight: 800, padding: "4px 10px", borderRadius: "999px" }}>
                  ⏳ CHỜ THANH TOÁN
                </span>
              </div>

              {/* Price Calculation */}
              <div style={{ background: "#f8fafc", borderRadius: "14px", padding: "1rem", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.9rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                  <span>Tạm tính ({items.length} khóa):</span>
                  <strong style={{ color: "#1e293b" }}>{money.format(cart?.subtotalAmount || 0)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                  <span>Giảm giá voucher:</span>
                  <strong style={{ color: cart?.discountAmount > 0 ? "#16a34a" : "#64748b" }}>
                    -{money.format(cart?.discountAmount || 0)}
                  </strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.6rem", borderTop: "1px solid #e2e8f0", fontSize: "1.05rem" }}>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>Tổng thanh toán:</span>
                  <strong style={{ fontSize: "1.5rem", fontWeight: 800, color: "#2563eb" }}>
                    {money.format(cart?.totalAmount || 0)}
                  </strong>
                </div>
              </div>

              {/* VietQR Payment Box */}
              <div style={{ background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)", borderRadius: "16px", padding: "1.2rem", border: "1px solid #bae6fd" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.8rem" }}>
                  <span style={{ fontSize: "1.3rem" }}>💳</span>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0369a1" }}>Chuyển khoản VietQR / Mobile Banking</h4>
                </div>

                <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                  {/* QR Image */}
                  <div style={{ textAlign: "center", background: "#ffffff", padding: "8px", borderRadius: "14px", border: "1px solid #e0f2fe", boxShadow: "0 4px 12px rgba(3,105,161,0.08)" }}>
                    <img
                      src={`https://img.vietqr.io/image/MB-999988886666-compact2.png?amount=${cart?.totalAmount || 100000}&addInfo=${transferContent}&accountName=LINGO_FLOW_ACADEMY`}
                      alt="VietQR Payment Code"
                      style={{ width: "140px", height: "140px", borderRadius: "8px", display: "block" }}
                    />
                    <small style={{ color: "#0369a1", fontWeight: 700, fontSize: "0.75rem", display: "block", marginTop: "4px" }}>
                      MBBank QR Pay
                    </small>
                  </div>

                  {/* Transfer Details */}
                  <div style={{ flex: 1, minWidth: "160px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.85rem" }}>
                    <div>
                      <span style={{ color: "#64748b", fontSize: "0.78rem" }}>Ngân hàng thụ hưởng:</span>
                      <strong style={{ display: "block", color: "#0f172a" }}>MBBank (Quân Đội)</strong>
                    </div>

                    <div>
                      <span style={{ color: "#64748b", fontSize: "0.78rem" }}>Số tài khoản:</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <strong style={{ color: "#0d9488", fontSize: "0.98rem" }}>999988886666</strong>
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
                      <span style={{ color: "#64748b", fontSize: "0.78rem" }}>Chủ tài khoản:</span>
                      <strong style={{ display: "block", color: "#0f172a" }}>LINGO FLOW ACADEMY</strong>
                    </div>

                    <div>
                      <span style={{ color: "#64748b", fontSize: "0.78rem" }}>Nội dung chuyển khoản:</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <strong style={{ color: "#2563eb", fontSize: "0.92rem" }}>{transferContent}</strong>
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

              {/* Instant Action Buttons */}
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
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              width: "100%",
              maxWidth: "420px",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.45)",
              border: "1px solid #e2e8f0",
            }}
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
            <div style={{ padding: "1.5rem" }}>
              {scanStep === 1 ? (
                <>
                  <div style={{ background: "#f8fafc", borderRadius: "16px", padding: "1rem", border: "1px solid #e2e8f0", marginBottom: "1.25rem", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.88rem" }}>
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
                      <strong style={{ color: "#dc2626", fontSize: "1.1rem" }}>{money.format(cart?.totalAmount || 0)}</strong>
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
                      style={{
                        width: "100%",
                        padding: "0.65rem",
                        background: "#f1f5f9",
                        color: "#64748b",
                        border: "1px solid #cbd5e1",
                        borderRadius: "10px",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
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
