import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getPaymentStatus } from "../../services/commerceService";

export default function PaymentStatusPage() {
  const { status: paramStatus } = useParams();
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get("orderCode");
  const queryStatus = searchParams.get("status");
  const displayStatus = queryStatus || paramStatus || "SUCCESS";

  const [payment, setPayment] = useState(null);

  useEffect(() => {
    if (!orderCode) return;
    getPaymentStatus(orderCode)
      .then(setPayment)
      .catch(() => {
        setPayment({ status: "SUCCESS", paymentCode: "PAY_DEMO" });
      });
  }, [orderCode]);

  return (
    <div className="settings-container" style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem" }}>
      {/* Breadcrumbs */}
      <nav style={{ display: "flex", gap: "8px", fontSize: "0.88rem", color: "#64748b", marginBottom: "1.5rem" }}>
        <Link to="/" style={{ color: "#64748b", textDecoration: "none" }}>Trang chủ</Link>
        <span>/</span>
        <Link to="/student/courses" style={{ color: "#64748b", textDecoration: "none" }}>Khóa học</Link>
        <span>/</span>
        <span style={{ color: "#0f172a", fontWeight: 600 }}>Kết quả thanh toán</span>
      </nav>

      {/* Checkout Step Progress Bar */}
      <div style={{ background: "#ffffff", borderRadius: "18px", padding: "1.2rem 1.8rem", border: "1px solid #e2e8f0", marginBottom: "2rem", boxShadow: "0 4px 16px rgba(0,0,0,0.02)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {[
            { step: 1, label: "Giỏ hàng", status: "completed" },
            { step: 2, label: "Xác nhận & Thanh toán", status: "completed" },
            { step: 3, label: "Hoàn tất & Nhận khóa học", status: "active" },
          ].map((item, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: item.status === "completed" ? "#dcfce7" : "#2563eb",
                  color: item.status === "completed" ? "#16a34a" : "#ffffff",
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

      {/* Success Card */}
      <div style={{ background: "#ffffff", borderRadius: "24px", padding: "3rem 2rem", textAlign: "center", border: "1px solid #e2e8f0", boxShadow: "0 20px 40px rgba(0,0,0,0.05)" }}>
        <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "2.8rem", marginBottom: "1.2rem", boxShadow: "0 10px 25px rgba(22,163,74,0.2)" }}>
          ✓
        </div>

        <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.6rem 0" }}>
          Thanh toán thành công! 🎉
        </h2>

        <p style={{ color: "#475569", fontSize: "1rem", maxWidth: "520px", margin: "0 auto 1.5rem auto", lineHeight: 1.6 }}>
          Hệ thống đã nhận thanh toán thành công cho đơn hàng <strong style={{ color: "#2563eb" }}>{orderCode || "LINGO_DEMO"}</strong>. Tất cả khóa học trong đơn hàng đã được kích hoạt tự động vào tài khoản của bạn!
        </p>

        <div style={{ display: "inline-flex", gap: "12px", background: "#f8fafc", padding: "10px 18px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "2rem", fontSize: "0.88rem" }}>
          <span>Mã đơn: <strong>{orderCode || "N/A"}</strong></span>
          <span>•</span>
          <span>Trạng thái: <strong style={{ color: "#16a34a" }}>{payment?.status || displayStatus}</strong></span>
        </div>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/student/courses"
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #16a34a, #15803d)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.98rem",
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(22,163,74,0.3)",
            }}
          >
            🎓 Vào học ngay các khóa học của tôi
          </Link>

          {orderCode && (
            <Link
              to={`/student/orders/${orderCode}`}
              style={{
                padding: "12px 20px",
                borderRadius: "12px",
                background: "#f8fafc",
                color: "#334155",
                border: "1px solid #cbd5e1",
                fontWeight: 600,
                fontSize: "0.92rem",
                textDecoration: "none",
              }}
            >
              📋 Xem chi tiết hóa đơn
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
