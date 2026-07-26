import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getPaymentStatus } from "../../services/commerceService";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

const STATUS_MAP = {
  SUCCESS: { label: "Thanh toán thành công", color: "#16a34a", icon: "✅" },
  FAILED: { label: "Thanh toán thất bại", color: "#dc2626", icon: "❌" },
  CANCELED: { label: "Đã hủy thanh toán", color: "#9ca3af", icon: "🚫" },
  INITIATED: { label: "Đang xử lý...", color: "#d97706", icon: "⏳" },
};

export default function PaymentStatusPage() {
  const { status: routeStatus } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get("orderCode");
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");
  const pollRef = useRef(null);

  function loadPayment() {
    if (!orderCode) return;
    getPaymentStatus(orderCode)
      .then((data) => {
        setPayment(data);
        // Stop polling when terminal state reached
        if (data?.status === "SUCCESS" || data?.status === "FAILED" || data?.status === "CANCELED") {
          clearInterval(pollRef.current);
        }
      })
      .catch((err) => {
        setError(err.message || "Không tải được trạng thái thanh toán");
        clearInterval(pollRef.current);
      });
  }

  useEffect(() => {
    loadPayment();
    // Poll if still INITIATED
    pollRef.current = setInterval(() => {
      if (payment?.status === "INITIATED") {
        loadPayment();
      } else {
        clearInterval(pollRef.current);
      }
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [orderCode]);

  // Derive effective status from backend or route param
  const effectiveStatus = payment?.status || routeStatus?.toUpperCase();
  const statusInfo = STATUS_MAP[effectiveStatus] || { label: effectiveStatus, color: "#64748b", icon: "ℹ️" };
  const isSuccess = effectiveStatus === "SUCCESS";
  const isFailed = effectiveStatus === "FAILED";
  const isCanceled = effectiveStatus === "CANCELED";

  return (
    <div className="course-page">
      <section className="page-hero">
        <span className="page-badge">Thanh toán</span>
        <h2 className="page-title" style={{ color: statusInfo.color }}>
          {statusInfo.icon} {statusInfo.label}
        </h2>
        {orderCode && <p className="page-description">Mã đơn: <strong>{orderCode}</strong></p>}
      </section>

      {error && <p className="auth-error">{error}</p>}

      <section className="page-panel-card">
        {payment && (
          <>
            <p>Mã thanh toán: <strong>{payment.paymentCode}</strong></p>
            <p>Số tiền: <strong style={{ fontSize: "1.1rem", color: "#2563eb" }}>{money.format(payment.amount || 0)}</strong></p>
            <p>Trạng thái: <strong style={{ color: statusInfo.color }}>{statusInfo.label}</strong></p>
            {payment.paidAt && (
              <p>Thời gian thanh toán: <strong>{new Date(payment.paidAt).toLocaleString("vi-VN")}</strong></p>
            )}
            {payment.failedReason && (
              <p>Lý do: <span style={{ color: "#dc2626" }}>{payment.failedReason}</span></p>
            )}
          </>
        )}

        {!payment && !error && (
          <p className="auth-state">Đang tải thông tin thanh toán...</p>
        )}

        <div className="page-actions" style={{ marginTop: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
          {isSuccess && (
            <>
              <Link id="btn-go-courses" className="page-action page-action-primary" to="/student/courses">
                🎓 Vào khóa học của tôi
              </Link>
              {orderCode && (
                <Link id="btn-view-invoice" className="page-action page-action-secondary" to={`/student/orders/${orderCode}/invoice`}>
                  🧾 Xem hóa đơn
                </Link>
              )}
              {orderCode && (
                <Link id="btn-view-order" className="page-action page-action-secondary" to={`/student/orders/${orderCode}`}>
                  📋 Chi tiết đơn hàng
                </Link>
              )}
            </>
          )}

          {(isFailed || isCanceled) && (
            <>
              {orderCode && (
                <button
                  id="btn-retry-payment"
                  className="page-action page-action-primary"
                  onClick={() => navigate(`/student/checkout?orderCode=${orderCode}`)}
                >
                  🔄 Thanh toán lại
                </button>
              )}
              <Link id="btn-back-cart" className="page-action page-action-secondary" to="/student/cart">
                🛒 Quay lại giỏ hàng
              </Link>
            </>
          )}

          <Link className="page-action page-action-secondary" to="/student/orders">
            📜 Lịch sử mua hàng
          </Link>
        </div>
      </section>
    </div>
  );
}
